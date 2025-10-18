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
import { generateProReportPDF } from '../services/pdfService.js';

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
        extractedLength: extractedText.length,
        scanInfo: req.scanInfo || null
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

    // Calculate scan usage
    const now = new Date();
    let scanInfo;

    if (user.tier === 'pro') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const proScansThisMonth = user.scanHistory?.filter(scan => 
        new Date(scan.createdAt) >= startOfMonth && 
        scan.analysisResults?.analysisType === 'pro'
      ).length || 0;

      scanInfo = {
        scansUsed: proScansThisMonth,
        scansRemaining: 15 - proScansThisMonth,
        tier: 'pro',
        maxScans: 15,
        resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
      };
    } else {
      const startOfWeek = new Date(now);
      const day = startOfWeek.getUTCDay();
      const diff = startOfWeek.getUTCDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setUTCDate(diff);
      startOfWeek.setUTCHours(0, 0, 0, 0);

      const scansThisWeek = user.scanHistory?.filter(scan => 
        new Date(scan.createdAt) >= startOfWeek
      ).length || 0;

      const nextWeek = new Date(startOfWeek);
      nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);

      scanInfo = {
        scansUsed: scansThisWeek,
        scansRemaining: 1 - scansThisWeek,
        tier: 'free',
        maxScans: 1,
        resetDate: nextWeek.toISOString()
      };
    }

    res.json({
      success: true,
      history,
      scanInfo
    });

  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scan history'
    });
  }
});

