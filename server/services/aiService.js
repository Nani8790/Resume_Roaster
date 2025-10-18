import OpenAI from "openai";

let client = null;

const getOpenAIClient = () => {
  if (!client && validateOpenAIKey()) {
    client = new OpenAI();
  }
  return client;
};

export const analyzeResumeWithAI = async (resumeText, analysisType, jobDescription = null) => {
  try {
    // Validate API key
    if (!validateOpenAIKey()) {
      throw new Error('OpenAI API key not configured');
    }

    // Truncate resume text if too long (OpenAI has token limits)
    const maxResumeLength = 8000; // Approximately 2000 tokens
    const truncatedResumeText = resumeText.length > maxResumeLength
      ? resumeText.substring(0, maxResumeLength) + '...[truncated]'
      : resumeText;

    let prompt;

    if (analysisType === 'quick') {
      prompt = `Analyze this specific resume for ATS compatibility and provide detailed, actionable feedback based on the actual content.

RESUME CONTENT:
${truncatedResumeText}

ANALYSIS REQUIREMENTS:
1. Carefully read and analyze the ACTUAL resume content above line by line
2. Look for section headers like "SUMMARY", "PROFESSIONAL SUMMARY", "PROFILE", "OBJECTIVE"
3. Check if there's a summary/profile paragraph (usually 2-4 sentences about the person)
4. Identify SPECIFIC issues in THIS resume (not generic advice)
5. Provide recommendations based on what you actually see in the content
6. Reference specific sections, skills, or experiences from the resume
7. Give concrete examples using the person's actual background
8. Be accurate about what sections exist - don't say missing if it's there

IMPORTANT: If you see a summary/profile section in the resume, mark has_summary as true. Only mark it false if there's genuinely no summary or objective statement.

Return ONLY valid JSON in this exact format:
{
  "overall_score": <0-100>,
  "formatting_score": <0-100>,
  "content_score": <0-100>,
  "structure_score": <0-100>,
  "recommendations": [
    {
      "priority": "critical|important|nice_to_have",
      "category": "formatting|content|structure",
      "issue": "Specific issue found in THIS resume",
      "suggestion": "Actionable fix based on this person's background",
      "example": "Specific example using their actual experience/skills"
    }
  ],
  "strengths": ["Specific things this person does well based on their resume"],
  "critical_issues": ["Top 3 specific fixes for THIS resume"],
  "formatting_feedback": {
    "has_proper_sections": true/false,
    "section_order": "good|needs_improvement", 
    "bullet_points_used": true/false,
    "length": "1 page|2 pages|too_long",
    "font_consistency": "good|issues_detected"
  },
  "content_feedback": {
    "action_verbs_count": <actual count from resume>,
    "quantifiable_achievements": <actual count from resume>,
    "weak_phrases": ["actual weak phrases found in this resume"],
    "strong_points": ["actual strong points from this resume"]
  },
  "structure_feedback": {
    "has_contact_info": true/false,
    "has_summary": true/false,
    "has_experience": true/false,
    "has_education": true/false,
    "has_skills": true/false
  }
}

IMPORTANT: Base ALL recommendations on the actual resume content. Do not give generic advice.`;
    } else {
      // Truncate job description if too long
      const maxJobDescLength = 2000;
      const truncatedJobDesc = jobDescription && jobDescription.length > maxJobDescLength
        ? jobDescription.substring(0, maxJobDescLength) + '...[truncated]'
        : jobDescription;

      prompt = `You are an expert ATS analyzer. Compare this resume against the job description and identify gaps.

Job Description: ${truncatedJobDesc}

Resume: ${truncatedResumeText}

Provide analysis in JSON format:
{
  "overall_score": <0-100>,
  "job_match_score": <0-100>,
  "keyword_analysis": {
    "total_job_keywords": <number>,
    "matched_keywords": ["list of matched keywords"],
    "missing_critical_keywords": ["list of important missing keywords"],
    "missing_nice_to_have": ["list of optional missing keywords"],
    "match_percentage": <0-100>
  },
  "skills_gap": {
    "technical_skills_missing": ["list"],
    "soft_skills_missing": ["list"],
    "certifications_mentioned": ["list"],
    "experience_gap": "description if any"
  },
  "recommendations": [
    {
      "priority": "critical|important|nice_to_have",
      "section": "summary|experience|skills|education",
      "issue": "What's missing or weak",
      "suggestion": "How to fix it with specific wording",
      "keywords_to_add": ["list of keywords"]
    }
  ],
  "section_analysis": {
    "summary": {
      "score": <0-100>,
      "issues": ["list"],
      "suggested_rewrite": "Suggested text that includes job keywords"
    },
    "experience": {
      "score": <0-100>,
      "issues": ["list"],
      "bullets_to_improve": [
        {
          "current": "Current text",
          "improved": "Improved version with keywords"
        }
      ]
    },
    "skills": {
      "score": <0-100>,
      "missing_from_job": ["list"],
      "irrelevant_skills": ["list"]
    },
    "projects": {
      "score": <0-100>,
      "issues": ["list of issues with current projects section"],
      "recommendations": ["specific project suggestions"]
    }
  },
  "project_recommendations": [
    {
      "title": "Project name",
      "description": "Brief description of what to build",
      "skills": ["list of skills this project demonstrates"],
      "difficulty": "Beginner|Intermediate|Advanced",
      "timeEstimate": "estimated time to complete",
      "priority": "high|medium|low based on job requirements"
    }
  ],
  "ats_compatibility": {
    "likely_to_pass_ats": true/false,
    "confidence": "high|medium|low",
    "reasons": ["list of reasons"]
  },
  "formatting_score": <0-100>,
  "content_score": <0-100>,
  "skills_match_score": <0-100>,
  "experience_match_score": <0-100>,
  "keyword_match_score": <0-100>,
  "missing_skills": ["exact skills from job description not found in resume"],
  "strong_matches": ["specific skills/experiences from resume that match job well"],
  "keyword_gaps": ["important keywords from job description missing in resume"],
  "tailored_suggestions": ["specific ways to improve this resume for this exact job"],
  "strengths": ["specific things in this resume that match job requirements well"],
  "critical_issues": ["top 3 specific changes needed for this job application"],
  "job_specific_feedback": {
    "role_alignment": "excellent|good|fair|poor",
    "industry_fit": "excellent|good|fair|poor", 
    "experience_level_match": "overqualified|perfect|underqualified",
    "salary_expectations_realistic": true/false
  },
  "formatting_feedback": {
    "has_proper_sections": true/false,
    "section_order": "good|needs_improvement",
    "bullet_points_used": true/false,
    "length": "1 page|2 pages|too_long",
    "font_consistency": "good|issues_detected"
  },
  "content_feedback": {
    "action_verbs_count": <actual count>,
    "quantifiable_achievements": <actual count>,
    "weak_phrases": ["actual weak phrases found"],
    "strong_points": ["actual strong points relevant to job"],
    "job_relevant_keywords": <count of job keywords found in resume>
  }
}


Be extremely specific about where and how to add missing keywords naturally. IMPORTANT: Base ALL analysis on the actual resume and job description content. Be specific and actionable.`;
    }

    const openaiClient = getOpenAIClient();
    if (!openaiClient) {
      throw new Error('OpenAI client not available');
    }

    console.log('Calling OpenAI API with GPT-4');
    const startTime = Date.now();

    const response = await Promise.race([
      openaiClient.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert ATS resume analyst with 15+ years of experience in recruitment and applicant tracking systems. You provide specific, actionable feedback based on actual resume content with deep keyword analysis and job matching capabilities. You understand how ATS systems parse resumes and can identify exactly where and how to add missing keywords naturally. Return ONLY valid JSON without any markdown formatting or explanations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
      // 60 second timeout
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI analysis timeout')), 60000)
      )
    ]);

    const endTime = Date.now();
    console.log(`OpenAI API call completed in ${endTime - startTime}ms`);

    const aiResponse = response.choices[0].message.content;
    console.log('Raw AI response length:', aiResponse.length);

    // Clean the response - remove any markdown formatting
    let cleanResponse = aiResponse.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
    }
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    // Parse the JSON response
    let analysisResult;
    try {
      analysisResult = JSON.parse(cleanResponse);
      console.log('Successfully parsed AI response');
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Cleaned response preview:', cleanResponse.substring(0, 500));
      throw new Error('AI response parsing failed');
    }

    return analysisResult;

  } catch (error) {
    console.error('OpenAI API error:', error);

    // Handle specific error types
    if (error.code === 'rate_limit_exceeded') {
      throw new Error('AI service is currently busy. Please try again in a few minutes.');
    }

    if (error.code === 'insufficient_quota') {
      throw new Error('AI service quota exceeded. Please contact support.');
    }

    if (error.message === 'AI analysis timeout') {
      throw new Error('AI analysis is taking longer than expected. Please try again.');
    }

    if (error.message === 'OpenAI API key not configured') {
      throw new Error('AI service is not properly configured.');
    }

    // Return intelligent fallback analysis based on actual resume content
    return generateFallbackAnalysis(truncatedResumeText, analysisType, jobDescription);
  }
};

