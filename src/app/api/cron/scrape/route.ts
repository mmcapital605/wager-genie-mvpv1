import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export const runtime = 'edge'

async function scrapePickDawgz() {
  try {
    const response = await fetch('https://pickdawgz.com')
    const html = await response.text()
    const $ = cheerio.load(html)
    
    const picks: Array<{ event: string; prediction: string }> = []
    $('.pick-card').each((_, element) => {
      const event = $(element).find('.event-name').text().trim()
      const prediction = $(element).find('.prediction').text().trim()
      if (event && prediction) {
        picks.push({ event, prediction })
      }
    })
    
    return picks
  } catch (error) {
    console.error('Error scraping PickDawgz:', error)
    return []
  }
}

export async function GET(request: Request) {
  try {
    // Verify cron secret to ensure this is called by the cron job
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const supabase = createRouteHandlerClient({ cookies })
    
    // Scrape picks
    const picks = await scrapePickDawgz()
    
    // Store in database
    if (picks.length > 0) {
      const { error } = await supabase
        .from('scraped_picks')
        .insert(
          picks.map(pick => ({
            ...pick,
            source: 'pickdawgz',
            scraped_at: new Date().toISOString()
          }))
        )

      if (error) throw error
    }

    return NextResponse.json({
      success: true,
      picksCount: picks.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in scrape API:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 