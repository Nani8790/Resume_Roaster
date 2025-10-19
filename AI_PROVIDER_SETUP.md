# AI Provider Integration - OpenAI & Gemini

## Overview
The Resume Roaster application now supports both OpenAI GPT-4 and Google Gemini 2.0-Flash as AI providers for resume analysis. Administrators can easily switch between providers through the admin dashboard.

## Features Implemented

### 1. Dual AI Provider Support
- **OpenAI GPT-4**: High-quality analysis with detailed feedback
- **Google Gemini 2.0-Flash**: Fast, efficient analysis with competitive quality
- **Automatic Fallback**: If the primary provider fails, the system can fall back to the secondary provider

### 2. Admin Dashboard Integration
- **AI Provider Status**: Real-time display of which providers are configured
- **One-Click Switching**: Toggle between OpenAI and Gemini with a single click
- **Configuration Validation**: Ensures API keys are properly configured before switching
- **Visual Indicators**: Clear status indicators for each provider

### 3. Database-Driven Configuration
- **Persistent Settings**: AI provider preference is stored in MongoDB
- **Admin Control**: Only administrators can change the AI provider
- **Audit Trail**: All provider changes are logged with admin details

## Configuration

### Environment Variables
```env
# AI Configuration
OPENAI_API_KEY=sk-proj-your-openai-key-here
GEMINI_API_KEY=AIzaSyBPKpnD0nsEGVEmZTzOqG4Gi_aHIsNISIk
AI_PROVIDER=openai  # Default provider (openai or gemini)
```

### API Keys Setup
1. **OpenAI**: Get your API key from https://platform.openai.com/api-keys
2. **Gemini**: Get your API key from https://makersuite.google.com/app/apikey

## Admin Dashboard Usage

### Accessing AI Provider Settings
1. Login to admin dashboard: `/admin/login`
2. Navigate to the main dashboard
3. Find the "AI Provider Configuration" section

### Switching Providers
1. **Current Status**: View which provider is currently active
2. **Provider Health**: See which providers are properly configured
3. **Switch Provider**: Click on the desired provider button
4. **Confirmation**: System will confirm the switch and update immediately

### Provider Status Indicators
- ✅ **Green Check**: Provider is configured and working
- ❌ **Red X**: Provider is not configured or has issues
- 🔵 **Blue Dot**: OpenAI provider
- 🟣 **Purple Dot**: Gemini provider

## Technical Implementation

### Files Modified/Created
1. **server/services/aiService.js**: Enhanced to support both providers
2. **server/models/Settings.js**: New model for storing admin settings
3. **admin/routes/admin.js**: Added AI provider management endpoints
4. **admin/components/AdminDashboard.jsx**: Added AI provider UI
5. **.env**: Added Gemini API key and provider setting

### API Endpoints
- `GET /api/admin/7780488674/settings/ai-provider`: Get current provider status
- `POST /api/admin/7780488674/settings/ai-provider`: Switch AI provider
- `GET /api/debug/ai`: Debug endpoint for AI provider status

### Database Schema
```javascript
// Settings Collection
{
  key: "ai_provider",
  value: "openai" | "gemini",
  description: "Current AI provider for resume analysis",
  updatedBy: ObjectId, // Admin user who made the change
  updatedAt: Date
}
```

## Testing

### Manual Testing
1. **Provider Detection**: Both providers should show as configured
2. **Switching**: Should be able to toggle between providers
3. **Analysis**: Resume analysis should work with both providers
4. **Fallback**: If one provider fails, system should handle gracefully

### Debug Endpoints
- `GET /api/debug/ai`: Check provider configuration
- `POST /api/debug/ai-test`: Test AI analysis with current provider

## Benefits

### For Administrators
- **Cost Management**: Switch to more cost-effective provider when needed
- **Performance Optimization**: Choose faster provider during high-traffic periods
- **Redundancy**: Backup provider available if primary fails
- **Easy Management**: No code changes required to switch providers

### For Users
- **Consistent Experience**: Same quality analysis regardless of provider
- **Reliability**: Backup provider ensures service availability
- **Performance**: Optimized provider selection for best user experience

## Monitoring

### Admin Dashboard Metrics
- Current active provider
- Provider health status
- Configuration validation
- Switch history (logged to console)

### Logging
All AI provider changes are logged with:
- Admin user who made the change
- Previous and new provider
- Timestamp
- Success/failure status

## Troubleshooting

### Common Issues
1. **Provider Not Configured**: Check API keys in environment variables
2. **Switch Failed**: Ensure target provider has valid API key
3. **Analysis Failed**: Check provider status and API key validity

### Debug Steps
1. Check `/api/debug/ai` endpoint for provider status
2. Verify API keys are properly set in environment
3. Check admin dashboard for provider health indicators
4. Review server logs for detailed error messages

## Future Enhancements
- **Usage Analytics**: Track which provider is used more frequently
- **Cost Tracking**: Monitor API usage costs for each provider
- **Performance Metrics**: Compare response times between providers
- **Auto-Switching**: Automatically switch based on performance/cost criteria