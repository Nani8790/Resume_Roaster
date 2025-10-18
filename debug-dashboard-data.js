// Debug script to check dashboard data flow
console.log('🔍 Debugging Dashboard Data Flow\n');

// Test the date calculation logic
const now = new Date();
console.log('Current Date:', now.toISOString());

// Test monthly calculation (Pro users)
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
console.log('Start of Month:', startOfMonth.toISOString());

// Create mock scan history with 7 scans this month
const mockScanHistory = [];
for (let i = 0; i < 7; i++) {
  const scanDate = new Date(now);
  scanDate.setDate(scanDate.getDate() - i); // Last 7 days
  mockScanHistory.push({
    createdAt: scanDate,
    fileId: `scan_${i}`,
    originalName: `resume_${i}.pdf`
  });
}

// Add some older scans from previous month
for (let i = 0; i < 3; i++) {
  const scanDate = new Date(now);
  scanDate.setMonth(scanDate.getMonth() - 1); // Previous month
  scanDate.setDate(scanDate.getDate() - i);
  mockScanHistory.push({
    createdAt: scanDate,
    fileId: `old_scan_${i}`,
    originalName: `old_resume_${i}.pdf`
  });
}

console.log('Mock Scan History:');
mockScanHistory.forEach((scan, index) => {
  console.log(`  ${index + 1}. ${scan.originalName} - ${scan.createdAt.toISOString().split('T')[0]}`);
});

// Test the filtering logic
const scansThisMonth = mockScanHistory.filter(scan => 
  new Date(scan.createdAt) >= startOfMonth
).length;

console.log('\n📊 Calculation Results:');
console.log(`Total Scans: ${mockScanHistory.length}`);
console.log(`Scans This Month: ${scansThisMonth}`);
console.log(`Scans Remaining: ${15 - scansThisMonth}`);
console.log(`Progress: ${((scansThisMonth / 15) * 100).toFixed(1)}%`);

console.log('\n🎯 Expected Dashboard Display:');
console.log(`"Pro Scans Used This Month: ${scansThisMonth}/15"`);
console.log(`"${15 - scansThisMonth} scans remaining this month"`);

// Test edge cases
console.log('\n🧪 Edge Case Tests:');

// Test with 0 scans
console.log('With 0 scans:', `${0}/15 (${15 - 0} remaining)`);

// Test with 15 scans (limit reached)
console.log('With 15 scans:', `${15}/15 (${15 - 15} remaining)`);

// Test with over limit
console.log('With 20 scans:', `${20}/15 (${15 - 20} remaining)`);