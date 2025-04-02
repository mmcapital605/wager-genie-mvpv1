import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const ODDS_API_KEY = process.env.ODDS_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET;

// List of sports to fetch odds for
const SPORTS = [
  'americanfootball_nfl',
  'basketball_nba',
  'baseball_mlb',
  'icehockey_nhl'
];

async function fetchOddsForSport(sport: string) {
  const response = await fetch(
    `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${ODDS_API_KEY}&regions=us&markets=h2h,spreads,totals&oddsFormat=american`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch odds for ${sport}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== CRON_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Fetch odds for all sports
    for (const sport of SPORTS) {
      const oddsData = await fetchOddsForSport(sport);
      
      // Process and store each event's odds
      for (const event of oddsData) {
        const { id, sport_key, home_team, away_team, commence_time, bookmakers } = event;
        
        // Format odds data for storage
        const formattedOdds = {
          event_id: id,
          home_team,
          away_team,
          commence_time,
          bookmakers: bookmakers.map((bm: any) => ({
            key: bm.key,
            title: bm.title,
            markets: bm.markets
          }))
        };
        
        // Insert into database
        const { error } = await supabase
          .from('odds_data')
          .insert({
            sport: sport_key,
            event: `${home_team} vs ${away_team}`,
            market: 'all', // We're storing multiple markets
            odds: formattedOdds
          });
          
        if (error) {
          console.error(`Error storing odds for ${sport} event ${id}:`, error);
        }
      }
    }
    
    return new NextResponse('Odds data fetched and stored successfully', { status: 200 });
  } catch (error) {
    console.error('Error in odds fetching cron job:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 