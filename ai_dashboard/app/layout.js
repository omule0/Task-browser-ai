import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { createClient } from '@/utils/supabase/server';
import { WorkspaceProvider } from "@/context/workspace-context";
import { Toaster } from "react-hot-toast";
import { NavigationBar } from "@/components/NavigationBar";
import { AnnouncementsProvider } from "@/components/AnnouncementsProvider";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default async function RootLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AnnouncementsProvider>
            <Toaster/>
            <WorkspaceProvider>
              <div className="flex flex-col h-full">
                <div className="shrink-0">
                  <Header/>
                  {user && <NavigationBar />}
                </div>
                <div className="flex flex-1 h-[calc(100vh-48px)] overflow-hidden">
                  {user && <Sidebar />}
                  <main className="flex-1 overflow-y-auto p-6">
                    {children}
                  </main>
                </div>
              </div>
            </WorkspaceProvider>
          </AnnouncementsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
