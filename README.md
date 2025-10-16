# Resume Roaster - AI-Powered ATS Resume Checker

A comprehensive SaaS platform that uses AI to analyze resumes for ATS compatibility and job matching, featuring a complete PRO tier with advanced analysis capabilities.

## 🚀 Features

### Core Features
- **AI-Powered Analysis**: OpenAI GPT-4 integration for intelligent resume analysis
- **Dual-Tier System**: Complete FREE and PRO experiences with dedicated components
- **ATS Compatibility Check**: Comprehensive formatting and structure analysis
- **Job Match Analysis**: Compare resumes against specific job descriptions (Pro feature)
- **Real-time Loading Screen**: Animated progress with step-by-step analysis updates
- **Priority-Based Feedback**: Critical, Important, and Nice-to-Have recommendations
- **File Support**: PDF and DOCX resume uploads with intelligent parsing
- **User Authentication**: JWT + Google OAuth integration
- **Comprehensive Results**: Separate optimized experiences for each tier

### AI Analysis Features
- **Dual Score Display**: Overall ATS Score + Job Match Score (PRO)
- **Enhanced Score Breakdown**: 4-bar visualization (Formatting, Content, Structure, Keywords)
- **Priority-Based Recommendations**: 🔴 Critical, 🟡 Important, 🟢 Nice-to-Have
- **Keyword Analysis**: Matched vs Missing keywords with counts and percentages
- **Section Analysis**: Expandable detailed analysis for each resume section
- **Before & After Examples**: Real improvement demonstrations
- **Skills Gap Analysis**: Technical skills, soft skills, and experience gaps
- **ATS Compatibility**: Pass likelihood with confidence levels and reasons

### Loading Experience
- 25-second animated analysis with progress bar
- Step-by-step status updates:
  - ✓ "Parsing resume structure..."
  - ✓ "Checking formatting..."
  - ✓ "Analyzing content quality..."
  - ⏳ "Calculating ATS score..."
- Real-time progress indication (0% → 100%)

## 🛠️ Tech Stack

- **Frontend**: React 18, Tailwind CSS, Vite, Lucide React Icons
- **Backend**: Node.js, Express.js, OpenAI API
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Passport.js (Google OAuth)
- **File Processing**: Multer, Mammoth (DOCX parsing)
- **AI Integration**: OpenAI GPT-4 for resume analysis

## 📋 Prerequisites

- Node.js (v16 or higher)
- Python 3.7+ (for accurate PDF parsing)
- MongoDB (local or cloud instance)
- OpenAI API key
- Google OAuth credentials (optional)

## 🚀 Quick Setup

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd resume-roaster
npm install
```

2. **Environment Configuration:**
Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/resume-roaster

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Session Secret
SESSION_SECRET=your-session-secret-here

# OpenAI API Key (Required for AI analysis)
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
```

3. **Install Python dependencies for PDF parsing:**
```bash
# On Windows
setup-python-deps.bat

# On Mac/Linux
cd server/python
pip install -r requirements.txt
```

4. **Start the services:**
```bash
# Start MongoDB (if running locally)
mongod

# Start the backend server
npm run server

# In another terminal, start the frontend
npm run dev
```

4. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔧 Configuration

### OpenAI API Setup
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to your `.env` file as `OPENAI_API_KEY`
3. Ensure you have sufficient credits for GPT-4 usage

### Google OAuth Setup (Optional)
1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
5. Add credentials to `.env` file

## 📁 Project Structure

