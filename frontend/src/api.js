import axios from "axios";

const BASE_URL = "http://localhost:3000"; // your backend server

// Fetch all jobs
export const fetchJobs = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/jobs`);
    return response.data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
};

// Add a new job
export const addJob = async (job) => {
  try {
    const response = await axios.post(`${BASE_URL}/jobs`, job);
    return response.data;
  } catch (error) {
    console.error("Error adding job:", error);
  }
};
