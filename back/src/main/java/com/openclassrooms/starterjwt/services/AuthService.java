package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.payload.response.JwtResponse;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public JwtResponse login(LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        UserDetailsImpl userDetails =
                (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Authenticated user not found"
                        )
                );

        String jwt = jwtUtils.generateJwtToken(authentication);

        return new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getFirstName(),
                userDetails.getLastName(),
                user.isAdmin()
        );
    }

    @Transactional
    public void register(SignupRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException(
                    "Error: Email is already taken!"
            );
        }

        User user = new User(
                request.getEmail(),
                request.getLastName(),
                request.getFirstName(),
                passwordEncoder.encode(request.getPassword()),
                false
        );

        userRepository.save(user);
    }
}