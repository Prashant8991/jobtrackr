const API_BASE_URL = 'http://localhost:3000/api';

// Application State
let jobsState = [];
let currentFilter = 'All';
let currentSearch = '';
let currentSort = 'newest';
let jobToDeleteId = null;

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
  loadStats();
});

// Event Listeners Setup
function setupEventListeners() {
  // Modal triggers
  openAddModalBtn.addEventListener('click', () => openModal());
  emptyStateAddBtn.addEventListener('click', () => openModal());
  closeModalBtn.addEventListener('click', closeModal);
  cancelModalBtn.addEventListener('click', closeModal);

  closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
  cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  confirmDeleteBtn.addEventListener('click', handleConfirmDelete);

  // Form Submit
  jobForm.addEventListener('submit', handleFormSubmit);

  // Search & Filter
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

// API Calls
async function loadJobs() {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs`);
    if (!response.ok) throw new Error('Failed to fetch jobs');
    jobsState = await response.json();
    render();
  } catch (error) {
    console.error('Error fetching jobs:', error);
    showToast('Backend connection error. Make sure server is running on port 3000.', 'error');
  }
}

async function loadStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    const stats = await response.json();
    
    statTotal.textContent = stats.total || 0;
    statApplied.textContent = stats.applied || 0;
    statInterview.textContent = stats.interview || 0;
    statOffer.textContent = stats.offer || 0;
    statRejected.textContent = stats.rejected || 0;
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
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

  try {
    let response;
    if (id) {
      // Update
      response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      // Create
      response = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (!response.ok) throw new Error('Failed to save job application');
    
    closeModal();
    showToast(id ? 'Application updated successfully!' : 'Application added successfully!', 'success');
    await loadJobs();
    await loadStats();
  } catch (error) {
    console.error('Error saving job:', error);
    showToast('Failed to save application.', 'error');
  }
}

// Quick Status Update from Table Row
async function updateJobStatus(id, newStatus) {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (!response.ok) throw new Error('Failed to update status');

    showToast(`Status updated to ${newStatus}`, 'info');
    await loadJobs();
    await loadStats();
  } catch (error) {
    console.error('Error updating status:', error);
    showToast('Failed to update status', 'error');
  }
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

  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobToDeleteId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete job application');

    closeDeleteModal();
    showToast('Application deleted', 'info');
    await loadJobs();
    await loadStats();
  } catch (error) {
    console.error('Error deleting job:', error);
    showToast('Failed to delete application', 'error');
  }
}

// Render Table Data
function render() {
  // Filter jobs
  let filtered = jobsState.filter(job => {
    const matchesFilter = (currentFilter === 'All') || (job.status && job.status.toLowerCase() === currentFilter.toLowerCase());
    const matchesSearch = !currentSearch || (
      (job.company && job.company.toLowerCase().includes(currentSearch)) ||
      (job.title && job.title.toLowerCase().includes(currentSearch)) ||
      (job.location && job.location.toLowerCase().includes(currentSearch))
    );
    return matchesFilter && matchesSearch;
  });

  // Sort jobs
  filtered.sort((a, b) => {
    if (currentSort === 'newest') return (b.id || 0) - (a.id || 0);
    if (currentSort === 'oldest') return (a.id || 0) - (b.id || 0);
    if (currentSort === 'company') return (a.company || '').localeCompare(b.company || '');
    return 0;
  });

  // Check empty state
  if (filtered.length === 0) {
    jobList.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  // Render rows
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
