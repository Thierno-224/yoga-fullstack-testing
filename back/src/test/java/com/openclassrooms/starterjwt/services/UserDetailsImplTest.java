package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserDetailsImplTest {

    private UserDetailsImpl createUser(Long id) {
        return UserDetailsImpl.builder()
                .id(id)
                .username("user@test.com")
                .firstName("John")
                .lastName("Doe")
                .password("encoded-password")
                .admin(false)
                .build();
    }

    @Test
    void shouldReturnUserInformation() {
        UserDetailsImpl user = createUser(1L);

        assertAll(
                () -> assertEquals(1L, user.getId()),
                () -> assertEquals("user@test.com", user.getUsername()),
                () -> assertEquals("John", user.getFirstName()),
                () -> assertEquals("Doe", user.getLastName()),
                () -> assertEquals("encoded-password", user.getPassword()),
                () -> assertFalse(user.getAdmin())
        );
    }

    @Test
    void shouldReturnEmptyAuthorities() {
        UserDetailsImpl user = createUser(1L);

        assertNotNull(user.getAuthorities());
        assertTrue(user.getAuthorities().isEmpty());
    }

    @Test
    void shouldReturnValidAccountStatus() {
        UserDetailsImpl user = createUser(1L);

        assertAll(
                () -> assertTrue(user.isAccountNonExpired()),
                () -> assertTrue(user.isAccountNonLocked()),
                () -> assertTrue(user.isCredentialsNonExpired()),
                () -> assertTrue(user.isEnabled())
        );
    }

    @Test
    void shouldBeEqualWhenIdsAreEqual() {
        UserDetailsImpl firstUser = createUser(1L);
        UserDetailsImpl secondUser = createUser(1L);

        assertEquals(firstUser, secondUser);
    }

    @Test
    void shouldNotBeEqualWhenIdsAreDifferent() {
        UserDetailsImpl firstUser = createUser(1L);
        UserDetailsImpl secondUser = createUser(2L);

        assertNotEquals(firstUser, secondUser);
    }

    @Test
    void shouldBeEqualToItself() {
        UserDetailsImpl user = createUser(1L);

        assertEquals(user, user);
    }

    @Test
    void shouldNotBeEqualToNull() {
        UserDetailsImpl user = createUser(1L);

        assertNotEquals(null, user);
    }
}
