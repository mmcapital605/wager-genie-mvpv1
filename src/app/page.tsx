import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-4xl mx-auto px-4 py-16 text-center space-y-12">
        <div className="space-y-6">
          <div className="text-8xl animate-bounce">🧞‍♂️</div>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">
            Welcome to Wager Genie
          </h1>
          <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
            Your magical companion for sports betting success! I'm here to grant your wishes
            with winning picks and expert insights.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-semibold">What I Offer:</h2>
          <ul className="text-xl space-y-4 max-w-xl mx-auto">
            <li className="flex items-center justify-center space-x-3">
              <span className="text-3xl">✨</span>
              <span>One FREE daily magical pick</span>
            </li>
            <li className="flex items-center justify-center space-x-3">
              <span className="text-3xl">🎯</span>
              <span>Expert analysis and predictions</span>
            </li>
            <li className="flex items-center justify-center space-x-3">
              <span className="text-3xl">💫</span>
              <span>Personalized betting guidance</span>
            </li>
            <li className="flex items-center justify-center space-x-3">
              <span className="text-3xl">🌟</span>
              <span>Premium plans for more wishes</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-6 justify-center">
          <Link 
            href="/login"
            className="px-8 py-4 text-lg rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-8 py-4 text-lg rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:opacity-90 transition-opacity"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </main>
  )
} 