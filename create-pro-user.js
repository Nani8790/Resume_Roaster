#!/usr/bin/env node

/**
 * Script to create a test PRO user account
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function createProUser() {
  console.log('🔧 Creating test PRO user account...\n');

  try {
    // Create PRO user via debug endpoint
    const response = await fetch(`${API_BASE}/debug/create-pro-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ Test PRO user created successfully!\n');
      console.log('👤 User Details:');
      console.log(`   Name: ${data.user.name}`);
      console.log(`   Email: ${data.user.email}`);
      console.log(`   Tier: ${data.user.tier.toUpperCase()}`);
      
      if (data.credentials) {
        console.log('\n🔑 Login Credentials:');
        console.log(`   Email: ${data.credentials.email}`);
        console.log(`   Password: ${data.credentials.password}`);
      }
      
      console.log('\n🌐 How to use:');
      console.log('1. Start the server: npm run server');
      console.log('2. Start the frontend: npm run dev');
      console.log('3. Visit http://localhost:3000');
      console.log('4. Login with the credentials above');
      console.log('5. Upload a resume and choose "Job Match Analysis"');
      console.log('6. You\'ll see the PRO results page with advanced features!');
      
    } else {
      console.error('❌ Failed to create PRO user:', data.message);
      if (data.error) {
        console.error('   Error:', data.error);
      }
    }

  } catch (error) {
    console.error('💥 Script failed:', error.message);
    console.log('\n💡 Make sure the server is running:');
    console.log('   npm run server');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Script interrupted by user');
  process.exit(0);
});

// Run the script
createProUser().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});