const API_URL = '/api/tasks';

// Init
document.addEventListener('DOMContentLoaded', () => {
    fetchTasks();
    const today = new Date();
    document.getElementById('date-display').innerText = today.toDateString();
});

// Toggle Form Visibility
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

// 1. Fetch & Render
async function fetchTasks() {
    const response = await fetch(API_URL);
    const tasks = await response.json();
    const list = document.getElementById('taskList');
    list.innerHTML = '';

    tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = 'task-item';
        
        // Priority Color Dot
        const priorityColor = task.priority === 'High' ? '#db4c3f' : (task.priority === 'Medium' ? '#f5a623' : 'grey');

        div.innerHTML = `
            <button class="check-circle ${task.isCompleted ? 'completed' : ''}" 
                    style="border-color: ${priorityColor}"
                    onclick="toggleComplete('${task._id}', ${!task.isCompleted})">
                ${task.isCompleted ? '✔' : ''}
            </button>
            
            <div class="task-content">
                <p class="task-title ${task.isCompleted ? 'completed-text' : ''}">${task.title}</p>
                <p class="task-desc">${task.description}</p>
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

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority })
    });

    // Reset Form
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    form.classList.add('hidden');
    formBtn.classList.remove('hidden');
    
    fetchTasks();
});

// 3. Toggle Complete
async function toggleComplete(id, status) {
    await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: status })
    });
    fetchTasks();
}

// 4. Delete
async function deleteTask(id) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchTasks();
}