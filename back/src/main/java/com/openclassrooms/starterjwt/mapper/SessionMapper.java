
package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SessionMapper {

    @Mapping(target = "teacher", ignore = true)
    @Mapping(target = "users", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Session toEntity(SessionDto dto);

    @Mapping(source = "teacher.id", target = "teacher_id")
    @Mapping(
            target = "users",
            expression = "java(session.getUsers() == null ? java.util.List.of() : session.getUsers().stream().map(user -> user.getId()).toList())"
    )
    SessionDto toDto(Session session);

    List<SessionDto> toDto(List<Session> sessions);
}
