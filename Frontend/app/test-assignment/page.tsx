'use client'

import { useState } from 'react'

export default function TestAssignment() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testDirectAssignment = async () => {
    setLoading(true)
    setResult('')
    
    try {
      const response = await fetch('/api/assign-resource-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1,
          resourceId: 1,
          suggestedBy: 1
        }),
      })

      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testDebugAssignment = async () => {
    setLoading(true)
    setResult('')
    
    try {
      const response = await fetch('/api/debug-assignment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test Resource Assignment APIs</h1>
      
      <div className="space-y-4">
        <button
          onClick={testDebugAssignment}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-4 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Debug Assignment (Setup DB)'}
        </button>
        
        <button
          onClick={testDirectAssignment}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Direct Assignment'}
        </button>
      </div>

      {result && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Result:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {result}
          </pre>
        </div>
      )}
    </div>
  )
}