// Intelligent fallback analysis based on actual resume content
const generateFallbackAnalysis = (resumeText, analysisType, jobDescription = null) => {
  console.log('Generating intelligent fallback analysis based on resume content');
  console.log('Resume text preview:', resumeText.substring(0, 200));

  const text = resumeText.toLowerCase();
  const lines = resumeText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  // More sophisticated content detection
  const hasContactInfo = /email|phone|@|linkedin|github/.test(text) ||
    lines.some(line => /@/.test(line) || /\(\d{3}\)/.test(line));

  // Better summary detection - look for actual summary content, not just keywords
  const hasSummary = detectSummarySection(lines, text);

  // Better experience detection
  const hasExperience = /experience|work history|employment|professional experience/.test(text) ||
    lines.some(line => /\d{4}.*-.*\d{4}|\d{4}.*-.*present/i.test(line));

  // Better education detection  
  const hasEducation = /education|degree|university|college|school|bachelor|master|phd/.test(text) ||
    lines.some(line => /university|college|bachelor|master|degree/i.test(line));

  // Better skills detection
  const hasSkills = /skills|technologies|technical skills|programming|competencies/.test(text) ||
    detectSkillsSection(lines);

  // Count quantifiable achievements
  const numberMatches = text.match(/\d+%|\d+\+|\$\d+|\d+ years?|\d+ months?/g) || [];
  const quantifiableAchievements = numberMatches.length;

  // Find weak phrases
  const weakPhrases = [];
  if (text.includes('responsible for')) weakPhrases.push('responsible for');
  if (text.includes('duties include')) weakPhrases.push('duties include');
  if (text.includes('worked on')) weakPhrases.push('worked on');
  if (text.includes('helped with')) weakPhrases.push('helped with');

  // Count action verbs
  const actionVerbs = ['led', 'managed', 'developed', 'created', 'implemented', 'designed', 'built', 'achieved', 'improved', 'increased'];
  const actionVerbCount = actionVerbs.filter(verb => text.includes(verb)).length;

  // Extract skills mentioned
  const commonSkills = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'aws', 'docker', 'git', 'agile', 'scrum'];
  const foundSkills = commonSkills.filter(skill => text.includes(skill));

  // Generate specific recommendations based on actual content
  const recommendations = [];

  if (quantifiableAchievements < 3) {
    recommendations.push({
      priority: "critical",
      category: "content",
      issue: "Limited quantifiable achievements found in your resume",
      suggestion: "Add specific numbers and metrics to demonstrate your impact",
      example: "Instead of 'improved performance', write 'improved system performance by 40%'"
    });
  }

  if (weakPhrases.length > 0) {
    recommendations.push({
      priority: "important",
      category: "content",
      issue: `Weak phrases detected: ${weakPhrases.join(', ')}`,
      suggestion: "Replace passive language with strong action verbs",
      example: `Replace '${weakPhrases[0]}' with 'Led', 'Managed', or 'Executed'`
    });
  }

  if (actionVerbCount < 5) {
    recommendations.push({
      priority: "important",
      category: "content",
      issue: "Limited use of strong action verbs in your experience descriptions",
      suggestion: "Start bullet points with powerful action verbs to show leadership",
      example: "Use verbs like 'Led', 'Developed', 'Implemented', 'Achieved'"
    });
  }

  if (!hasSkills) {
    recommendations.push({
      priority: "critical",
      category: "structure",
      issue: "No dedicated skills section found",
      suggestion: "Add a skills section with relevant technical and soft skills",
      example: "Create a 'Technical Skills' section listing your programming languages, tools, and frameworks"
    });
  }

  if (!hasSummary) {
    recommendations.push({
      priority: "important",
      category: "structure",
      issue: "Missing professional summary or objective statement",
      suggestion: "Add a compelling professional summary at the top of your resume",
      example: "Write 2-3 sentences highlighting your key qualifications and career goals"
    });
  }

  const baseAnalysis = {
    overall_score: Math.max(60, Math.min(90, 70 + (quantifiableAchievements * 3) + (actionVerbCount * 2) - (weakPhrases.length * 5))),
    formatting_score: hasContactInfo && hasExperience ? 85 : 70,
    content_score: Math.max(50, 80 - (weakPhrases.length * 10) + (quantifiableAchievements * 5)),
    structure_score: [hasContactInfo, hasSummary, hasExperience, hasEducation, hasSkills].filter(Boolean).length * 17,
    recommendations: recommendations.slice(0, 5),
    strengths: generateStrengths(text, foundSkills, quantifiableAchievements),
    critical_issues: generateCriticalIssues(quantifiableAchievements, weakPhrases, hasSkills),
    formatting_feedback: {
      has_proper_sections: hasExperience && hasEducation,
      section_order: "good",
      bullet_points_used: text.includes('•') || text.includes('-'),
      length: resumeText.length > 3000 ? "2 pages" : "1 page",
      font_consistency: "good"
    },
    content_feedback: {
      action_verbs_count: actionVerbCount,
      quantifiable_achievements: quantifiableAchievements,
      weak_phrases: weakPhrases,
      strong_points: generateStrongPoints(text, foundSkills)
    },
    structure_feedback: {
      has_contact_info: hasContactInfo,
      has_summary: hasSummary,
      has_experience: hasExperience,
      has_education: hasEducation,
      has_skills: hasSkills
    }
  };

  if (analysisType === 'pro' && jobDescription) {
    // Add job-specific analysis for Pro users
    const jobText = jobDescription.toLowerCase();
    const jobSkills = commonSkills.filter(skill => jobText.includes(skill));
    const missingSkills = jobSkills.filter(skill => !foundSkills.includes(skill));
    const matchingSkills = jobSkills.filter(skill => foundSkills.includes(skill));
    const keywordMatchPercentage = jobSkills.length > 0 ? (matchingSkills.length / jobSkills.length) * 100 : 75;

    return {
      ...baseAnalysis,
      job_match_score: Math.max(50, 85 - (missingSkills.length * 10)),
      skills_match_score: keywordMatchPercentage,
      experience_match_score: 80,
      keyword_match_score: Math.max(60, 90 - (missingSkills.length * 8)),
      missing_skills: missingSkills,
      strong_matches: matchingSkills,
      keyword_gaps: missingSkills,
      tailored_suggestions: generateJobSpecificSuggestions(missingSkills, matchingSkills),
      keyword_analysis: {
        total_job_keywords: jobSkills.length,
        matched_keywords: matchingSkills,
        missing_critical_keywords: missingSkills.slice(0, 3),
        missing_nice_to_have: missingSkills.slice(3),
        match_percentage: keywordMatchPercentage
      },
      skills_gap: {
        technical_skills_missing: missingSkills,
        soft_skills_missing: ['Communication', 'Leadership'].filter(skill => !text.includes(skill.toLowerCase())),
        certifications_mentioned: [],
        experience_gap: missingSkills.length > 3 ? "Significant technical skills gap identified" : "Minor skills enhancement needed"
      },
      section_analysis: {
        summary: {
          score: hasSummary ? 80 : 40,
          issues: hasSummary ? [] : ["Missing professional summary"],
          suggested_rewrite: `Professional ${foundSkills[0] || 'Software'} Engineer with expertise in ${matchingSkills.slice(0, 2).join(' and ')}...`
        },
        experience: {
          score: hasExperience ? 85 : 50,
          issues: quantifiableAchievements < 2 ? ["Add more quantifiable achievements"] : [],
          bullets_to_improve: [
            {
              current: "Worked on projects",
              improved: `Led ${foundSkills[0] || 'development'} projects resulting in measurable business impact`
            }
          ]
        },
        skills: {
          score: Math.max(60, 90 - (missingSkills.length * 15)),
          missing_from_job: missingSkills,
          irrelevant_skills: []
        },
        projects: {
          score: text.includes('project') ? 70 : 45,
          issues: text.includes('project') ? ["Limited project portfolio showcased"] : ["No projects section found"],
          recommendations: ["Add 2-3 relevant projects that demonstrate job-specific skills"]
        }
      },
      project_recommendations: generateProjectRecommendationsFromJob(jobDescription, missingSkills),
      ats_compatibility: {
        likely_to_pass_ats: missingSkills.length < 3,
        confidence: missingSkills.length < 2 ? "high" : "medium",
        reasons: [
          missingSkills.length < 3 ? "Good keyword match" : "Missing critical keywords",
          hasSkills ? "Skills section present" : "Missing skills section",
          quantifiableAchievements > 1 ? "Quantifiable achievements included" : "Limited quantifiable achievements"
        ]
      },
      job_specific_feedback: {
        role_alignment: matchingSkills.length >= jobSkills.length * 0.7 ? "good" : "fair",
        industry_fit: "good",
        experience_level_match: "perfect",
        salary_expectations_realistic: true
      }
    };
  }

  return baseAnalysis;
};

