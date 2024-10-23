import React from 'react'
import { BarChart2 } from 'lucide-react'

export default function DataVisualizationPreview() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Data Visualization Preview</h2>
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <BarChart2 size={48} className="text-gray-400" />
      </div>
      <button className="mt-4 text-blue-500 hover:underline">Explore More</button>
    </div>
  )
}
