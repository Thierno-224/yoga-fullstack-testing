package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.mapper.UserMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserService userService;

    private User user;
    private UserDto userDto;
    @BeforeEach
    void setUp() {
        user = new User(
                1L,
                "jean.dupont@example.com",
                "Dupont",
                "Jean",
                "passwordHash123",
                false,
                null,
                null
        );
        userDto = new UserDto(
                1L,
                "jean.dupont@example.com",
                "Dupont",
                "Jean",
                false,
                "passwordHash123",
                null,
                null
        );
    }

    @Test
    void shouldReturnUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        User result = userService.findById(1L);

        assertNotNull(result);
        assertEquals("Dupont", result.getLastName());
    }

    @Test
    void shouldThrowWhenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class,
                ()-> userService.findById(99L));
    }

    @Test
    void shouldUserDeleteHerAccount() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

         userService.delete(1L, "jean.dupont@example.com");

         verify(userRepository).delete(user);
    }

    @Test
    void shouldReturnUserToDto() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userMapper.toDto(user)).thenReturn(userDto);

        UserDto result = userService.findDtoById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(userRepository).findById(1L);
        verify(userMapper).toDto(user);
    }

    @Test
    void shouldNotDeleteWhenISNotEmail() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThrows(ResponseStatusException.class,
                ()-> userService.delete(1L, "martin.dupont@example.com"));

        verify(userRepository, never()).delete(user);
    }


}
