import ChatInterface from "../components/ChatInterface";
import { MainSidebar } from "@/components/MainSidebar";
import { Header } from "@/components/header";

export default function Home() {
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <MainSidebar className="border-r border-border" />
      <div className="flex-1 pl-0">
        <Header />
        <main className="px-8 py-6">
          <div className="max-w-5xl mx-auto">
            <ChatInterface />
          </div>
        </main>
      </div>
    </div>
  );
}
