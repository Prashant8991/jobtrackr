const API_BASE_URL = 'http://localhost:3000/api';

// Application State
let jobsState = [];
let currentFilter = 'All';
let currentSearch = '';
let currentSort = 'newest';
let jobToDeleteId = null;
let isOfflineMode = false;

// Initial Local Storage Data for Live Demo fallback
const INITIAL_DEMO_JOBS = [
  {
    id: "1722528000001",
    title: "Frontend Developer",
    company: "Google",
    location: "Mountain View, CA (Hybrid)",
    salary: "$140,000 - $165,000",
    status: "Interview",
    dateApplied: "2026-07-15",
    notes: "Completed Technical Screening. Round 2 System Design on Aug 5th.",
    url: "https://careers.google.com"
  },
  {
    id: "1722528000002",
    title: "Full Stack Engineer",
    company: "Stripe",
    location: "San Francisco, CA (Remote)",
    salary: "$150,000 - $180,000",
    status: "Offer",
    dateApplied: "2026-07-10",
    notes: "Received offer letter! Negotiating base salary.",
    url: "https://stripe.com/jobs"
  },
  {
    id: "1722528000003",
    title: "Software Engineer",
    company: "Microsoft",
    location: "Redmond, WA",
    salary: "$135,000 - $160,000",
    status: "Applied",
    dateApplied: "2026-07-22",
    notes: "Applied via referral from Alex.",
    url: "https://careers.microsoft.com"
  },
  {
    id: "1722528000004",
    title: "Backend API Developer",
    company: "Amazon",
    location: "Seattle, WA",
    salary: "$145,000",
    status: "Rejected",
    dateApplied: "2026-06-30",
    notes: "Position filled internally.",
    url: "https://amazon.jobs"
  },
  {
    id: "1722528000005",
    title: "React UI Architect",
    company: "Vercel",
    location: "Remote",
    salary: "$160,000 - $190,000",
    status: "Applied",
    dateApplied: "2026-07-28",
    notes: "Submitted custom portfolio project link.",
    url: "https://vercel.com/careers"
  }
];

// DOM Elements
const jobList = document.getElementById('jobList');
const emptyState = document.getElementById('emptyState');

// Stats Elements
const statTotal = document.getElementById('statTotal');
const statApplied = document.getElementById('statApplied');
const statInterview = document.getElementById('statInterview');
const statOffer = document.getElementById('statOffer');
const statRejected = document.getElementById('statRejected');

// Controls & Inputs
const searchInput = document.getElementById('searchInput');
const filterPills = document.getElementById('filterPills');
const sortSelect = document.getElementById('sortSelect');

// Modals
const jobModal = document.getElementById('jobModal');
const deleteModal = document.getElementById('deleteModal');
const jobForm = document.getElementById('jobForm');
const modalTitle = document.getElementById('modalTitle');

// Buttons
const openAddModalBtn = document.getElementById('openAddModalBtn');
const emptyStateAddBtn = document.getElementById('emptyStateAddBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadJobs();
});

// Event Listeners Setup
function setupEventListeners() {
  openAddModalBtn.addEventListener('click', () => openModal());
  emptyStateAddBtn.addEventListener('click', () => openModal());
  closeModalBtn.addEventListener('click', closeModal);
  cancelModalBtn.addEventListener('click', closeModal);

  closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
  cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  confirmDeleteBtn.addEventListener('click', handleConfirmDelete);

  jobForm.addEventListener('submit', handleFormSubmit);

  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value.toLowerCase();
    render();
  });

  filterPills.addEventListener('click', (e) => {
    if (e.target.classList.contains('pill')) {
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.getAttribute('data-status');
      render();
    }
  });

  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    render();
  });
}

// LocalStorage Fallback Helpers
function getLocalJobs() {
  const stored = localStorage.getItem('jobtrackr_jobs');
  if (!stored) {
    localStorage.setItem('jobtrackr_jobs', JSON.stringify(INITIAL_DEMO_JOBS));
    return INITIAL_DEMO_JOBS;
  }
  return JSON.parse(stored);
}

function saveLocalJobs(jobs) {
  localStorage.setItem('jobtrackr_jobs', JSON.stringify(jobs));
}

// API / Storage Calls
async function loadJobs() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${API_BASE_URL}/jobs`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error('Backend error');
    jobsState = await response.json();
    isOfflineMode = false;
  } catch (error) {
    console.log('Using LocalStorage Mode (Live Demo Mode)');
    isOfflineMode = true;
    jobsState = getLocalJobs();
  }
  
  updateStats();
  render();
}

function updateStats() {
  const stats = {
    total: jobsState.length,
    applied: jobsState.filter(j => j.status === 'Applied').length,
    interview: jobsState.filter(j => j.status === 'Interview').length,
    offer: jobsState.filter(j => j.status === 'Offer').length,
    rejected: jobsState.filter(j => j.status === 'Rejected').length
  };

  statTotal.textContent = stats.total;
  statApplied.textContent = stats.applied;
  statInterview.textContent = stats.interview;
  statOffer.textContent = stats.offer;
  statRejected.textContent = stats.rejected;
}

// Form Submission (Add or Edit)
async function handleFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('jobId').value;
  const payload = {
    company: document.getElementById('company').value.trim(),
    title: document.getElementById('title').value.trim(),
    location: document.getElementById('location').value.trim(),
    salary: document.getElementById('salary').value.trim(),
    status: document.getElementById('status').value,
    url: document.getElementById('url').value.trim(),
    notes: document.getElementById('notes').value.trim(),
  };

  if (!isOfflineMode) {
    try {
      const url = id ? `${API_BASE_URL}/jobs/${id}` : `${API_BASE_URL}/jobs`;
      const method = id ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to save');
    } catch (err) {
      isOfflineMode = true;
    }
  }

  if (isOfflineMode) {
    if (id) {
      const index = jobsState.findIndex(j => j.id === id);
      if (index !== -1) {
        jobsState[index] = { ...jobsState[index], ...payload };
      }
    } else {
      const newJob = {
        id: Date.now().toString(),
        ...payload,
        dateApplied: new Date().toISOString().split('T')[0]
      };
      jobsState.unshift(newJob);
    }
    saveLocalJobs(jobsState);
  }

  closeModal();
  showToast(id ? 'Application updated!' : 'Application added!', 'success');
  if (!isOfflineMode) await loadJobs();
  else {
    updateStats();
    render();
  }
}

// Quick Status Update
async function updateJobStatus(id, newStatus) {
  if (!isOfflineMode) {
    try {
      await fetch(`${API_BASE_URL}/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      isOfflineMode = true;
    }
  }

  if (isOfflineMode) {
    const job = jobsState.find(j => j.id === id);
    if (job) job.status = newStatus;
    saveLocalJobs(jobsState);
  }

  showToast(`Status updated to ${newStatus}`, 'info');
  updateStats();
  render();
}

