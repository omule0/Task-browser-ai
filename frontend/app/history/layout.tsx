import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'History',
  description: 'View your past interactions and results',
};

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pt-12">
        {children}
      </main>
    </div>
  );
} 