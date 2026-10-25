
package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@WithMockUser
class SessionControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserRepository userRepository;

    private Teacher teacher;

    @BeforeEach
    void setUp() {
        sessionRepository.deleteAll();
        userRepository.deleteAll();
        teacherRepository.deleteAll();

        teacher = teacherRepository.save(
                Teacher.builder()
                        .firstName("Jean")
                        .lastName("Dupont")
                        .build()
        );
    }

    private Session createSession() {
        return sessionRepository.save(
                Session.builder()
                        .name("Yoga débutant")
                        .date(new Date())
                        .description("Séance de yoga pour débutants")
                        .teacher(teacher)
                        .users(new ArrayList<>())
                        .build()
        );
    }

    private SessionDto createSessionDto() {
        SessionDto dto = new SessionDto();
        dto.setName("Yoga avancé");
        dto.setDate(new Date());
        dto.setDescription("Séance de yoga avancé");
        dto.setTeacher_id(teacher.getId());
        return dto;
    }

    private User createUser() {
        return userRepository.save(
                User.builder()
                        .email("jean@doe.com")
                        .firstName("Jean")
                        .lastName("Doe")
                        .password("encoded-password")
                        .admin(false)
                        .build()
        );
    }

    @Test
    void shouldFindAllSessions() throws Exception {
        createSession();

        mockMvc.perform(get("/api/session"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Yoga débutant"));
    }

    @Test
    void shouldFindSessionById() throws Exception {
        Session session = createSession();

        mockMvc.perform(get("/api/session/{id}", session.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(session.getId()))
                .andExpect(jsonPath("$.name").value("Yoga débutant"));
    }

    @Test
    void shouldCreateSession() throws Exception {
        SessionDto dto = createSessionDto();

        mockMvc.perform(post("/api/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Yoga avancé"));

        assertEquals(1, sessionRepository.count());
    }

    @Test
    void shouldUpdateSession() throws Exception {
        Session session = createSession();
        SessionDto dto = createSessionDto();

        mockMvc.perform(put("/api/session/{id}", session.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Yoga avancé"));

        Session updated = sessionRepository.findById(session.getId())
                .orElseThrow();

        assertEquals("Yoga avancé", updated.getName());
    }

    @Test
    void shouldDeleteSession() throws Exception {
        Session session = createSession();

        mockMvc.perform(delete("/api/session/{id}", session.getId()))
                .andExpect(status().isOk());

        assertFalse(sessionRepository.existsById(session.getId()));
    }
}
