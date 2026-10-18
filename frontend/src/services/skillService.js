import api from './api';
import authService from './authService';

const SKILLS_KEY = 'skillswap_skills';

export const skillService = {
    /**
     * Fetch all available skills from backend
     */
    getAllSkills: async () => {
        try {
            const skills = await api.get('/skills');
            if (Array.isArray(skills)) {
                localStorage.setItem(SKILLS_KEY, JSON.stringify(skills));
                window.dispatchEvent(new Event('skillswap-skills-updated'));
            }
            return skills;
        } catch (error) {
            // Fallback to localStorage if backend is unreachable
            console.warn('Backend unavailable, falling back to cached skills', error);
            return JSON.parse(localStorage.getItem(SKILLS_KEY) || '[]');
        }
    },

    /**
     * Get single skill by ID
     */
    getSkillById: async (id) => {
        return await api.get(`/skills/${id}`);
    },

    /**
     * Get skills offered by a specific user email
     */
    getSkillsByOwner: async (email) => {
        try {
            return await api.get(`/skills/user/${encodeURIComponent(email)}`);
        } catch (error) {
            console.warn('Backend unavailable, filtering cached skills', error);
            const all = JSON.parse(localStorage.getItem(SKILLS_KEY) || '[]');
            return all.filter(s => (s.ownerEmail || '').toLowerCase() === email.toLowerCase());
        }
    },

    /**
     * Create a new skill listing
     */
    createSkill: async (skillData) => {
        const user = authService.getCurrentUser();
        const userId = skillData.userId || user?.id || user?.email;

        if (!userId) {
            throw new Error('You must be logged in to offer a skill.');
        }

        const payload = {
            title: skillData.title.trim(),
            category: skillData.category || 'Technology',
            description: skillData.description ? skillData.description.trim() : '',
            level: skillData.level || 'Beginner',
            wants: skillData.wants ? skillData.wants.trim() : '',
            userId: userId,
            ownerEmail: user?.email || skillData.ownerEmail
        };

        const createdSkill = await api.post(`/skills?userId=${encodeURIComponent(userId)}`, payload);

        // Update local cache
        const local = JSON.parse(localStorage.getItem(SKILLS_KEY) || '[]');
        local.push(createdSkill);
        localStorage.setItem(SKILLS_KEY, JSON.stringify(local));
        window.dispatchEvent(new Event('skillswap-skills-updated'));

        return createdSkill;
    },

    /**
     * Delete a skill listing
     */
    deleteSkill: async (id) => {
        await api.del(`/skills/${id}`);

        const local = JSON.parse(localStorage.getItem(SKILLS_KEY) || '[]');
        const filtered = local.filter(s => s.id !== id);
        localStorage.setItem(SKILLS_KEY, JSON.stringify(filtered));
        window.dispatchEvent(new Event('skillswap-skills-updated'));
    },

    /**
     * Filter skills by search query and category
     */
    searchSkills: (skills, query = '', category = 'All') => {
        return skills.filter(skill => {
            const matchesCategory = category === 'All' || skill.category === category;
            const searchLower = query.toLowerCase();
            const matchesQuery = !query ||
                (skill.title || '').toLowerCase().includes(searchLower) ||
                (skill.description || '').toLowerCase().includes(searchLower) ||
                (skill.ownerName || '').toLowerCase().includes(searchLower) ||
                (skill.wants || '').toLowerCase().includes(searchLower);
            return matchesCategory && matchesQuery;
        });
    }
};

export default skillService;
