/**
 * Convert array of skills to lowercase set
 */
const normalizeSkills = (skills = []) => {
  return new Set(skills.map((skill) => skill.toLowerCase()));
};

/**
 * Jaccard Similarity
 * Formula:
 * Intersection / Union
 */
export const calculateJaccardSimilarity = (skillsA, skillsB) => {
  const setA = normalizeSkills(skillsA);
  const setB = normalizeSkills(skillsB);

  const intersection = new Set(
    [...setA].filter((skill) => setB.has(skill))
  );

  const union = new Set([...setA, ...setB]);

  const similarity =
    union.size === 0 ? 0 : intersection.size / union.size;

  return similarity;
};

/**
 * Basic Skill Match Percentage
 */
export const calculateSkillMatchPercentage = (
  freelancerSkills,
  jobSkills
) => {
  if (!jobSkills || jobSkills.length === 0) return 0;

  const matchCount = jobSkills.filter((skill) =>
    freelancerSkills
      .map((s) => s.toLowerCase())
      .includes(skill.toLowerCase())
  ).length;

  return (matchCount / jobSkills.length) * 100;
};

/**
 * Hybrid Similarity Score (Advanced)
 */
export const calculateHybridScore = (
  freelancerSkills,
  jobSkills
) => {
  const jaccard = calculateJaccardSimilarity(
    freelancerSkills,
    jobSkills
  );

  const percentage = calculateSkillMatchPercentage(
    freelancerSkills,
    jobSkills
  );

  // Weighted combination
  const score = jaccard * 0.6 + (percentage / 100) * 0.4;

  return score * 100; // scale to 0–100
};