package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.ActiveProfiles;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class JwtUtilsIT {

    private static final String SECRET =
            "integration-test-secret-key-with-at-least-sixty-four-characters-123456789";

    private static final String OTHER_SECRET =
            "another-integration-test-secret-key-with-at-least-sixty-four-characters-123456789";

    private static final SecretKey SIGNING_KEY =
            Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    private static final SecretKey OTHER_SIGNING_KEY =
            Keys.hmacShaKeyFor(OTHER_SECRET.getBytes(StandardCharsets.UTF_8));

    @Autowired
    private JwtUtils jwtUtils;

    @Test
    void shouldGenerateValidJwtToken() {
        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        "user@test.com",
                        null
                );

        String token = jwtUtils.generateJwtToken(authentication);

        assertAll(
                () -> assertNotNull(token),
                () -> assertTrue(jwtUtils.validateJwtToken(token)),
                () -> assertEquals(
                        "user@test.com",
                        jwtUtils.getUserNameFromJwtToken(token)
                )
        );
    }

    @Test
    void shouldRejectExpiredJwtToken() {
        String token = createToken(
                new Date(System.currentTimeMillis() - 60_000)
        );

        assertFalse(jwtUtils.validateJwtToken(token));
    }

    @Test
    void shouldRejectMalformedJwtToken() {
        assertFalse(jwtUtils.validateJwtToken("invalid.jwt.token"));
    }

    @Test
    void shouldRejectEmptyJwtToken() {
        assertFalse(jwtUtils.validateJwtToken(""));
    }

    @Test
    void shouldRejectNullJwtToken() {
        assertFalse(jwtUtils.validateJwtToken(null));
    }

    @Test
    void shouldRejectJwtWithInvalidSignature() {
        String token = Jwts.builder()
                .subject("user@test.com")
                .issuedAt(new Date())
                .expiration(
                        new Date(System.currentTimeMillis() + 3_600_000)
                )
                .signWith(OTHER_SIGNING_KEY, Jwts.SIG.HS512)
                .compact();

        assertFalse(jwtUtils.validateJwtToken(token));
    }

    @Test
    void shouldRejectUnsupportedJwtToken() {
        String token = Jwts.builder()
                .content("test".getBytes(StandardCharsets.UTF_8))
                .signWith(SIGNING_KEY, Jwts.SIG.HS512)
                .compact();

        assertFalse(jwtUtils.validateJwtToken(token));
    }

    private String createToken(Date expiration) {
        return Jwts.builder()
                .subject("user@test.com")
                .issuedAt(new Date(System.currentTimeMillis() - 120_000))
                .expiration(expiration)
                .signWith(SIGNING_KEY, Jwts.SIG.HS512)
                .compact();
    }
}
