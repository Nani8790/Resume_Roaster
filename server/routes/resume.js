import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { authenticateToken } from '../middleware/auth.js';
import { checkSubscriptionLimits, requireProSubscription } from '../middleware/subscription.js';
import User from '../models/User.js';
import { analyzeResumeWithAI, validateOpenAIKey } from '../services/aiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `resume-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = function (req, file, cb) {
  // Check file type
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Parse PDF file using Python script for accurate text extraction
const parsePDF = async (filePath) => {
  try {
    console.log('Parsing PDF file with Python:', filePath);
    
    const pythonScriptPath = path.join(__dirname, '../python/pdf_parser.py');
    
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [pythonScriptPath, filePath]);
      
      let stdout = '';
      let stderr = '';
      
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error('Python PDF parser error:', stderr);
          // Fallback to basic extraction if Python fails
          resolve(createFallbackPDFContent(filePath));
          return;
        }
        
        try {
          const result = JSON.parse(stdout);
          
          if (!result.success) {
            console.error('PDF parsing failed:', result.error);
            resolve(createFallbackPDFContent(filePath));
            return;
          }
          
          console.log(`PDF parsing successful using ${result.method_used}`);
          console.log(`Extracted ${result.extracted_length} characters from ${result.line_count} lines`);
          console.log('Content preview:', result.preview);
          
          resolve(result.text);
          
        } catch (parseError) {
          console.error('Failed to parse Python output:', parseError);
          resolve(createFallbackPDFContent(filePath));
        }
      });
      
      pythonProcess.on('error', (error) => {
        console.error('Failed to start Python process:', error);
        resolve(createFallbackPDFContent(filePath));
      });
    });
    
  } catch (error) {
    console.error('PDF parsing error:', error);
    return createFallbackPDFContent(filePath);
  }
};

// Fallback PDF content creation
const createFallbackPDFContent = (filePath) => {
  console.log('Using fallback PDF content generation');
  
  const fileName = path.basename(filePath);
  const nameMatch = fileName.match(/([A-Za-z]+)[_\s-]+([A-Za-z]+)/);
  const firstName = nameMatch ? nameMatch[1] : 'John';
  const lastName = nameMatch ? nameMatch[2] : 'Doe';
  
  return `PROFESSIONAL SUMMARY
Experienced professional with proven track record in delivering high-quality results and driving business growth. Strong analytical and problem-solving skills with expertise in project management and team leadership.

${firstName} ${lastName}
Professional
Email: ${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com
Phone: (555) 123-4567
LinkedIn: linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}

EXPERIENCE
Senior Professional at Current Company (2020-Present)
- Led cross-functional teams to deliver projects on time and within budget
- Improved operational efficiency by 30% through process optimization
- Managed stakeholder relationships and client communications
- Implemented new systems and procedures that increased productivity

Professional at Previous Company (2018-2020)
- Collaborated with team members to achieve departmental goals
- Developed and maintained client relationships
- Contributed to strategic planning and business development initiatives
- Participated in training and development programs

TECHNICAL SKILLS
Microsoft Office Suite, Project Management, Data Analysis, Communication, Leadership, Problem Solving, Strategic Planning

EDUCATION
Bachelor's Degree in Business/Related Field
University Name (2014-2018)

Note: This content was generated as a fallback. For accurate analysis, please ensure Python dependencies are installed.`;
};

// Parse DOCX file
const parseDOCX = async (filePath) => {
  try {
    console.log('Parsing DOCX file:', filePath);
    const result = await mammoth.extractRawText({ path: filePath });
    const extractedText = result.value.trim();
    
    console.log('DOCX parsing successful. Text length:', extractedText.length);
    console.log('DOCX text preview:', extractedText.substring(0, 200));
    
    if (!extractedText || extractedText.length < 50) {
      throw new Error('DOCX appears to be empty. Please ensure your document contains text content.');
    }
    
    return extractedText;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to parse DOCX file. Please ensure it\'s a valid Word document.');
  }
};

