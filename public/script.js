const API_URL = '/api/tasks';
const CATEGORY_API_URL = '/api/categories';



const auth = {
    getToken() {
        return localStorage.getItem('authToken');
    },

    getUser() {
        return {
            email: localStorage.getItem('userEmail') || 'user@example.com',
            role: localStorage.getItem('userRole') || 'user'
        };
    },

    isAuthenticated() {
        return !!this.getToken();
    },

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        window.location.href = '/login.html';
    },

    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getToken()}`
        };
    }
};



const elements = {
    taskList: document.getElementById('taskList'),
    emptyState: document.getElementById('emptyState'),
    dateDisplay: document.getElementById('dateDisplay'),
    taskModal: document.getElementById('taskModal'),
    taskForm: document.getElementById('taskForm'),
    fabAddTask: document.getElementById('fabAddTask'),
    closeModal: document.getElementById('closeModal'),
    cancelTask: document.getElementById('cancelTask'),
    logoutBtn: document.getElementById('logoutBtn'),
    userName: document.getElementById('userName'),
    userEmail: document.getElementById('userEmail'),
    userAvatar: document.getElementById('userAvatar'),
    categorySelect: document.getElementById('taskCategory'),
    navItems: document.querySelectorAll('.nav-item[data-page]')
};


document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!auth.isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }

    // Initialize UI
    initializeUI();
    fetchTasks();
    loadCategories();
    setupEventListeners();
});

function initializeUI() {
    // Set date
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    elements.dateDisplay.textContent = today.toLocaleDateString('en-US', options);

    // Set user info
    const user = auth.getUser();
    elements.userEmail.textContent = user.email;
    elements.userName.textContent = user.email.split('@')[0];
    elements.userAvatar.textContent = user.email.charAt(0).toUpperCase();
}


function setupEventListeners() {
    // FAB - Open Modal
    elements.fabAddTask.addEventListener('click', () => openModal());

    // Close Modal
    elements.closeModal.addEventListener('click', () => closeModal());
    elements.cancelTask.addEventListener('click', () => closeModal());

    // Close modal on overlay click
    elements.taskModal.addEventListener('click', (e) => {
        if (e.target === elements.taskModal) {
            closeModal();
        }
    });

    // Form submission
    elements.taskForm.addEventListener('submit', handleTaskSubmit);

    // Logout
    elements.logoutBtn.addEventListener('click', () => auth.logout());

    // Navigation
    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            elements.navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
        if (e.key === 'n' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            openModal();
        }
    });
}


// MODAL FUNCTIONS


function openModal() {
    elements.taskModal.classList.add('active');
    document.getElementById('taskTitle').focus();
}

function closeModal() {
    elements.taskModal.classList.remove('active');
    elements.taskForm.reset();
}

// ============================================
// TASK FUNCTIONS
// ============================================

async function fetchTasks() {
    try {
        const response = await fetch(API_URL, {
            headers: auth.getHeaders()
        });

        if (response.status === 401) {
            auth.logout();
            return;
        }

        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
    }
}

function renderTasks(tasks) {
    elements.taskList.innerHTML = '';

    if (tasks.length === 0) {
        elements.emptyState.classList.remove('hidden');
        return;
    }

    elements.emptyState.classList.add('hidden');

    tasks.forEach(task => {
        const taskCard = createTaskCard(task);
        elements.taskList.appendChild(taskCard);
    });
}

function createTaskCard(task) {
    const div = document.createElement('div');
    div.className = `task-card ${task.isCompleted ? 'completed' : ''}`;
    div.dataset.id = task._id;

    const categoryName = task.category?.name || '';
    const categoryBadge = categoryName
        ? `<span class="task-category">
            <span class="priority-indicator priority-${task.priority.toLowerCase()}"></span>
            ${categoryName}
           </span>`
        : `<span class="task-category">
            <span class="priority-indicator priority-${task.priority.toLowerCase()}"></span>
            ${task.priority}
           </span>`;

    div.innerHTML = `
        <div class="task-checkbox ${task.isCompleted ? 'checked' : ''}" onclick="toggleTask('${task._id}', ${!task.isCompleted})">
            <input type="checkbox" ${task.isCompleted ? 'checked' : ''} class="sr-only">
        </div>
        
        <div class="task-content">
            <p class="task-title">${escapeHtml(task.title)}</p>
            ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
            <div class="task-meta">
                ${categoryBadge}
            </div>
        </div>
        
        <div class="task-actions">
            <button class="action-btn delete" onclick="deleteTask('${task._id}')" title="Delete task">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
    `;

    return div;
}

async function handleTaskSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const priority = document.getElementById('taskPriority').value;
    const category = document.getElementById('taskCategory').value;

    if (!title) return;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: auth.getHeaders(),
            body: JSON.stringify({
                title,
                description,
                priority,
                category: category || null
            })
        });

        if (response.status === 401) {
            auth.logout();
            return;
        }

        if (!response.ok) {
            throw new Error('Failed to create task');
        }

        closeModal();
        fetchTasks();
    } catch (error) {
        console.error('Failed to create task:', error);
        alert('Failed to create task. Please try again.');
    }
}

async function toggleTask(id, status) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: auth.getHeaders(),
            body: JSON.stringify({ isCompleted: status })
        });

        if (response.status === 401) {
            auth.logout();
            return;
        }

        fetchTasks();
    } catch (error) {
        console.error('Failed to update task:', error);
    }
}

async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: auth.getHeaders()
        });

        if (response.status === 401) {
            auth.logout();
            return;
        }

        fetchTasks();
    } catch (error) {
        console.error('Failed to delete task:', error);
    }
}

// ============================================
// CATEGORY FUNCTIONS
// ============================================

async function loadCategories() {
    try {
        const response = await fetch(CATEGORY_API_URL, {
            headers: auth.getHeaders()
        });

        if (!response.ok) return;

        const categories = await response.json();

        elements.categorySelect.innerHTML = '<option value="">No Category</option>';

        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat._id;
            option.textContent = cat.name;
            elements.categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally available for onclick handlers
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;