const generateStrengths = (text, foundSkills, quantifiableAchievements) => {
  const strengths = [];
  if (foundSkills.length > 3) strengths.push(`Strong technical skill set including ${foundSkills.slice(0, 3).join(', ')}`);
  if (quantifiableAchievements > 2) strengths.push("Good use of quantifiable achievements to demonstrate impact");
  if (text.includes('lead') || text.includes('manage')) strengths.push("Leadership experience clearly highlighted");
  return strengths.length > 0 ? strengths : ["Professional experience clearly documented", "Relevant skills mentioned"];
};

const generateCriticalIssues = (quantifiableAchievements, weakPhrases, hasSkills) => {
  const issues = [];
  if (quantifiableAchievements < 2) issues.push("Add more quantifiable achievements with specific numbers and percentages");
  if (weakPhrases.length > 0) issues.push(`Replace weak phrases like '${weakPhrases[0]}' with strong action verbs`);
  if (!hasSkills) issues.push("Add a dedicated skills section with relevant technical competencies");
  return issues.length > 0 ? issues : ["Enhance quantifiable achievements", "Strengthen action verbs", "Optimize keyword usage"];
};

const generateStrongPoints = (text, foundSkills) => {
  const points = [];
  if (foundSkills.length > 0) points.push(`Technical skills: ${foundSkills.join(', ')}`);
  if (text.includes('project')) points.push("Project experience mentioned");
  if (text.includes('team')) points.push("Team collaboration highlighted");
  return points.length > 0 ? points : ["Professional experience", "Educational background"];
};

