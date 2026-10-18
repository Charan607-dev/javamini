package com.skillswap.config;

/**
 * Placeholder for Spring Security configuration.
 *
 * The current project uses only {@code spring-security-crypto} for BCrypt
 * password hashing, not the full {@code spring-boot-starter-security}.
 * No security filter chain is registered; all API endpoints are open.
 *
 * To add full security later:
 * 1. Add {@code spring-boot-starter-security} to pom.xml.
 * 2. Create a SecurityFilterChain bean here.
 * 3. Configure HTTP security, CSRF, and authentication rules.
 */
public class SecurityConfig {
    // Intentionally left empty — retained for project structure.
}
