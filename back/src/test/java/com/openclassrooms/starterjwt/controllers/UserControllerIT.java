package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@WithMockUser(username = "jean@doe.com")
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class UserControllerIT {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    UserRepository userRepository;

    User user = new User();
    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        user.setFirstName("Doe");
        user.setLastName("Jean");
        user.setEmail("jean@doe.com");
        user.setPassword("Password!123");

        userRepository.save(user);
    }

    @Test
    void shouldFindUserById() throws Exception {

        mockMvc.perform(get("/api/user/{id}", user.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Doe"));
    }

//    @Test
//    void shouldDeleteUser() throws Exception {
//        mockMvc.perform(delete("/api/user/{id}", user.getId()))
//                .andExpect(status().isOk());
//
//        assertFalse(userRepository.existsById(user.getId()));
//    }

    @Test
    void shouldReturn404WhenUserDoesNotExist() throws Exception {
        mockMvc.perform(get("/api/user/9999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").isNotEmpty())
                .andExpect(result -> {
                    Exception exception = result.getResolvedException();

                    assertNotNull(exception);
                    assertInstanceOf(NotFoundException.class, exception);
                });
    }
}
