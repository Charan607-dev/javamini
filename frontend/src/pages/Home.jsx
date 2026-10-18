
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ArrowRight, Code2, Palette, Camera, Megaphone,
    Sparkles, Users, Star, Laptop, BookOpen, Globe
} from 'lucide-react'

const skills = [
    { icon: Code2, title: 'Web Development', type: 'TECHNOLOGY', color: 'purple', desc: 'Build modern websites and applications.' },
    { icon: Palette, title: 'UI/UX Design', type: 'DESIGN', color: 'pink', desc: 'Design useful and beautiful experiences.' },
    { icon: Camera, title: 'Photography', type: 'CREATIVE', color: 'orange', desc: 'Learn composition and editing techniques.' },
    { icon: Megaphone, title: 'Digital Marketing', type: 'BUSINESS', color: 'green', desc: 'Understand content and digital growth.' },
]

export default function Home() {
    return (
        <>
            <main>
                <section className="hero">
                    <motion.div
                        className="hero-copy"
                        initial={{ opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="eyebrow"><Sparkles size={15} /> LEARN TOGETHER. GROW TOGETHER.</div>
                        <h1>Your skills are<br />someone's <span className="gradient-text">next big thing.</span></h1>
                        <p className="hero-description">
                            Exchange what you know for what you want to learn.
                            Meet students, share knowledge, and grow your skills
                            together — without exchanging money.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/register" className="btn btn-primary btn-large">
                                Start swapping <ArrowRight size={18} />
                            </Link>
                            <Link to="/explore" className="btn btn-secondary btn-large">Explore skills</Link>
                        </div>
                        <div className="social-proof">
                            <div className="avatar-stack"><span>A</span><span>R</span><span>S</span><span>K</span></div>
                            <div><strong>A community built on sharing</strong><p>Teach something. Learn something new.</p></div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="hero-visual"
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                    >
                        <div className="visual-glow" />
                        <div className="swap-card card-one">
                            <div className="profile-row">
                                <div className="profile-avatar purple-bg">AK</div>
                                <div><strong>Arjun Kumar</strong><p>Wants to teach React</p></div>
                                <span className="online-dot" />
                            </div>
                            <div className="skill-chip purple-chip"><Code2 size={15} /> React Development</div>
                        </div>
                        <div className="swap-symbol"><ArrowRight size={23} /></div>
                        <div className="swap-card card-two">
                            <div className="profile-row">
                                <div className="profile-avatar orange-bg">SP</div>
                                <div><strong>Sneha Patel</strong><p>Wants to teach design</p></div>
                                <span className="online-dot" />
                            </div>
                            <div className="skill-chip orange-chip"><Palette size={15} /> UI/UX Design</div>
                        </div>
                        <div className="floating-note"><Star size={15} fill="currentColor" /> Knowledge goes both ways</div>
                    </motion.div>
                </section>

                <section className="stats-strip">
                    <div><Users size={21} /><strong>Student-first</strong><span>Peer-to-peer learning</span></div>
                    <div><Sparkles size={21} /><strong>Smart matching</strong><span>Complementary skills</span></div>
                    <div><Globe size={21} /><strong>Open community</strong><span>Learn from each other</span></div>
                </section>

                <section className="skills-section" id="skills">
                    <div className="section-heading">
                        <div><span className="section-kicker">DISCOVER YOUR NEXT SKILL</span><h2>Knowledge is better <span className="gradient-text">shared.</span></h2></div>
                        <Link to="/explore" className="text-link">Explore all skills <ArrowRight size={16} /></Link>
                    </div>
                    <div className="skills-grid">
                        {skills.map(({ icon: Icon, title, type, color, desc }, i) => (
                            <motion.article
                                className="skill-card" key={title}
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                            >
                                <div className={`skill-icon ${color}`}><Icon size={23} /></div>
                                <span className="skill-category">{type}</span>
                                <h3>{title}</h3>
                                <p>{desc}</p>
                                <Link to="/explore" className="card-arrow" aria-label={`Explore ${title}`}><ArrowRight size={18} /></Link>
                            </motion.article>
                        ))}
                    </div>
                </section>

                <section className="how-section" id="how-it-works">
                    <span className="section-kicker">SIMPLE BY DESIGN</span>
                    <h2>Three steps. <span className="gradient-text">New possibilities.</span></h2>
                    <div className="steps-grid">
                        <div><span>01</span><BookOpen size={23} /><h3>Share your skills</h3><p>Add what you can teach and what you want to learn.</p></div>
                        <div><span>02</span><Users size={23} /><h3>Find your match</h3><p>Discover students with skills that complement yours.</p></div>
                        <div><span>03</span><Laptop size={23} /><h3>Learn by swapping</h3><p>Exchange knowledge and practise together.</p></div>
                    </div>
                </section>

                <section className="cta-section">
                    <span className="section-kicker">YOUR NEXT SKILL STARTS HERE</span>
                    <h2>What will you <span className="gradient-text">learn next?</span></h2>
                    <p>Join a community where everyone has something to teach.</p>
                    <Link to="/register" className="btn btn-primary btn-large">Create your account <ArrowRight size={18} /></Link>
                </section>
            </main>
            <footer>
                <Link to="/" className="brand">Skill<span className="accent">Swap</span></Link>
                <p>Everyone has something to teach.</p>
                <Link to="/explore">Explore skills <ArrowRight size={15} /></Link>
            </footer>
        </>
    )
}
