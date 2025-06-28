'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Category } from '../types'

interface CategoryCardProps {
    category: Category
    onClick: (category: Category) => void
}

export default function CategoryCard({ category, onClick }: CategoryCardProps) {
    return (
        <motion.div
            className="glass-enhanced rounded-2xl p-6 text-center cursor-pointer group"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onClick(category)}
            style={{
                background: `linear-gradient(135deg, ${category.color.replace('from-', 'rgba(').replace(' to-', ', 0.1), rgba(').replace('-500', '')}, 0.1))`
            }}
        >
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {category.icon}
            </div>

            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-300 transition-colors">
                {category.name}
            </h3>

            <p className="text-white/70 text-sm">
                {category.subcategories.join(' • ')}
            </p>

            <div className="mt-4 text-xs text-white/50">
                {category.subcategories.length} subcategories
            </div>
        </motion.div>
    )
}