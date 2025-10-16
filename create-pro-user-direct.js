#!/usr/bin/env node

/**
 * Direct database script to create a test PRO user account
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// User schema (simplified version)
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: function() {
      return !this.googleId;
    }
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  tier: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  scanHistory: [{
    fileId: String,
    originalName: String,
    filePath: String,
    extractedText: String,
    fileSize: Number,
    mimeType: String,
    analysisResults: mongoose.Schema.Types.Mixed,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password_hash') || !this.password_hash) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

async function createProUserDirect() {
  console.log('🔧 Creating test PRO user account directly in database...\n');

  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-roaster';
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const testProUser = {
      email: 'pro@test.com',
      password_hash: 'testpro123', // Will be hashed by pre-save hook
      name: 'Pro Test User',
      tier: 'pro',
      emailVerified: true,
      lastLogin: new Date(),
      scanHistory: []
    };

    // Check if user already exists
    console.log('🔍 Checking if user already exists...');
    const existingUser = await User.findOne({ email: testProUser.email });
    
    if (existingUser) {
      console.log('👤 User already exists, upgrading to PRO...');
      existingUser.tier = 'pro';
      existingUser.name = testProUser.name;
      existingUser.emailVerified = true;
      await existingUser.save();
      
      console.log('✅ Existing user upgraded to PRO!\n');
      console.log('👤 User Details:');
      console.log(`   Name: ${existingUser.name}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Tier: ${existingUser.tier.toUpperCase()}`);
      console.log(`   ID: ${existingUser._id}`);
    } else {
      console.log('👤 Creating new PRO user...');
      const newUser = new User(testProUser);
      await newUser.save();

      console.log('✅ Test PRO user created successfully!\n');
      console.log('👤 User Details:');
      console.log(`   Name: ${newUser.name}`);
      console.log(`   Email: ${newUser.email}`);
      console.log(`   Tier: ${newUser.tier.toUpperCase()}`);
      console.log(`   ID: ${newUser._id}`);
    }

    console.log('\n🔑 Login Credentials:');
    console.log('   Email: pro@test.com');
    console.log('   Password: testpro123');
    
    console.log('\n🌐 How to use:');
    console.log('1. Start the server: npm run server');
    console.log('2. Start the frontend: npm run dev');
    console.log('3. Visit http://localhost:3000');
    console.log('4. Login with the credentials above');
    console.log('5. Upload a resume and choose "Job Match Analysis"');
    console.log('6. You\'ll see the PRO results page with advanced features!');

    // Close database connection
    await mongoose.connection.close();
    console.log('\n📡 Database connection closed');

  } catch (error) {
    console.error('💥 Failed to create PRO user:', error.message);
    
    if (error.code === 11000) {
      console.log('\n💡 User might already exist. Try logging in with:');
      console.log('   Email: pro@test.com');
      console.log('   Password: testpro123');
    }
    
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Script interrupted by user');
  mongoose.connection.close();
  process.exit(0);
});

// Run the script
createProUserDirect().catch(error => {
  console.error('💥 Unexpected error:', error);
  mongoose.connection.close();
  process.exit(1);
});