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
  return children;
} 