import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { createClient } from '@/utils/supabase/server';
import { WorkspaceProvider } from "@/context/workspace-context";

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
        <WorkspaceProvider>
          <div className="bg-gray-100 min-h-screen flex flex-col">
            <Header/>
            <div className="flex flex-1">
              {user && <Sidebar />}
              <main className={`flex-1 p-6 ${!user ? 'w-full' : ''}`}>
                {children}
              </main>
            </div>
          </div>
        </WorkspaceProvider>
      </body>
    </html>
  );
}
