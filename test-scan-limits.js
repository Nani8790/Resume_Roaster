// Test script to verify scan limits
const testScanLimits = () => {
  console.log('🧪 Testing Scan Limits Implementation\n');

  // Test Pro user monthly limit calculation
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  console.log('📅 Current Date:', now.toISOString().split('T')[0]);
  console.log('📅 Start of Month:', startOfMonth.toISOString().split('T')[0]);
  
  // Simulate scan history
  const mockScans = [];
  for (let i = 0; i < 20; i++) {
    const scanDate = new Date(now);
    scanDate.setDate(scanDate.getDate() - i);
    mockScans.push({
      createdAt: scanDate,
      fileId: `scan_${i}`
    });
  }
  
  // Count scans this month
  const scansThisMonth = mockScans.filter(scan => 
    new Date(scan.createdAt) >= startOfMonth
  ).length;
  
  console.log('\n📊 Pro User Limits:');
  console.log(`  Total Mock Scans: ${mockScans.length}`);
  console.log(`  Scans This Month: ${scansThisMonth}`);
  console.log(`  Remaining Scans: ${15 - scansThisMonth}`);
  console.log(`  Limit Exceeded: ${scansThisMonth >= 15 ? '❌ YES' : '✅ NO'}`);
  
  // Test Free user weekly limit calculation
  const startOfWeek = new Date(now);
  const day = startOfWeek.getUTCDay();
  const diff = startOfWeek.getUTCDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setUTCDate(diff);
  startOfWeek.setUTCHours(0, 0, 0, 0);
  
  const scansThisWeek = mockScans.filter(scan => 
    new Date(scan.createdAt) >= startOfWeek
  ).length;
  
  console.log('\n📊 Free User Limits:');
  console.log(`  Start of Week: ${startOfWeek.toISOString().split('T')[0]}`);
  console.log(`  Scans This Week: ${scansThisWeek}`);
  console.log(`  Remaining Scans: ${1 - scansThisWeek}`);
  console.log(`  Limit Exceeded: ${scansThisWeek >= 1 ? '❌ YES' : '✅ NO'}`);
  
  console.log('\n💰 Monetization Benefits:');
  console.log('  ✅ Controlled OpenAI API costs');
  console.log('  ✅ Sustainable business model');
  console.log('  ✅ Encourages Pro subscriptions');
  console.log('  ✅ 15 scans/month = reasonable usage');
  console.log('  ✅ Monthly billing cycle alignment');
  
  console.log('\n🎯 Pricing Strategy:');
  console.log('  Free: 1 scan/week (4 scans/month)');
  console.log('  Pro: 15 scans/month ($10/month)');
  console.log('  Cost per scan: ~$1 for Pro users');
  console.log('  OpenAI cost: ~$0.10-0.30 per analysis');
  console.log('  Profit margin: ~70-90% per scan');
};

testScanLimits();