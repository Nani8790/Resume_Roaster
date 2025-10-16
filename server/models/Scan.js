import mongoose from 'mongoose';

const scanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileId: {
    type: String,
    required: true,
    unique: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  extractedText: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  analysisResults: {
    analysisType: {
      type: String,
      enum: ['quick', 'pro']
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    jobMatchScore: {
      type: Number,
      min: 0,
      max: 100
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    feedback: [String],
    improvements: {
      keywords: [String],
      formatting: String,
      content: String,
      sections: {
        contact: String,
        summary: String,
        experience: String,
        skills: String,
        education: String
      }
    },
    jobMatch: {
      overallMatch: Number,
      skillsMatch: Number,
      experienceMatch: Number,
      keywordMatch: Number,
      missingSkills: [String],
      strongMatches: [String],
      recommendations: [String],
      jobDescription: String
    },
    strengths: [String],
    criticalIssues: [String],
    aiPowered: {
      type: Boolean,
      default: false
    }
  },
  // Track scan for freemium limits
  scanType: {
    type: String,
    enum: ['upload', 'analysis'],
    default: 'upload'
  },
  weekStart: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
scanSchema.index({ userId: 1, createdAt: -1 });
scanSchema.index({ fileId: 1 });
scanSchema.index({ userId: 1, weekStart: 1 }); // For weekly limit tracking

export default mongoose.model('Scan', scanSchema);