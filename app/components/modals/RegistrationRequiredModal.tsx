'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function RegistrationRequiredModal() {
    const { activeModals, hideModal, showModal } = useApp()
    const isOpen = activeModals.has('registration-required')

    const handleClose = () => {
        hideModal('registration-required')
    }

    const switchToRegister = () => {
        hideModal('registration-required')
        showModal('register')
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
                        className="relative glass-enhanced rounded-3xl p-8 w-full max-w-md text-center"
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

                        <div className="mb-8">
                            <div className="text-6xl mb-4">⭐</div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                                🚀 Registration Required
                            </h2>
                            <p className="text-white/70 leading-relaxed">
                                Unlock the full StreamVid Pro experience! Complete your registration to access premium features,
                                full videos, and personalized content recommendations.
                            </p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center space-x-3 p-3 glass rounded-xl">
                                <Star className="w-5 h-5 text-yellow-400" />
                                <span className="text-sm">Unlimited video streaming</span>
                            </div>
                            <div className="flex items-center space-x-3 p-3 glass rounded-xl">
                                <Star className="w-5 h-5 text-yellow-400" />
                                <span className="text-sm">Personalized recommendations</span>
                            </div>
                            <div className="flex items-center space-x-3 p-3 glass rounded-xl">
                                <Star className="w-5 h-5 text-yellow-400" />
                                <span className="text-sm">Exclusive premium content</span>
                            </div>
                        </div>

                        <motion.button
                            onClick={switchToRegister}
                            className="w-full btn-primary"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            ✨ Complete Registration
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}