```
resume-roaster/
├── src/                          # React frontend
│   ├── components/
│   │   ├── LoadingScreen.jsx     # AI analysis loading screen
│   │   ├── AnalysisResults.jsx   # Router component (tier-based routing)
│   │   ├── FreeAnalysisResults.jsx # FREE tier results page
│   │   ├── ProAnalysisResults.jsx  # PRO tier results page
│   │   ├── History.jsx           # Scan history page
│   │   ├── Settings.jsx          # User settings page
│   │   ├── ResumeUpload.jsx      # File upload component
│   │   └── ...
│   ├── contexts/
│   │   └── AuthContext.jsx       # Authentication context
│   └── main.jsx
├── server/                       # Express backend
│   ├── services/
│   │   └── aiService.js          # OpenAI integration
│   ├── routes/
│   │   ├── resume.js             # Resume analysis endpoints
│   │   └── auth.js               # Authentication routes
│   ├── models/
│   │   └── User.js               # User model with scan history
│   ├── middleware/
│   │   └── auth.js               # JWT authentication
│   └── index.js                  # Server entry point
├── .env                          # Environment variables
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Resume Analysis
- `POST /api/resume/upload` - Upload resume file
- `POST /api/resume/analyze` - Analyze resume with AI
- `GET /api/resume/history` - Get user's scan history
- `GET /api/resume/file/:fileId` - Get specific file content

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - User logout

### Debug Endpoints
- `GET /api/debug/ai` - Check AI service configuration
- `GET /api/debug/auth` - Test authentication middleware

## 🤖 AI Analysis Features

## 📊 Tier Comparison

| Feature | 🆓 FREE Tier | 👑 PRO Tier |
|---------|-------------|-------------|
| **Analysis Component** | `FreeAnalysisResults.jsx` | `ProAnalysisResults.jsx` |
| **Score Display** | Single ATS Score (circular) | Dual Scores: ATS + Job Match |
| **Score Breakdown** | 3 bars (Formatting, Content, Structure) | 4 bars (+ Keyword Match) |
| **Recommendations** | Top 5 basic suggestions | Priority-grouped (Critical/Important/Nice-to-Have) |
| **Keyword Analysis** | ❌ Not available | ✅ Found/Missing with counts & percentages |
| **Section Analysis** | ❌ Basic overview only | ✅ 5 expandable sections with scores |
| **Before/After Examples** | ❌ Limited examples | ✅ 3 detailed examples with toggle |
| **Job Description Analysis** | ❌ Not supported | ✅ Full job-specific matching |
| **Scan Limit** | 1 per week | Unlimited |
| **Report Download** | Basic JSON | Full PDF Report |
| **History Saving** | ❌ Not available | ✅ Full history with search |
| **ATS Compatibility** | Basic score only | Detailed pass/fail analysis |
| **Skills Gap Analysis** | ❌ Not available | ✅ Technical & soft skills gaps |
| **Action Buttons** | 2 basic actions | 3 premium actions |

### 🆓 Quick Health Check (FREE Tier)
**Component**: `FreeAnalysisResults.jsx` - Essential resume feedback

**Key Features:**
- **Single ATS Score**: Circular progress indicator (0-100) with color coding
- **3-Bar Breakdown**: Formatting, Content, Structure scores
- **Top 5 Recommendations**: Priority-based suggestions with clear icons
- **Basic Before/After**: Simple improvement examples
- **Weekly Limit**: 1 resume scan per week
- **Basic Actions**: Analyze another resume, basic report download
- **Upgrade Prompts**: Strategic PRO feature promotion

### 👑 Job Match Analysis (PRO Tier) - COMPREHENSIVE
**Component**: `ProAnalysisResults.jsx` - Full-featured professional analysis

**1. Dual Score Display:**
- ✅ Overall ATS Score (0-100) - Circular progress chart
- ✅ Job Match Score (0-100) - Only for job-specific analysis
- ✅ Side-by-side comparison with color-coded results

**2. Enhanced Score Breakdown (4 Bars):**
- ✅ Formatting Score with progress bar
- ✅ Content Quality Score with progress bar
- ✅ Structure Score with progress bar
- ✅ Keyword Match Score (job-specific only)

**3. Keyword Analysis Section (Job-Specific):**
- ✅ Keywords Found (green tags) with count display
- ✅ Critical Missing Keywords (red tags) with count
- ✅ Match percentage: "12/18 critical keywords found"
- ✅ Visual progress bar for keyword match rate

**4. Priority Recommendations:**
- ✅ **🔴 CRITICAL (Fix immediately)**: Top priority fixes
- ✅ **🟡 IMPORTANT (Should fix)**: High-impact improvements
- ✅ **🟢 NICE TO HAVE (Polish)**: Optional enhancements
- ✅ Each includes: Section name, specific issue, detailed suggestion, keywords to add

**5. Detailed Section Analysis (Expandable):**
- ✅ **Contact Information [Score: X/100]**: Expandable with ✓ good points, ⚠️ issues, → fixes
- ✅ **Professional Summary [Score: X/100]**: Rewrite suggestions and optimization tips
- ✅ **Work Experience [Score: X/100]**: Bullet point improvements and quantification
- ✅ **Skills [Score: X/100]**: Missing skills identification and relevance analysis
- ✅ **Education [Score: X/100]**: Completeness and enhancement suggestions

**6. Before & After Examples:**
- ✅ Toggle show/hide functionality
- ✅ 3 real examples from resume content
- ✅ **❌ BEFORE**: "Weak version" with clear formatting
- ✅ **✅ AFTER**: "Improved version with keywords" with enhancements
- ✅ Professional Summary, Experience bullets, and Skills section examples

**7. Action Buttons:**
- ✅ **"Download Full PDF Report"**: Comprehensive analysis export
- ✅ **"Analyze Another Resume"**: Unlimited scans
- ✅ **"Save to History"**: Persistent analysis storage

**8. Advanced Data Handling:**
- ✅ Pro tier verification and access control
- ✅ Full analysis_data retrieval from database
- ✅ Job-specific vs general analysis routing
- ✅ Comprehensive error handling and fallback modes
- ✅ Real-time progress tracking and status updates

### AI Prompt Structure
The system uses carefully crafted prompts for both tiers:

```javascript
// FREE Tier - Quick Analysis Prompt
"Analyze this resume for ATS compatibility. Return JSON with:
- overall_score (0-100)
- formatting_score, content_score, structure_score (0-100)
- recommendations: priority-based array with issue, suggestion, example
- critical_issues: top 3 specific fixes
- strengths: what the resume does well
- formatting/content/structure_feedback: detailed analysis"

