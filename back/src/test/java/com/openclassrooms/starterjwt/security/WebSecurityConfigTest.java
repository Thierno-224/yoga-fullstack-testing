
package com.openclassrooms.starterjwt.security;

import com.openclassrooms.starterjwt.security.jwt.AuthTokenFilter;
import com.openclassrooms.starterjwt.security.services.UserDetailsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class WebSecurityConfigTest {

    private WebSecurityConfig securityConfig;

    @BeforeEach
    void setUp() {
        securityConfig = new WebSecurityConfig();

        UserDetailsServiceImpl userDetailsService =
                mock(UserDetailsServiceImpl.class);

        ReflectionTestUtils.setField(
                securityConfig,
                "userDetailsService",
                userDetailsService
        );
    }

    @Test
    void shouldCreatePasswordEncoder() {
        PasswordEncoder encoder = securityConfig.passwordEncoder();

        assertNotNull(encoder);
    }

    @Test
    void shouldEncodeAndVerifyPassword() {
        PasswordEncoder encoder = securityConfig.passwordEncoder();

        String password = "password123";
        String encodedPassword = encoder.encode(password);

        assertNotEquals(password, encodedPassword);
        assertTrue(encoder.matches(password, encodedPassword));
    }

    @Test
    void shouldRejectIncorrectPassword() {
        PasswordEncoder encoder = securityConfig.passwordEncoder();

        String encodedPassword = encoder.encode("password123");

        assertFalse(encoder.matches("wrongpassword", encodedPassword));
    }

    @Test
    void shouldGenerateDifferentHashesForSamePassword() {
        PasswordEncoder encoder = securityConfig.passwordEncoder();

        String firstHash = encoder.encode("password123");
        String secondHash = encoder.encode("password123");

        assertNotEquals(firstHash, secondHash);
        assertTrue(encoder.matches("password123", firstHash));
        assertTrue(encoder.matches("password123", secondHash));
    }

    @Test
    void shouldUseBCryptPasswordEncoding() {
        PasswordEncoder encoder = securityConfig.passwordEncoder();

        String encodedPassword = encoder.encode("password123");

        assertTrue(encodedPassword.startsWith("$2"));
    }

    @Test
    void shouldCreateAuthenticationProvider() {
        DaoAuthenticationProvider provider =
                securityConfig.authenticationProvider();

        assertNotNull(provider);
    }

    @Test
    void shouldCreateJwtAuthenticationFilter() {
        AuthTokenFilter filter =
                securityConfig.authenticationJwtTokenFilter();

        assertNotNull(filter);
    }

    @Test
    void shouldCreateAuthenticationManager() throws Exception {
        AuthenticationConfiguration configuration =
                mock(AuthenticationConfiguration.class);

        AuthenticationManager authenticationManager =
                mock(AuthenticationManager.class);

        when(configuration.getAuthenticationManager())
                .thenReturn(authenticationManager);

        AuthenticationManager result =
                securityConfig.authenticationManager(configuration);

        assertSame(authenticationManager, result);

        verify(configuration).getAuthenticationManager();
    }
}
