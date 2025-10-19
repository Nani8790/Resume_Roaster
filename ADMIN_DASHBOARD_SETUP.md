# Admin Dashboard Setup Guide

## Overview

The Admin Dashboard provides comprehensive insights into your Resume Roaster platform, including:

- **User Analytics**: Total users, active users, conversion rates
- **Revenue Tracking**: Monthly recurring revenue, total revenue, per-user metrics
- **Usage Analytics**: Scan volumes, AI usage patterns, feature adoption
- **Real-time Monitoring**: System health, uptime, memory usage
- **User Management**: Search users, upgrade accounts, view detailed user profiles

## Setup Instructions

### 1. Configure Admin Access

Add your admin email(s) to the `.env` file:

```env
# Admin Configuration
ADMIN_EMAILS=your-admin-email@example.com,another-admin@example.com
```

**Important**: Only users with emails listed in `ADMIN_EMAILS` can access the admin dashboard.

### 2. Create Admin User Account

You need to create a user account with your admin email:

**Option A: Sign up normally**
1. Go to `/auth/signup` 
2. Create an account using your admin email
3. Complete the signup process

**Option B: Use the test script**
```bash
node test-admin-dashboard.js create-admin
```

### 3. Access the Admin Dashboard

Once you have an admin account:

1. **Login** with your admin credentials
2. **Navigate** to `/admin` or click "Admin Dashboard" in the user dropdown
3. **Verify** you can see the dashboard (if not, check your email is in `ADMIN_EMAILS`)

## Features Overview

### 📊 Dashboard Overview
- **User Statistics**: Total, Pro, Free, Active users
- **Growth Metrics**: New users today/week/month
- **Conversion Rate**: Free to Pro conversion percentage
- **Scan Analytics**: Total scans, quick vs pro scans
- **Revenue Metrics**: Monthly revenue, average per user

### 📈 Analytics Charts
- **User Growth Chart**: 30-day user registration trends
- **Scan Volume**: Quick vs Pro scan distribution
- **Revenue Trends**: Monthly recurring revenue tracking

### 👥 User Management
- **Search Users**: Find users by name or email
- **Filter by Tier**: View Free or Pro users
- **User Details**: View individual user profiles and scan history
- **Upgrade Users**: Manually upgrade users to Pro
- **Activity Tracking**: Last login, total scans, average scores

### 🔧 System Health
- **Database Status**: MongoDB connection health
- **AI Service**: OpenAI API configuration status
- **Stripe Integration**: Payment processing status
- **Server Metrics**: Uptime, memory usage

## API Endpoints

All admin endpoints require authentication and admin privileges:

```javascript
// Headers required for all requests
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/dashboard/overview` | GET | Dashboard statistics |
| `/api/admin/dashboard/user-growth` | GET | User growth chart data |
| `/api/admin/dashboard/recent-users` | GET | Recent user registrations |
| `/api/admin/dashboard/users/search` | GET | Search and filter users |
| `/api/admin/dashboard/users/:id` | GET | User details and history |
| `/api/admin/dashboard/users/:id/upgrade` | POST | Upgrade user to Pro |
| `/api/admin/dashboard/health` | GET | System health check |

### Query Parameters

**User Growth**: `?days=30` (default: 30)
**Recent Users**: `?limit=10` (default: 10)
**User Search**: `?q=search&tier=pro&page=1&limit=20`

## Security Features

### Authentication & Authorization
- **JWT Token Validation**: All requests require valid authentication
- **Admin Email Verification**: Only emails in `ADMIN_EMAILS` can access
- **Route Protection**: Frontend routes protected with `AdminRoute` component
- **API Endpoint Protection**: Backend endpoints use `authenticateAdmin` middleware

### Data Privacy
- **Sensitive Data Filtering**: Passwords and sensitive info excluded from responses
- **Audit Logging**: Admin actions logged for security
- **Rate Limiting**: API endpoints protected against abuse

## Testing

### Test Admin Functionality
```bash
# Test all admin endpoints
node test-admin-dashboard.js

# Create admin user
node test-admin-dashboard.js create-admin
```

### Manual Testing Checklist
- [ ] Admin user can login and access `/admin`
- [ ] Non-admin users get "Access Denied" message
- [ ] Dashboard shows correct user/scan statistics
- [ ] User search and filtering works
- [ ] User upgrade functionality works
- [ ] System health shows correct status
- [ ] Charts display properly with real data

## Troubleshooting

### Common Issues

**1. "Access Denied" Error**
- Check your email is in `ADMIN_EMAILS` environment variable
- Verify the email matches exactly (case-sensitive)
- Restart the server after changing `.env`

**2. Dashboard Shows No Data**
- Ensure you have users and scans in your database
- Check MongoDB connection in system health
- Verify API endpoints return data (use test script)

**3. Charts Not Loading**
- Check browser console for JavaScript errors
- Verify Recharts library is installed: `npm list recharts`
- Ensure data format matches chart expectations

**4. User Search Not Working**
- Check MongoDB text indexes are created
- Verify search query parameters
- Test with simple queries first

### Debug Commands

```bash
# Check admin configuration
echo $ADMIN_EMAILS

# Test database connection
node -e "
import mongoose from 'mongoose';
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ DB Connected'))
  .catch(err => console.log('❌ DB Error:', err));
"

# Test admin API
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/admin/dashboard/health
```

## Customization

### Adding New Metrics
1. **Backend**: Add new aggregation queries in `/server/routes/admin.js`
2. **Frontend**: Update dashboard components in `/src/components/AdminDashboard.jsx`
3. **Charts**: Use Recharts library for new visualizations

### Custom User Actions
1. Add new endpoints in admin routes
2. Update user management UI
3. Add appropriate security checks

### Revenue Integration
Currently uses mock revenue data. To integrate with Stripe:

1. **Update Revenue Calculations**:
```javascript
// In admin.js - replace mock revenue with Stripe data
const subscriptions = await stripe.subscriptions.list();
const monthlyRevenue = subscriptions.data
  .filter(sub => sub.status === 'active')
  .reduce((sum, sub) => sum + (sub.items.data[0].price.unit_amount / 100), 0);
```

2. **Add Subscription Analytics**:
- Churn rate calculation
- Subscription lifecycle tracking
- Payment failure monitoring

## Performance Considerations

### Database Optimization
- **Indexes**: Ensure proper indexes on frequently queried fields
- **Aggregation**: Use MongoDB aggregation pipeline for complex queries
- **Caching**: Consider Redis for frequently accessed data

### Frontend Optimization
- **Lazy Loading**: Load charts only when needed
- **Pagination**: Implement pagination for large user lists
- **Real-time Updates**: Consider WebSocket for live metrics

## Monitoring & Alerts

### Recommended Monitoring
- **User Growth**: Alert on unusual registration patterns
- **System Health**: Monitor API response times
- **Error Rates**: Track failed admin operations
- **Security**: Monitor admin access patterns

### Integration Options
- **Logging**: Winston for structured logging
- **Monitoring**: New Relic, DataDog for APM
- **Alerts**: Email/Slack notifications for critical issues

## Next Steps

1. **Set up your admin email** in `.env`
2. **Create your admin account** 
3. **Test the dashboard** with real data
4. **Customize metrics** based on your needs
5. **Set up monitoring** for production use

For questions or issues, check the troubleshooting section or review the test scripts for examples.