package com.pixelforge;

import com.pixelforge.dto.AuthRequests.RegisterRequest;
import com.pixelforge.dto.AuthResponses.AuthResponse;
import com.pixelforge.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class PixelForgeApplicationTests {

    @Autowired
    private AuthService authService;

    @Test
    void contextLoads() {
        assertNotNull(authService);
    }

    @Test
    void testUserRegistrationAndLogin() {
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setEmail("test_" + System.currentTimeMillis() + "@pixelforge.ai");
        registerReq.setPassword("secret123");
        registerReq.setFullName("Test Suite User");

        AuthResponse authRes = authService.register(registerReq);
        assertNotNull(authRes.getToken());
        assertEquals(registerReq.getEmail(), authRes.getUser().getEmail());
    }
}
