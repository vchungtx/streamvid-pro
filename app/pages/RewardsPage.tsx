// ===== APP/PAGES/REWARDSPAGE.TSX =====
'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Gift, Smartphone, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../components/NotificationProvider'

export default function RewardsPage() {
    const [referralPhone, setReferralPhone] = useState('')
    const { user } = useAuth()
    const { showNotification } = useNotification()

    const handleSendReferral = () => {
        if (!referralPhone.trim()) {
            showNotification('Please enter a phone number', 'warning')
            return
        }

        const referralMessage = `🎉 Hey! Check out StreamVid Pro - the ultimate premium video streaming experience! 🚀 Join using my referral for exclusive benefits: https://streamvid.pro/ref/${user.phone} ✨`

        showNotification(
            `📱 Opening SMS app...\nTo: ${referralPhone}\nMessage: ${referralMessage}\n\n🎁 Tap Send to invite your friend!`,
            'success',
            6000
        )

        setReferralPhone('')
    }

    const rewards = [
        { icon: '🎬', title: 'Premium Access', description: '30 days free premium for each referral' },
        { icon: '💎', title: 'Exclusive Content', description: 'Access to VIP-only videos and series' },
        { icon: '🎁', title: 'Monthly Perks', description: 'Special bonuses and surprise rewards' },
        { icon: '⭐', title: 'Priority Support', description: '24/7 premium customer support' },
    ]

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="text-5xl mb-4">🎁</div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
                    Invite & Earn Rewards
                </h1>
                <p className="text-xl text-white/70 max-w-2xl mx-auto">
                    Share StreamVid Pro with friends and unlock amazing rewards together!
                </p>
            </motion.div>

            {/* Referral Section */}
            <motion.div
                className="glass-enhanced rounded-3xl p-8 mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Invite Your Friends</h2>
                    <p className="text-white/70">
                        Send an invitation and both you and your friend get premium benefits!
                    </p>
                </div>

                <div className="max-w-md mx-auto">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            📱 Friend's Phone Number
                        </label>
                        <div className="relative">
                            <input
                                type="tel"
                                value={referralPhone}
                                onChange={(e) => setReferralPhone(e.target.value)}
                                placeholder="Enter phone number"
                                className="w-full p-4 glass rounded-2xl text-white placeholder-white/50 border border-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                onKeyPress={(e) => e.key === 'Enter' && handleSendReferral()}
                            />
                            <Smartphone className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                        </div>
                    </div>

                    <motion.button
                        onClick={handleSendReferral}
                        className="w-full btn-primary flex items-center justify-center space-x-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Gift className="w-5 h-5" />
                        <span>🚀 Send Invitation</span>
                    </motion.button>
                </div>
            </motion.div>

            {/* Rewards Grid */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                <h3 className="text-2xl font-bold text-center mb-8">
                    🌟 Your Rewards
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rewards.map((reward, index) => (
                        <motion.div
                            key={index}
                            className="glass-enhanced rounded-2xl p-6 text-center"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 * index }}
                            whileHover={{ scale: 1.02, y: -5 }}
                        >
                            <div className="text-4xl mb-4">{reward.icon}</div>
                            <h4 className="text-lg font-semibold mb-2">{reward.title}</h4>
                            <p className="text-white/70 text-sm">{reward.description}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Stats Section */}
            <motion.div
                className="mt-12 glass-enhanced rounded-2xl p-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
            >
                <h3 className="text-xl font-bold text-center mb-6">📊 Your Stats</h3>

                <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                        <div className="text-3xl font-bold text-blue-400 mb-1">0</div>
                        <div className="text-sm text-white/70">Referrals</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-purple-400 mb-1">0</div>
                        <div className="text-sm text-white/70">Points</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-pink-400 mb-1">0</div>
                        <div className="text-sm text-white/70">Rewards</div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
