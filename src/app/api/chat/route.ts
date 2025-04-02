import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import * as cheerio from 'cheerio'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const ODDS_API_KEY = process.env.ODDS_API_KEY
const ODDS_API_HOST = 'https://api.the-odds-api.com/v4'

async function getOddsData() {
  try {
    const response = await fetch(
      `${ODDS_API_HOST}/sports/upcoming/odds/?apiKey=${ODDS_API_KEY}&regions=us&markets=h2h,spreads&oddsFormat=american`
    )
    if (!response.ok) throw new Error('Failed to fetch odds')
    return await response.json()
  } catch (error) {
    console.error('Error fetching odds:', error)
    return null
  }
}

async function scrapePickDawgz() {
  try {
    const response = await fetch('https://pickdawgz.com')
    const html = await response.text()
    const $ = cheerio.load(html)
    
    const picks = []
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

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { message, userId } = await request.json()

    // Get real-time odds data
    const oddsData = await getOddsData()
    
    // Get scraped picks
    const scrapedPicks = await scrapePickDawgz()

    // Combine data for AI context
    const context = {
      odds: oddsData,
      scrapedPicks,
      timestamp: new Date().toISOString(),
    }

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are Wager Genie, an AI sports betting assistant. You have access to real-time odds data and expert picks. 
          Always analyze both the odds and expert picks before making recommendations.
          Format your responses to be clear and concise, with specific predictions and confidence levels.
          Include relevant odds when available. Be direct but maintain a friendly, magical tone.`
        },
        {
          role: "user",
          content: `Context: ${JSON.stringify(context)}\n\nUser Query: ${message}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const aiMessage = completion.choices[0].message.content

    // Extract pick details if present
    const pickDetails = {
      event: "",
      prediction: "",
      odds: "",
      source: "odds_api" as const,
      confidence: 0
    }

    // Simple pattern matching to extract pick details
    const eventMatch = aiMessage.match(/Event: (.*?)(?:\n|$)/)
    const predictionMatch = aiMessage.match(/Prediction: (.*?)(?:\n|$)/)
    const oddsMatch = aiMessage.match(/Odds: (.*?)(?:\n|$)/)
    const confidenceMatch = aiMessage.match(/Confidence: (\d+)%/)

    if (eventMatch) pickDetails.event = eventMatch[1]
    if (predictionMatch) pickDetails.prediction = predictionMatch[1]
    if (oddsMatch) pickDetails.odds = oddsMatch[1]
    if (confidenceMatch) pickDetails.confidence = parseInt(confidenceMatch[1])

    return NextResponse.json({
      message: aiMessage,
      picks: Object.values(pickDetails).some(v => v) ? pickDetails : null
    })

  } catch (error) {
    console.error('Error in chat API:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 