import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, ArrowLeft } from 'lucide-react'
import { pageVariants, pageTransition, staggerContainer, staggerChild } from '../utils/animations'

const SAMPLE_REVIEWS = [
    {
        id: '1',
        reviewer: 'Alice Johnson',
        recipient: 'Bob Smith',
        skill: 'Figma & UI Design',
        rating: 5,
        comment: 'Bob explained wireframing and design systems so clearly! Our skill swap was super productive.',
        date: '2026-10-15',
    },
    {
        id: '2',
        reviewer: 'Bob Smith',
        recipient: 'Alice Johnson',
        skill: 'Java & Spring Boot 3',
        rating: 5,
        comment: 'Alice taught me how REST controllers and service layers work. Fantastic exchange partner!',
        date: '2026-10-16',
    },
]

export default function Reviews() {
    const [reviews] = useState(SAMPLE_REVIEWS)

    return (
        <motion.main
            className="ss-page"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            transition={pageTransition}
        >
            <div className="ss-container">

                {/* Header */}
                <motion.header
                    className="ss-header"
                    initial={{ opacity: 0, y: -14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                    <div>
                        <motion.div whileHover={{ x: -3 }} transition={{ duration: 0.15 }}>
                            <Link
                                to="/dashboard"
                                className="back-link"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8, color: 'var(--primary)', textDecoration: 'none' }}
                            >
                                <ArrowLeft size={16} /> Back to dashboard
                            </Link>
                        </motion.div>
                        <h1 className="ss-title">Peer Reviews &amp; Endorsements</h1>
                        <p className="ss-subtitle">Community feedback from completed student skill exchanges.</p>
                    </div>
                </motion.header>

                {/* Review cards */}
                <motion.div
                    className="ss-list"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    {reviews.map(r => (
                        <motion.article
                            key={r.id}
                            className="ss-booking-card"
                            variants={staggerChild}
                            whileHover={{ y: -3, scale: 1.005, transition: { duration: 0.18 } }}
                            layout
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <h3 className="ss-card-title">{r.skill}</h3>

                                {/* Staggered star animation */}
                                <motion.div
                                    style={{ display: 'flex', color: 'var(--warning)' }}
                                    variants={staggerContainer}
                                    initial="initial"
                                    animate="animate"
                                >
                                    {[...Array(r.rating)].map((_, i) => (
                                        <motion.span
                                            key={i}
                                            variants={{
                                                initial: { opacity: 0, scale: 0.4, rotate: -20 },
                                                animate: {
                                                    opacity: 1,
                                                    scale: 1,
                                                    rotate: 0,
                                                    transition: { delay: i * 0.06, type: 'spring', stiffness: 400, damping: 18 },
                                                },
                                            }}
                                        >
                                            <Star size={16} fill="var(--warning)" />
                                        </motion.span>
                                    ))}
                                </motion.div>
                            </div>

                            <p className="ss-card-text" style={{ fontStyle: 'italic', marginBottom: 12 }}>
                                &ldquo;{r.comment}&rdquo;
                            </p>

                            <p className="ss-card-text" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                From <strong>{r.reviewer}</strong> to <strong>{r.recipient}</strong> · {r.date}
                            </p>
                        </motion.article>
                    ))}
                </motion.div>

            </div>
        </motion.main>
    )
}
