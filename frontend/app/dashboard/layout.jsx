import { Inter } from 'next/font/google'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Dashboard | Gym Credit Token System',
  description: 'Manage your Gym Credit Tokens and profile',
}

export default function DashboardLayout({ children }) {
  return (
    <div className={inter.className}>
      {children}
    </div>
  )
}