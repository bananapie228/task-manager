const API_URL = '/api/tasks';

// Init
document.addEventListener('DOMContentLoaded', () => {
    fetchTasks();
    const today = new Date();
    document.getElementById('date-display').innerText = today.toDateString();
});

const formBtn = document.getElementById('showFormBtn');
const form = document.getElementById('taskForm');
const cancelBtn = document.getElementById('cancelBtn');

formBtn.addEventListener('click', () => {
    form.classList.remove('hidden');
    formBtn.classList.add('hidden');
});

cancelBtn.addEventListener('click', () => {
    form.classList.add('hidden');
    formBtn.classList.remove('hidden');
});


async function fetchTasks() {
    const response = await fetch(API_URL);
    const tasks = await response.json();
    const list = document.getElementById('taskList');
    list.innerHTML = '';

    tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = 'task-item';
        
        // Determine Priority Color
        let pColor = 'grey';
        if (task.priority === 'High') pColor = '#db4c3f';
        if (task.priority === 'Medium') pColor = '#f5a623';

        const categoryName = task.category ? task.category.name : ''; 
        const categoryBadge = categoryName 
            ? `<span class="category-tag">${categoryName}</span>` 
            : '';

        div.innerHTML = `
            <div class="task-left">
                <button class="check-circle ${task.isCompleted ? 'completed' : ''}" 
                        style="border-color: ${pColor}; ${task.isCompleted ? 'background-color:'+pColor : ''}"
                        onclick="toggleComplete('${task._id}', ${!task.isCompleted})">
                    ${task.isCompleted ? '✔' : ''}
                </button>
                
                <div class="task-content">
                    <p class="task-title ${task.isCompleted ? 'completed-text' : ''}">
                        ${task.title}
                    </p>
                    ${task.description ? `<p class="task-desc">${task.description}</p>` : ''}
                    
                    ${categoryBadge}
                </div>
            </div>

            <button class="delete-btn" onclick="deleteTask('${task._id}')">🗑</button>
        `;
        list.appendChild(div);
    });
}

// 2. Add Task
document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const priority = document.getElementById('priority').value;
    // Get the selected category ID
    const category = document.getElementById('categorySelect').value; 

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            title, 
            description, 
            priority,
            category: category || null // Send ID or null if empty
        })
    });

    // ... (rest of your reset code) ...
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    form.classList.add('hidden');
    formBtn.classList.remove('hidden');
    
    fetchTasks();
});

// 
async function toggleComplete(id, status) {
    await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: status })
    });
    fetchTasks();
}

// delete
async function deleteTask(id) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchTasks();
}

async function loadCategories() {
    const res = await fetch('/api/categories');
    const categories = await res.json();
    
    const select = document.getElementById('categorySelect');
    // Keep the first default option
    select.innerHTML = '<option value="">Select Category</option>';
    
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat._id; // The value is the ID (needed for database)
        option.textContent = cat.name;
        select.appendChild(option);
    });
}

// Simple way to create a category using a popup
async function createNewCategory() {
    const name = prompt("Enter new category name (e.g., Work, Personal):");
    if (name) {
        await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        loadCategories(); // Refresh the list
    }
}

// Load categories when page starts
loadCategories();