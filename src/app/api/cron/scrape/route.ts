import { createServerClient } from '@supabase/ssr'
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
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Fetch the webpage
    const response = await fetch('https://www.pickdawgz.com')
    if (!response.ok) {
      throw new Error('Failed to fetch webpage')
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract picks
    const picks = $('.pick-card').map((_, element) => {
      const $el = $(element)
      return {
        event: $el.find('.event-name').text().trim(),
        prediction: $el.find('.prediction').text().trim(),
        confidence: parseInt($el.find('.confidence').text().trim().replace('%', '')) || 0,
        source: 'pickdawgz'
      }
    }).get()

    // Store picks in Supabase
    if (picks.length > 0) {
      const { error } = await supabase
        .from('scraped_picks')
        .insert(picks.map(pick => ({
          ...pick,
          created_at: new Date().toISOString()
        })))

      if (error) {
        throw error
      }
    }

    return NextResponse.json({ success: true, picks_count: picks.length })
  } catch (error) {
    console.error('Scraping error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 