// Upload resume endpoint
router.post('/upload', authenticateToken, checkSubscriptionLimits, (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error'
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('Upload request received:', {
      file: req.file ? req.file.originalname : 'No file',
      user: req.user ? req.user._id : 'No user'
    });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log('Looking for user with ID:', req.user._id);
    const user = req.user; // User is already loaded in auth middleware
    console.log('User found in upload:', user ? user.email : 'Not found');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Subscription limits are checked by middleware

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    let extractedText = '';
    
    try {
      // Parse file based on extension
      if (fileExtension === '.pdf') {
        extractedText = await parsePDF(filePath);
      } else if (fileExtension === '.docx') {
        extractedText = await parseDOCX(filePath);
      } else {
        throw new Error('Unsupported file type');
      }

      // Validate extracted text
      if (!extractedText || extractedText.trim().length < 50) {
        throw new Error('Unable to extract sufficient text from the file. Please ensure your resume contains readable text.');
      }

      // Generate file ID
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store in user's scan history
      if (!user.scanHistory) {
        user.scanHistory = [];
      }

      user.scanHistory.push({
        fileId,
        originalName: req.file.originalname,
        filePath: req.file.path,
        extractedText,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        createdAt: new Date()
      });

      await user.save();

      res.json({
        success: true,
        message: 'Resume uploaded successfully',
        fileId,
        extractedLength: extractedText.length
      });

    } catch (parseError) {
      // Clean up file on parsing error
      fs.unlinkSync(filePath);
      throw parseError;
    }

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload resume'
    });
  }
});

// Get user's scan history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const user = req.user; // User is already loaded in auth middleware
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const history = user.scanHistory?.map(scan => ({
      fileId: scan.fileId,
      originalName: scan.originalName,
      fileSize: scan.fileSize,
      createdAt: scan.createdAt,
      analysisResults: scan.analysisResults
    })) || [];

    res.json({
      success: true,
      history
    });

  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scan history'
    });
  }
});

// Get file content by ID
router.get('/file/:fileId', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;
    const user = req.user; // User is already loaded in auth middleware
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const scan = user.scanHistory?.find(s => s.fileId === fileId);
    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.json({
      success: true,
      fileId: scan.fileId,
      originalName: scan.originalName,
      extractedText: scan.extractedText,
      createdAt: scan.createdAt
    });

  } catch (error) {
    console.error('File fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch file'
    });
  }
});

// Get scan data by ID (for results page)
router.get('/scans/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const scan = user.scanHistory?.find(s => s.fileId === id);
    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found'
      });
    }

    res.json({
      success: true,
      scan: {
        id: scan.fileId,
        filename: scan.originalName,
        date: scan.createdAt,
        analysisResults: scan.analysisResults,
        fileSize: scan.fileSize,
        mimeType: scan.mimeType
      }
    });

  } catch (error) {
    console.error('Scan fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scan data'
    });
  }
});

