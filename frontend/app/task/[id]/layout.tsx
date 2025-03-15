import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Task Details',
  description: 'View detailed information and recording of your task',
};

export default function TaskDetailLayout({
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