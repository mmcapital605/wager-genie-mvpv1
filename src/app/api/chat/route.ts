import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
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

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { messages } = await request.json()

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a magical sports betting genie with deep expertise in sports analytics and betting. Provide structured pick recommendations with confidence levels and odds."
        },
        ...messages
      ],
    })

    const { data: oddsData } = await supabase
      .from('odds')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const response = {
      message: completion.choices[0].message,
      odds: oddsData || null
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Chat API error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 