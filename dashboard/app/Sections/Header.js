import React from 'react'
import { Bell, ChevronDown, Sun, Moon } from 'lucide-react'

export default function Header({ darkMode, toggleDarkMode }) {
  return (
    <header className="bg-blue-800 dark:bg-blue-900 text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">Digest.ai</div>
      <div className="flex items-center space-x-4">
        <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-blue-700 dark:hover:bg-blue-800">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <Bell size={20} />
        <div className="flex items-center cursor-pointer">
          <img src="/placeholder.svg" alt="User" className="w-8 h-8 rounded-full" />
          <ChevronDown size={16} className="ml-1" />
        </div>
      </div>
    </header>
  )
}
