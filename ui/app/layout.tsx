import type { Metadata } from 'next'
import { Manrope, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PyCodingAgent',
  description: 'AI-powered Python project generator',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {/* ── Ambient background orbs ── */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[#060B17]" aria-hidden>
          <div className="absolute -top-48 -left-48 w-[750px] h-[750px] rounded-full bg-blue-600/[0.14] blur-[140px]" />
          <div className="absolute -top-24 right-[-80px] w-[550px] h-[500px] rounded-full bg-cyan-500/[0.09] blur-[110px]" />
          <div className="absolute top-[45%] right-[-120px] w-[450px] h-[450px] rounded-full bg-violet-600/[0.08] blur-[100px]" />
          <div className="absolute bottom-[-80px] left-[35%] w-[650px] h-[450px] rounded-full bg-indigo-600/[0.11] blur-[130px]" />
        </div>
        {children}
      </body>
    </html>
  )
}
