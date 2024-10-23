import React from 'react'

export default function AIInsights() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Latest AI-Generated Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Market Trends</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Identified emerging trends in the industry</p>
          <button className="text-blue-500 hover:underline">View Details</button>
        </div>
        <div className="border p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Customer Behavior</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Analyzed customer purchasing patterns</p>
          <button className="text-blue-500 hover:underline">View Details</button>
        </div>
      </div>
    </div>
  )
}
