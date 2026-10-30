import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ArrowRight, Code2, Palette, Camera, Megaphone,
    Sparkles, Users, Star, Laptop, BookOpen, Globe,
    Zap, ArrowRightLeft, Brain,
} from 'lucide-react'
import { staggerContainer, staggerChild, fadeUp, pageVariants, pageTransition } from '../utils/animations'

const skills = [
    { icon: Code2,     title: 'Web Development',  type: 'TECHNOLOGY', color: 'purple', desc: 'Build modern websites and applications.' },
    { icon: Palette,   title: 'UI/UX Design',      type: 'DESIGN',     color: 'pink',   desc: 'Design useful and beautiful experiences.' },
    { icon: Camera,    title: 'Photography',       type: 'CREATIVE',   color: 'orange', desc: 'Learn composition and editing techniques.' },
    { icon: Megaphone, title: 'Digital Marketing', type: 'BUSINESS',   color: 'green',  desc: 'Understand content and digital growth.' },
]

const floatingIcons = [
    { icon: Code2,          top: '12%', left: '4%',  delay: 0,   size: 20, opacity: 0.22 },
    { icon: Brain,          top: '22%', right: '6%', delay: 0.4, size: 18, opacity: 0.18 },
    { icon: Palette,        top: '65%', left: '2%',  delay: 0.8, size: 16, opacity: 0.16 },
    { icon: Sparkles,       top: '78%', right: '4%', delay: 0.2, size: 18, opacity: 0.20 },
    { icon: ArrowRightLeft, top: '46%', left: '1%',  delay: 1.1, size: 15, opacity: 0.14 },
    { icon: Globe,          top: '35%', right: '2%', delay: 0.6, size: 16, opacity: 0.15 },
]

