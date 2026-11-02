
package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.models.Teacher;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class TeacherMapperTest {

    private final TeacherMapper teacherMapper =
            Mappers.getMapper(TeacherMapper.class);

    @Test
    void shouldMapTeacherToDto() {
        Teacher teacher = createTeacher(1L, "Dupont", "Jean");

        TeacherDto result = teacherMapper.toDto(teacher);

        assertNotNull(result);
        assertAll(
                () -> assertEquals(1L, result.getId()),
                () -> assertEquals("Dupont", result.getLastName()),
                () -> assertEquals("Jean", result.getFirstName()),
                () -> assertEquals(teacher.getCreatedAt(), result.getCreatedAt()),
                () -> assertEquals(teacher.getUpdatedAt(), result.getUpdatedAt())
        );
    }

    @Test
    void shouldMapDtoToTeacher() {
        TeacherDto dto = new TeacherDto(
                2L,
                "Martin",
                "Marie",
                LocalDateTime.of(2026, 10, 20, 10, 0),
                LocalDateTime.of(2026, 10, 21, 12, 0)
        );

        Teacher result = teacherMapper.toEntity(dto);

        assertNotNull(result);
        assertAll(
                () -> assertEquals(2L, result.getId()),
                () -> assertEquals("Martin", result.getLastName()),
                () -> assertEquals("Marie", result.getFirstName()),
                () -> assertEquals(dto.getCreatedAt(), result.getCreatedAt()),
                () -> assertEquals(dto.getUpdatedAt(), result.getUpdatedAt())
        );
    }

    @Test
    void shouldMapTeachersToDtos() {
        List<Teacher> teachers = List.of(
                createTeacher(1L, "Dupont", "Jean"),
                createTeacher(2L, "Martin", "Marie")
        );

        List<TeacherDto> result = teacherMapper.toDto(teachers);

        assertEquals(2, result.size());
        assertEquals("Dupont", result.get(0).getLastName());
        assertEquals("Martin", result.get(1).getLastName());
    }

    @Test
    void shouldMapDtosToTeachers() {
        List<TeacherDto> dtos = List.of(
                new TeacherDto(1L, "Dupont", "Jean", null, null),
                new TeacherDto(2L, "Martin", "Marie", null, null)
        );

        List<Teacher> result = teacherMapper.toEntity(dtos);

        assertEquals(2, result.size());
        assertEquals("Jean", result.get(0).getFirstName());
        assertEquals("Marie", result.get(1).getFirstName());
    }

    @Test
    void shouldReturnNullForNullInputs() {
        assertAll(
                () -> assertNull(teacherMapper.toDto((Teacher) null)),
                () -> assertNull(teacherMapper.toEntity((TeacherDto) null)),
                () -> assertNull(teacherMapper.toDto((List<Teacher>) null)),
                () -> assertNull(teacherMapper.toEntity((List<TeacherDto>) null))
        );
    }

    private Teacher createTeacher(Long id, String lastName, String firstName) {
        return Teacher.builder()
                .id(id)
                .lastName(lastName)
                .firstName(firstName)
                .createdAt(LocalDateTime.of(2026, 10, 20, 10, 0))
                .updatedAt(LocalDateTime.of(2026, 10, 21, 12, 0))
                .build();
    }
}
