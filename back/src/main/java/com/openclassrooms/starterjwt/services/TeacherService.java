package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.mapper.TeacherMapper;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.openclassrooms.starterjwt.exception.NotFoundException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final TeacherMapper teacherMapper;

    public Teacher findById(Long id) {
        return teacherRepository.findById(id)
                .orElseThrow(() ->
                        new NotFoundException("Professeur introuvable")
                );
    }

    public TeacherDto findDtoById(Long id) {
        return teacherMapper.toDto(findById(id));
    }

    public List<TeacherDto> findAll() {
        return teacherMapper.toDto(teacherRepository.findAll());
    }
}