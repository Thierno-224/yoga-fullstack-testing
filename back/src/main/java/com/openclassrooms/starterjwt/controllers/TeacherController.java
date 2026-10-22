package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.services.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;

    @GetMapping
    public ResponseEntity<List<TeacherDto>> findAll() {
        return ResponseEntity.ok(teacherService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeacherDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(teacherService.findDtoById(id));
    }
}