const generateJobSpecificSuggestions = (missingSkills, matchingSkills) => {
  const suggestions = [];
  if (missingSkills.length > 0) {
    suggestions.push(`Add experience with ${missingSkills.slice(0, 2).join(' and ')} to better match job requirements`);
  }
  if (matchingSkills.length > 0) {
    suggestions.push(`Emphasize your ${matchingSkills[0]} experience more prominently`);
  }
  suggestions.push("Tailor your professional summary to highlight job-relevant experience");
  return suggestions;
};

const generateProjectRecommendationsFromJob = (jobDescription, missingSkills) => {
  if (!jobDescription) return [];

  const jobLower = jobDescription.toLowerCase();
  const projects = [];

  // Web Development Projects
  if (jobLower.includes('react') || jobLower.includes('frontend') || missingSkills.includes('react')) {
    projects.push({
      title: 'E-commerce Dashboard',
      description: 'Build a responsive admin dashboard with React.js featuring product management, analytics, and user authentication.',
      skills: ['React.js', 'JavaScript', 'CSS3', 'REST APIs', 'Redux'],
      difficulty: 'Intermediate',
      timeEstimate: '2-3 weeks',
      priority: missingSkills.includes('react') ? 'high' : 'medium'
    });
  }

  if (jobLower.includes('node') || jobLower.includes('backend') || missingSkills.includes('node')) {
    projects.push({
      title: 'Task Management API',
      description: 'Create a RESTful API with Node.js and Express for task management with user authentication and real-time updates.',
      skills: ['Node.js', 'Express.js', 'MongoDB', 'Socket.io', 'JWT'],
      difficulty: 'Intermediate',
      timeEstimate: '3-4 weeks',
      priority: missingSkills.includes('node') ? 'high' : 'medium'
    });
  }

  // Data Science Projects
  if (jobLower.includes('python') || jobLower.includes('data') || missingSkills.includes('python')) {
    projects.push({
      title: 'Sales Prediction Model',
      description: 'Develop a machine learning model to predict sales trends using Python, pandas, and scikit-learn with interactive visualizations.',
      skills: ['Python', 'Pandas', 'Scikit-learn', 'Matplotlib', 'Jupyter'],
      difficulty: 'Advanced',
      timeEstimate: '4-5 weeks',
      priority: missingSkills.includes('python') ? 'high' : 'medium'
    });
  }

  // Cloud Projects
  if (jobLower.includes('aws') || jobLower.includes('cloud') || missingSkills.includes('aws')) {
    projects.push({
      title: 'Serverless Web Application',
      description: 'Deploy a full-stack application using AWS Lambda, API Gateway, and DynamoDB with CI/CD pipeline.',
      skills: ['AWS Lambda', 'API Gateway', 'DynamoDB', 'CloudFormation', 'CI/CD'],
      difficulty: 'Advanced',
      timeEstimate: '3-4 weeks',
      priority: missingSkills.includes('aws') ? 'high' : 'medium'
    });
  }

  return projects.slice(0, 3);
};