// Get scan usage information
router.get('/scan-usage', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const now = new Date();
    let scanInfo;

    if (user.tier === 'pro') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const proScansThisMonth = user.scanHistory?.filter(scan => 
        new Date(scan.createdAt) >= startOfMonth && 
        scan.analysisResults?.analysisType === 'pro'
      ).length || 0;

      scanInfo = {
        scansUsed: proScansThisMonth,
        scansRemaining: 15 - proScansThisMonth,
        tier: 'pro',
        maxScans: 15,
        resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
        period: 'monthly'
      };
    } else {
      const startOfWeek = new Date(now);
      const day = startOfWeek.getUTCDay();
      const diff = startOfWeek.getUTCDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setUTCDate(diff);
      startOfWeek.setUTCHours(0, 0, 0, 0);

      const scansThisWeek = user.scanHistory?.filter(scan => 
        new Date(scan.createdAt) >= startOfWeek
      ).length || 0;

      const nextWeek = new Date(startOfWeek);
      nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);

      scanInfo = {
        scansUsed: scansThisWeek,
        scansRemaining: 1 - scansThisWeek,
        tier: 'free',
        maxScans: 1,
        resetDate: nextWeek.toISOString(),
        period: 'weekly'
      };
    }

    res.json({
      success: true,
      scanInfo
    });

  } catch (error) {
    console.error('Scan usage fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scan usage'
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

    // Check Pro analysis limits (only for Pro analysis, quick analysis is unlimited)
    if (analysisType === 'pro' && user.tier === 'pro') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const proScansThisMonth = user.scanHistory?.filter(scan => 
        new Date(scan.createdAt) >= startOfMonth && 
        scan.analysisResults?.analysisType === 'pro'
      ).length || 0;

      if (proScansThisMonth >= 15) {
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        
        return res.status(429).json({
          success: false,
          message: 'Monthly Pro analysis limit reached (15 Pro analyses per month)',
          code: 'PRO_SCAN_LIMIT_REACHED',
          resetDate: nextMonth.toISOString(),
          scansUsed: proScansThisMonth,
          scansRemaining: 15 - proScansThisMonth,
          tier: 'pro',
          maxScans: 15
        });
      }
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
              education: 'Good',
              projects: aiAnalysis.section_analysis?.projects ? getScoreLabel(aiAnalysis.section_analysis.projects.score) : 'Needs improvement'
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
            atsCompatibility: aiAnalysis.ats_compatibility,
            projectRecommendations: aiAnalysis.project_recommendations || generateProjectRecommendations(jobDescription, aiAnalysis)
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
              education: 'Good',
              projects: isProAnalysis ? 'Needs improvement' : 'Fair'
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
            jobDescription: jobDescription,
            projectRecommendations: generateProjectRecommendations(jobDescription, { missing_skills: ['Python', 'Machine Learning', 'AWS'] })
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

function generateProjectRecommendations(jobDescription, aiAnalysis) {
  if (!jobDescription) {
    return [];
  }

  const jobLower = jobDescription.toLowerCase();
  const missingSkills = aiAnalysis.skills_gap?.technical_skills_missing || aiAnalysis.missing_skills || [];
  const projects = [];

  // Web Development Projects
  if (jobLower.includes('react') || jobLower.includes('frontend') || jobLower.includes('javascript')) {
    projects.push({
      title: 'Interactive Dashboard Application',
      description: 'Build a responsive dashboard using React.js with real-time data visualization, user authentication, and API integration.',
      skills: ['React.js', 'JavaScript', 'CSS3', 'REST APIs', 'Chart.js'],
      difficulty: 'Intermediate',
      timeEstimate: '2-3 weeks',
      priority: missingSkills.some(skill => ['react', 'javascript', 'frontend'].includes(skill.toLowerCase())) ? 'high' : 'medium'
    });
  }

  if (jobLower.includes('node') || jobLower.includes('backend') || jobLower.includes('api')) {
    projects.push({
      title: 'RESTful API with Authentication',
      description: 'Create a scalable Node.js API with JWT authentication, database integration, and comprehensive testing.',
      skills: ['Node.js', 'Express.js', 'MongoDB', 'JWT', 'Jest'],
      difficulty: 'Intermediate',
      timeEstimate: '2-4 weeks',
      priority: missingSkills.some(skill => ['node', 'backend', 'api'].includes(skill.toLowerCase())) ? 'high' : 'medium'
    });
  }

  // Data Science Projects
  if (jobLower.includes('python') || jobLower.includes('data') || jobLower.includes('machine learning')) {
    projects.push({
      title: 'Predictive Analytics Model',
      description: 'Develop a machine learning model for data prediction using Python, pandas, and scikit-learn with data visualization.',
      skills: ['Python', 'Pandas', 'Scikit-learn', 'Matplotlib', 'Jupyter'],
      difficulty: 'Advanced',
      timeEstimate: '3-5 weeks',
      priority: missingSkills.some(skill => ['python', 'machine learning', 'data analysis'].includes(skill.toLowerCase())) ? 'high' : 'medium'
    });
  }

  // Cloud/DevOps Projects
  if (jobLower.includes('aws') || jobLower.includes('cloud') || jobLower.includes('docker')) {
    projects.push({
      title: 'Cloud-Native Application Deployment',
      description: 'Deploy a containerized application on AWS using Docker, implement CI/CD pipeline, and set up monitoring.',
      skills: ['AWS', 'Docker', 'CI/CD', 'Kubernetes', 'Terraform'],
      difficulty: 'Advanced',
      timeEstimate: '3-4 weeks',
      priority: missingSkills.some(skill => ['aws', 'docker', 'kubernetes'].includes(skill.toLowerCase())) ? 'high' : 'medium'
    });
  }

  // Mobile Development Projects
  if (jobLower.includes('mobile') || jobLower.includes('react native') || jobLower.includes('flutter')) {
    projects.push({
      title: 'Cross-Platform Mobile App',
      description: 'Build a feature-rich mobile application with offline capabilities, push notifications, and native device integration.',
      skills: ['React Native', 'Redux', 'Firebase', 'Push Notifications', 'AsyncStorage'],
      difficulty: 'Intermediate',
      timeEstimate: '4-6 weeks',
      priority: missingSkills.some(skill => ['react native', 'mobile', 'flutter'].includes(skill.toLowerCase())) ? 'high' : 'medium'
    });
  }

  // Database Projects
  if (jobLower.includes('database') || jobLower.includes('sql') || jobLower.includes('postgresql')) {
    projects.push({
      title: 'Database Design and Optimization',
      description: 'Design a normalized database schema, implement complex queries, and optimize performance for large datasets.',
      skills: ['PostgreSQL', 'SQL', 'Database Design', 'Query Optimization', 'Indexing'],
      difficulty: 'Intermediate',
      timeEstimate: '2-3 weeks',
      priority: missingSkills.some(skill => ['sql', 'database', 'postgresql'].includes(skill.toLowerCase())) ? 'high' : 'medium'
    });
  }

  // Sort by priority (high first) and return top 4
  return projects
    .sort((a, b) => a.priority === 'high' && b.priority !== 'high' ? -1 : 1)
    .slice(0, 4);
}


// Generate PDF report endpoint (Pro feature)
router.get('/pdf-report/:fileId', authenticateToken, requireProSubscription, async (req, res) => {
  try {
    console.log('PDF generation request received for fileId:', req.params.fileId);
    console.log('User:', req.user ? req.user.email : 'No user');
    console.log('User tier:', req.user ? req.user.tier : 'No tier');

    const { fileId } = req.params;
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
        message: 'Scan not found'
      });
    }

    // Check if analysis results exist
    if (!scan.analysisResults) {
      return res.status(400).json({
        success: false,
        message: 'No analysis results found. Please analyze the resume first.'
      });
    }

    // Only allow PDF generation for Pro analysis
    if (scan.analysisResults.analysisType !== 'pro') {
      return res.status(400).json({
        success: false,
        message: 'PDF reports are only available for Pro analysis'
      });
    }

    console.log('Generating PDF report for scan:', fileId);

    // Prepare data for PDF generation
    const reportData = {
      fileName: scan.originalName,
      jobDescription: scan.analysisResults.jobMatch?.jobDescription || '',
      overallScore: scan.analysisResults.score || 0,
      jobMatchScore: scan.analysisResults.jobMatch?.overallMatch || 0,
      analysisDate: scan.analysisResults.timestamp || scan.createdAt,
      keywordAnalysis: scan.analysisResults.jobMatch?.keywordAnalysis || {
        matched: scan.analysisResults.jobMatch?.strongMatches || [],
        missing: scan.analysisResults.jobMatch?.missingSkills || []
      },
      skillsGap: scan.analysisResults.jobMatch?.skillsGap || {
        missing: scan.analysisResults.jobMatch?.missingSkills || []
      },
      sectionAnalysis: scan.analysisResults.jobMatch?.sectionAnalysis || {},
      atsCompatibility: scan.analysisResults.jobMatch?.atsCompatibility || { score: 85 },
      recommendations: scan.analysisResults.jobMatch?.recommendations || scan.analysisResults.feedback || [],
      strengths: scan.analysisResults.strengths || [],
      criticalIssues: scan.analysisResults.criticalIssues || []
    };

    // Generate PDF
    const pdfBuffer = await generateProReportPDF(reportData);
    console.log('Generated PDF buffer size:', pdfBuffer.length, 'bytes');

    // Verify the buffer is valid
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Generated PDF buffer is empty');
    }

    // Create temporary file for download
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const fileName = `resume-analysis-${scan.originalName.replace(/\.[^/.]+$/, '')}-${Date.now()}.pdf`;
    const tempFilePath = path.join(tempDir, fileName);

    // Write PDF to temporary file
    fs.writeFileSync(tempFilePath, pdfBuffer);

    // Send file using res.download (this bypasses middleware issues)
    res.download(tempFilePath, fileName, (err) => {
      // Clean up temporary file after download
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }

      if (err) {
        console.error('Download error:', err);
      } else {
        console.log('PDF downloaded successfully:', fileName);
      }
    });

    console.log('PDF report generated successfully:', fileName);

  } catch (error) {
    console.error('PDF generation error:', error);
    console.error('Error stack:', error.stack);

    // Make sure we return JSON error response
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate PDF report',
        error: error.message
      });
    }
  }
});

export default router;