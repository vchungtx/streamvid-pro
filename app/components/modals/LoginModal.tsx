'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Smartphone, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { useNotification } from '../NotificationProvider'

export default function LoginModal() {
    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState('')
    const [step, setStep] = useState<'phone' | 'otp'>('phone')
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const { activeModals, hideModal, showModal } = useApp()
    const { showNotification } = useNotification()

    const isOpen = activeModals.has('login')

    const handlePhoneSubmit = async () => {
        if (!phone.trim()) {
            showNotification('Please enter your phone number', 'warning')
            return
        }

        setLoading(true)

        // Simulate 4G detection
        const has4G = Math.random() > 0.3

        if (has4G) {
            try {
                await login(phone)
                showNotification('🎉 Successfully logged in via 4G detection!', 'success')
                hideModal('login')
                reset()
            } catch (error) {
                showNotification('Login failed. Please try again.', 'error')
            }
        } else {
            setStep('otp')
            showNotification('📱 OTP sent to your phone', 'info')
        }

        setLoading(false)
    }

    const handleOtpSubmit = async () => {
        if (!otp.trim() || otp.length < 4) {
            showNotification('Please enter a valid OTP', 'warning')
            return
        }

        setLoading(true)

        try {
            await login(phone)
            showNotification('✅ Successfully logged in!', 'success')
            hideModal('login')
            reset()
        } catch (error) {
            showNotification('Invalid OTP. Please try again.', 'error')
        }

        setLoading(false)
    }

    const reset = () => {
        setPhone('')
        setOtp('')
        setStep('phone')
        setLoading(false)
    }

    const handleClose = () => {
        hideModal('login')
        reset()
    }

    const switchToRegister = () => {
        hideModal('login')
        showModal('register')
        reset()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="relative glass-enhanced rounded-3xl p-8 w-full max-w-md"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 glass rounded-full hover:bg-white/20 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-8">
                            <div className="text-4xl mb-4">🔐</div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                Welcome Back
                            </h2>
                            <p className="text-white/70 mt-2">
                                Sign in to access your premium content
                            </p>
                        </div>

                        {step === 'phone' ? (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        📱 Phone Number
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="Enter your phone number"
                                            className="w-full p-4 glass rounded-2xl text-white placeholder-white/50 border border-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                            onKeyPress={(e) => e.key === 'Enter' && handlePhoneSubmit()}
                                        />
                                        <Smartphone className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                                    </div>
                                </div>

                                <motion.button
                                    onClick={handlePhoneSubmit}
                                    disabled={loading}
                                    className="w-full btn-primary flex items-center justify-center space-x-2"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Shield className="w-5 h-5" />
                                            <span>Auto-detect 4G / Request OTP</span>
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        🔢 OTP Code
                                    </label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="Enter 6-digit OTP"
                                        className="w-full p-4 glass rounded-2xl text-white placeholder-white/50 border border-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        maxLength={6}
                                        onKeyPress={(e) => e.key === 'Enter' && handleOtpSubmit()}
                                    />
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setStep('phone')}
                                        className="flex-1 btn-outline"
                                    >
                                        Back
                                    </button>
                                    <motion.button
                                        onClick={handleOtpSubmit}
                                        disabled={loading}
                                        className="flex-2 btn-primary"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                                        ) : (
                                            'Verify OTP'
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 text-center">
                            <p className="text-white/70">
                                Don't have an account?{' '}
                                <button
                                    onClick={switchToRegister}
                                    className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                                >
                                    Register here ✨
                                </button>
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}