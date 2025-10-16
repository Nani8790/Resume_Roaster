// Load environment variables FIRST
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from './models/User.js';
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resume.js';
import dashboardRoutes from './routes/dashboard.js';
import stripeRoutes from './routes/stripe.js';
import userRoutes from './routes/user.js';
import { authenticateToken } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-roaster')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Configure Passport Google OAuth Strategy (temporarily disabled for testing)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google OAuth Strategy - Profile received:', {
      id: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName
    });

    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId: profile.id });
    console.log('Existing user with Google ID:', user ? 'Found' : 'Not found');

    if (user) {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      console.log('Updated existing user login time');
      return done(null, user);
    }

    // Check if user exists with same email
    user = await User.findOne({ email: profile.emails[0].value });
    console.log('Existing user with email:', user ? 'Found' : 'Not found');

    if (user) {
      // Link Google account to existing user
      user.googleId = profile.id;
      user.avatar = profile.photos[0]?.value;
      user.lastLogin = new Date();
      await user.save();
      console.log('Linked Google account to existing user');
      return done(null, user);
    }

    // Create new user
    console.log('Creating new user from Google profile');
    user = new User({
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      avatar: profile.photos[0]?.value,
      emailVerified: true
    });

    await user.save();
    done(null, user);

  } catch (error) {
    console.error('Google OAuth error:', error);
    done(error, null);
  }
}));
} else {
  console.log('Google OAuth not configured - skipping Google strategy');
}

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add request logging for debugging
app.use('/api', (req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body ? 'with body' : 'no body');
  next();
});

// Ensure JSON responses
app.use('/api', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Session middleware for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, '../dist')));

// Stripe webhook needs raw body, so it must come before express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Check if Stripe is configured
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key_here') {
    console.warn('Stripe webhook received but Stripe not configured');
    return res.status(200).json({ received: true, message: 'Stripe not configured' });
  }

  let event;

  try {
    const stripe = (await import('./services/stripeService.js')).default;
    if (!stripe) {
      return res.status(200).json({ received: true, message: 'Stripe not configured' });
    }
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const { handleWebhookEvent } = await import('./services/stripeService.js');
    await handleWebhookEvent(event);
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/user', userRoutes);
app.use('/api', dashboardRoutes);

// Global error handler for API routes
app.use('/api', (err, req, res, next) => {
  console.error('API Error:', err);

  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Debug endpoint to check users in database
app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await User.find({}, { email: 1, name: 1, _id: 1 });
    res.json({ users, count: users.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to check Google OAuth config
app.get('/api/debug/oauth', (req, res) => {
  res.json({
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    clientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
    callbackUrl: '/api/auth/google/callback'
  });
});

// Debug endpoint to test auth middleware
app.get('/api/debug/auth', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user ? {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name
    } : null,
    message: 'Auth middleware working'
  });
});

// Debug endpoint to create test PRO account
app.post('/api/debug/create-pro-user', async (req, res) => {
  try {
    const testProUser = {
      email: 'pro@test.com',
      password_hash: 'testpro123',
      name: 'Pro Test User',
      tier: 'pro',
      emailVerified: true
    };

    // Check if user already exists
    const existingUser = await User.findOne({ email: testProUser.email });
    if (existingUser) {
      // Update existing user to PRO
      existingUser.tier = 'pro';
      existingUser.name = testProUser.name;
      await existingUser.save();

      return res.json({
        success: true,
        message: 'Existing user upgraded to PRO',
        user: {
          email: existingUser.email,
          name: existingUser.name,
          tier: existingUser.tier
        }
      });
    }

    // Create new PRO user
    const newUser = new User(testProUser);
    await newUser.save();

    res.json({
      success: true,
      message: 'Test PRO user created successfully',
      user: {
        email: newUser.email,
        name: newUser.name,
        tier: newUser.tier
      },
      credentials: {
        email: 'pro@test.com',
        password: 'testpro123'
      }
    });

  } catch (error) {
    console.error('Error creating test PRO user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test PRO user',
      error: error.message
    });
  }
});

// Debug endpoint to upgrade any user to PRO
app.post('/api/debug/upgrade-to-pro', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Upgrade user to PRO
    user.tier = 'pro';
    await user.save();

    res.json({
      success: true,
      message: 'User upgraded to PRO successfully',
      user: {
        email: user.email,
        name: user.name,
        tier: user.tier
      }
    });

  } catch (error) {
    console.error('Error upgrading user to PRO:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upgrade user to PRO',
      error: error.message
    });
  }
});

