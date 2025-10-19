#!/bin/bash

# 🔒 Secure Admin Dashboard - Git Branch Setup
# This script sets up a separate Git branch for admin functionality

echo "🔒 Setting up secure admin dashboard branch..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a Git repository. Please run 'git init' first."
    exit 1
fi

# Create and switch to admin branch
echo "📝 Creating admin-dashboard branch..."
git checkout -b admin-dashboard 2>/dev/null || git checkout admin-dashboard

# Add admin files to the branch
echo "📁 Adding admin files..."
git add admin/
git add -f admin/components/AdminDashboard.jsx
git add -f admin/components/AdminRoute.jsx
git add -f admin/routes/admin.js
git add -f admin/SECURE_ADMIN_SETUP.md
git add -f admin/setup-admin-branch.sh

# Update main app files that reference admin
git add src/App.jsx
git add src/components/Header.jsx
git add server/index.js
git add test-admin-dashboard.js

# Commit admin functionality
echo "💾 Committing admin dashboard..."
git commit -m "🔒 Add secure admin dashboard

- Admin dashboard accessible only via /admin/7780488674
- Email-based admin authorization
- Separate admin codebase in /admin folder
- Security logging and access control
- Dark theme admin interface
- Comprehensive user management
- Revenue and analytics tracking
- System health monitoring

Security Features:
- Hidden URL path
- Admin email whitelist
- Access attempt logging
- Unauthorized access blocking
- Secure API endpoints"

echo "✅ Admin dashboard committed to admin-dashboard branch"

# Switch back to main branch
echo "🔄 Switching back to main branch..."
git checkout main

# Show branch status
echo ""
echo "📊 Branch Status:"
git branch -v

echo ""
echo "🎉 Admin dashboard setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Configure admin emails in .env: ADMIN_EMAILS=your-email@company.com"
echo "2. Create admin user: npm run create-admin"
echo "3. Access admin at: http://localhost:3000/admin/7780488674"
echo ""
echo "🔒 Security Notes:"
echo "- Admin code is isolated in admin-dashboard branch"
echo "- Only authorized emails can access admin features"
echo "- All admin actions are logged for security"
echo "- Change the secret path '7780488674' for production"
echo ""
echo "🚀 To deploy admin features:"
echo "git checkout admin-dashboard  # Switch to admin branch"
echo "npm run server               # Start with admin features"
echo ""
echo "🛡️ To keep admin separate:"
echo "git checkout main            # Main branch without admin"
echo "npm run server               # Start without admin features"