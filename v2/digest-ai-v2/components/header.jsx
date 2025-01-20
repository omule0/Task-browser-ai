import { Github, Twitter, Mail, Sun, Moon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  return (
    <header className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">Pages</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm">Research Assistant</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-accent/50 px-3 py-1 rounded-full">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm">Operational</span>
          </div>
          <Card className="flex items-center p-1">
            <Button variant="ghost" size="icon">
              <Github className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Twitter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Mail className="h-4 w-4" />
            </Button>
          </Card>
          <Card className="p-1">
            <ThemeToggle />
          </Card>
        </div>
      </div>
      <h1 className="text-4xl font-bold">Research Assistant</h1>
    </header>
  )
}

