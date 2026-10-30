package com.skillswap.repository;

import com.skillswap.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillRepository extends JpaRepository<Skill, String> {

    List<Skill> findByOwnerEmailIgnoreCase(String ownerEmail);

    default List<Skill> findByOwnerEmail(String ownerEmail) {
        if (ownerEmail == null) return List.of();
        return findByOwnerEmailIgnoreCase(ownerEmail.trim());
    }
}
