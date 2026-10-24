package com.openclassrooms.starterjwt.services;
import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.mapper.TeacherMapper;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TeacherServiceTest {

    @Mock
    private  TeacherRepository teacherRepository;

    @Mock
    private TeacherMapper teacherMapper;

    @InjectMocks
    private  TeacherService teacherService;

    private Teacher teacher;
    private TeacherDto teacherDto;
    @BeforeEach
    void setUp() {
        teacher = new Teacher(
                1L,
                "Dupont",
                "Jean",
                null,
                null
        );

        teacherDto = new TeacherDto(
                1L,
                "Dupont",
                "Jean",
                null,
                null
        );
    }

    @Test
    public void shouldReturnTeacher() {
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));

        Teacher result = teacherService.findById(1L);

        assertNotNull(result);
        assertEquals("Jean", result.getFirstName());
    }

    @Test
    public void shouldThrowTeacherNotFound() {
        when(teacherRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class,
                ()-> teacherService.findById(99L));
    }

    @Test
    public void shouldReturnListOfTeacher() {
        when(teacherRepository.findAll()).thenReturn(List.of(teacher));
        when(teacherMapper.toDto(List.of(teacher))).thenReturn(List.of(teacherDto));

        List<TeacherDto> teachers = teacherService.findAll();

        assertNotNull(teachers);
        assertEquals(1, teachers.size());
        assertEquals("Jean", teachers.getFirst().getFirstName());
    }

    @Test
    void shouldReturnTeacherDtoById() {

        when(teacherRepository.findById(1L))
                .thenReturn(Optional.of(teacher));

        when(teacherMapper.toDto(teacher))
                .thenReturn(teacherDto);

        TeacherDto result = teacherService.findDtoById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Jean", result.getFirstName());
        assertEquals("Dupont", result.getLastName());

        verify(teacherRepository).findById(1L);
        verify(teacherMapper).toDto(teacher);
    }
}
