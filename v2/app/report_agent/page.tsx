"use client"

import { Send } from "lucide-react"

export default function ReportAgentPage() {
  return (
    <div className="flex justify-center p-8">
      <div className="w-[800px] bg-white rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Create Report</h1>
        
        <div className="w-full h-[60px] bg-white rounded-full shadow-lg flex items-center px-6 hover:shadow-xl transition-shadow duration-300 mb-8">
          <input 
            type="text"
            placeholder="Ask me to research any topic..."
            className="flex-1 text-lg text-gray-600 placeholder-gray-400 outline-none"
          />
          <div className="flex items-center ml-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
              <Send className="w-5 h-5 text-blue-600" />
            </button>
          </div>
        </div>
      
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-neutral-200 hover:shadow-lg transition-all cursor-pointer group">
            <h3 className="text-lg font-semibold text-blue-600 mb-3">Scientific basis for 40HZ gamma sound and light treatment of Alzheimer&apos;s disease</h3>
            <p className="text-neutral-600 text-sm line-clamp-3 group-hover:text-neutral-900">The scientific basis for 40Hz gamma sound and light treatment represents a novel and promising approach in addressing Alzheimer&apos;s disease symptoms and progression.</p>
          </div>
      
          <div className="bg-white rounded-xl p-6 border border-neutral-200 hover:shadow-lg transition-all cursor-pointer group">
            <h3 className="text-lg font-semibold text-blue-600 mb-3">Smart cities and the role of digital technology, examples</h3>
            <p className="text-neutral-600 text-sm line-clamp-3 group-hover:text-neutral-900">Smart cities represent an evolving concept at the intersection of urban development and digital innovation, leveraging technology to enhance quality of life.</p>
          </div>
      
          <div className="bg-white rounded-xl p-6 border border-neutral-200 hover:shadow-lg transition-all cursor-pointer group">
            <h3 className="text-lg font-semibold text-blue-600 mb-3">Automatic Knowledge Curation</h3>
            <p className="text-neutral-600 text-sm line-clamp-3 group-hover:text-neutral-900">Automatic Knowledge Curation encompasses the automated processes of collecting, organizing, and managing information to transform raw data into valuable insights.</p>
          </div>
        </div>
      </div>
    </div>
  )
} 