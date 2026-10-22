package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findDtoById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication
    ) {
        userService.delete(id, authentication.getName());

        return ResponseEntity.ok().build();
    }
}