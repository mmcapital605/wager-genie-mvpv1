import { supabase } from './supabase'

async function testDatabase() {
  console.log('🧞‍♂️ Starting database tests...')
  let lastSuccessfulStep = 'none'

  try {
    // Use existing test user
    const testUserId = 'a22d498e-fd28-49f9-a9c6-7e4c642d36f5'
    console.log('Using existing test user:', testUserId)

    // Sign in as the test user
    console.log('Attempting to sign in...')
    const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@wagergenie.com',
      password: 'TestGenie123!'
    })

    if (signInError) {
      throw new Error(`Authentication failed: ${signInError.message}`)
    }
    if (!user) {
      throw new Error('Authentication succeeded but no user data returned')
    }
    lastSuccessfulStep = 'authentication'
    console.log('✅ Authentication successful:', user.id)

    // Test 0: Verify user profile exists
    console.log('Verifying user profile...')
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', testUserId)
      .single()

    if (profileError) {
      throw new Error(`Failed to fetch user profile: ${profileError.message}`)
    }
    if (!profile) {
      throw new Error('No user profile found for test user')
    }
    lastSuccessfulStep = 'profile verification'
    console.log('✅ User profile verified:', profile)

    // Test 0.1: Verify subscription exists
    console.log('Verifying subscription...')
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', testUserId)
      .single()

    if (subscriptionError) {
      throw new Error(`Failed to fetch subscription: ${subscriptionError.message}`)
    }
    if (!subscription) {
      throw new Error('No subscription found for test user')
    }
    lastSuccessfulStep = 'subscription verification'
    console.log('✅ Subscription verified:', subscription)

    // Test 1: Insert a test pick
    console.log('Testing pick insertion...')
    const pickData = {
      sport: 'NBA',
      event: 'Lakers vs Warriors',
      prediction: 'Lakers -5.5',
      odds: -110,
      confidence: 0.85,
      result: 'pending',
      source: 'odds_api',
      user_id: testUserId
    }
    console.log('Attempting to insert pick:', pickData)
    const { data: pick, error: pickError } = await supabase
      .from('picks')
      .insert(pickData)
      .select()

    if (pickError) {
      throw new Error(`Pick insertion failed: ${pickError.message}\nDetails: ${JSON.stringify(pickError.details)}\nData attempted: ${JSON.stringify(pickData)}`)
    }
    if (!pick || pick.length === 0) {
      throw new Error('Pick inserted but no data returned')
    }
    lastSuccessfulStep = 'pick insertion'
    console.log('✅ Pick inserted successfully:', pick[0])

    // Test 2: Insert test chat messages
    console.log('Testing chat message insertion...')
    const messageData = {
      content: 'Show me today\'s best NBA pick',
      role: 'user',
      user_id: testUserId,
      pick_id: pick[0].id
    }
    console.log('Attempting to insert message:', messageData)
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .insert(messageData)
      .select()

    if (messageError) {
      throw new Error(`Chat message insertion failed: ${messageError.message}\nDetails: ${JSON.stringify(messageError.details)}\nData attempted: ${JSON.stringify(messageData)}`)
    }
    if (!message || message.length === 0) {
      throw new Error('Chat message inserted but no data returned')
    }
    lastSuccessfulStep = 'chat message insertion'
    console.log('✅ Chat message inserted successfully:', message[0])

    // Test 3: Insert test odds data
    console.log('Testing odds data insertion...')
    const oddsData = {
      sport: 'NBA',
      event_id: `test_event_${Date.now()}`,
      home_team: 'Lakers',
      away_team: 'Warriors',
      commence_time: new Date().toISOString(),
      odds_data: {
        h2h: [1.85, 2.0],
        spreads: [-5.5, 5.5]
      }
    }
    console.log('Attempting to insert odds data:', oddsData)
    const { data: odds, error: oddsError } = await supabase
      .from('odds_data')
      .insert(oddsData)
      .select()

    if (oddsError) {
      throw new Error(`Odds data insertion failed: ${oddsError.message}\nDetails: ${JSON.stringify(oddsError.details)}\nData attempted: ${JSON.stringify(oddsData)}`)
    }
    if (!odds || odds.length === 0) {
      throw new Error('Odds data inserted but no data returned')
    }
    lastSuccessfulStep = 'odds data insertion'
    console.log('✅ Odds data inserted successfully:', odds[0])

    // Test 4: Insert test scraped pick
    console.log('Testing scraped pick insertion...')
    const scrapedData = {
      source_url: 'https://example.com/picks',
      sport: 'NBA',
      event: 'Lakers vs Warriors',
      prediction: 'Lakers ML',
      confidence: 'High',
      analysis: 'Strong home performance expected',
      raw_data: {
        original_text: 'Lakers looking strong at home',
        timestamp: new Date().toISOString()
      }
    }
    console.log('Attempting to insert scraped pick:', scrapedData)
    const { data: scraped, error: scrapedError } = await supabase
      .from('scraped_picks')
      .insert(scrapedData)
      .select()

    if (scrapedError) {
      throw new Error(`Scraped pick insertion failed: ${scrapedError.message}\nDetails: ${JSON.stringify(scrapedError.details)}\nData attempted: ${JSON.stringify(scrapedData)}`)
    }
    if (!scraped || scraped.length === 0) {
      throw new Error('Scraped pick inserted but no data returned')
    }
    lastSuccessfulStep = 'scraped pick insertion'
    console.log('✅ Scraped pick inserted successfully:', scraped[0])

    // Test 5: Query relationships
    console.log('Testing relationship queries...')
    const { data: messages, error: queryError } = await supabase
      .from('chat_messages')
      .select(`
        *,
        picks (*),
        user_profiles!inner (*)
      `)
      .eq('user_id', testUserId)
      .limit(1)

    if (queryError) {
      throw new Error(`Relationship query failed: ${queryError.message}\nDetails: ${JSON.stringify(queryError.details)}`)
    }
    if (!messages || messages.length === 0) {
      throw new Error('Relationship query returned no results')
    }
    lastSuccessfulStep = 'relationship query'
    console.log('✅ Relationship query successful:', messages[0])

    console.log('🎉 All database tests passed!')
    return true

  } catch (error: any) {
    console.error(`❌ Database test failed at step: ${lastSuccessfulStep}`)
    console.error('Error details:', {
      message: error.message,
      details: error.details || 'No additional details',
      hint: error.hint || 'No hint provided',
      code: error.code || 'No error code'
    })
    
    // Display the error prominently in the UI
    const errorMessage = `
    ============================
    DATABASE TEST FAILED
    ============================
    Last successful step: ${lastSuccessfulStep}
    Error message: ${error.message}
    Details: ${JSON.stringify(error.details || {})}
    Hint: ${error.hint || 'No hint provided'}
    Code: ${error.code || 'No error code'}
    ============================
    `
    console.error(errorMessage)
    return false
  }
}

// Export for use in development
export { testDatabase } 