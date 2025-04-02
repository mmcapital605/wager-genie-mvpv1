'use client'

import { useEffect, useState } from 'react'
import { testDatabase } from '@/lib/test-db'

export default function TestPage() {
  const [testResult, setTestResult] = useState<string>('Running tests...')
  const [testOutput, setTestOutput] = useState<string[]>([])

  useEffect(() => {
    // Override console.log to capture output
    const originalLog = console.log
    const logs: string[] = []
    
    console.log = (...args) => {
      originalLog(...args)
      logs.push(args.join(' '))
      setTestOutput([...logs])
    }

    // Run tests
    testDatabase()
      .then((success) => {
        setTestResult(success ? 'All tests passed! 🎉' : 'Tests failed ❌')
      })
      .catch((error) => {
        setTestResult(`Error running tests: ${error.message}`)
      })
      .finally(() => {
        // Restore console.log
        console.log = originalLog
      })
  }, [])

  return (
    <main className="min-h-screen p-8 bg-background text-foreground">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Database Tests</h1>
        
        <div className="bg-card rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Result:</h2>
          <p className={`text-lg ${
            testResult.includes('passed') ? 'text-green-500' : 
            testResult.includes('failed') ? 'text-red-500' : 
            'text-yellow-500'
          }`}>
            {testResult}
          </p>
        </div>

        <div className="bg-card rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Output:</h2>
          <pre className="bg-background p-4 rounded overflow-auto max-h-[400px] text-sm">
            {testOutput.map((log, i) => (
              <div key={i} className="mb-2">{log}</div>
            ))}
          </pre>
        </div>
      </div>
    </main>
  )
} 