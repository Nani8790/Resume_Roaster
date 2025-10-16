#!/usr/bin/env node

/**
 * Comprehensive script to set up a PRO account for testing
 * Provides multiple methods to create or upgrade to PRO
 */

import fetch from 'node-fetch';
import readline from 'readline';

const API_BASE = 'http://localhost:5000/api';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function createTestProUser() {
  console.log('🔧 Creating test PRO user account...\n');

  try {
    const response = await fetch(`${API_BASE}/debug/create-pro-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ Test PRO user created/updated successfully!\n');
      console.log('👤 User Details:');
      console.log(`   Name: ${data.user.name}`);
      console.log(`   Email: ${data.user.email}`);
      console.log(`   Tier: ${data.user.tier.toUpperCase()}`);
      
      if (data.credentials) {
        console.log('\n🔑 Login Credentials:');
        console.log(`   Email: ${data.credentials.email}`);
        console.log(`   Password: ${data.credentials.password}`);
      }
      
      return true;
    } else {
      console.error('❌ Failed to create PRO user:', data.message);
      return false;
    }

  } catch (error) {
    console.error('💥 API call failed:', error.message);
    return false;
  }
}

async function upgradeExistingUser() {
  console.log('🔧 Upgrading existing user to PRO...\n');
  
  const email = await askQuestion('Enter email address: ');
  const password = await askQuestion('Enter password: ');
  
  try {
    // First, login to get token
    console.log('🔐 Logging in...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok || !loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return false;
    }

    console.log('✅ Login successful');

    // Now upgrade to PRO
    console.log('⬆️  Upgrading to PRO...');
    const upgradeResponse = await fetch(`${API_BASE}/debug/upgrade-to-pro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      }
    });

    const upgradeData = await upgradeResponse.json();

    if (upgradeResponse.ok && upgradeData.success) {
      console.log('✅ User upgraded to PRO successfully!\n');
      console.log('👤 Updated User Details:');
      console.log(`   Name: ${upgradeData.user.name}`);
      console.log(`   Email: ${upgradeData.user.email}`);
      console.log(`   Tier: ${upgradeData.user.tier.toUpperCase()}`);
      return true;
    } else {
      console.error('❌ Failed to upgrade user:', upgradeData.message);
      return false;
    }

  } catch (error) {
    console.error('💥 Upgrade failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🎯 Resume Roaster - PRO Account Setup\n');
  console.log('Choose an option:');
  console.log('1. Create new test PRO user (pro@test.com)');
  console.log('2. Upgrade existing user to PRO');
  console.log('3. Exit\n');

  const choice = await askQuestion('Enter your choice (1-3): ');

  let success = false;

  switch (choice) {
    case '1':
      success = await createTestProUser();
      break;
    case '2':
      success = await upgradeExistingUser();
      break;
    case '3':
      console.log('👋 Goodbye!');
      rl.close();
      return;
    default:
      console.log('❌ Invalid choice. Please run the script again.');
      rl.close();
      return;
  }

  if (success) {
    console.log('\n🌐 Next Steps:');
    console.log('1. Start the server: npm run server');
    console.log('2. Start the frontend: npm run dev');
    console.log('3. Visit http://localhost:3000');
    console.log('4. Login with your PRO credentials');
    console.log('5. Upload a resume and choose "Job Match Analysis"');
    console.log('6. Experience the PRO results page with:');
    console.log('   • Advanced job matching');
    console.log('   • Keyword analysis');
    console.log('   • Skills gap analysis');
    console.log('   • Section-by-section feedback');
    console.log('   • ATS compatibility scoring');
    console.log('   • Comprehensive reporting');
    
    console.log('\n🎉 Enjoy testing the PRO features!');
  } else {
    console.log('\n💡 Troubleshooting:');
    console.log('• Make sure the server is running: npm run server');
    console.log('• Check if MongoDB is connected');
    console.log('• Verify the API endpoints are working');
    console.log('• Try the direct database script: node create-pro-user-direct.js');
  }

  rl.close();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Script interrupted by user');
  rl.close();
  process.exit(0);
});

// Run the script
main().catch(error => {
  console.error('💥 Unexpected error:', error);
  rl.close();
  process.exit(1);
});