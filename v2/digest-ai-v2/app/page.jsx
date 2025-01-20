import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings2 } from 'lucide-react'

export default function Page() {
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar className="border-r border-border" />
      <div className="flex-1 pl-0">
        <Header />
        <main className="px-8 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="relative">
              <Input 
                placeholder="What should I research for you?" 
                className="w-full h-14 pl-6 pr-32 text-lg bg-accent/50 border-accent"
              />
              <Button 
                className="absolute right-2 top-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Research
              </Button>
            </div>
            <div className="text-center space-y-2 text-sm text-muted-foreground">
              <p>Tavily is powered by our Search API that aims for objective and factual results at speed. <a href="#" className="underline">Learn more.</a></p>
              <p>Each search report will use up 10 Tavily API credits from your account.</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm mb-8">
              <Settings2 className="h-4 w-4" />
              <span>Preferences</span>
            </div>
            <div className="grid grid-cols-2 gap-4 auto-rows-min">
              <Button 
                variant="outline" 
                className="w-full justify-start p-6 text-left h-auto bg-accent/50 hover:bg-accent/60"
              >
                How to improve problem-solving skills?
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start p-6 text-left h-auto bg-accent/50 hover:bg-accent/60"
              >
                How to legally avoid taxes when inheriting property in California?
              </Button>
              <Button 
                variant="outline" 
                className="col-span-2 justify-start p-6 text-left h-auto bg-accent/50 hover:bg-accent/60"
              >
                What are the most promising cryptocurrency projects right now?
              </Button>
              <Button 
                variant="outline" 
                className="col-span-2 justify-start p-6 text-left h-auto bg-accent/50 hover:bg-accent/60"
              >
                What&apos;s the optimal tech stack for building a SaaS product?
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

