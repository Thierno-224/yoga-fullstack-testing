package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.payload.response.JwtResponse;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    @Mock
    private UserDetailsImpl userDetails;

    @InjectMocks
    private AuthService authService;

    private User user;
    private SignupRequest signupRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        user = new User(
                1L,
                "jean.dupont@example.com",
                "Dupont",
                "Jean",
                "hashedPassword",
                false,
                null,
                null
        );

        signupRequest = new SignupRequest();
        signupRequest.setEmail("jean.dupont@example.com");
        signupRequest.setLastName("Dupont");
        signupRequest.setFirstName("Jean");
        signupRequest.setPassword("password123");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("jean.dupont@example.com");
        loginRequest.setPassword("password123");
    }

    @Test
    void shouldRegisterUserSuccessfully() {

        when(userRepository.existsByEmail(signupRequest.getEmail()))
                .thenReturn(false);

        when(passwordEncoder.encode(signupRequest.getPassword()))
                .thenReturn("hashedPassword");

        authService.register(signupRequest);

        ArgumentCaptor<User> userCaptor =
                ArgumentCaptor.forClass(User.class);

        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();

        assertEquals("jean.dupont@example.com", savedUser.getEmail());
        assertEquals("Jean", savedUser.getFirstName());
        assertEquals("Dupont", savedUser.getLastName());
        assertEquals("hashedPassword", savedUser.getPassword());
        assertFalse(savedUser.isAdmin());

        verify(passwordEncoder).encode("password123");
    }

    @Test
    void shouldThrowWhenEmailAlreadyExists() {

        when(userRepository.existsByEmail(signupRequest.getEmail()))
                .thenReturn(true);

        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> authService.register(signupRequest)
        );

        assertEquals(
                "Error: Email is already taken!",
                exception.getMessage()
        );

        verify(userRepository, never()).save(any(User.class));
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void shouldLoginSuccessfully() {

        when(authenticationManager.authenticate(any()))
                .thenReturn(authentication);

        when(authentication.getPrincipal())
                .thenReturn(userDetails);

        when(userDetails.getUsername())
                .thenReturn("jean.dupont@example.com");

        when(userDetails.getId()).thenReturn(1L);
        when(userDetails.getFirstName()).thenReturn("Jean");
        when(userDetails.getLastName()).thenReturn("Dupont");

        when(userRepository.findByEmail("jean.dupont@example.com"))
                .thenReturn(Optional.of(user));

        when(jwtUtils.generateJwtToken(authentication))
                .thenReturn("fake-jwt-token");

        JwtResponse result = authService.login(loginRequest);

        assertNotNull(result);

        verify(authenticationManager).authenticate(any());
        verify(userRepository).findByEmail("jean.dupont@example.com");
        verify(jwtUtils).generateJwtToken(authentication);
    }

    @Test
    void shouldThrowWhenAuthenticatedUserNotFound() {

        when(authenticationManager.authenticate(any()))
                .thenReturn(authentication);

        when(authentication.getPrincipal())
                .thenReturn(userDetails);

        when(userDetails.getUsername())
                .thenReturn("jean.dupont@example.com");

        when(userRepository.findByEmail("jean.dupont@example.com"))
                .thenReturn(Optional.empty());

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> authService.login(loginRequest)
        );

        assertEquals(
                "Authenticated user not found",
                exception.getMessage()
        );

        verify(jwtUtils, never()).generateJwtToken(any());
    }
}
