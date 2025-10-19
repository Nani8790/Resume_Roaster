import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from project root
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import Settings model
import Settings from '../models/Settings.js';

const initializeSettings = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-roaster');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-roaster');
    console.log('✅ Connected to MongoDB');

    // Initialize default AI provider setting
    const defaultProvider = process.env.AI_PROVIDER || 'openai';
    
    await Settings.setValue(
      'ai_provider',
      defaultProvider,
      'Default AI provider setting initialized'
    );

    console.log(`✅ AI provider setting initialized to: ${defaultProvider}`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');

  } catch (error) {
    console.error('Error initializing settings:', error);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeSettings();
}

export default initializeSettings;