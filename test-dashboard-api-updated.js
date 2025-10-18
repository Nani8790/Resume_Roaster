// Test updated dashboard API
const testDashboardAPI = async () => {
  try {
    console.log('🧪 Testing Updated Dashboard API\n');
    
    // Test with a Pro user token (you'll need to get this from your browser)
    const token = 'your_jwt_token_here'; // Replace with actual token
    
    const response = await fetch('http://localhost:5000/api/user/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.log('❌ API request failed:', response.status, response.statusText);
      console.log('💡 Make sure server is running and you have a valid token');
      return;
    }
    
    const data = await response.json();
    console.log('✅ Dashboard API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success && data.stats) {
      const stats = data.stats;
      console.log('\n📊 Parsed Stats:');
      console.log(`  Current Tier: ${stats.currentTier}`);
      console.log(`  Total Scans: ${stats.totalScans}`);
      console.log(`  Average Score: ${stats.avgScore}`);
      
      if (stats.currentTier === 'pro') {
        const scansData = stats.scansThisMonth;
        const proLimit = stats.proLimit;
        
        if (typeof scansData === 'object') {
          console.log(`  Pro Scans Used: ${scansData.used}`);
          console.log(`  Bonus Scans: ${scansData.bonusScans}`);
          console.log(`  Total Pro Limit: ${scansData.totalLimit}`);
          console.log(`  Remaining: ${scansData.totalLimit - scansData.used}`);
        } else {
          console.log(`  Pro Scans Used: ${scansData}`);
          console.log(`  Pro Limit: ${proLimit}`);
          console.log(`  Remaining: ${proLimit - scansData}`);
        }
      } else if (stats.currentTier === 'free') {
        console.log(`  Quick Scans This Week: ${stats.scansThisWeek?.quick || 0}/3`);
        console.log(`  Pro Scans This Week: ${stats.scansThisWeek?.pro || 0}/2`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing dashboard API:', error.message);
    console.log('💡 This test requires the server to be running');
  }
};

// For now, just show what the response should look like
console.log('🧪 Expected Dashboard API Response for Pro User with 7 Pro scans:\n');

const expectedResponse = {
  success: true,
  stats: {
    totalScans: 11,
    avgScore: 82,
    currentTier: 'pro',
    scansThisWeek: 0,
    scansThisMonth: {
      used: 7,
      bonusScans: 6,
      totalLimit: 21
    },
    freeLimits: { quick: 3, pro: 2 },
    proLimit: 21
  }
};

console.log(JSON.stringify(expectedResponse, null, 2));

console.log('\n📊 Dashboard Should Display:');
console.log('  "Pro Analysis Used This Month: 7/21"');
console.log('  "14 Pro analyses remaining this month"');
console.log('  "🎁 Upgrade bonus: +6 Pro scans this month!"');
console.log('  "Quick scans are unlimited for Pro users"');

testDashboardAPI();