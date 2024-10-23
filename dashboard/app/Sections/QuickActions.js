import React from 'react'
import { Search, Upload, FileText, Database } from 'lucide-react'

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <button className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg flex items-center justify-center">
        <Search className="mr-2" /> New Research Query
      </button>
      <button className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg flex items-center justify-center">
        <Upload className="mr-2" /> Upload Document
      </button>
      <button className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg flex items-center justify-center">
        <FileText className="mr-2" /> Generate Report
      </button>
      <button className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg flex items-center justify-center">
        <Database className="mr-2" /> Connect Data Source
      </button>
    </div>
  )
}
