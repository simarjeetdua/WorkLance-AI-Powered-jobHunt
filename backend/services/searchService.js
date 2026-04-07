import Job from "../models/Job.model.js";

/**
 * Search Jobs Service
 */
export const searchJobsService = async (queryParams) => {
  const {
    keyword,
    skill,
    minBudget,
    maxBudget,
    sortBy,
  } = queryParams;

  let query = {};

  // =============================
  // KEYWORD SEARCH (Title + Description)
  // =============================
  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
    ];
  }

  // =============================
  // SKILL FILTER
  // =============================
  if (skill) {
    query.requiredSkills = { $in: [skill] };
  }

  // =============================
  // BUDGET FILTER
  // =============================
  if (minBudget || maxBudget) {
    query.budget = {};

    if (minBudget) {
      query.budget.$gte = Number(minBudget);
    }

    if (maxBudget) {
      query.budget.$lte = Number(maxBudget);
    }
  }

  // =============================
  // DEFAULT: ONLY OPEN JOBS
  // =============================
  query.status = "open";

  // =============================
  // SORTING
  // =============================
  let sortOptions = {};

  if (sortBy === "latest") {
    sortOptions = { createdAt: -1 };
  } else if (sortBy === "budget_high") {
    sortOptions = { budget: -1 };
  } else if (sortBy === "budget_low") {
    sortOptions = { budget: 1 };
  } else {
    sortOptions = { createdAt: -1 }; // default
  }

  // =============================
  // EXECUTE QUERY
  // =============================
  const jobs = await Job.find(query)
    .populate("client", "name email")
    .sort(sortOptions);

  return jobs;
};