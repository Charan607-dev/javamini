package com.skillswap.repository;

import com.skillswap.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmailIgnoreCase(String email);

    default Optional<User> findByEmail(String email) {
        if (email == null) return Optional.empty();
        return findByEmailIgnoreCase(email.trim());
    }

    boolean existsByEmailIgnoreCase(String email);
}
