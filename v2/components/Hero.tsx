import { Bot } from "lucide-react"

export default function Hero() {
  return (
    <div className="text-center">
      <div className="inline-block p-3 bg-white rounded-full mb-3">
        <Bot className="w-10 h-10 text-blue-600" />
      </div>
      <h1 className="text-2xl font-semibold mb-2">Hey, I&apos;m ****.</h1>
      <p className="text-gray-500">How can I help you today?</p>
    </div>
  )
}

