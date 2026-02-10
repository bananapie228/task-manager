
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

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!auth.isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }

    // --- DOM Elements ---
    const views = {
        home: document.getElementById('view-home'),
        categories: document.getElementById('view-categories'),
        profile: document.getElementById('view-profile')
    };
    // Map 'tasks' to 'home' view but with different filter

    // Header & Titles
    const viewTitle = document.querySelector('#view-home .dashboard-header h1');
    const viewSubtitle = document.querySelector('#view-home .date-display');

    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    const dateDisplay = document.getElementById('dateDisplay');

    // Modal
    const taskModal = document.getElementById('taskModal');
    const taskForm = document.getElementById('taskForm');
    const fabAddTask = document.getElementById('fabAddTask');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelTaskBtn = document.getElementById('cancelTask');

    // User Info
    const logoutBtn = document.getElementById('logoutBtn');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userAvatar = document.getElementById('userAvatar');

    // Inputs
    const categorySelect = document.getElementById('taskCategory');
    const navItems = document.querySelectorAll('.nav-item[data-page]');

    // Category View
    const categoriesList = document.getElementById('categoriesList');
    const createCategoryForm = document.getElementById('createCategoryForm');

    // Profile View
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileRole = document.getElementById('profileRole');
    const profileAvatar = document.getElementById('profileAvatar');

    // State
    let currentTasks = [];
    let currentFilter = 'all'; // 'all', 'active', or categoryId

    // --- Initialization ---
    const user = auth.getUser();

    // Set Header Info
    userEmail.textContent = user.email;
    userName.textContent = user.email.split('@')[0];
    userAvatar.textContent = user.email.charAt(0).toUpperCase();

    // Set Date
    const today = new Date();
    if (dateDisplay) {
        dateDisplay.textContent = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    // --- View Switching Logic ---
    function showView(pageName, filterId = null) {
        // Update Nav State
        navItems.forEach(nav => {
            if (nav.dataset.page === pageName) nav.classList.add('active');
            else nav.classList.remove('active');
        });

        // Hide all views
        Object.values(views).forEach(el => {
            if (el) {
                el.classList.remove('active');
                setTimeout(() => el.classList.add('hidden'), 10);
                el.classList.add('hidden');
                el.style.display = 'none';
            }
        });

        // Determine target view
        let targetViewId = pageName === 'tasks' ? 'home' : pageName;
        let targetView = views[targetViewId];

        // Show target view
        if (targetView) {
            targetView.style.display = 'block';
            setTimeout(() => {
                targetView.classList.remove('hidden');
                targetView.classList.add('active');
            }, 10);
        }

        // Logic per view
        if (targetViewId === 'home') {
            fabAddTask.style.display = 'flex';

            if (filterId) {
                // Category filtering
                viewTitle.textContent = 'Category View';
                // Subtitle set by caller
                currentFilter = filterId;
            } else if (pageName === 'home') {
                viewTitle.textContent = 'Inbox';
                viewSubtitle.textContent = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                currentFilter = 'all';
            } else if (pageName === 'tasks') {
                viewTitle.textContent = 'Active Tasks';
                viewSubtitle.textContent = 'Focus on what remains';
                currentFilter = 'active';
            }

            fetchTasks();
        } else {
            fabAddTask.style.display = 'none';
        }

        if (pageName === 'categories') fetchCategoriesView();
        if (pageName === 'profile') loadProfileView();
    }

    // Default View
    showView('home');

    // --- Event Listeners ---

    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            showView(page);
        });
    });

    // FAB
    fabAddTask.addEventListener('click', () => {
        taskModal.classList.add('active');
        document.getElementById('taskTitle').focus();
    });

    // Modal
    function closeModal() {
        taskModal.classList.remove('active');
        taskForm.reset();
    }
    closeModalBtn.addEventListener('click', closeModal);
    cancelTaskBtn.addEventListener('click', closeModal);
    taskModal.addEventListener('click', (e) => { if (e.target === taskModal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    // Task Form Submit
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const priority = document.getElementById('taskPriority').value;
        const category = document.getElementById('taskCategory').value;
        const dueDate = document.getElementById('taskDueDate').value;

        if (!title) return;

        try {
            await apiCall(API_URL, 'POST', {
                title,
                description,
                priority,
                category: category || null,
                dueDate: dueDate || null
            });
            closeModal();
            fetchTasks(); // Refresh list
        } catch (error) {
            console.error(error);
            alert('Failed to create task');
        }
    });

    // Create Category Form
    if (createCategoryForm) {
        createCategoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('newCatName');
            const colorInput = document.getElementById('newCatColor');

            const name = nameInput.value.trim();
            // Default color if input is missing or empty
            const color = colorInput ? colorInput.value : '#E63946';

            if (!name) return;

            try {
                await apiCall(CATEGORY_API_URL, 'POST', { name, color });
                createCategoryForm.reset();
                fetchCategoriesView(); // Refresh grid
                loadCategorySelect(); // Refresh dropdown
            } catch (error) {
                console.error(error);
                alert('Failed to create category');
            }
        });
    }

    // Logout
    logoutBtn.addEventListener('click', () => auth.logout());

    // Task Interactions (Delegation)
    taskList.addEventListener('click', (e) => {
        const checkbox = e.target.closest('.task-checkbox');
        if (checkbox) {
            const id = checkbox.closest('.task-card').dataset.id;
            const status = !checkbox.classList.contains('checked');
            apiCall(`${API_URL}/${id}`, 'PUT', { isCompleted: status }).then(fetchTasks);
        }

        const deleteBtn = e.target.closest('.action-btn.delete');
        if (deleteBtn) {
            const id = deleteBtn.closest('.task-card').dataset.id;
            if (confirm('Delete task?')) {
                apiCall(`${API_URL}/${id}`, 'DELETE').then(fetchTasks);
            }
        }
    });

    // --- API Helper ---
    async function apiCall(url, method = 'GET', body = null) {
        const headers = auth.getHeaders();
        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);

        const res = await fetch(url, options);
        if (res.status === 401) { auth.logout(); return; }
        if (!res.ok) throw new Error('API Error');
        return method === 'DELETE' ? res : res.json();
    }

    // --- Data Loading Functions ---

    async function fetchTasks() {
        try {
            const tasks = await apiCall(API_URL);
            currentTasks = tasks;
            renderTasks();
        } catch (error) {
            console.error('Fetch tasks failed', error);
        }
    }

    function renderTasks() {
        taskList.innerHTML = '';

        // Filter Logic
        let filteredTasks = currentTasks;
        if (currentFilter === 'active') {
            filteredTasks = currentTasks.filter(t => !t.isCompleted);
        } else if (currentFilter !== 'all') {
            // It's a category ID
            filteredTasks = currentTasks.filter(t => {
                const catId = t.category ? (t.category._id || t.category) : null;
                console.log('Task:', t.title, 'CatID:', catId, 'Filter:', currentFilter, 'Match:', catId === currentFilter);
                return catId === currentFilter;
            });
        }

        // Sort: Incomplete first, then by Due Date (soonest first), then Priority
        filteredTasks.sort((a, b) => {
            if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
            if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
            if (a.dueDate) return -1;
            if (b.dueDate) return 1;
            return 0; // Maintain original order (created at desc)
        });

        if (filteredTasks.length === 0) {
            emptyState.classList.remove('hidden');
            emptyState.querySelector('h3').textContent = currentFilter === 'all' ? 'No tasks yet' : 'No tasks found';
            return;
        }
        emptyState.classList.add('hidden');

        filteredTasks.forEach(task => {
            const div = document.createElement('div');
            div.className = `task-card${task.isCompleted ? ' completed' : ''}`;
            div.dataset.id = task._id;

            const catName = task.category ? task.category.name : '';
            const catColor = task.category ? task.category.color : '#666';

            // Format Date
            let dateHtml = '';
            if (task.dueDate) {
                const d = new Date(task.dueDate);
                const isOverdue = d < new Date() && !task.isCompleted;
                dateHtml = `<span class="task-date ${isOverdue ? 'overdue' : ''}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    ${d.toLocaleDateString()}
                </span>`;
            }

            div.innerHTML = `
                <div class="task-checkbox${task.isCompleted ? ' checked' : ''}">
                     <input type="checkbox" class="sr-only">
                </div>
                <div class="task-content">
                    <p class="task-title">${escapeHtml(task.title)}</p>
                    ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
                    <div class="task-meta">
                        ${catName ? `<span class="task-category" style="border-color:${catColor}; color:${catColor}">
                            <span class="priority-indicator" style="background-color:${catColor}"></span>
                            ${escapeHtml(catName)}
                        </span>` :
                    `<span class="task-category priority-${task.priority.toLowerCase()}">
                            <span class="priority-indicator"></span>
                            ${task.priority}
                        </span>`}
                        ${dateHtml}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="action-btn delete" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </div>
            `;
            taskList.appendChild(div);
        });
    }

    async function fetchCategoriesView() {
        try {
            const categories = await apiCall(CATEGORY_API_URL);

            categoriesList.innerHTML = '';
            if (!categories || categories.length === 0) {
                categoriesList.innerHTML = '<p class="text-secondary">No categories found. Create one above.</p>';
                return;
            }

            categories.forEach(cat => {
                const div = document.createElement('div');
                div.className = 'category-card';
                div.style.borderLeft = `3px solid ${cat.color}`;
                div.innerHTML = `
                    <div class="category-header">
                        <div class="category-color-dot" style="background-color: ${cat.color}"></div>
                        <span class="category-name">${escapeHtml(cat.name)}</span>
                    </div>
                    <button class="btn-icon delete-cat-btn" title="Delete Category">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                `;

                // Click to filter (ignore if clicked on delete button)
                div.addEventListener('click', (e) => {
                    if (e.target.closest('.delete-cat-btn')) return;
                    showView('home', cat._id);
                    viewSubtitle.textContent = `Tasks in ${cat.name}`;
                });

                // Delete Logic
                const deleteBtn = div.querySelector('.delete-cat-btn');
                deleteBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    if (confirm(`Delete category "${cat.name}"? Tasks will remain but lose their category.`)) {
                        try {
                            await apiCall(`${CATEGORY_API_URL}/${cat._id}`, 'DELETE');
                            fetchCategoriesView();
                            loadCategorySelect();
                        } catch (err) {
                            console.error(err);
                            alert('Failed to delete category');
                        }
                    }
                });

                categoriesList.appendChild(div);
            });

        } catch (error) {
            console.error(error);
        }
    }

    function loadProfileView() {
        profileName.textContent = user.email.split('@')[0];
        profileEmail.textContent = user.email;
        profileRole.textContent = user.role;
        profileAvatar.textContent = user.email.charAt(0).toUpperCase();
    }

    function loadCategorySelect() {
        apiCall(CATEGORY_API_URL).then(cats => {
            categorySelect.innerHTML = '<option value="">No Category</option>';
            cats.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c._id;
                opt.textContent = c.name;
                categorySelect.appendChild(opt);
            });
        }).catch(e => console.error(e));
    }

    function escapeHtml(text) {
        if (!text) return '';
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }

    // Initial Load
    loadCategorySelect();

});