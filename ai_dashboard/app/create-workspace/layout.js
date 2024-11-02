import { Toaster } from 'react-hot-toast';
export const metadata = {
  title: 'Create Workspace',
  description: 'Create a new workspace',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
       <Toaster />
      <body>{children}</body>
    </html>
  )
}
