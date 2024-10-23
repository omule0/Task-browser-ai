import React from 'react'

export default function WelcomeBanner() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-2">Welcome back, John Doe</h1>
      <p>You have 3 new insights and 2 completed analyses</p>
    </div>
  )
}
