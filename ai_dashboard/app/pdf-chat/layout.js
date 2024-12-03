"use client";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";
import { WorkspaceProvider } from "@/context/workspace-context";

// Import the fonts directly in this layout to maintain consistent typography
const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function PDFChatLayout({ children }) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <WorkspaceProvider>
          <div className="h-screen">
            <Toaster />
            {children}
          </div>
        </WorkspaceProvider>
      </ThemeProvider>
    </div>
  );
}

// // Metadata configuration
// export const metadata = {
//   title: 'PDF Chat',
//   description: 'Chat with your PDF documents',
// }; 