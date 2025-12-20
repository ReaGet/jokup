import './globals.css'

export const metadata = {
  title: 'Jokup - Comedy Prompt Battle Game',
  description: 'A real-time multiplayer party game where players compete with funny answers',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white min-h-screen">{children}</body>
    </html>
  )
}
