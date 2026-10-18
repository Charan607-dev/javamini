package com.skillswap.service;

import com.skillswap.dto.SkillRequest;
import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.model.Skill;
import com.skillswap.model.User;
import com.skillswap.repository.SkillRepository;
import com.skillswap.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class SkillService {

    private final SkillRepository skillRepository;
    private final UserRepository userRepository;

    public SkillService(SkillRepository skillRepository, UserRepository userRepository) {
        this.skillRepository = skillRepository;
        this.userRepository = userRepository;
    }

    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    public Skill getSkillById(String id) {
        return skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found: " + id));
    }

    public List<Skill> getSkillsByOwnerEmail(String email) {
        return skillRepository.findByOwnerEmail(email);
    }

    public Skill createSkill(String userId, SkillRequest request) throws IOException {
        String lookup = userId;
        if ((lookup == null || lookup.isBlank()) && request != null) {
            lookup = request.getUserId() != null ? request.getUserId() : request.getOwnerEmail();
        }

        User user = null;
        if (lookup != null && !lookup.isBlank()) {
            user = userRepository.findById(lookup).orElse(null);
            if (user == null) {
                user = userRepository.findByEmail(lookup).orElse(null);
            }
        }

        if (user == null) {
            throw new ResourceNotFoundException("User not found: " + lookup);
        }

        String level = request.getLevel();
        if (level == null || level.isBlank()) {
            level = "Beginner";
        }

        Skill skill = new Skill(
                user.getEmail(),
                user.getName(),
                request.getTitle().trim(),
                request.getCategory() != null ? request.getCategory() : "Technology",
                request.getDescription() != null ? request.getDescription().trim() : "",
                level,
                request.getWants() != null ? request.getWants().trim() : ""
        );

        return skillRepository.save(skill);
    }

    public void deleteSkill(String id) throws IOException {
        if (skillRepository.findById(id).isEmpty()) {
            throw new ResourceNotFoundException("Skill not found: " + id);
        }
        skillRepository.deleteById(id);
    }
}
