// Debug script to check actual user scan data
import mongoose from 'mongoose';
import User from './server/models/User.js';

const debugUserScans = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-roaster');
    console.log('✅ Connected to MongoDB');

    // Find Pro users (you can replace with your email)
    const proUsers = await User.find({ tier: 'pro' }).limit(5);
    
    if (proUsers.length === 0) {
      console.log('❌ No Pro users found');
      return;
    }

    for (const user of proUsers) {
      console.log(`\n👤 User: ${user.email} (${user.tier})`);
      console.log(`📅 Upgrade Date: ${user.upgradeDate || 'Not set'}`);
      
      const scanHistory = user.scanHistory || [];
      console.log(`📊 Total Scans: ${scanHistory.length}`);
      
      if (scanHistory.length === 0) {
        console.log('   No scans found');
        continue;
      }

      // Current month calculation
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      console.log(`📅 Current Month: ${startOfMonth.toISOString().split('T')[0]} to ${now.toISOString().split('T')[0]}`);
      
      // Analyze each scan
      console.log('\n📋 Scan Breakdown:');
      scanHistory.forEach((scan, index) => {
        const scanDate = new Date(scan.createdAt);
        const isThisMonth = scanDate >= startOfMonth;
        const analysisType = scan.analysisResults?.analysisType || 'none';
        const tierAtTime = scan.tierAtTime || 'unknown';
        
        console.log(`  ${index + 1}. ${scan.originalName}`);
        console.log(`     Date: ${scanDate.toISOString().split('T')[0]}`);
        console.log(`     This Month: ${isThisMonth ? '✅' : '❌'}`);
        console.log(`     Analysis Type: ${analysisType}`);
        console.log(`     Tier at Time: ${tierAtTime}`);
        console.log(`     Counts for Pro Limit: ${isThisMonth && analysisType === 'pro' ? '✅ YES' : '❌ NO'}`);
      });
      
      // Count different types
      const allScansThisMonth = scanHistory.filter(scan => 
        new Date(scan.createdAt) >= startOfMonth
      ).length;
      
      const proScansThisMonth = scanHistory.filter(scan => 
        new Date(scan.createdAt) >= startOfMonth && 
        scan.analysisResults?.analysisType === 'pro'
      ).length;
      
      const quickScansThisMonth = scanHistory.filter(scan => 
        new Date(scan.createdAt) >= startOfMonth && 
        scan.analysisResults?.analysisType === 'quick'
      ).length;
      
      const uploadsOnlyThisMonth = scanHistory.filter(scan => 
        new Date(scan.createdAt) >= startOfMonth && 
        !scan.analysisResults
      ).length;
      
      console.log('\n🎯 Monthly Summary:');
      console.log(`   All Scans This Month: ${allScansThisMonth}`);
      console.log(`   Pro Analyses This Month: ${proScansThisMonth} (counts towards limit)`);
      console.log(`   Quick Analyses This Month: ${quickScansThisMonth} (unlimited)`);
      console.log(`   Uploads Only: ${uploadsOnlyThisMonth} (no analysis)`);
      
      console.log('\n📊 Dashboard Should Show:');
      console.log(`   "Pro Analysis Used This Month: ${proScansThisMonth}/15"`);
      console.log(`   "${15 - proScansThisMonth} Pro analyses remaining this month"`);
      
      // Calculate upgrade bonus if applicable
      if (user.upgradeDate) {
        const upgradeDate = new Date(user.upgradeDate);
        const upgradeInCurrentMonth = upgradeDate >= startOfMonth;
        
        if (upgradeInCurrentMonth) {
          const weeksInMonth = Math.ceil((new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()) / 7);
          const weekOfUpgrade = Math.ceil(upgradeDate.getDate() / 7);
          const remainingWeeks = weeksInMonth - weekOfUpgrade + 1;
          const bonusScans = remainingWeeks * 2;
          
          console.log('\n🎁 Upgrade Bonus:');
          console.log(`   Upgraded: ${upgradeDate.toISOString().split('T')[0]}`);
          console.log(`   Remaining Weeks: ${remainingWeeks}`);
          console.log(`   Bonus Pro Scans: ${bonusScans}`);
          console.log(`   Total Pro Limit: 15 + ${bonusScans} = ${15 + bonusScans}`);
        }
      }
      
      console.log('\n' + '='.repeat(60));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

debugUserScans();