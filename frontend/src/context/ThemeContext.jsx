import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

const STORAGE_KEY = 'skillswap_theme'

/** Returns the initial theme: saved → system preference → 'light' */
function getInitialTheme() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved === 'dark' || saved === 'light') return saved
    } catch { /* ignore */ }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Applies theme to the <html> element immediately */
function applyTheme(theme, animate = false) {
    if (animate) {
        document.documentElement.classList.add('theme-transition')
        window.clearTimeout(window.__themeTransitionTimer)
        window.__themeTransitionTimer = window.setTimeout(() => {
            document.documentElement.classList.remove('theme-transition')
        }, 300)
    }
    document.documentElement.setAttribute('data-theme', theme)
}

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(getInitialTheme)

    // Apply theme on mount and whenever state changes
    useEffect(() => {
        applyTheme(theme)
        try { localStorage.setItem(STORAGE_KEY, theme) } catch { /* ignore */ }
    }, [theme])

    // Listen to system preference changes if no manual preference has been set
    useEffect(() => {
        const mql = window.matchMedia?.('(prefers-color-scheme: dark)')
        if (!mql) return

        const handler = (e) => {
            try {
                const saved = localStorage.getItem(STORAGE_KEY)
                if (!saved) {
                    const newTheme = e.matches ? 'dark' : 'light'
                    setThemeState(newTheme)
                    applyTheme(newTheme, true)
                }
            } catch { /* ignore */ }
        }

        if (mql.addEventListener) {
            mql.addEventListener('change', handler)
            return () => mql.removeEventListener('change', handler)
        } else if (mql.addListener) {
            mql.addListener(handler)
            return () => mql.removeListener(handler)
        }
    }, [])

    const toggleTheme = () => {
        setThemeState((t) => {
            const next = t === 'light' ? 'dark' : 'light'
            applyTheme(next, true)
            return next
        })
    }

    const setTheme = (t) => {
        if (t === 'light' || t === 'dark') {
            applyTheme(t, true)
            setThemeState(t)
        }
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

/** Hook — use this in any component to read or toggle the theme */
export function useTheme() {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
    return ctx
}

