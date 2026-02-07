# Resume Analysis App - Setup Guide

## Recent Updates

### ✅ Fixed AI SDK Error

- Migrated from `gpt-4-turbo` to `gpt-4o` (AI SDK v2 compatible)
- The app now works with AI SDK 5.x

### ✨ New Features

#### 1. Multi-Provider AI Support

The app now supports multiple AI providers:

- **OpenAI** (GPT-4o, GPT-4o Mini, GPT-4 Turbo)
- **Anthropic** (Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus)
- **Google** (Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini Pro)

#### 2. User API Key Management

Users can now:

- Add their own API keys for different providers
- Switch between different AI models
- Manage multiple API configurations
- Delete API keys when needed

## Setup Instructions

### 1. Database Migration

Run the SQL migration to create the API keys table in your Supabase database:

```sql
-- Execute the contents of: scripts/002_create_user_api_keys.sql
```

Go to your Supabase project → SQL Editor → New query, and paste the contents of `scripts/002_create_user_api_keys.sql`.

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Optional**: Set a default API key (if users don't configure their own):

```env
DEFAULT_AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
```

### 3. Install Dependencies

The required AI SDK providers are already installed:

- `@ai-sdk/openai`
- `@ai-sdk/anthropic`
- `@ai-sdk/google`

If you need to reinstall:

```bash
npm install @ai-sdk/anthropic @ai-sdk/google --force
```

### 4. Start the Development Server

```bash
npm run dev
```

## User Guide

### For End Users

#### Adding Your API Key

1. **Navigate to Settings**
   - Click the "Settings" button in the dashboard header
   - Or go to `/settings`

2. **Add Your API Key**
   - Select your preferred provider (OpenAI, Anthropic, or Google)
   - Choose the model you want to use
   - Paste your API key
   - Click "Save API Key"

3. **Get Your API Key**
   - **OpenAI**: https://platform.openai.com/api-keys
   - **Anthropic**: https://console.anthropic.com/settings/keys
   - **Google**: https://aistudio.google.com/app/apikey

#### Using the Analysis

1. Go to the dashboard (`/protected`)
2. Upload your resume PDF
3. Paste the job posting
4. Select your preferred AI provider (if you have multiple configured)
5. Click "Analyze Resume"

### API Key Security

- API keys are stored securely in Supabase with Row Level Security (RLS)
- Each user can only access their own API keys
- Keys are encrypted in transit
- We never share your keys with third parties

## File Structure

```
app/
├── api/
│   ├── analyze-resume/
│   │   └── route.ts          # Updated with multi-provider support
│   └── api-keys/
│       └── route.ts          # New: API key management endpoints
├── protected/
│   └── page.tsx              # Updated with provider selection
└── settings/
    └── page.tsx              # New: API key management UI

scripts/
├── 001_create_resume_sessions.sql
└── 002_create_user_api_keys.sql  # New: API keys table migration
```

## Available Models

### OpenAI

- `gpt-4o` (Recommended) - Latest GPT-4 Omni model
- `gpt-4o-mini` - Faster, more cost-effective
- `gpt-4-turbo` - Previous generation

### Anthropic

- `claude-3-5-sonnet-20241022` (Recommended) - Best balance
- `claude-3-5-haiku-20241022` - Fastest
- `claude-3-opus-20240229` - Most capable

### Google

- `gemini-1.5-pro-latest` (Recommended) - Most capable
- `gemini-1.5-flash-latest` - Fastest
- `gemini-pro` - Previous generation

## Troubleshooting

### "No API key configured" Error

If you see this error, it means:

1. You haven't added an API key in settings, AND
2. No default API key is set in environment variables

**Solution**: Go to Settings → Add your API key

### AI SDK Version Error

If you still see model version errors:

1. Make sure you're using AI SDK 5.x or higher
2. Check that you're using v2-compatible models (`gpt-4o`, not `gpt-4-turbo`)
3. Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Database Errors

If API keys aren't saving:

1. Verify you ran the migration: `scripts/002_create_user_api_keys.sql`
2. Check Supabase RLS policies are enabled
3. Verify user authentication is working

## Development Notes

### Adding New Providers

To add support for a new AI provider:

1. Install the AI SDK provider:

   ```bash
   npm install @ai-sdk/provider-name
   ```

2. Update `app/api/analyze-resume/route.ts`:
   - Import the provider
   - Add a new case in the `getAIModel` switch statement

3. Update `app/settings/page.tsx`:
   - Add the provider to `providerModels` object
   - Add the provider option in the Select component

4. Update the database constraint in `002_create_user_api_keys.sql`:
   ```sql
   CHECK (provider IN ('openai', 'anthropic', 'google', 'new-provider'))
   ```

## Support

For issues or questions:

- Check the error logs in the browser console
- Review the server logs for API errors
- Ensure your API keys are valid and have sufficient credits
- Verify Supabase connection and migrations

## License

MIT
