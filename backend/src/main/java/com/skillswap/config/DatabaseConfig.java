package com.skillswap.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Production-ready Datasource configuration tailored for Supabase PostgreSQL & Session Pooler on Render.
 * 
 * Features:
 * 1. Safe diagnostic logging without leaking passwords or sensitive tokens.
 * 2. Automatic JDBC URL normalization:
 *    - Automatically adds '?sslmode=require' if missing when connecting to cloud hosts (Supabase, Render, AWS, Neon).
 *    - Accepts standard 'postgres://' or 'postgresql://' URIs (e.g., Render DATABASE_URL) and converts to 'jdbc:postgresql://'.
 * 3. Supabase Pooler compatibility:
 *    - Optimized maxLifetime (10 mins) and idleTimeout (5 mins) to prevent stale socket closures by Supavisor/firewalls.
 *    - Keeps maximumPoolSize moderate (5-10) to respect Supabase pool limits.
 *    - Sets keepaliveTime (5 mins) and validationTimeout (5s).
 */
@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:#{null}}")
    private String configuredUrl;

    @Value("${spring.datasource.username:#{null}}")
    private String configuredUsername;

    @Value("${spring.datasource.password:#{null}}")
    private String configuredPassword;

    @Value("${spring.datasource.hikari.maximum-pool-size:10}")
    private int maxPoolSize;

    @Value("${spring.datasource.hikari.minimum-idle:2}")
    private int minIdle;

    @Bean
    @Primary
    public DataSource dataSource() {
        // Resolve raw inputs from environment variables or application.properties
        String rawUrl = getEnvOrProperty("SPRING_DATASOURCE_URL", configuredUrl);
        if (rawUrl == null || rawUrl.isBlank()) {
            rawUrl = System.getenv("DATABASE_URL");
        }
        if (rawUrl == null || rawUrl.isBlank()) {
            rawUrl = "jdbc:postgresql://localhost:5432/postgres";
        }

        String rawUser = getEnvOrProperty("SPRING_DATASOURCE_USERNAME", configuredUsername);
        if (rawUser == null || rawUser.isBlank()) {
            rawUser = System.getenv("PGUSER");
        }

        String rawPassword = getEnvOrProperty("SPRING_DATASOURCE_PASSWORD", configuredPassword);
        if (rawPassword == null || rawPassword.isBlank()) {
            rawPassword = System.getenv("PGPASSWORD");
        }

        // Parse and normalize connection details
        ResolvedConnection conn = resolveConnection(rawUrl, rawUser, rawPassword);

        // Safe diagnostic logging (MASKING PASSWORDS)
        logDiagnostics(conn);

        // Configure HikariCP connection pool
        HikariConfig config = new HikariConfig();
        config.setPoolName("SkillSwapHikariPool");
        if (conn.jdbcUrl.startsWith("jdbc:h2:")) {
            config.setDriverClassName("org.h2.Driver");
        } else {
            config.setDriverClassName("org.postgresql.Driver");
        }
        config.setJdbcUrl(conn.jdbcUrl);
        config.setUsername(conn.username);
        config.setPassword(conn.password);

        config.setMaximumPoolSize(maxPoolSize);
        config.setMinimumIdle(Math.min(minIdle, maxPoolSize));
        // Supabase pooler / cloud NAT terminates idle sockets; retire connections gracefully before that:
        config.setMaxLifetime(600000);        // 10 minutes (default 30 mins is too long for Supavisor)
        config.setIdleTimeout(300000);        // 5 minutes
        config.setConnectionTimeout(30000);   // 30 seconds wait for connection
        config.setValidationTimeout(5000);    // 5 seconds test query timeout
        config.setKeepaliveTime(300000);      // 5 minutes keepalive ping
        config.setLeakDetectionThreshold(20000); // 20s leak detection log

        return new HikariDataSource(config);
    }

    private String getEnvOrProperty(String envName, String propValue) {
        String env = System.getenv(envName);
        if (env != null && !env.isBlank()) return env.trim();
        return (propValue != null && !propValue.isBlank()) ? propValue.trim() : null;
    }

    private ResolvedConnection resolveConnection(String url, String username, String password) {
        String cleanUrl = url.trim();
        String finalUser = username != null ? username.trim() : "";
        String finalPassword = password != null ? password : "";

        // If URL is in standard non-JDBC format: postgres://user:password@host:port/dbname
        if (cleanUrl.startsWith("postgres://") || cleanUrl.startsWith("postgresql://")) {
            try {
                URI uri = new URI(cleanUrl);
                String userInfo = uri.getUserInfo();
                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    if (finalUser.isEmpty()) finalUser = parts[0];
                    if (finalPassword.isEmpty()) finalPassword = parts[1];
                }
                int port = uri.getPort() != -1 ? uri.getPort() : 5432;
                String path = uri.getPath() != null && !uri.getPath().isEmpty() ? uri.getPath() : "/postgres";
                cleanUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + path;
                if (uri.getQuery() != null && !uri.getQuery().isBlank()) {
                    cleanUrl += "?" + uri.getQuery();
                }
            } catch (Exception e) {
                log.warn("Could not parse URI structure, attempting regex fallback: {}", e.getMessage());
            }
        }

        // Ensure jdbc: prefix exists
        if (!cleanUrl.startsWith("jdbc:postgresql://")) {
            if (cleanUrl.startsWith("jdbc:")) {
                // Already other jdbc
            } else {
                cleanUrl = "jdbc:postgresql://" + cleanUrl;
            }
        }

        // For Supabase, AWS, Render external databases: ensure sslmode=require is present
        boolean isRemoteHost = cleanUrl.contains("supabase") || cleanUrl.contains("render.com") ||
                               cleanUrl.contains("amazonaws.com") || cleanUrl.contains("neon.tech");
        if (isRemoteHost && !cleanUrl.contains("sslmode=")) {
            if (cleanUrl.contains("?")) {
                cleanUrl += "&sslmode=require";
            } else {
                cleanUrl += "?sslmode=require";
            }
        }

        return new ResolvedConnection(cleanUrl, finalUser, finalPassword);
    }

    private void logDiagnostics(ResolvedConnection conn) {
        log.info("──────── SkillSwap Database Connection Diagnostics ────────");
        
        // Extract host and port safely
        Pattern hostPattern = Pattern.compile("jdbc:postgresql://([^:/]+)(?::(\\d+))?(?:/([^?]+))?");
        Matcher matcher = hostPattern.matcher(conn.jdbcUrl);
        if (matcher.find()) {
            String host = matcher.group(1);
            String port = matcher.group(2) != null ? matcher.group(2) : "5432";
            String db = matcher.group(3) != null ? matcher.group(3) : "postgres";
            
            log.info("DB Host: {}", host);
            log.info("DB Port: {}", port);
            log.info("DB Name: {}", db);

            if (host.contains("pooler.supabase.com")) {
                log.info("Connection Type: Supabase Connection Pooler (Supavisor)");
                if ("5432".equals(port)) {
                    log.info("Pooler Mode: Session Mode (Port 5432 - Supported for Hibernate/JPA)");
                } else if ("6543".equals(port)) {
                    log.warn("Pooler Mode: Transaction Mode (Port 6543). NOTE: Session Mode (port 5432) is strongly recommended for Spring Boot/JPA!");
                }
            } else if (host.contains(".supabase.co")) {
                log.info("Connection Type: Supabase Direct Connection");
            } else {
                log.info("Connection Type: Standard PostgreSQL");
            }
        } else {
            log.info("DB Target: [Custom JDBC URL pattern]");
        }

        // SSL status
        boolean hasSsl = conn.jdbcUrl.contains("sslmode=require") || conn.jdbcUrl.contains("ssl=true");
        log.info("SSL Enabled: {}", hasSsl);

        // Username diagnostics (without revealing secrets)
        if (conn.username == null || conn.username.isBlank()) {
            log.error("DB Username: [MISSING] – Please set SPRING_DATASOURCE_USERNAME");
        } else {
            log.info("DB Username: {} (Length: {})", conn.username, conn.username.length());
            if (conn.jdbcUrl.contains("pooler.supabase.com") && !conn.username.contains(".")) {
                log.warn("WARNING: Supabase Pooler username typically requires format 'postgres.<PROJECT_REF>', but username was '{}'. Check Supabase Connect modal!", conn.username);
            }
        }

        // Password presence
        if (conn.password == null || conn.password.isBlank()) {
            log.error("DB Password: [MISSING] – Please set SPRING_DATASOURCE_PASSWORD");
        } else {
            log.info("DB Password: [CONFIGURED] (Length: {})", conn.password.length());
        }
        log.info("────────────────────────────────────────────────────────────");
    }

    private static class ResolvedConnection {
        final String jdbcUrl;
        final String username;
        final String password;

        ResolvedConnection(String jdbcUrl, String username, String password) {
            this.jdbcUrl = jdbcUrl;
            this.username = username;
            this.password = password;
        }
    }
}
