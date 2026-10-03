package com.pixelforge.service;

import com.pixelforge.config.JwtService;
import com.pixelforge.dto.AuthRequests.*;
import com.pixelforge.dto.AuthResponses.*;
import com.pixelforge.exception.ApiException;
import com.pixelforge.model.User;
import com.pixelforge.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String name = request.getFullName();
        if (name == null || name.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "NAME_REQUIRED", "Full name is required");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "USER_EXISTS", "User with this email already exists");
        }

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                name
        );
        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(savedUser.getEmail());
        UserDto userDto = new UserDto(savedUser.getId(), savedUser.getEmail(), savedUser.getFullName(), savedUser.getRole());
        return new AuthResponse(token, userDto);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail());
        UserDto userDto = new UserDto(user.getId(), user.getEmail(), user.getFullName(), user.getRole());
        return new AuthResponse(token, userDto);
    }

    public UserDto getCurrentUserDto(User user) {
        return new UserDto(user.getId(), user.getEmail(), user.getFullName(), user.getRole());
    }
}
