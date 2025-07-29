const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let jobs = []; // This is your temporary storage (in-memory)

app.get('/api/jobs', (req, res) => {
  res.json(jobs);
});

app.post('/api/jobs', (req, res) => {
  const { title, company } = req.body;
  if (!title || !company) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const newJob = { id: Date.now(), title, company };
  jobs.push(newJob);
  res.status(201).json(newJob);
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
