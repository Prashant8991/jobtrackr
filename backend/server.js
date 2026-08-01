const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'jobs.json');

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to read jobs from disk
const readJobs = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error reading jobs.json:', error);
    return [];
  }
};

// Helper function to write jobs to disk
const writeJobs = (jobs) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(jobs, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to jobs.json:', error);
  }
};

// GET /api/jobs - List all jobs with optional search and status filtering
app.get('/api/jobs', (req, res) => {
  let jobs = readJobs();
  const { status, search } = req.query;

  if (status && status !== 'All') {
    jobs = jobs.filter(j => j.status && j.status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const query = search.toLowerCase();
    jobs = jobs.filter(j => 
      (j.title && j.title.toLowerCase().includes(query)) ||
      (j.company && j.company.toLowerCase().includes(query)) ||
      (j.location && j.location.toLowerCase().includes(query))
    );
  }

  res.json(jobs);
});

// GET /api/stats - Quick analytics breakdown
app.get('/api/stats', (req, res) => {
  const jobs = readJobs();
  const stats = {
    total: jobs.length,
    applied: jobs.filter(j => j.status === 'Applied').length,
    interview: jobs.filter(j => j.status === 'Interview').length,
    offer: jobs.filter(j => j.status === 'Offer').length,
    rejected: jobs.filter(j => j.status === 'Rejected').length
  };
  res.json(stats);
});

// POST /api/jobs - Create a new job application
app.post('/api/jobs', (req, res) => {
  const { title, company, location, salary, status, notes, url } = req.body;

  if (!title || !company) {
    return res.status(400).json({ error: 'Title and Company are required fields' });
  }

  const jobs = readJobs();
  const newJob = {
    id: Date.now().toString(),
    title: title.trim(),
    company: company.trim(),
    location: location ? location.trim() : 'Not Specified',
    salary: salary ? salary.trim() : 'N/A',
    status: status || 'Applied',
    dateApplied: new Date().toISOString().split('T')[0],
    notes: notes ? notes.trim() : '',
    url: url ? url.trim() : ''
  };

  jobs.unshift(newJob);
  writeJobs(jobs);

  res.status(201).json(newJob);
});

// PUT /api/jobs/:id - Update an existing job application
app.put('/api/jobs/:id', (req, res) => {
  const { id } = req.params;
  const jobs = readJobs();
  const index = jobs.findIndex(j => j.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Job application not found' });
  }

  const updatedJob = {
    ...jobs[index],
    ...req.body,
    id // preserve ID
  };

  jobs[index] = updatedJob;
  writeJobs(jobs);

  res.json(updatedJob);
});

// DELETE /api/jobs/:id - Delete a job application
app.delete('/api/jobs/:id', (req, res) => {
  const { id } = req.params;
  let jobs = readJobs();
  const initialLength = jobs.length;

  jobs = jobs.filter(j => j.id !== id);

  if (jobs.length === initialLength) {
    return res.status(404).json({ error: 'Job application not found' });
  }

  writeJobs(jobs);
  res.json({ message: 'Job application deleted successfully', id });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 JobTrackr Server running at http://localhost:${PORT}`);
});
