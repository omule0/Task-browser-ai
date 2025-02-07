"use client"

import { useState } from "react"
import { BarLoader } from "react-spinners"
import Chat from "@/components/Chat"
import Hero from "@/components/Hero"

export default function Home() {
  const [isInitializing, setIsInitializing] = useState(true)

  return (
    <>
      {isInitializing && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <BarLoader color="#2563eb" loading={true} width="100%" height={8} />
        </div>
      )}
      <main className="flex flex-col min-h-screen p-4">
        <Hero />
        <div className="flex-1 py-4">
          <Chat setIsInitializing={setIsInitializing} />
        </div>
      </main>
    </>
  )
} 