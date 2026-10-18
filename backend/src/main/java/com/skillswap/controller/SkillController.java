package com.skillswap.controller;

import com.skillswap.dto.SkillRequest;
import com.skillswap.model.Skill;
import com.skillswap.service.SkillService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    @GetMapping
    public ResponseEntity<List<Skill>> getAllSkills() {
        return ResponseEntity.ok(skillService.getAllSkills());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Skill> getSkillById(@PathVariable String id) {
        return ResponseEntity.ok(skillService.getSkillById(id));
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<List<Skill>> getSkillsByOwnerEmail(@PathVariable String email) {
        return ResponseEntity.ok(skillService.getSkillsByOwnerEmail(email));
    }

    /**
     * Create a skill for a user.
     * The userId can be passed as a query parameter or inside the request body.
     */
    @PostMapping
    public ResponseEntity<Skill> createSkill(
            @RequestParam(required = false) String userId,
            @Valid @RequestBody SkillRequest request) throws IOException {
        Skill skill = skillService.createSkill(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(skill);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSkill(@PathVariable String id) throws IOException {
        skillService.deleteSkill(id);
        return ResponseEntity.noContent().build();
    }
}
