# 💼 JobTrackr - Modern Job Application Tracker

![License](https://img.shields.io/badge/License-MIT-green.svg)
![Node.js](https://img.shields.io/badge/Node.js-v18%2B-blue.svg)
![Express.js](https://img.shields.io/badge/Express.js-v5.0-lightgrey.svg)
![UI](https://img.shields.io/badge/Design-Glassmorphism_Dark-purple.svg)

> A fast, modern, full-stack application for tracking job applications, interviews, offers, and rejections with real-time statistics and disk-persisted REST backend.

---

## ✨ Features

- 📊 **Real-Time Analytics Dashboard**: Instant stats breakdown for Total Applications, Applied, Interviewing, Offers, and Rejections.
- 🎨 **Sleek Glassmorphism Dark UI**: Built with modern CSS design system, vibrant status pills, smooth micro-interactions, and Google Fonts (`Plus Jakarta Sans` & `Inter`).
- ⚡ **Full RESTful CRUD API**: Create, Read, Update, and Delete job applications seamlessly.
- 💾 **Persistent JSON Data Storage**: Applications are saved directly to `jobs.json` on the server so your data survives server restarts.
- 🔍 **Live Search & Filtering**: Filter applications by status (`Applied`, `Interview`, `Offer`, `Rejected`) or search dynamically by company, role, or location.
- 🔀 **Smart Sorting**: Sort applications by newest date, oldest date, or company name alphabetically.
- 📝 **Interactive Modals**: Form validation for adding/editing job details (company, role, salary, location, job URL, notes).
- 🔔 **Toast Feedback System**: Instant notifications for successful edits, status changes, and deletions.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Glassmorphism & Variables), JavaScript ES6+ (Async/Await Fetch API), FontAwesome 6 Icons.
- **Backend**: Node.js, Express.js, CORS middleware, File System (`fs`) JSON persistence.

---

## 📁 Project Structure

```text
jobtrackr/
├── backend/
│   ├── jobs.json          # Persistent JSON storage for application data
│   ├── package.json       # Backend dependencies and scripts
│   └── server.js          # Express.js REST API server (Port 3000)
├── frontend/
│   ├── index.html         # Main dashboard HTML template
│   ├── style.css          # Glassmorphism dark theme CSS stylesheet
│   ├── script.js          # Client-side state management & API integration
│   └── package.json       # Optional dev server configuration
└── README.md              # Documentation & setup guide
```

---

## 🚀 Quick Start Guide

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- npm (installed automatically with Node.js)

---

### Step 1: Start the Backend Server

1. Open your terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies (first time only):
   ```bash
   npm install
   ```
3. Launch the server:
   ```bash
   npm start
   ```
   *The server will start running at `http://localhost:3000`.*

---

### Step 2: Open the Frontend Dashboard

Simply double-click `frontend/index.html` in your file explorer, or serve it via any static web server:

```bash
cd frontend
npm start
```
*Open `http://localhost:5000` or open `index.html` directly in your web browser.*

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/jobs` | Retrieve all jobs (supports `?status=Interview` & `?search=Google`) |
| `GET` | `/api/stats` | Retrieve metrics summary counts |
| `POST` | `/api/jobs` | Create a new job application |
| `PUT` | `/api/jobs/:id` | Update an existing job application details or status |
| `DELETE` | `/api/jobs/:id` | Delete a job application by ID |

---

## 🔄 Commit & Push Changes to GitHub

To push all these updates back to your GitHub repository (`https://github.com/Prashant8991/jobtrackr`), run the following commands in your terminal:

```bash
git add .
git commit -m "refactor: complete JobTrackr overhaul with Express REST backend, persistent JSON storage, and glassmorphism UI dashboard"
git push origin main
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
