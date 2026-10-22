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
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class SessionService {
    private final SessionRepository sessionRepository;
    private final SessionMapper sessionMapper;
    private final TeacherRepository teacherRepository;

    private final UserRepository userRepository;

    public SessionDto create(SessionDto dto) {

        Teacher teacher = teacherRepository.findById(dto.getTeacher_id())
                .orElseThrow(() -> new NotFoundException("Aucun teacher trouvé"));

        Session session = new Session();

        session.setName(dto.getName());
        session.setDate(dto.getDate());
        session.setDescription(dto.getDescription());
        session.setTeacher(teacher);
        session.setUsers(new ArrayList<>());

        sessionRepository.save(session);

        return sessionMapper.toDto(session);
    }

    public void delete(Long id) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(()-> new NotFoundException("Aucune session trouvée"));
         sessionRepository.delete(session);
    }

    public List<SessionDto> findAll() {
        List<Session> listSession = this.sessionRepository.findAll();
        return sessionMapper.toDto(listSession);
    }

    public SessionDto getById(Long id) {
        Session session =  this.sessionRepository.findById(id)
                .orElseThrow(()-> new NotFoundException("Aucune session trouvée"));
        return sessionMapper.toDto(session);
    }

    @Transactional
    public SessionDto update(Long id, SessionDto dto) {

        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Aucune session trouvée"));

        Teacher teacher = teacherRepository.findById(dto.getTeacher_id())
                .orElseThrow(() -> new NotFoundException("Aucun professeur trouvé"));

        session.setName(dto.getName());
        session.setDate(dto.getDate());
        session.setDescription(dto.getDescription());
        session.setTeacher(teacher);

        return sessionMapper.toDto(session);
    }

    @Transactional
    public void participate(Long id, Long userId) {

        Session session = sessionRepository.findById(id)
                .orElseThrow(() ->
                        new NotFoundException("Session introuvable"));

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new NotFoundException("Utilisateur introuvable"));

        boolean alreadyParticipate = session.getUsers()
                .stream()
                .anyMatch(participant -> participant.getId().equals(userId));

        if (alreadyParticipate) {
            throw new BadRequestException(
                    "Cet utilisateur participe déjà à cette session"
            );
        }

        session.getUsers().add(user);
    }

    @Transactional
    public void noLongerParticipate(Long id, Long userId) {

        Session session = sessionRepository.findById(id)
                .orElseThrow(() ->
                        new NotFoundException("Session introuvable"));

        boolean removed = session.getUsers()
                .removeIf(user -> user.getId().equals(userId));

        if (!removed) {
            throw new BadRequestException(
                    "Cet utilisateur ne participe pas à cette session"
            );
        }
    }
}