// PRO Tier - Comprehensive Job Match Prompt  
"Compare this resume against job description. Return JSON with:
- overall_score, job_match_score (0-100)
- keyword_analysis: {total_keywords, matched_keywords[], missing_critical_keywords[], match_percentage}
- skills_gap: {technical_skills_missing[], soft_skills_missing[], experience_gap}
- section_analysis: {summary: {score, issues[], suggested_rewrite}, experience: {score, bullets_to_improve[]}, skills: {score, missing_from_job[], irrelevant_skills[]}}
- ats_compatibility: {likely_to_pass_ats, confidence, reasons[]}
- recommendations: priority-grouped with section, keywords_to_add[]"
```

## 🏗️ Technical Implementation

### Component Architecture
```
src/components/
├── AnalysisResults.jsx          # Router component (tier-based routing)
├── FreeAnalysisResults.jsx      # FREE tier optimized component
├── ProAnalysisResults.jsx       # PRO tier comprehensive component
├── LoadingScreen.jsx            # Shared loading experience
└── shared/                      # Shared UI components
```

### State Management
- **Tier Detection**: Automatic routing based on `user.tier`
- **Analysis Type**: Handles both 'quick' and 'pro' analysis types
- **Job Description**: Conditional features based on job description presence
- **Expandable Sections**: Local state for section expansion in PRO tier
- **Before/After Toggle**: Show/hide functionality for examples

### Data Flow
1. **Upload**: File processing and text extraction
2. **Analysis**: AI service call with tier-appropriate prompts
3. **Routing**: Automatic component selection based on user tier
4. **Rendering**: Tier-optimized UI with appropriate features
5. **Actions**: Tier-specific action buttons and functionality

## 🔒 Error Handling

The application includes comprehensive error handling:

- **AI Service Failures**: Automatic fallback to mock analysis
- **Rate Limiting**: User-friendly messages for API limits
- **Timeout Handling**: 30-second timeout with retry options
- **File Upload Errors**: Validation and size limit enforcement
- **Authentication Errors**: Clear error messages and redirect handling

## 🎨 UI/UX Features

### Component Architecture
- **Tier-Based Routing**: Automatic routing to appropriate results page based on user tier
- **Separated Components**: Clean separation between FREE and PRO experiences
- **Maintainable Code**: Each tier has its own optimized component
- **Consistent Navigation**: Shared navigation patterns across both tiers

### 🆓 FREE Tier Results Page (`FreeAnalysisResults.jsx`)
- **Streamlined Layout**: Focused on essential feedback
- **Single Circular Chart**: ATS compatibility score visualization
- **3-Bar Breakdown**: Core scoring metrics (Formatting, Content, Structure)
- **Top 5 Recommendations**: Priority-based with clear action items
- **Upgrade Prompts**: Strategic PRO feature promotion
- **Basic Actions**: Limited functionality with clear upgrade paths

### 👑 PRO Tier Results Page (`ProAnalysisResults.jsx`) - COMPREHENSIVE
- **Full-Width Layout**: Maximum space for detailed analysis
- **Dual Circular Charts**: ATS Score + Job Match Score side-by-side
- **4-Bar Enhanced Breakdown**: Including keyword match analysis
- **Comprehensive Keyword Analysis**: Found vs Missing with percentages
- **Priority-Grouped Recommendations**: Critical/Important/Nice-to-Have sections
- **Expandable Section Analysis**: 5 detailed sections with scores and fixes
- **Before/After Examples**: 3 real improvement demonstrations with toggle
- **Premium Action Suite**: Full PDF reports, unlimited scans, history saving
- **Professional Branding**: Crown icons, gradient themes, premium styling
- **Advanced Data Visualization**: Multiple chart types and progress indicators

### Loading Screen
- Animated spinner with step icons
- Real-time progress bar (0-100%)
- Dynamic status messages
- Estimated completion time
- AI-powered branding

### Navigation
- **Header Navigation**: Dashboard, History, Settings
- **User Dropdown**: Profile info, logout functionality, tier display
- **Breadcrumbs**: Clear navigation paths
- **Responsive Design**: Mobile-friendly interface

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-domain.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/resume-roaster
JWT_SECRET=your-production-jwt-secret
OPENAI_API_KEY=your-openai-api-key
# ... other production configs
```

