import React from 'react'
import { Search, FileText } from 'lucide-react'

export default function RecentActivities() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
      <ul className="space-y-4">
        <li className="flex items-center">
          <Search className="mr-4 text-blue-500" />
          <div>
            <p className="font-semibold">Research Query</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Analyzed market trends</p>
          </div>
          <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">2 hours ago</span>
        </li>
        <li className="flex items-center">
          <FileText className="mr-4 text-green-500" />
          <div>
            <p className="font-semibold">Document Analysis</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Extracted key insights from report</p>
          </div>
          <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">4 hours ago</span>
        </li>
      </ul>
      <button className="mt-4 text-blue-500 hover:underline">View All</button>
    </div>
  )
}
