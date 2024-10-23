'use client'
import React, { useState } from 'react'
import Header from './Sections/Header'
import Sidebar from './Sections/Sidebar'
import WelcomeBanner from './Sections/WelcomeBanner'
import QuickActions from './Sections/QuickActions'
import RecentActivities from './Sections/RecentActivities'
import AIInsights from './Sections/AIInsights'
import DataVisualizationPreview from './Sections/DataVisualizationPreview'
import SystemStatus from './Sections/SystemStatus'

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar />

          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-6">
              <WelcomeBanner />
              <QuickActions />
              <RecentActivities />
              <AIInsights />
              <DataVisualizationPreview />
              <SystemStatus />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
