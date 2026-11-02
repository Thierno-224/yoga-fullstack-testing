
package com.openclassrooms.starterjwt.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class RouteSecurityIT {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldRejectUnauthenticatedRequests() throws Exception {
        mockMvc.perform(get("/api/sessions"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void shouldAllowAuthenticatedUserThroughSecurityFilter() throws Exception {
        mockMvc.perform(
                request(HttpMethod.GET, "/api/sessions")
        ).andExpect(result -> {
            int statusCode = result.getResponse().getStatus();

            org.junit.jupiter.api.Assertions.assertNotEquals(
                    401,
                    statusCode
            );

            org.junit.jupiter.api.Assertions.assertNotEquals(
                    403,
                    statusCode
            );
        });
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldAllowAuthenticatedAdminThroughSecurityFilter() throws Exception {
        mockMvc.perform(
                request(HttpMethod.GET, "/api/sessions")
        ).andExpect(result -> {
            int statusCode = result.getResponse().getStatus();

            org.junit.jupiter.api.Assertions.assertNotEquals(
                    401,
                    statusCode
            );

            org.junit.jupiter.api.Assertions.assertNotEquals(
                    403,
                    statusCode
            );
        });
    }
}
