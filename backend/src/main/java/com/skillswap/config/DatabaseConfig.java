package com.skillswap.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;

/**
 * Minimal, reliable DataSource configuration for Supabase PostgreSQL on Render.
 *
 * Reads SPRING_DATASOURCE_URL / _USERNAME / _PASSWORD env vars directly,
 * normalises the URL format (postgres:// → jdbc:postgresql://), appends
 * sslmode=require for cloud hosts, then hands off to HikariCP.
 *
 * Deliberately simple – no regex URL parsing, no multi-fallback chains.
 */
@Configuration
@Profile("!test")  // Skip during tests – H2 auto-config handles test datasource
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Bean
    @Primary
    public DataSource dataSource() {

        // ── 1. Read raw values from environment (highest priority) or system properties ──
        String rawUrl      = resolveValue("SPRING_DATASOURCE_URL",      "spring.datasource.url",      "jdbc:postgresql://localhost:5432/postgres");
        String rawUser     = resolveValue("SPRING_DATASOURCE_USERNAME",  "spring.datasource.username",  "postgres");
        String rawPassword = resolveValue("SPRING_DATASOURCE_PASSWORD",  "spring.datasource.password",  "");

        // ── 2. Normalise URL ──
        String jdbcUrl = normaliseJdbcUrl(rawUrl);

        // ── 3. Safe diagnostics ──
        logDiagnostics(jdbcUrl, rawUser);

        // ── 4. Build HikariCP pool ──
        HikariConfig cfg = new HikariConfig();
        cfg.setPoolName("SkillSwapHikariPool");
        cfg.setDriverClassName("org.postgresql.Driver");
        cfg.setJdbcUrl(jdbcUrl);
        cfg.setUsername(rawUser);
        cfg.setPassword(rawPassword);

        // Pool sizing – conservative for Supabase free-tier
        cfg.setMaximumPoolSize(5);
        cfg.setMinimumIdle(1);

        // Timeouts tuned for Supavisor / cloud NAT
        cfg.setConnectionTimeout(10_000);   // 10 s – fail fast on bad credentials
        cfg.setIdleTimeout(300_000);        // 5 min
        cfg.setMaxLifetime(600_000);        // 10 min – below Supabase 20-min idle limit
        cfg.setKeepaliveTime(60_000);       // 1-min TCP keepalive ping
        cfg.setValidationTimeout(5_000);    // 5 s

        // Explicit connection test query (avoids isValid() JDBC issues with some poolers)
        cfg.setConnectionTestQuery("SELECT 1");

        return new HikariDataSource(cfg);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Reads: environment variable → system property → default.
     */
    private String resolveValue(String envKey, String sysPropKey, String defaultValue) {
        String v = System.getenv(envKey);
        if (v != null && !v.isBlank()) return v.trim();
        v = System.getProperty(sysPropKey);
        if (v != null && !v.isBlank()) return v.trim();
        return defaultValue;
    }

    /**
     * Converts postgres:// or postgresql:// to jdbc:postgresql://.
     * Appends ?sslmode=require for recognised cloud hostnames.
     */
    private String normaliseJdbcUrl(String raw) {
        String url = raw.trim();

        // Strip non-JDBC scheme
        if (url.startsWith("postgres://")) {
            url = "jdbc:postgresql://" + url.substring("postgres://".length());
        } else if (url.startsWith("postgresql://")) {
            url = "jdbc:postgresql://" + url.substring("postgresql://".length());
        }

        // Ensure jdbc:postgresql:// prefix
        if (!url.startsWith("jdbc:postgresql://")) {
            url = "jdbc:postgresql://" + url;
        }

        // Append sslmode=require for cloud hosts if not already present
        boolean isCloud = url.contains("supabase.com") || url.contains("supabase.co")
                || url.contains("render.com") || url.contains("amazonaws.com")
                || url.contains("neon.tech");
        if (isCloud && !url.contains("sslmode=")) {
            url += (url.contains("?") ? "&" : "?") + "sslmode=require";
        }

        return url;
    }

    private void logDiagnostics(String jdbcUrl, String username) {
        log.info("=== SkillSwap DataSource ===");
        log.info("JDBC URL : {}", jdbcUrl);
        log.info("Username : {} (length={})", username, username == null ? 0 : username.length());
        if (username != null && jdbcUrl.contains("pooler.supabase.com") && !username.contains(".")) {
            log.warn("Supabase Pooler requires username format 'postgres.<project-ref>' but got '{}'. " +
                     "Update SPRING_DATASOURCE_USERNAME in Render.", username);
        }
        log.info("===========================");
        log.info("[Startup] DataSource bean created. Tomcat will bind port next.");
    }
}
