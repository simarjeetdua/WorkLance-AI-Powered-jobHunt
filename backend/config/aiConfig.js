/**
 * AI Configuration for WorkLance Recommendation System
 */

const aiConfig = {
  // ===============================
  // WEIGHTS FOR SCORING
  // ===============================
  weights: {
    skillMatch: 0.6,   // 60% importance
    budget: 0.2,       // 20% importance
    recency: 0.2,      // 20% importance
  },

  // ===============================
  // RECOMMENDATION SETTINGS
  // ===============================
  recommendation: {
    maxResults: 10,         // top jobs to return
    recentDaysLimit: 7,     // consider jobs within 7 days
  },

  // ===============================
  // SKILL MATCH SETTINGS
  // ===============================
  skillMatching: {
    caseSensitive: false,
    partialMatch: true,     // future feature
  },

  // ===============================
  // BUDGET NORMALIZATION
  // ===============================
  budget: {
    divisor: 1000,   // normalize budget score
  },

  // ===============================
  // RECENCY SCORING
  // ===============================
  recencyScore: (daysOld) => {
    if (daysOld <= 3) return 20;
    if (daysOld <= 7) return 10;
    return 5;
  },
};

export default aiConfig;