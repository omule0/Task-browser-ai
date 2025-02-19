import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'View and edit your profile settings',
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 