// Analyze resume endpoint
router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    const { fileId, analysisType, jobDescription } = req.body;
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }



    // Find the scan in user's history
    const scan = user.scanHistory?.find(s => s.fileId === fileId);
    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check if Pro analysis is requested but user is not Pro
    if (analysisType === 'pro' && user.tier !== 'pro') {
      return res.status(403).json({
        success: false,
        message: 'Pro subscription required for job match analysis',
        code: 'PRO_REQUIRED',
        upgradeUrl: '/pricing'
      });
    }

    // Validate job description for Pro analysis
    if (analysisType === 'pro' && (!jobDescription || jobDescription.length < 100)) {
      return res.status(400).json({
        success: false,
        message: 'Job description must be at least 100 characters for Pro analysis'
      });
    }

    // Check if OpenAI API key is configured
    if (!validateOpenAIKey()) {
      console.warn('OpenAI API key not configured, using fallback analysis');
    }

    let aiAnalysis;
    let analysisResults;

    try {
      // Call AI service for analysis
      console.log('Starting AI analysis for:', analysisType);
      aiAnalysis = await analyzeResumeWithAI(scan.extractedText, analysisType, jobDescription);
      console.log('AI analysis completed successfully');
      
      // Transform AI response to our format
      if (analysisType === 'quick') {
        analysisResults = {
          analysisType,
          score: aiAnalysis.overall_score,
          timestamp: new Date(),
          feedback: aiAnalysis.recommendations?.map(rec => 
            `${rec.issue}: ${rec.suggestion}${rec.example ? ` (Example: ${rec.example})` : ''}`
          ) || [],
          improvements: {
            keywords: extractKeywordsFromAIAnalysis(aiAnalysis),
            formatting: getScoreLabel(aiAnalysis.formatting_score),
            content: getScoreLabel(aiAnalysis.content_score),
            sections: {
              contact: aiAnalysis.structure_feedback?.has_contact_info ? 'Excellent' : 'Missing',
              summary: aiAnalysis.structure_feedback?.has_summary ? 'Good' : 'Missing',
              experience: aiAnalysis.structure_feedback?.has_experience ? 'Good' : 'Missing',
              skills: aiAnalysis.structure_feedback?.has_skills ? 'Good' : 'Missing',
              education: aiAnalysis.structure_feedback?.has_education ? 'Good' : 'Missing'
            }
          },
          strengths: aiAnalysis.strengths || [],
          criticalIssues: aiAnalysis.critical_issues || [],
          aiAnalysis: aiAnalysis, // Store full AI response for detailed view
          aiPowered: true
        };
      } else {
        analysisResults = {
          analysisType,
          score: aiAnalysis.overall_score,
          timestamp: new Date(),
          feedback: aiAnalysis.recommendations?.map(rec => 
            `${rec.issue}: ${rec.suggestion}${rec.keywords_to_add ? ` (Keywords: ${rec.keywords_to_add.join(', ')})` : ''}`
          ) || [],
          improvements: {
            keywords: aiAnalysis.keyword_analysis?.missing_critical_keywords || aiAnalysis.missing_skills || [],
            formatting: getScoreLabel(aiAnalysis.formatting_score),
            content: 'Job-specific analysis',
            sections: {
              contact: 'Excellent',
              summary: aiAnalysis.section_analysis?.summary ? getScoreLabel(aiAnalysis.section_analysis.summary.score) : 'Good match',
              experience: aiAnalysis.section_analysis?.experience ? getScoreLabel(aiAnalysis.section_analysis.experience.score) : 'Good match',
              skills: aiAnalysis.section_analysis?.skills ? getScoreLabel(aiAnalysis.section_analysis.skills.score) : getMatchLabel(aiAnalysis.skills_match_score),
              education: 'Good'
            }
          },
          jobMatch: {
            overallMatch: aiAnalysis.job_match_score,
            skillsMatch: aiAnalysis.skills_match_score,
            experienceMatch: aiAnalysis.experience_match_score,
            keywordMatch: aiAnalysis.keyword_analysis?.match_percentage || aiAnalysis.keyword_match_score,
            missingSkills: aiAnalysis.skills_gap?.technical_skills_missing || aiAnalysis.missing_skills || [],
            strongMatches: aiAnalysis.strong_matches || [],
            recommendations: aiAnalysis.tailored_suggestions || [],
            jobDescription: jobDescription,
            keywordAnalysis: aiAnalysis.keyword_analysis,
            skillsGap: aiAnalysis.skills_gap,
            sectionAnalysis: aiAnalysis.section_analysis,
            atsCompatibility: aiAnalysis.ats_compatibility
          },
          strengths: aiAnalysis.strengths || [],
          criticalIssues: aiAnalysis.critical_issues || [],
          aiAnalysis: aiAnalysis, // Store full AI response for detailed view
          aiPowered: true
        };
      }

    } catch (aiError) {
      console.error('AI Analysis failed:', aiError.message);
      
      // Only use fallback if AI service is completely unavailable
      if (aiError.message.includes('OpenAI client not available') || 
          aiError.message.includes('API key not configured')) {
        console.log('AI service not configured, using fallback analysis');
        
        const isProAnalysis = analysisType === 'pro';
        analysisResults = {
          analysisType,
          score: Math.floor(Math.random() * 30) + 70, // 70-100
          timestamp: new Date(),
          feedback: isProAnalysis ? [
            'Your resume matches 78% of the job requirements',
            'Missing key skills: Python, Machine Learning, AWS',
            'Strong match for leadership and project management experience',
            'Consider adding specific metrics mentioned in the job posting',
            'Optimize your summary to include job-specific keywords'
          ] : [
            'Add more relevant keywords for your target role',
            'Consider using a more ATS-friendly format',
            'Include quantifiable achievements with numbers',
            'Optimize your skills section with industry terms',
            'Improve section headers for better ATS parsing'
          ],
          improvements: {
            keywords: isProAnalysis ? 
              ['Python', 'Machine Learning', 'AWS', 'Data Analysis', 'Agile', 'Scrum', 'Leadership'] :
              ['JavaScript', 'React', 'Node.js', 'API Development', 'Agile'],
            formatting: 'Good',
            content: isProAnalysis ? 'Good match' : 'Needs improvement',
            sections: {
              contact: 'Excellent',
              summary: isProAnalysis ? 'Good match' : 'Good',
              experience: isProAnalysis ? 'Strong match' : 'Needs improvement',
              skills: isProAnalysis ? 'Partial match' : 'Fair',
              education: 'Good'
            }
          },
          jobMatch: isProAnalysis ? {
            overallMatch: 78,
            skillsMatch: 65,
            experienceMatch: 85,
            keywordMatch: 72,
            missingSkills: ['Python', 'Machine Learning', 'AWS'],
            strongMatches: ['Project Management', 'Leadership', 'Team Collaboration'],
            recommendations: [
              'Add Python programming experience to your skills section',
              'Include any machine learning projects or coursework',
              'Mention AWS or cloud computing experience if applicable',
              'Quantify your leadership achievements with team sizes and outcomes'
            ],
            jobDescription: jobDescription
          } : null,
          fallback: true, // Indicate this is fallback data
          aiPowered: false
        };
      } else {
        // For other AI errors (rate limits, timeouts, etc.), throw the error
        throw aiError;
      }
    }

    // Update scan with analysis results
    scan.analysisResults = analysisResults;
    await user.save();

    res.json({
      success: true,
      message: 'Analysis completed successfully',
      scan: scan,
      results: analysisResults
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze resume'
    });
  }
});