export default function Home() {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            transition={pageTransition}
        >
            <main style={{ overflow: 'hidden' }}>

                {/* ── Hero ── */}
                <section className="hero" style={{ position: 'relative' }}>

                    {/* Floating background icons */}
                    {floatingIcons.map(({ icon: Icon, top, left, right, delay, size, opacity }, i) => (
                        <motion.div
                            key={i}
                            aria-hidden="true"
                            style={{ position: 'absolute', top, left, right, color: 'var(--primary)', opacity, pointerEvents: 'none', zIndex: 0 }}
                            animate={{ y: [0, -10, 0], rotate: [0, 6, -4, 0] }}
                            transition={{ duration: 5 + i * 0.7, delay, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' }}
                        >
                            <Icon size={size} />
                        </motion.div>
                    ))}

                    {/* Hero copy */}
                    <motion.div
                        className="hero-copy"
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        style={{ position: 'relative', zIndex: 1 }}
                    >
                        <motion.div
                            className="eyebrow"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1, duration: 0.4 }}
                        >
                            <Sparkles size={15} /> LEARN TOGETHER. GROW TOGETHER.
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.18, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                        >
                            Your skills are<br />someone's <span className="gradient-text">next big thing.</span>
                        </motion.h1>

                        <motion.p
                            className="hero-description"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.28, duration: 0.48 }}
                        >
                            Exchange what you know for what you want to learn.
                            Meet students, share knowledge, and grow your skills
                            together — without exchanging money.
                        </motion.p>

                        <motion.div
                            className="hero-buttons"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.38, duration: 0.44 }}
                        >
                            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                                <Link to="/register" className="btn btn-primary btn-large">
                                    Start swapping <ArrowRight size={18} />
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <Link to="/explore" className="btn btn-secondary btn-large">Explore skills</Link>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            className="social-proof"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.52, duration: 0.4 }}
                        >
                            <div className="avatar-stack"><span>A</span><span>R</span><span>S</span><span>K</span></div>
                            <div>
                                <strong>A community built on sharing</strong>
                                <p>Teach something. Learn something new.</p>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Hero visual */}
                    <motion.div
                        className="hero-visual"
                        initial={{ opacity: 0, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        style={{ position: 'relative', zIndex: 1 }}
                    >
                        <div className="visual-glow" />

                        <motion.div
                            className="swap-card card-one"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <div className="profile-row">
                                <div className="profile-avatar purple-bg">AK</div>
                                <div><strong>Arjun Kumar</strong><p>Wants to teach React</p></div>
                                <span className="online-dot" />
                            </div>
                            <div className="skill-chip purple-chip"><Code2 size={15} /> React Development</div>
                        </motion.div>

                        <motion.div
                            className="swap-symbol"
                            animate={{ rotate: [0, 12, -8, 0], scale: [1, 1.08, 1] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                        >
                            <ArrowRight size={23} />
                        </motion.div>

                        <motion.div
                            className="swap-card card-two"
                            animate={{ y: [0, 6, 0] }}
                            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                        >
                            <div className="profile-row">
                                <div className="profile-avatar orange-bg">SP</div>
                                <div><strong>Sneha Patel</strong><p>Wants to teach design</p></div>
                                <span className="online-dot" />
                            </div>
                            <div className="skill-chip orange-chip"><Palette size={15} /> UI/UX Design</div>
                        </motion.div>

                        <motion.div
                            className="floating-note"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                        >
                            <Star size={15} fill="currentColor" /> Knowledge goes both ways
                        </motion.div>
                    </motion.div>
                </section>

                {/* ── Stats strip ── */}
                <motion.section
                    className="stats-strip"
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: '-40px' }}
                >
                    {[
                        { icon: Users,    label: 'Student-first',  sub: 'Peer-to-peer learning' },
                        { icon: Sparkles, label: 'Smart matching',  sub: 'Complementary skills' },
                        { icon: Globe,    label: 'Open community',  sub: 'Learn from each other' },
                    ].map(({ icon: Icon, label, sub }) => (
                        <motion.div key={label} variants={staggerChild}>
                            <Icon size={21} />
                            <strong>{label}</strong>
                            <span>{sub}</span>
                        </motion.div>
                    ))}
                </motion.section>

                {/* ── Skill cards ── */}
                <section className="skills-section" id="skills">
                    <motion.div className="section-heading" {...fadeUp}>
                        <div>
                            <span className="section-kicker">DISCOVER YOUR NEXT SKILL</span>
                            <h2>Knowledge is better <span className="gradient-text">shared.</span></h2>
                        </div>
                        <Link to="/explore" className="text-link">Explore all skills <ArrowRight size={16} /></Link>
                    </motion.div>

                    <motion.div
                        className="skills-grid"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, margin: '-50px' }}
                    >
                        {skills.map(({ icon: Icon, title, type, color, desc }) => (
                            <motion.article
                                className="skill-card"
                                key={title}
                                variants={staggerChild}
                                whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.2 } }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className={`skill-icon ${color}`}><Icon size={23} /></div>
                                <span className="skill-category">{type}</span>
                                <h3>{title}</h3>
                                <p>{desc}</p>
                                <Link to="/explore" className="card-arrow" aria-label={`Explore ${title}`}>
                                    <ArrowRight size={18} />
                                </Link>
                            </motion.article>
                        ))}
                    </motion.div>
                </section>

                {/* ── How it works ── */}
                <section className="how-section" id="how-it-works">
                    <motion.span className="section-kicker" {...fadeUp}>SIMPLE BY DESIGN</motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.44, delay: 0.1 }}
                    >
                        Three steps. <span className="gradient-text">New possibilities.</span>
                    </motion.h2>
                    <motion.div
                        className="steps-grid"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, margin: '-40px' }}
                    >
                        {[
                            { num: '01', Icon: BookOpen, h: 'Share your skills',  p: 'Add what you can teach and what you want to learn.' },
                            { num: '02', Icon: Users,    h: 'Find your match',    p: 'Discover students with skills that complement yours.' },
                            { num: '03', Icon: Laptop,   h: 'Learn by swapping',  p: 'Exchange knowledge and practise together.' },
                        ].map(({ num, Icon, h, p }) => (
                            <motion.div
                                key={num}
                                variants={staggerChild}
                                whileHover={{ y: -4, borderColor: 'var(--primary)', transition: { duration: 0.2 } }}
                            >
                                <span>{num}</span>
                                <Icon size={23} />
                                <h3>{h}</h3>
                                <p>{p}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* ── CTA section ── */}
                <motion.section
                    className="cta-section"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <span className="section-kicker" style={{ color: 'rgba(255,255,255,.75)' }}>
                            <Zap size={14} /> START YOUR JOURNEY
                        </span>
                        <h2>Ready to swap skills?</h2>
                        <p className="hero-description" style={{ color: 'rgba(255,255,255,.8)' }}>
                            Join students already sharing their expertise. Sign up free and start learning today.
                        </p>
                        <div className="hero-buttons" style={{ justifyContent: 'center', marginTop: 28 }}>
                            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
                                <Link to="/register" className="btn btn-large" style={{ background: '#fff', color: 'var(--primary-hover)', border: 'none' }}>
                                    Get started free <ArrowRight size={18} />
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <Link to="/explore" className="btn btn-secondary btn-large cta-section-btn" style={{ borderColor: 'rgba(255,255,255,.4)', color: '#fff', background: 'rgba(255,255,255,.12)' }}>
                                    Explore skills
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.section>
            </main>

            <footer>
                <Link to="/" className="brand">Skill<span className="accent">Swap</span></Link>
                <p>Everyone has something to teach.</p>
                <Link to="/explore">Explore skills <ArrowRight size={15} /></Link>
            </footer>
        </motion.div>
    )
}
