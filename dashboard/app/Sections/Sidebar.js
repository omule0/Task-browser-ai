import React from 'react'

export default function Sidebar() {
  return (
    <nav className="bg-blue-900 dark:bg-blue-950 text-white w-64 p-4 hidden md:block">
      <ul className="space-y-2">
        <li className="p-2 rounded bg-blue-800 dark:bg-blue-800">Dashboard</li>
        <li className="p-2 rounded hover:bg-blue-800 dark:hover:bg-blue-800">Research Assistant</li>
        <li className="p-2 rounded hover:bg-blue-800 dark:hover:bg-blue-800">Document Analysis</li>
        <li className="p-2 rounded hover:bg-blue-800 dark:hover:bg-blue-800">Data Visualization</li>
        <li className="p-2 rounded hover:bg-blue-800 dark:hover:bg-blue-800">Integrations</li>
        <li className="p-2 rounded hover:bg-blue-800 dark:hover:bg-blue-800">Settings</li>
      </ul>
    </nav>
  )
}
