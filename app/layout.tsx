import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import Header from './components/Header'
import BottomNavigation from './components/BottomNavigation'
import NotificationProvider from './components/NotificationProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'StreamVid Pro - Premium Video Streaming',
    description: 'Professional video streaming platform with premium features',
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#667eea',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <AuthProvider>
            <AppProvider>
                <NotificationProvider>
                    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-x-hidden">
                        {/* Animated Background */}
                        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-shift bg-[length:400%_400%]" />
                            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full animate-float" />
                            <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full animate-float [animation-delay:2s]" />
                            <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full animate-float [animation-delay:4s]" />
                        </div>

                        {/* Desktop Header */}
                        <div className="hidden md:block relative z-10">
                            <Header />
                        </div>

                        {/* Main Content */}
                        <main className="relative z-10 pb-20 md:pb-8">
                            {children}
                        </main>

                        {/* Mobile Bottom Navigation */}
                        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
                            <BottomNavigation />
                        </div>
                    </div>
                </NotificationProvider>
            </AppProvider>
        </AuthProvider>
        </body>
        </html>
    )
}
