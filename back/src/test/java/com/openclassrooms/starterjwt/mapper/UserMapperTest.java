
package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.models.User;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class UserMapperTest {

    private final UserMapper userMapper =
            Mappers.getMapper(UserMapper.class);

    @Test
    void shouldMapUserToDto() {
        LocalDateTime createdAt =
                LocalDateTime.of(2026, 10, 20, 10, 0);
        LocalDateTime updatedAt =
                LocalDateTime.of(2026, 10, 21, 12, 0);

        User user = User.builder()
                .id(1L)
                .email("user@test.com")
                .firstName("Jean")
                .lastName("Dupont")
                .password("hashed-password")
                .admin(false)
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .build();

        UserDto result = userMapper.toDto(user);

        assertNotNull(result);
        assertAll(
                () -> assertEquals(1L, result.getId()),
                () -> assertEquals("user@test.com", result.getEmail()),
                () -> assertEquals("Jean", result.getFirstName()),
                () -> assertEquals("Dupont", result.getLastName()),
                () -> assertFalse(result.isAdmin()),
                () -> assertEquals(createdAt, result.getCreatedAt()),
                () -> assertEquals(updatedAt, result.getUpdatedAt())
        );
    }

    @Test
    void shouldMapUsersToDtos() {
        User first = createUser(1L, "first@test.com");
        User second = createUser(2L, "second@test.com");

        List<UserDto> result =
                userMapper.toDto(List.of(first, second));

        assertNotNull(result);
        assertAll(
                () -> assertEquals(2, result.size()),
                () -> assertEquals(1L, result.get(0).getId()),
                () -> assertEquals("first@test.com", result.get(0).getEmail()),
                () -> assertEquals(2L, result.get(1).getId()),
                () -> assertEquals("second@test.com", result.get(1).getEmail())
        );
    }

    @Test
    void shouldReturnNullWhenUserIsNull() {
        UserDto result = userMapper.toDto((User) null);

        assertNull(result);
    }

    @Test
    void shouldReturnNullWhenUserListIsNull() {
        List<UserDto> result =
                userMapper.toDto((List<User>) null);

        assertNull(result);
    }

    @Test
    void shouldReturnEmptyListWhenUsersAreEmpty() {
        List<UserDto> result = userMapper.toDto(List.of());

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    private User createUser(Long id, String email) {
        return User.builder()
                .id(id)
                .email(email)
                .firstName("Jean")
                .lastName("Dupont")
                .password("hashed-password")
                .admin(false)
                .build();
    }
}
