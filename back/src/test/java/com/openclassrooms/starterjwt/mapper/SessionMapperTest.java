package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SessionMapperTest {

    private final SessionMapper sessionMapper =
            Mappers.getMapper(SessionMapper.class);

    @Test
    void shouldMapSessionToDto() {
        Date date = new Date();

        Teacher teacher = Teacher.builder()
                .id(1L)
                .firstName("Jean")
                .lastName("Dupont")
                .build();

        User user = User.builder()
                .id(2L)
                .email("user@test.com")
                .firstName("Jean")
                .lastName("Dupont")
                .password("hashed-password")
                .admin(false)
                .build();

        Session session = Session.builder()
                .id(10L)
                .name("Yoga débutant")
                .date(date)
                .description("Séance de yoga pour débutants")
                .teacher(teacher)
                .users(List.of(user))
                .build();

        SessionDto result = sessionMapper.toDto(session);

        assertAll(
                () -> assertNotNull(result),
                () -> assertEquals(10L, result.getId()),
                () -> assertEquals("Yoga débutant", result.getName()),
                () -> assertEquals(date, result.getDate()),
                () -> assertEquals(
                        "Séance de yoga pour débutants",
                        result.getDescription()
                ),
                () -> assertEquals(1L, result.getTeacher_id()),
                () -> assertEquals(List.of(2L), result.getUsers())
        );
    }

    @Test
    void shouldReturnEmptyUsersWhenUsersAreNull() {
        Session session = Session.builder()
                .users(null)
                .build();

        SessionDto result = sessionMapper.toDto(session);

        assertNotNull(result);
        assertEquals(List.of(), result.getUsers());
    }

    @Test
    void shouldIgnoreTechnicalFieldsAndRelationsWhenMappingToEntity() {
        SessionDto dto = new SessionDto();

        dto.setId(10L);
        dto.setName("Yoga avancé");
        dto.setDate(new Date());
        dto.setDescription("Séance avancée");
        dto.setTeacher_id(1L);
        dto.setUsers(List.of(2L, 3L));
        dto.setCreatedAt(LocalDateTime.now());
        dto.setUpdatedAt(LocalDateTime.now());

        Session result = sessionMapper.toEntity(dto);

        assertAll(
                () -> assertNotNull(result),
                () -> assertEquals("Yoga avancé", result.getName()),
                () -> assertEquals(dto.getDate(), result.getDate()),
                () -> assertEquals("Séance avancée", result.getDescription()),
                () -> assertNull(result.getId()),
                () -> assertNull(result.getTeacher()),
                () -> assertNull(result.getUsers()),
                () -> assertNull(result.getCreatedAt()),
                () -> assertNull(result.getUpdatedAt())
        );
    }

    @Test
    void shouldMapSessionListToDtos() {
        Session first = Session.builder()
                .id(1L)
                .name("Yoga débutant")
                .build();

        Session second = Session.builder()
                .id(2L)
                .name("Yoga avancé")
                .build();

        List<SessionDto> result =
                sessionMapper.toDto(List.of(first, second));

        assertAll(
                () -> assertEquals(2, result.size()),
                () -> assertEquals("Yoga débutant", result.get(0).getName()),
                () -> assertEquals("Yoga avancé", result.get(1).getName())
        );
    }
}
