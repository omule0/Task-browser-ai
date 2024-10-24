import localFont from "next/font/local";
import "./globals.css";
import {
  GiftIcon,
  HelpCircleIcon,
} from "lucide-react";
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

export const metadata = {
  title: "Dashboard",
  description: "Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="bg-gray-100 min-h-screen flex flex-col">
          <header className="bg-purple-900 text-white">
            <div className="container mx-auto px-4">
              <nav className="flex items-center justify-between h-12">
                <div className="flex items-center space-x-4">
                  <h1 className="text-lg font-bold">Digest.ai</h1>
                </div>
                <div className="flex items-center space-x-6">
                  <a href="#" className="hover:text-purple-200 text-sm">
                    Integrations
                  </a>
                  <a href="#" className="hover:text-purple-200 text-sm">
                    Templates
                  </a>
                  <GiftIcon className="w-6 h-6" />
                  <HelpCircleIcon className="w-6 h-6" />
                  <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center">
                    <span className="font-semibold">M</span>
                  </div>
                </div>
              </nav>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