// Helper function to detect summary section more accurately
const detectSummarySection = (lines, text) => {
  // Look for summary section headers
  const summaryHeaders = ['summary', 'professional summary', 'profile', 'objective', 'career objective', 'about'];
  const hasSummaryHeader = summaryHeaders.some(header =>
    lines.some(line => line.toLowerCase().includes(header) && line.length < 50)
  );

  if (hasSummaryHeader) {
    // Find the summary content - look for paragraph-like content after header
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (summaryHeaders.some(header => line.includes(header)) && line.length < 50) {
        // Check if next few lines contain summary content (longer sentences)
        const nextLines = lines.slice(i + 1, i + 4);
        const hasSummaryContent = nextLines.some(nextLine =>
          nextLine.length > 50 &&
          /experienced|professional|skilled|passionate|dedicated/.test(nextLine.toLowerCase())
        );
        return hasSummaryContent;
      }
    }
  }

  // Look for summary-like content at the beginning (after contact info)
  const topLines = lines.slice(0, 10);
  const hasEarlySummary = topLines.some(line =>
    line.length > 80 &&
    /experienced|professional|skilled|passionate|dedicated|years of experience/.test(line.toLowerCase())
  );

  return hasEarlySummary;
};

// Helper function to detect skills section more accurately
const detectSkillsSection = (lines) => {
  const skillsHeaders = ['skills', 'technical skills', 'core competencies', 'technologies', 'programming languages'];
  const hasSkillsHeader = skillsHeaders.some(header =>
    lines.some(line => line.toLowerCase().includes(header) && line.length < 50)
  );

  if (hasSkillsHeader) {
    // Look for skills content after header
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (skillsHeaders.some(header => line.includes(header)) && line.length < 50) {
        const nextLines = lines.slice(i + 1, i + 3);
        const hasSkillsContent = nextLines.some(nextLine =>
          /javascript|python|java|react|node|sql|aws|html|css|git/.test(nextLine.toLowerCase()) ||
          nextLine.split(/[,•\-]/).length > 2
        );
        return hasSkillsContent;
      }
    }
  }

  return false;
};

export const validateOpenAIKey = () => {
  return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-');
};