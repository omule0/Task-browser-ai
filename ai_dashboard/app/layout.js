import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { createClient } from '@/utils/supabase/server';
import { WorkspaceProvider } from "@/context/workspace-context";
import { Toaster } from "react-hot-toast";
import { NavigationBar } from "@/components/NavigationBar";

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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Toaster/>
        <WorkspaceProvider>
          <div className="bg-background min-h-screen flex flex-col">
            <div className="fixed top-0 left-0 right-0 z-50">
              <Header/>
              {user && <NavigationBar />}
            </div>
            <div className={`flex flex-1 relative ${user ? 'md:pt-[48px] pt-[96px]' : 'pt-[48px]'}`}>
              {user && <Sidebar />}
              <main className={`flex-1 p-6 ${!user ? 'w-full' : ''} md:ml-0`}>
                {children}
              </main>
            </div>
          </div>
        </WorkspaceProvider>
      </body>
    </html>
  );
}
