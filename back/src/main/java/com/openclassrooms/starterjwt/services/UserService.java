package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.mapper.UserMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() ->
                        new NotFoundException("Utilisateur introuvable")
                );
    }

    @Transactional(readOnly = true)
    public UserDto findDtoById(Long id) {
        return userMapper.toDto(findById(id));
    }

    @Transactional
    public void delete(Long id, String authenticatedEmail) {
        User user = findById(id);

        if (!user.getEmail().equals(authenticatedEmail)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Vous ne pouvez pas supprimer un autre utilisateur"
            );
        }

        userRepository.delete(user);
    }
}