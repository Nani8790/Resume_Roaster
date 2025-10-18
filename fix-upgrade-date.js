// Fix upgrade date for existing Pro users
import mongoose from 'mongoose';
import User from './server/models/User.js';

const fixUpgradeDate = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-roaster');
    console.log('✅ Connected to MongoDB');

    // Find Pro users without upgrade date
    const proUsers = await User.find({ 
      tier: 'pro', 
      $or: [
        { upgradeDate: null },
        { upgradeDate: { $exists: false } }
      ]
    });
    
    console.log(`Found ${proUsers.length} Pro users without upgrade date`);
    
    for (const user of proUsers) {
      console.log(`\n👤 Fixing user: ${user.email}`);
      
      // Find the first Pro analysis scan (likely when they upgraded)
      const firstProScan = user.scanHistory?.find(scan => 
        scan.analysisResults?.analysisType === 'pro'
      );
      
      if (firstProScan) {
        const upgradeDate = new Date(firstProScan.createdAt);
        user.upgradeDate = upgradeDate;
        await user.save();
        
        console.log(`✅ Set upgrade date to: ${upgradeDate.toISOString().split('T')[0]}`);
        
        // Calculate bonus scans
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        if (upgradeDate >= startOfMonth) {
          const weeksInMonth = Math.ceil((new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()) / 7);
          const weekOfUpgrade = Math.ceil(upgradeDate.getDate() / 7);
          const remainingWeeks = weeksInMonth - weekOfUpgrade + 1;
          const bonusScans = remainingWeeks * 2;
          
          console.log(`🎁 Upgrade bonus: ${bonusScans} scans (${remainingWeeks} weeks remaining)`);
          console.log(`📊 New Pro limit: 15 + ${bonusScans} = ${15 + bonusScans}`);
        }
      } else {
        // No Pro scans found, set upgrade date to account creation or current date
        const upgradeDate = user.createdAt || new Date();
        user.upgradeDate = upgradeDate;
        await user.save();
        
        console.log(`✅ Set upgrade date to account creation: ${upgradeDate.toISOString().split('T')[0]}`);
      }
    }
    
    console.log('\n✅ All Pro users updated with upgrade dates');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

fixUpgradeDate();