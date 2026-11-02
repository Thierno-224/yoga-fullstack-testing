package com.openclassrooms.starterjwt.security;

import com.openclassrooms.starterjwt.security.jwt.AuthTokenFilter;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import com.openclassrooms.starterjwt.security.services.UserDetailsServiceImpl;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthTokenFilterTest {

    private static final String TOKEN = "valid.jwt.token";
    private static final String USERNAME = "user@test.com";

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private UserDetailsServiceImpl userDetailsService;

    @InjectMocks
    private AuthTokenFilter authTokenFilter;

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;
    private MockFilterChain filterChain;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();

        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        filterChain = new MockFilterChain();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldAuthenticateUserWithValidJwt()
            throws ServletException, IOException {

        request.addHeader("Authorization", "Bearer " + TOKEN);

        UserDetailsImpl userDetails = createUser();

        when(jwtUtils.validateJwtToken(TOKEN)).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken(TOKEN))
                .thenReturn(USERNAME);
        when(userDetailsService.loadUserByUsername(USERNAME))
                .thenReturn(userDetails);

        authTokenFilter.doFilter(request, response, filterChain);

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        assertAll(
                () -> assertNotNull(authentication),
                () -> assertTrue(authentication.isAuthenticated()),
                () -> assertEquals(USERNAME, authentication.getName()),
                () -> assertSame(userDetails, authentication.getPrincipal()),
                () -> assertSame(request, filterChain.getRequest()),
                () -> assertSame(response, filterChain.getResponse())
        );

        verify(jwtUtils).validateJwtToken(TOKEN);
        verify(jwtUtils).getUserNameFromJwtToken(TOKEN);
        verify(userDetailsService).loadUserByUsername(USERNAME);
    }

    @Test
    void shouldNotAuthenticateWhenAuthorizationHeaderIsMissing()
            throws ServletException, IOException {

        authTokenFilter.doFilter(request, response, filterChain);

        assertNull(
                SecurityContextHolder.getContext().getAuthentication()
        );

        verifyNoInteractions(jwtUtils, userDetailsService);
        assertNotNull(filterChain.getRequest());
    }

    @Test
    void shouldNotAuthenticateWithInvalidJwt()
            throws ServletException, IOException {

        request.addHeader("Authorization", "Bearer " + TOKEN);

        when(jwtUtils.validateJwtToken(TOKEN)).thenReturn(false);

        authTokenFilter.doFilter(request, response, filterChain);

        assertNull(
                SecurityContextHolder.getContext().getAuthentication()
        );

        verify(jwtUtils).validateJwtToken(TOKEN);
        verify(jwtUtils, never()).getUserNameFromJwtToken(anyString());
        verifyNoInteractions(userDetailsService);
        assertNotNull(filterChain.getRequest());
    }

    @Test
    void shouldIgnoreAuthorizationHeaderWithoutBearerPrefix()
            throws ServletException, IOException {

        request.addHeader("Authorization", TOKEN);

        authTokenFilter.doFilter(request, response, filterChain);

        assertNull(
                SecurityContextHolder.getContext().getAuthentication()
        );

        verifyNoInteractions(jwtUtils, userDetailsService);
        assertNotNull(filterChain.getRequest());
    }

    @Test
    void shouldNotAuthenticateWhenUserDoesNotExist()
            throws ServletException, IOException {

        request.addHeader("Authorization", "Bearer " + TOKEN);

        when(jwtUtils.validateJwtToken(TOKEN)).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken(TOKEN))
                .thenReturn(USERNAME);

        when(userDetailsService.loadUserByUsername(USERNAME))
                .thenThrow(
                        new UsernameNotFoundException("User not found")
                );

        authTokenFilter.doFilter(request, response, filterChain);

        assertNull(
                SecurityContextHolder.getContext().getAuthentication()
        );

        verify(userDetailsService).loadUserByUsername(USERNAME);
        assertNotNull(filterChain.getRequest());
    }

    @Test
    void shouldContinueFilterChainWhenJwtValidationThrowsException()
            throws ServletException, IOException {

        request.addHeader("Authorization", "Bearer " + TOKEN);

        when(jwtUtils.validateJwtToken(TOKEN))
                .thenThrow(new IllegalArgumentException("Invalid token"));

        assertDoesNotThrow(
                () -> authTokenFilter.doFilter(
                        request,
                        response,
                        filterChain
                )
        );

        assertNull(
                SecurityContextHolder.getContext().getAuthentication()
        );

        assertSame(request, filterChain.getRequest());
        assertSame(response, filterChain.getResponse());
    }

    private UserDetailsImpl createUser() {
        return UserDetailsImpl.builder()
                .id(1L)
                .username(USERNAME)
                .firstName("John")
                .lastName("Doe")
                .password("encoded-password")
                .admin(false)
                .build();
    }
}
