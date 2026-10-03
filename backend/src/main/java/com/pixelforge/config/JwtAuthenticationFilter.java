package com.pixelforge.config;

import com.pixelforge.model.User;
import com.pixelforge.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            try {
                String userEmail = jwtService.extractUsername(jwt);
                if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    Optional<User> userOpt = userRepository.findByEmail(userEmail);
                    if (userOpt.isPresent() && jwtService.isTokenValid(jwt, userEmail)) {
                        setSecurityUser(userOpt.get(), request);
                        filterChain.doFilter(request, response);
                        return;
                    }
                }
            } catch (Exception e) {
                // Token invalid
            }
        }

        // Fallback: Default workspace user for login-free access
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            User demoUser = userRepository.findByEmail("demo@pixelforge.ai")
                    .orElseGet(() -> {
                        User newDemo = new User("demo@pixelforge.ai", new BCryptPasswordEncoder().encode("password"), "PixelForge User");
                        return userRepository.save(newDemo);
                    });
            setSecurityUser(demoUser, request);
        }

        filterChain.doFilter(request, response);
    }

    private void setSecurityUser(User user, HttpServletRequest request) {
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                user,
                null,
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole()))
        );
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);
    }
}