// Delete Handling
function promptDelete(id) {
  jobToDeleteId = id;
  deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
  jobToDeleteId = null;
  deleteModal.classList.add('hidden');
}

async function handleConfirmDelete() {
  if (!jobToDeleteId) return;

  if (!isOfflineMode) {
    try {
      await fetch(`${API_BASE_URL}/jobs/${jobToDeleteId}`, { method: 'DELETE' });
    } catch (err) {
      isOfflineMode = true;
    }
  }

  if (isOfflineMode) {
    jobsState = jobsState.filter(j => j.id !== jobToDeleteId);
    saveLocalJobs(jobsState);
  }

  closeDeleteModal();
  showToast('Application deleted', 'info');
  updateStats();
  render();
}

// Render Table Data
function render() {
  let filtered = jobsState.filter(job => {
    const matchesFilter = (currentFilter === 'All') || (job.status && job.status.toLowerCase() === currentFilter.toLowerCase());
    const matchesSearch = !currentSearch || (
      (job.company && job.company.toLowerCase().includes(currentSearch)) ||
      (job.title && job.title.toLowerCase().includes(currentSearch)) ||
      (job.location && job.location.toLowerCase().includes(currentSearch))
    );
    return matchesFilter && matchesSearch;
  });

  filtered.sort((a, b) => {
    if (currentSort === 'newest') return (b.id || 0) - (a.id || 0);
    if (currentSort === 'oldest') return (a.id || 0) - (b.id || 0);
    if (currentSort === 'company') return (a.company || '').localeCompare(b.company || '');
    return 0;
  });

  if (filtered.length === 0) {
    jobList.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  jobList.innerHTML = filtered.map(job => {
    const statusClass = (job.status || 'applied').toLowerCase();
    const dateFormatted = job.dateApplied || 'N/A';
    const linkHtml = job.url 
      ? `<a href="${escapeHtml(job.url)}" target="_blank" class="link-icon" title="View Job Link"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>`
      : '';

    return `
      <tr>
        <td>
          <div class="company-cell">
            <span class="company-name">
              ${escapeHtml(job.company)} ${linkHtml}
            </span>
            <span class="job-title">${escapeHtml(job.title)}</span>
          </div>
        </td>
        <td>${escapeHtml(job.location || 'Not Specified')}</td>
        <td>${escapeHtml(job.salary || 'N/A')}</td>
        <td>
          <select class="badge ${statusClass}" onchange="updateJobStatus('${job.id}', this.value)">
            <option value="Applied" ${job.status === 'Applied' ? 'selected' : ''}>Applied</option>
            <option value="Interview" ${job.status === 'Interview' ? 'selected' : ''}>Interview</option>
            <option value="Offer" ${job.status === 'Offer' ? 'selected' : ''}>Offer</option>
            <option value="Rejected" ${job.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
          </select>
        </td>
        <td>${dateFormatted}</td>
        <td>
          <div class="action-btns">
            <button class="icon-btn" onclick="openEditModal('${job.id}')" title="Edit Application">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="icon-btn delete" onclick="promptDelete('${job.id}')" title="Delete Application">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Modal Helpers
function openModal(job = null) {
  jobForm.reset();
  if (job) {
    modalTitle.textContent = 'Edit Job Application';
    document.getElementById('jobId').value = job.id;
    document.getElementById('company').value = job.company || '';
    document.getElementById('title').value = job.title || '';
    document.getElementById('location').value = job.location || '';
    document.getElementById('salary').value = job.salary || '';
    document.getElementById('status').value = job.status || 'Applied';
    document.getElementById('url').value = job.url || '';
    document.getElementById('notes').value = job.notes || '';
  } else {
    modalTitle.textContent = 'Add Job Application';
    document.getElementById('jobId').value = '';
    document.getElementById('status').value = 'Applied';
  }
  jobModal.classList.remove('hidden');
}

function openEditModal(id) {
  const job = jobsState.find(j => j.id === id);
  if (job) openModal(job);
}

function closeModal() {
  jobModal.classList.add('hidden');
}

// Toast Notifications
function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid fa-circle-info"></i> <span>${escapeHtml(message)}</span>`;
  
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Helper: Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, match => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[match]);
}
