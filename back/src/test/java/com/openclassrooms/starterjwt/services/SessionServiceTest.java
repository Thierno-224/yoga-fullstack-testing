package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.mapper.SessionMapper;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SessionServiceTest {
    @Mock
    private SessionRepository sessionRepository;
    @Mock
    private SessionMapper sessionMapper;
    @Mock
    private TeacherRepository teacherRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SessionService sessionService;

    private SessionDto sessionDto;
    private Teacher teacher;
    private User user;
    private Session session;

    @BeforeEach
    void setUp() {
        teacher = new Teacher(
                1L,
                "Dupont",
                "Jean",
                null,
                null
        );
        session = new Session();
        session.setId(1L);
        session.setName("Yoga débutant");
        session.setDescription("Séance de yoga pour débutants");
        session.setDate(Date.from(Instant.parse("2026-11-15T10:00:00Z")));
        session.setTeacher(teacher);

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

        sessionDto = new SessionDto(
                1L,
                "Yoga débutant",
                Date.from(Instant.parse("2026-11-15T10:00:00Z")),
                1L,
                "Séance de yoga pour débutants",
                List.of(1L),
                null,
                null
        );
    }

    @Test
    void shouldNotCreateSessionWhenTeacherNotFound() {
        when(teacherRepository.findById(anyLong())).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class,
                ()-> sessionService.create(sessionDto));

        assertEquals("Aucun teacher trouvé", exception.getMessage());
        verify(sessionRepository, never()).save(any());
    }

    @Test
    void shouldCreateSession() {
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));
        when(sessionRepository.save(any(Session.class))).thenReturn(session);
        when(sessionMapper.toDto(any(Session.class))).thenReturn(sessionDto);
        SessionDto result = sessionService.create(sessionDto);

        assertNotNull(result);
    }

    @Test
    void shouldFindAllSessions() {
        List<Session> sessions = List.of(session);
        List<SessionDto> sessionDtos = List.of(sessionDto);

        when(sessionRepository.findAll()).thenReturn(sessions);
        when(sessionMapper.toDto(sessions)).thenReturn(sessionDtos);

        List<SessionDto> result = sessionService.findAll();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(sessionDto, result.getFirst());

        verify(sessionRepository).findAll();
        verify(sessionMapper).toDto(sessions);
    }

    @Test
    void shouldReturnEmptyListWhenNoSessionsExist() {
        List<Session> sessions = Collections.emptyList();
        List<SessionDto> sessionDtos = Collections.emptyList();

        when(sessionRepository.findAll()).thenReturn(sessions);
        when(sessionMapper.toDto(sessions)).thenReturn(sessionDtos);

        List<SessionDto> result = sessionService.findAll();

        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(sessionRepository).findAll();
        verify(sessionMapper).toDto(sessions);
    }

    @Test
    void shouldGetSessionById() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        when(sessionMapper.toDto(session)).thenReturn(sessionDto);

        SessionDto result = sessionService.getById(1L);

        assertNotNull(result);
        assertEquals(sessionDto, result);

        verify(sessionRepository).findById(1L);
        verify(sessionMapper).toDto(session);
    }

    @Test
    void shouldThrowNotFoundExceptionWhenSessionDoesNotExist() {
        when(sessionRepository.findById(99L)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(
                NotFoundException.class,
                () -> sessionService.getById(99L)
        );

        assertEquals("Aucune session trouvée", exception.getMessage());

        verify(sessionRepository).findById(99L);
        verifyNoInteractions(sessionMapper);
    }

    @Test
    void shouldThrowNotFoundExceptionWhenUpdatingUnknownSession() {
        when(sessionRepository.findById(99L)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(
                NotFoundException.class,
                () -> sessionService.update(99L, sessionDto)
        );

        assertEquals("Aucune session trouvée", exception.getMessage());

        verify(sessionRepository).findById(99L);
        verifyNoInteractions(teacherRepository, sessionMapper);
    }

    @Test
    void shouldUpdateSession() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));

        when(sessionMapper.toDto(session)).thenReturn(sessionDto);

        SessionDto result = sessionService.update(1L, sessionDto);

        assertNotNull(result);

        assertEquals(sessionDto.getName(), session.getName());
        assertEquals(teacher, session.getTeacher());

        verify(sessionRepository).findById(1L);
        verify(teacherRepository).findById(1L);
        verify(sessionMapper).toDto(session);
    }

    @Test
    void shouldThrowNotFoundExceptionWhenUpdatingWithUnknownTeacher() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        when(teacherRepository.findById(1L)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(
                NotFoundException.class,
                () -> sessionService.update(1L, sessionDto)
        );

        assertEquals("Aucun professeur trouvé", exception.getMessage());

        verify(sessionRepository).findById(1L);
        verify(teacherRepository).findById(1L);
        verifyNoInteractions(sessionMapper);
    }

    @Test
    void shouldParticipateSuccessfully() {
        session.setUsers(new ArrayList<>());

        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        sessionService.participate(1L, 1L);

        assertEquals(1, session.getUsers().size());
        assertTrue(session.getUsers().contains(user));

        verify(sessionRepository).findById(1L);
        verify(userRepository).findById(1L);
    }

    @Test
    void shouldThrowNotFoundExceptionWhenSessionDoesNotExistForParticipation() {
        when(sessionRepository.findById(99L)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(
                NotFoundException.class,
                () -> sessionService.participate(99L, 1L)
        );

        assertEquals("Session introuvable", exception.getMessage());
        verifyNoInteractions(userRepository);
    }

    @Test
    void shouldThrowNotFoundExceptionWhenUserDoesNotExistForParticipation() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(
                NotFoundException.class,
                () -> sessionService.participate(1L, 99L)
        );

        assertEquals("Utilisateur introuvable", exception.getMessage());
    }

    @Test
    void shouldThrowBadRequestExceptionWhenUserAlreadyParticipates() {
        session.setUsers(new ArrayList<>(List.of(user)));

        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> sessionService.participate(1L, 1L)
        );

        assertEquals(
                "Cet utilisateur participe déjà à cette session",
                exception.getMessage()
        );

        assertEquals(1, session.getUsers().size());
    }

    @Test
    void shouldDeleteSession() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        sessionService.delete(1L);

        verify(sessionRepository).findById(1L);
        verify(sessionRepository).delete(session);
    }

    @Test
    void shouldThrowNotFoundExceptionWhenDeletingUnknownSession() {
        when(sessionRepository.findById(99L)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(
                NotFoundException.class,
                () -> sessionService.delete(99L)
        );

        assertEquals("Aucune session trouvée", exception.getMessage());

        verify(sessionRepository).findById(99L);
        verify(sessionRepository, never()).delete(any(Session.class));
    }

    @Test
    void shouldNoLongerParticipateSuccessfully() {
        session.setUsers(new ArrayList<>(List.of(user)));

        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        sessionService.noLongerParticipate(1L, 1L);

        assertTrue(session.getUsers().isEmpty());

        verify(sessionRepository).findById(1L);
    }

    @Test
    void shouldThrowNotFoundExceptionWhenSessionDoesNotExistForUnparticipation() {
        when(sessionRepository.findById(99L)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(
                NotFoundException.class,
                () -> sessionService.noLongerParticipate(99L, 1L)
        );

        assertEquals("Session introuvable", exception.getMessage());

        verify(sessionRepository).findById(99L);
    }

    @Test
    void shouldThrowBadRequestExceptionWhenUserDoesNotParticipate() {
        session.setUsers(new ArrayList<>());

        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> sessionService.noLongerParticipate(1L, 1L)
        );

        assertEquals(
                "Cet utilisateur ne participe pas à cette session",
                exception.getMessage()
        );

        assertTrue(session.getUsers().isEmpty());
    }
}
