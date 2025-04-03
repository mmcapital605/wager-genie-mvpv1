# Wager Genie

Your AI-powered sports betting assistant that provides expert picks and real-time odds.

## Features

- AI-powered chat with sports betting expertise
- Real-time odds integration
- Automated pick scraping
- Beautiful modern UI with dark mode support

## Deployment

This project is automatically deployed to Vercel through GitHub Actions. Every push to the main branch triggers a new deployment.

### Environment Variables Required

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `OPENAI_API_KEY`: Your OpenAI API key
- `ODDS_API_KEY`: Your The Odds API key
- `CRON_SECRET`: Secret key for cron job authentication
- `VERCEL_TOKEN`: Vercel deployment token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID

## Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Tech Stack

- Next.js 14
- React
- TypeScript
- Supabase
- OpenAI GPT-4
- TailwindCSS
- Shadcn UI
- The Odds API 