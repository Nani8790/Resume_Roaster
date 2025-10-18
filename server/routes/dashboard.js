import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get user stats for dashboard
router.get('/user/stats', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const scanHistory = user.scanHistory || [];
    const totalScans = scanHistory.length;
    
    // Calculate average score from scans with analysis results
    const scansWithScores = scanHistory.filter(scan => 
      scan.analysisResults && scan.analysisResults.score
    );
    
    const avgScore = scansWithScores.length > 0 
      ? Math.round(scansWithScores.reduce((sum, scan) => sum + scan.analysisResults.score, 0) / scansWithScores.length)
      : 0;

    // Get current period scan count
    const now = new Date();
    let scansThisWeek = 0;
    let scansThisMonth = 0;

    if (user.tier === 'free') {
      const startOfWeek = new Date(now);
      // Set to Monday 00:00 UTC
      const day = startOfWeek.getUTCDay();
      const diff = startOfWeek.getUTCDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setUTCDate(diff);
      startOfWeek.setUTCHours(0, 0, 0, 0);

      // Count quick and Pro scans separately for free users
      const quickScansThisWeek = scanHistory.filter(scan => 
        new Date(scan.createdAt) >= startOfWeek && 
        scan.analysisResults?.analysisType === 'quick'
      ).length;

      const proScansThisWeek = scanHistory.filter(scan => 
        new Date(scan.createdAt) >= startOfWeek && 
        scan.analysisResults?.analysisType === 'pro'
      ).length;

      scansThisWeek = { quick: quickScansThisWeek, pro: proScansThisWeek };
    } else if (user.tier === 'pro') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0); // Ensure we start at beginning of day
      
      console.log('Debug - Start of month:', startOfMonth.toISOString());
      console.log('Debug - Current date:', now.toISOString());
      console.log('Debug - Total scan history length:', scanHistory.length);
      
      scansThisMonth = scanHistory.filter(scan => {
        const scanDate = new Date(scan.createdAt);
        const isThisMonth = scanDate >= startOfMonth;
        const isProScan = scan.analysisResults?.analysisType === 'pro';
        console.log(`Debug - Scan ${scan.fileId}: ${scanDate.toISOString()} >= ${startOfMonth.toISOString()} = ${isThisMonth}, analysisType: ${scan.analysisResults?.analysisType}, isProScan: ${isProScan}`);
        return isThisMonth && isProScan;
      }).length;
      
      // Calculate upgrade bonus
      let bonusScans = 0;
      if (user.upgradeDate) {
        const upgradeDate = new Date(user.upgradeDate);
        const upgradeInCurrentMonth = upgradeDate >= startOfMonth;
        
        if (upgradeInCurrentMonth) {
          const weeksInMonth = Math.ceil((new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()) / 7);
          const weekOfUpgrade = Math.ceil(upgradeDate.getDate() / 7);
          const remainingWeeks = weeksInMonth - weekOfUpgrade + 1;
          bonusScans = remainingWeeks * 2;
          
          console.log('Debug - Upgrade bonus calculation:');
          console.log(`  Upgrade date: ${upgradeDate.toISOString().split('T')[0]}`);
          console.log(`  Weeks in month: ${weeksInMonth}`);
          console.log(`  Week of upgrade: ${weekOfUpgrade}`);
          console.log(`  Remaining weeks: ${remainingWeeks}`);
          console.log(`  Bonus scans: ${bonusScans}`);
        }
      }
      
      console.log('Debug - PRO scans this month:', scansThisMonth);
      console.log('Debug - Bonus scans:', bonusScans);
      console.log('Debug - Total Pro limit:', 15 + bonusScans);
      
      // Store bonus info for response
      scansThisMonth = {
        used: scansThisMonth,
        bonusScans: bonusScans,
        totalLimit: 15 + bonusScans
      };
    }

    res.json({
      success: true,
      stats: {
        totalScans: totalScans,
        avgScore,
        currentTier: user.tier,
        scansThisWeek,
        scansThisMonth,
        freeLimits: { quick: 3, pro: 2 }, // New free tier limits
        proLimit: user.tier === 'pro' && typeof scansThisMonth === 'object' ? scansThisMonth.totalLimit : 15
      }
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user stats'
    });
  }
});

// Get scan history with pagination
router.get('/scans/history', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const scanHistory = user.scanHistory || [];
    
    // Apply tier-based limits
    let scansToShow = scanHistory;
    if (user.tier === 'free') {
      scansToShow = scanHistory.slice(0, 3); // Free users see last 3
    }
    
    // Sort by date (newest first)
    const sortedScans = scansToShow
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(offset, offset + limit);

    // Format scans for dashboard display
    const formattedScans = sortedScans.map(scan => ({
      id: scan.fileId,
      date: scan.createdAt,
      filename: scan.originalName,
      overallScore: scan.analysisResults?.score || null,
      jobMatchScore: scan.analysisResults?.jobMatch?.overallMatch || null,
      analysisType: scan.analysisResults?.analysisType || null,
      hasResults: !!scan.analysisResults,
      fileSize: scan.fileSize,
      mimeType: scan.mimeType
    }));

    res.json({
      success: true,
      scans: formattedScans,
      total: scansToShow.length,
      hasMore: offset + limit < scansToShow.length,
      tier: user.tier
    });

  } catch (error) {
    console.error('Scan history fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scan history'
    });
  }
});



// Get score trend data for chart
router.get('/user/score-trend', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const scanHistory = user.scanHistory || [];
    
    // Get scans with scores, sorted by date
    const scansWithScores = scanHistory
      .filter(scan => scan.analysisResults && scan.analysisResults.score)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(scan => ({
        date: scan.createdAt.toISOString().split('T')[0], // YYYY-MM-DD format
        score: scan.analysisResults.score,
        filename: scan.originalName
      }));

    res.json({
      success: true,
      trendData: scansWithScores
    });

  } catch (error) {
    console.error('Score trend fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch score trend data'
    });
  }
});

export default router;