// Debug endpoint to test AI service
app.get('/api/debug/ai', (req, res) => {
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  const keyLength = process.env.OPENAI_API_KEY?.length || 0;
  const keyPrefix = process.env.OPENAI_API_KEY?.substring(0, 7) || 'none';

  res.json({
    hasApiKey,
    keyLength,
    keyPrefix,
    configured: hasApiKey && keyLength > 20
  });
});

// Test Python PDF parser endpoint
app.post('/api/debug/pdf-test', async (req, res) => {
  try {
    const { spawn } = await import('child_process');
    const path = await import('path');

    // Test with a sample PDF path (you can modify this)
    const testPdfPath = './test-resume.pdf';
    const pythonScriptPath = path.join(process.cwd(), 'server/python/pdf_parser.py');

    const pythonProcess = spawn('python', [pythonScriptPath, testPdfPath]);

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
        return res.status(500).json({
          success: false,
          message: 'Python PDF parser test failed',
          error: stderr,
          code
        });
      }

      try {
        const result = JSON.parse(stdout);
        res.json({
          success: true,
          message: 'Python PDF parser test completed',
          result
        });
      } catch (parseError) {
        res.status(500).json({
          success: false,
          message: 'Failed to parse Python output',
          error: parseError.message,
          rawOutput: stdout
        });
      }
    });

    pythonProcess.on('error', (error) => {
      res.status(500).json({
        success: false,
        message: 'Failed to start Python process',
        error: error.message,
        suggestion: 'Make sure Python is installed and in PATH'
      });
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'PDF parser test failed',
      error: error.message
    });
  }
});

// Test AI analysis endpoint
app.post('/api/debug/ai-test', async (req, res) => {
  try {
    const { analyzeResumeWithAI } = await import('./services/aiService.js');

    const testResume = `PROFESSIONAL SUMMARY
Experienced Software Engineer with 5+ years of expertise in full-stack development, specializing in React, Node.js, and cloud technologies. Proven track record of leading development teams and delivering scalable web applications that serve millions of users.

John Doe
Software Engineer
Email: john@example.com
Phone: (555) 123-4567

EXPERIENCE
Senior Software Engineer at Tech Corp (2020-Present)
- Developed web applications using React and Node.js
- Led a team of 5 developers
- Improved application performance by 40%
- Implemented CI/CD pipelines reducing deployment time by 60%

Software Engineer at StartupXYZ (2018-2020)
- Built REST APIs using Express.js
- Implemented automated testing with Jest
- Collaborated with cross-functional teams

TECHNICAL SKILLS
JavaScript, React, Node.js, Python, SQL, MongoDB, Git, AWS, Docker

EDUCATION
Bachelor of Science in Computer Science
University of Technology (2014-2018)`;

    const result = await analyzeResumeWithAI(testResume, 'quick');

    res.json({
      success: true,
      message: 'AI analysis test completed',
      result,
      resumePreview: testResume.substring(0, 200)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI analysis test failed',
      error: error.message
    });
  }
});

app.post('/api/scan-resume', authenticateToken, (req, res) => {
  // Mock resume scanning endpoint
  const { resumeData } = req.body;

  // Simulate processing time
  setTimeout(() => {
    res.json({
      success: true,
      score: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
      feedback: [
        'Add more relevant keywords for your target role',
        'Consider using a more ATS-friendly format',
        'Include quantifiable achievements',
        'Optimize your skills section'
      ],
      improvements: {
        keywords: ['JavaScript', 'React', 'Node.js', 'API'],
        formatting: 'Good',
        content: 'Needs improvement'
      }
    });
  }, 2000);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Resume Roaster API is running' });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});