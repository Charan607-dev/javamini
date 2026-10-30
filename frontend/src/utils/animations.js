/**
 * SkillSwap — Shared Framer Motion animation presets
 * All durations are short enough to feel snappy on mobile.
 * Respects prefers-reduced-motion via Framer Motion's built-in support.
 */

// ── Page-level entrance ─────────────────────────────────────────────────────
export const pageVariants = {
    initial:  { opacity: 0, y: 14 },
    animate:  { opacity: 1, y: 0 },
    exit:     { opacity: 0, y: -8 },
}

export const pageTransition = {
    duration: 0.38,
    ease: [0.22, 1, 0.36, 1],
}

// ── Stagger container — wraps a list of children ────────────────────────────
export const staggerContainer = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.07,
            delayChildren: 0.05,
        },
    },
}

// ── Individual staggered child ───────────────────────────────────────────────
export const staggerChild = {
    initial: { opacity: 0, y: 18 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
    },
}

// ── Fade + slide up (for sections revealed on scroll) ───────────────────────
export const fadeUp = {
    initial:   { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport:  { once: true, margin: '-50px' },
    transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
}

// ── Fade in (no movement) ───────────────────────────────────────────────────
export const fadeIn = {
    initial:   { opacity: 0 },
    animate:   { opacity: 1 },
    transition: { duration: 0.35 },
}

// ── Slide up from below (modal / panel) ─────────────────────────────────────
export const slideUp = {
    initial:   { opacity: 0, y: 28, scale: 0.98 },
    animate:   { opacity: 1, y: 0,  scale: 1 },
    exit:      { opacity: 0, y: 20, scale: 0.97 },
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
}

// ── Card hover tap ───────────────────────────────────────────────────────────
export const cardHover = {
    whileHover: { y: -3, scale: 1.005, transition: { duration: 0.2 } },
    whileTap:   { y: 0,  scale: 0.99, transition: { duration: 0.1 } },
}

// ── Button tap ───────────────────────────────────────────────────────────────
export const buttonTap = {
    whileHover: { scale: 1.03, transition: { duration: 0.15 } },
    whileTap:   { scale: 0.97 },
}

// ── Scale-in (auth card, modals) ─────────────────────────────────────────────
export const scaleIn = {
    initial:   { opacity: 0, scale: 0.95, y: 12 },
    animate:   { opacity: 1, scale: 1,    y: 0 },
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
}

// ── Message slide-in (chat) ──────────────────────────────────────────────────
export const messageIn = {
    initial:   { opacity: 0, x: -12, scale: 0.97 },
    animate:   { opacity: 1, x: 0,   scale: 1 },
    transition: { duration: 0.25, ease: 'easeOut' },
}

// ── Success / notification badge pop ─────────────────────────────────────────
export const popIn = {
    initial:   { opacity: 0, scale: 0.7 },
    animate:   { opacity: 1, scale: 1 },
    exit:      { opacity: 0, scale: 0.8 },
    transition: { type: 'spring', stiffness: 400, damping: 22 },
}

// ── Stats strip / counter fade ───────────────────────────────────────────────
export const statFadeUp = {
    initial:     { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport:    { once: true },
    transition:  { duration: 0.4, ease: 'easeOut' },
}
