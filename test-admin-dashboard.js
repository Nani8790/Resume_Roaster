import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const BASE_URL = 'http://localhost:5000';
const ADMIN_SECRET_PATH = '7780488674'; // Secret admin path

async function testAdminDashboard() {
  console.log('🧪 Testing Admin Dashboard API...\n');

  try {
    // First, let's create a test admin user
    console.log('1. Creating test admin user...');
    
    const adminEmail = process.env.ADMIN_EMAILS?.split(',')[0] || 'admin@test.com';
    console.log(`Admin email from env: ${adminEmail}`);

    // Test login with admin credentials (you'll need to create this user first)
    console.log('\n2. Testing admin authentication...');
    
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: adminEmail,
        password: 'Admin123!' // Strong password meeting requirements
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Admin login failed. Please create an admin user first.');
      console.log('You can create one by:');
      console.log('1. Signing up normally with your admin email');
      console.log('2. Or using the debug endpoint to create a test user');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Admin login successful');

    // Test admin endpoints
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('\n3. Testing admin dashboard overview...');
    const overviewResponse = await fetch(`${BASE_URL}/api/admin/7780488674/dashboard/overview`, { headers });
    
    if (overviewResponse.ok) {
      const overviewData = await overviewResponse.json();
      console.log('✅ Dashboard overview:', JSON.stringify(overviewData.data, null, 2));
    } else {
      console.log('❌ Dashboard overview failed:', overviewResponse.status);
    }

    console.log('\n4. Testing user growth data...');
    const growthResponse = await fetch(`${BASE_URL}/api/admin/7780488674/dashboard/user-growth?days=7`, { headers });
    
    if (growthResponse.ok) {
      const growthData = await growthResponse.json();
      console.log('✅ User growth data:', JSON.stringify(growthData.data, null, 2));
    } else {
      console.log('❌ User growth failed:', growthResponse.status);
    }

    console.log('\n5. Testing recent users...');
    const usersResponse = await fetch(`${BASE_URL}/api/admin/7780488674/dashboard/recent-users?limit=5`, { headers });
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('✅ Recent users:', JSON.stringify(usersData.data, null, 2));
    } else {
      console.log('❌ Recent users failed:', usersResponse.status);
    }

    console.log('\n6. Testing system health...');
    const healthResponse = await fetch(`${BASE_URL}/api/admin/7780488674/dashboard/health`, { headers });
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ System health:', JSON.stringify(healthData.data, null, 2));
    } else {
      console.log('❌ System health failed:', healthResponse.status);
    }

    console.log('\n🎉 Admin dashboard API tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Helper function to create admin user
async function createAdminUser() {
  console.log('🔧 Creating admin user...\n');

  try {
    const adminEmail = process.env.ADMIN_EMAILS?.split(',')[0] || 'admin@test.com';
    
    const signupResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Admin User',
        email: adminEmail,
        password: 'Admin123!' // Strong password meeting validation requirements
      })
    });

    if (signupResponse.ok) {
      const signupData = await signupResponse.json();
      console.log('✅ Admin user created successfully');
      console.log('Email:', adminEmail);
      console.log('Password: Admin123!');
      console.log('Now you can access the admin dashboard!');
    } else {
      const errorData = await signupResponse.json();
      console.log('❌ Failed to create admin user:', errorData.message);
      
      if (errorData.message?.includes('already exists')) {
        console.log('✅ Admin user already exists, you can proceed with testing');
      }
    }

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
}

// Check command line arguments
const command = process.argv[2];

if (command === 'create-admin') {
  createAdminUser();
} else {
  testAdminDashboard();
}

console.log('\n📝 Usage:');
console.log('  node test-admin-dashboard.js          # Test admin API');
console.log('  node test-admin-dashboard.js create-admin  # Create admin user');