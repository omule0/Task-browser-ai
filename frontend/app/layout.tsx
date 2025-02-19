import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Digest AI',
    default: 'Digest AI - AI-Powered Web Research Assistant'
  },
  description: 'Digest AI helps you research, analyze, and summarize web content with the power of AI.',

};

import { RootLayoutClient } from '@/components/RootLayoutClient';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}
