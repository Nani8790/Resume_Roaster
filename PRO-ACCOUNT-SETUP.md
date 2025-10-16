# 👑 PRO Account Setup Guide

This guide helps you create a test PRO account to experience all the advanced features of Resume Roaster.

## 🚀 Quick Setup (Recommended)

### Method 1: Interactive Setup Script
```bash
npm run setup-pro
```

This interactive script will guide you through:
- Creating a new test PRO user
- Upgrading an existing user to PRO
- Providing login credentials

### Method 2: Direct Database Creation
```bash
npm run create-pro-direct
```

This directly creates a PRO user in the database (requires MongoDB connection).

## 🔑 Default PRO Test Account

After running either script, you'll have access to:

**Login Credentials:**
- Email: `pro@test.com`
- Password: `testpro123`

## 🎯 Testing PRO Features

Once you have a PRO account:

1. **Start the application:**
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend  
   npm run dev
   ```

2. **Login with PRO credentials:**
   - Visit http://localhost:3000
   - Click "Login" and use the PRO credentials above

3. **Test PRO Analysis:**
   - Upload a resume (PDF or DOCX)
   - Choose "Job Match Analysis" (PRO feature)
   - Paste a job description (minimum 100 characters)
   - Click "Analyze Against Job"

4. **Experience PRO Features:**
   - **4-Column Layout**: More comprehensive display
   - **Job Match Breakdown**: Skills, experience, keyword matching
   - **Keyword Analysis**: Total keywords, matched vs missing, percentages
   - **Skills Gap Analysis**: Technical skills, soft skills, certifications
   - **Section Analysis**: Summary rewrite, experience improvements, skills optimization
   - **ATS Compatibility**: Pass likelihood, confidence levels, specific reasons
   - **Pro Report Download**: Comprehensive JSON report
   - **Premium Branding**: Crown icons, gradient styling

## 🔧 Manual Account Upgrade

If you already have a user account and want to upgrade it to PRO:

1. **Via API (if server is running):**
   ```bash
   curl -X POST http://localhost:5000/api/debug/upgrade-to-pro \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

2. **Via Interactive Script:**
   ```bash
   npm run setup-pro
   # Choose option 2: "Upgrade existing user to PRO"
   ```

## 🆚 FREE vs PRO Comparison

| Feature | FREE Tier | PRO Tier |
|---------|-----------|----------|
| **Layout** | 3-column | 4-column |
| **Analysis Type** | Quick Health Check | Job Match Analysis |
| **Job Description** | Not used | Required input |
| **Keyword Analysis** | Basic suggestions | Advanced with percentages |
| **Skills Gap** | General recommendations | Detailed technical/soft skills |
| **Section Analysis** | Basic scoring | Detailed with rewrite suggestions |
| **ATS Compatibility** | General score | Confidence levels + reasons |
| **Report Download** | Basic JSON | Comprehensive JSON |
| **Scans per Week** | 1 scan | Unlimited |
| **Branding** | Standard | Premium with crown icons |

## 🐛 Troubleshooting

### Script Fails to Run
- Ensure MongoDB is running and connected
- Check that the server is started: `npm run server`
- Verify environment variables in `.env` file

### User Already Exists
- The script will automatically upgrade existing users to PRO
- Or use the interactive script to upgrade manually

### Login Issues
- Clear browser localStorage: `localStorage.clear()`
- Check browser console for authentication errors
- Verify JWT token is being set correctly

### PRO Features Not Showing
- Confirm user tier is set to 'pro' in database
- Check browser console for routing errors
- Refresh the page after login

## 🎉 Success Indicators

You'll know the PRO account is working when you see:

✅ **Navigation**: Crown icon in user dropdown showing "PRO Plan"  
✅ **Upload Flow**: "Job Match Analysis" option is enabled (not grayed out)  
✅ **Results Page**: 4-column layout with advanced features  
✅ **Job Analysis**: Detailed keyword matching and skills gap analysis  
✅ **Premium Branding**: Crown icons and gradient styling throughout  

## 📞 Need Help?

If you encounter issues:

1. Check the server logs for error messages
2. Verify MongoDB connection
3. Ensure all environment variables are set
4. Try the direct database script as a fallback
5. Check the browser console for frontend errors

Happy testing! 🚀