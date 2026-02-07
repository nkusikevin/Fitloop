# Quick Start - Migration Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Run Database Migration

Copy and execute the SQL in your Supabase SQL Editor:

**File**: `scripts/002_create_user_api_keys.sql`

1. Open your Supabase project
2. Go to SQL Editor → New query
3. Copy the entire contents of `scripts/002_create_user_api_keys.sql`
4. Paste and click "Run"

### Step 2: Configure Environment (Optional)

If you want a system-wide default API key:

```bash
# In .env.local
DEFAULT_AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
```

**Note**: Users can still add their own API keys via Settings, which will override this default.

### Step 3: Get Your API Key

Choose one provider and get an API key:

- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/settings/keys
- **Google**: https://aistudio.google.com/app/apikey

Then add it in your app:

1. Sign in to your app
2. Click "Settings" in the header
3. Select provider, choose model, paste key
4. Click "Save"

## ✅ You're Done!

Now when you analyze a resume, it will use your configured AI provider.

## Model Recommendations

### Best Overall

- **OpenAI GPT-4o** - Great balance of speed and quality
- **Anthropic Claude 3.5 Sonnet** - Excellent reasoning

### Fastest

- **OpenAI GPT-4o Mini** - Quick and cost-effective
- **Google Gemini 1.5 Flash** - Very fast responses

### Most Capable

- **Anthropic Claude 3 Opus** - Best for complex analysis
- **Google Gemini 1.5 Pro** - Large context window

## Cost Comparison (approximate)

| Provider  | Model             | Cost per Resume Analysis\* |
| --------- | ----------------- | -------------------------- |
| OpenAI    | GPT-4o            | $0.02 - $0.05              |
| OpenAI    | GPT-4o Mini       | $0.001 - $0.003            |
| Anthropic | Claude 3.5 Sonnet | $0.03 - $0.06              |
| Anthropic | Claude 3.5 Haiku  | $0.005 - $0.01             |
| Google    | Gemini 1.5 Pro    | Free tier available        |
| Google    | Gemini 1.5 Flash  | Free tier available        |

\*Estimates based on typical resume + job posting length (~2000-4000 tokens)

## Troubleshooting

**Error: "No API key configured"**

- Add your API key in Settings
- OR set a default key in `.env.local`

**Error: "Unsupported model version"**

- This has been fixed! Make sure you pulled the latest changes
- Restart your dev server: `npm run dev`

**Database error when saving API key**

- Make sure you ran the SQL migration (Step 1)
- Check Supabase logs for specific errors

**Analysis still not working**

- Verify your API key is valid
- Check you have API credits available
- Look at browser console for specific errors

## Need Help?

Check `SETUP.md` for detailed documentation.
