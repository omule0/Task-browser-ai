import { Metadata } from 'next';
import Script from 'next/script';

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
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-QD0186HNYG" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QD0186HNYG');
          `}
        </Script>
      </head>
      <body>
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}