### Build Commands
```bash
# Build frontend
npm run build

# Start production server
npm start
```

## 📊 Usage Analytics

The system tracks:
- Resume upload success rates
- AI analysis completion rates
- User engagement metrics
- Error rates and types
- Feature usage (free vs pro)

## ✅ Recently Implemented (PRO Tier Complete)

- ✅ **Comprehensive PRO Results Page**: Full-featured analysis with all requested components
- ✅ **Dual Score Display**: ATS + Job Match scores with circular progress charts
- ✅ **Enhanced 4-Bar Breakdown**: Formatting, Content, Structure, Keywords
- ✅ **Advanced Keyword Analysis**: Found/Missing keywords with counts and percentages
- ✅ **Priority Recommendations**: Critical/Important/Nice-to-Have groupings
- ✅ **Expandable Section Analysis**: 5 detailed sections with scores and actionable fixes
- ✅ **Before & After Examples**: Real improvement demonstrations with toggle functionality
- ✅ **Premium Action Buttons**: PDF reports, unlimited scans, history saving
- ✅ **Professional UI/UX**: Crown branding, gradient themes, responsive design

## 🔮 Future Enhancements

- [ ] **PDF Report Generation**: Professional formatted reports with charts
- [ ] **Resume Template Suggestions**: ATS-optimized templates based on analysis
- [ ] **Industry-Specific Analysis**: Tailored feedback for different sectors
- [ ] **Batch Resume Processing**: Multiple resume analysis for recruiters
- [ ] **Job Board Integration**: Direct application tracking and optimization
- [ ] **Advanced Analytics Dashboard**: Usage metrics and improvement tracking
- [ ] **Mobile App Development**: Native iOS/Android applications
- [ ] **AI Resume Builder**: Guided resume creation with real-time optimization
- [ ] **Interview Preparation**: AI-powered interview questions based on resume analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the debug endpoints for configuration issues
- Review the console logs for detailed error messages
- Ensure all environment variables are properly set
- Verify OpenAI API key has sufficient credits

## 🔧 Troubleshooting

### Common Issues

1. **AI Analysis Not Working**
   - Check OpenAI API key in `.env`
   - Verify API key has GPT-4 access
   - Check console for rate limit errors

2. **File Upload Failures**
   - Ensure file size is under 5MB
   - Check file format (PDF/DOCX only)
   - Verify upload directory permissions

3. **Authentication Issues**
   - Check JWT secret configuration
   - Verify Google OAuth credentials
   - Clear browser localStorage if needed

## 🎯 Testing the Complete System

### Testing FREE Tier Analysis:
1. **Register as FREE user** (default tier)
2. **Upload a resume** (PDF or DOCX format)
3. **Choose "Quick Analysis"**
4. **Watch animated loading screen** with progress updates
5. **Review FREE results page** with basic analysis and upgrade prompts

### Testing PRO Tier Analysis:
1. **Upgrade to PRO tier** (use `create-pro-user.js` script for testing)
2. **Upload a resume** with job description for full analysis
3. **Choose "Job Match Analysis"**
4. **Experience comprehensive PRO results**:
   - Dual circular scores (ATS + Job Match)
   - 4-bar enhanced breakdown
   - Detailed keyword analysis with counts
   - Priority-grouped recommendations
   - Expandable section analysis with scores
   - Before/After examples with toggle
   - Premium action buttons

### Testing Key Features:
- **Tier-Based Routing**: Automatic routing to appropriate results page
- **Job-Specific Analysis**: Enhanced features when job description provided
- **Expandable Sections**: Click to expand detailed section analysis
- **Before/After Toggle**: Show/hide improvement examples
- **Action Buttons**: Test PDF download, history saving, new analysis
- **Error Handling**: AI service fallback and retry functionality

The system provides a complete dual-tier experience with automatic fallback to mock data if AI service is unavailable.