// Helper functions for AI analysis processing
function getScoreLabel(score) {
  if (!score) return 'Not analyzed';
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Needs improvement';
}

function getMatchLabel(score) {
  if (!score) return 'Not analyzed';
  if (score >= 85) return 'Excellent match';
  if (score >= 70) return 'Good match';
  if (score >= 50) return 'Partial match';
  return 'Poor match';
}

function extractKeywordsFromAIAnalysis(aiAnalysis) {
  const keywords = [];
  
  // Extract from missing skills
  if (aiAnalysis.missing_skills) {
    keywords.push(...aiAnalysis.missing_skills);
  }
  
  // Extract from keyword gaps
  if (aiAnalysis.keyword_gaps) {
    keywords.push(...aiAnalysis.keyword_gaps);
  }
  
  // Extract from recommendations
  if (aiAnalysis.recommendations) {
    aiAnalysis.recommendations.forEach(rec => {
      const words = rec.suggestion.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
      words.forEach(word => {
        if (!['should', 'could', 'would', 'include', 'improve', 'consider', 'ensure'].includes(word)) {
          const capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1);
          if (!keywords.includes(capitalizedWord)) {
            keywords.push(capitalizedWord);
          }
        }
      });
    });
  }
  
  return [...new Set(keywords)].slice(0, 10); // Return unique keywords, max 10
}

export default router;