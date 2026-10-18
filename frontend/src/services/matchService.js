import skillService from './skillService';
import authService from './authService';

/**
 * MatchService computes intelligent matches between students based on mutual interests:
 * What student A can teach vs what student B wants to learn, and vice-versa.
 */
export const matchService = {
    /**
     * Compute compatibility score (0 to 100%) between two skills.
     */
    calculateMatchScore: (mySkill, otherSkill) => {
        if (!mySkill || !otherSkill) return 0;

        let score = 0;
        const myWants = (mySkill.wants || '').toLowerCase();
        const theirTitle = (otherSkill.title || '').toLowerCase();
        const theirWants = (otherSkill.wants || '').toLowerCase();
        const myTitle = (mySkill.title || '').toLowerCase();

        // 1. Mutual direct match: I want what they teach & they want what I teach
        const directMutual = myWants && theirTitle && (theirTitle.includes(myWants) || myWants.includes(theirTitle));
        const reverseMutual = theirWants && myTitle && (myTitle.includes(theirWants) || theirWants.includes(myTitle));

        if (directMutual && reverseMutual) {
            score += 60;
        } else if (directMutual || reverseMutual) {
            score += 35;
        }

        // 2. Category synergy
        if (mySkill.category && otherSkill.category && mySkill.category === otherSkill.category) {
            score += 20;
        }

        // 3. Experience level synergy
        const levels = ['Beginner', 'Intermediate', 'Advanced'];
        const myLevelIdx = levels.indexOf(mySkill.level || 'Beginner');
        const theirLevelIdx = levels.indexOf(otherSkill.level || 'Beginner');
        if (Math.abs(myLevelIdx - theirLevelIdx) <= 1) {
            score += 15;
        }

        // 4. Baseline student exchange willingness
        score += 5;

        return Math.min(score, 100);
    },

    /**
     * Find best exchange partners for the logged in student
     */
    findMatches: async (userEmail = null) => {
        const user = authService.getCurrentUser();
        const email = (userEmail || user?.email || '').toLowerCase();

        const allSkills = await skillService.getAllSkills();
        const mySkills = allSkills.filter(s => (s.ownerEmail || '').toLowerCase() === email);
        const candidateSkills = allSkills.filter(s => (s.ownerEmail || '').toLowerCase() !== email);

        if (mySkills.length === 0 || candidateSkills.length === 0) {
            return [];
        }

        const matches = [];

        candidateSkills.forEach(candidate => {
            // Compare candidate with all of my skills to find the highest match
            let highestScore = 0;
            let bestMatchingMySkill = null;

            mySkills.forEach(mySkill => {
                const score = matchService.calculateMatchScore(mySkill, candidate);
                if (score > highestScore) {
                    highestScore = score;
                    bestMatchingMySkill = mySkill;
                }
            });

            if (highestScore > 10) {
                matches.push({
                    candidateSkill: candidate,
                    offeredSkill: bestMatchingMySkill,
                    matchScore: highestScore,
                    isMutual: highestScore >= 50
                });
            }
        });

        // Sort descending by match score
        return matches.sort((a, b) => b.matchScore - a.matchScore);
    },

    /**
     * Get recommended skills based on what the student wants to learn
     */
    getRecommendedSkills: (mySkills, allSkills, currentEmail) => {
        const userEmail = (currentEmail || '').toLowerCase();
        const myWants = mySkills.map(s => (s.wants || '').toLowerCase()).filter(Boolean);

        return allSkills
            .filter(s => (s.ownerEmail || '').toLowerCase() !== userEmail)
            .map(skill => {
                let relevance = 0;
                const titleLower = (skill.title || '').toLowerCase();
                const descLower = (skill.description || '').toLowerCase();

                myWants.forEach(want => {
                    if (titleLower.includes(want)) relevance += 50;
                    if (descLower.includes(want)) relevance += 25;
                });

                return { skill, relevance };
            })
            .sort((a, b) => b.relevance - a.relevance)
            .map(item => item.skill);
    }
};

export default matchService;
