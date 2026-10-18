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

        String level = request != null ? request.getLevel() : "Beginner";
        if (level == null || level.isBlank()) {
            level = "Beginner";
        }

        String title = (request != null && request.getTitle() != null) ? request.getTitle().trim() : "Skill";
        String category = (request != null && request.getCategory() != null) ? request.getCategory() : "Technology";
        String description = (request != null && request.getDescription() != null) ? request.getDescription().trim() : "";
        String wants = (request != null && request.getWants() != null) ? request.getWants().trim() : "";

        Skill skill = new Skill(
                user.getEmail(),
                user.getName(),
                title,
                category,
                description,
                level,
                wants
        );

        return skillRepository.save(skill);
    }

    public Skill updateSkill(String id, SkillRequest request) throws IOException {
        Skill existing = getSkillById(id);
        if (request != null) {
            if (request.getTitle() != null && !request.getTitle().isBlank()) existing.setTitle(request.getTitle().trim());
            if (request.getCategory() != null && !request.getCategory().isBlank()) existing.setCategory(request.getCategory());
            if (request.getDescription() != null) existing.setDescription(request.getDescription().trim());
            if (request.getLevel() != null && !request.getLevel().isBlank()) existing.setLevel(request.getLevel());
            if (request.getWants() != null) existing.setWants(request.getWants().trim());
        }
        return skillRepository.save(existing);
    }

    public void deleteSkill(String id) throws IOException {
        if (skillRepository.findById(id).isEmpty()) {
            throw new ResourceNotFoundException("Skill not found: " + id);
        }
        skillRepository.deleteById(id);
    }
}
