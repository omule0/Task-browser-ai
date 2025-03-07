import { ReactNode } from 'react';

export default function TaskChatLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen h-full">
      {children}
    </main>
  );
} 