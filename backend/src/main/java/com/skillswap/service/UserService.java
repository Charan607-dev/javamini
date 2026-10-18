package com.skillswap.service;

import com.skillswap.dto.UserResponse;
import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.model.User;
import com.skillswap.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public UserResponse getUserById(String id) {
        User user = findUserByIdOrEmail(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return toResponse(user);
    }

    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return toResponse(user);
    }

    public java.util.Optional<User> findUserByIdOrEmail(String identifier) {
        if (identifier == null || identifier.isBlank()) return java.util.Optional.empty();
        java.util.Optional<User> byId = userRepository.findById(identifier.trim());
        if (byId.isPresent()) return byId;
        return userRepository.findByEmail(identifier.trim());
    }

    public boolean existsById(String id) {
        return id != null && userRepository.findById(id.trim()).isPresent();
    }

    public boolean existsByEmail(String email) {
        return email != null && userRepository.findByEmail(email.trim()).isPresent();
    }

    public UserResponse updateUser(String id, User updates) throws java.io.IOException {
        User existing = findUserByIdOrEmail(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        if (updates != null) {
            if (updates.getName() != null && !updates.getName().isBlank()) {
                existing.setName(updates.getName().trim());
            }
            if (updates.getCollege() != null && !updates.getCollege().isBlank()) {
                existing.setCollege(updates.getCollege().trim());
            }
        }
        userRepository.save(existing);
        return toResponse(existing);
    }

    public void deleteUser(String id) throws java.io.IOException {
        User existing = findUserByIdOrEmail(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        userRepository.deleteById(existing.getId());
    }

    public UserResponse toResponse(User user) {
        if (user == null) return null;
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCollege(),
                user.getCreatedAt()
        );
    }
}
