package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.mapper.SessionMapper;
import com.openclassrooms.starterjwt.services.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/session")
@Log4j2
public class SessionController {
    private final SessionMapper sessionMapper;
    private final SessionService sessionService;

    @GetMapping("/{id}")
    public ResponseEntity<SessionDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(sessionService.getById(id));
    }

    @GetMapping()
    public ResponseEntity<List<SessionDto>> findAll() {
        return ResponseEntity.ok(sessionService.findAll());
    }

    @PostMapping()
    public ResponseEntity<SessionDto> create(@Valid @RequestBody SessionDto sessionDto) {
        return ResponseEntity.ok(sessionService.create(sessionDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SessionDto> update( @PathVariable Long id, @Valid @RequestBody SessionDto dto) {

        return ResponseEntity.ok(sessionService.update(id, dto));
    }

    @DeleteMapping("{id}")
    public void deleteSession( @PathVariable Long id) {
         sessionService.delete(id);
    }

    @PostMapping("/{id}/participate/{userId}")
    public ResponseEntity<Void> participate( @PathVariable Long id, @PathVariable Long userId) {

        sessionService.participate(id, userId);

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/participate/{userId}")
    public ResponseEntity<Void> noLongerParticipate( @PathVariable Long id, @PathVariable Long userId) {

        sessionService.noLongerParticipate(id, userId);

        return ResponseEntity.noContent().build();
    }
}
