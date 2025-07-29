import React, { useEffect, useState } from "react";
import { fetchJobs, addJob } from "../../src/api.js";
function App() {
  const [jobs, setJobs] = useState([]);
  const [newJobTitle, setNewJobTitle] = useState("");

  useEffect(() => {
    const loadJobs = async () => {
      const data = await fetchJobs();
      setJobs(data);
    };

    loadJobs();
  }, []);

  const handleAddJob = async () => {
    if (!newJobTitle.trim()) return;

    const newJob = {
      title: newJobTitle,
      status: "Applied",
    };

    const added = await addJob(newJob);
    setJobs([...jobs, added]);
    setNewJobTitle("");
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🎯 JobTrackr</h1>
      <input
        type="text"
        placeholder="Enter job title"
        value={newJobTitle}
        onChange={(e) => setNewJobTitle(e.target.value)}
        style={{ padding: "0.5rem", marginRight: "1rem" }}
      />
      <button onClick={handleAddJob} style={{ padding: "0.5rem 1rem" }}>
        Add Job
      </button>

      <ul style={{ marginTop: "2rem" }}>
        {jobs.length === 0 ? (
          <li>No jobs yet.</li>
        ) : (
          jobs.map((job) => (
            <li key={job.id}>
              <strong>{job.title}</strong> - {job.status}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default App;
