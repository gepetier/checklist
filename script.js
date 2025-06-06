const loginContainer = document.getElementById('login-container');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const todoSection = document.getElementById('todo-section');
const listSelectContainer = document.getElementById('list-select-container');

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const newListName = document.getElementById('new-list-name');
const createListBtn = document.getElementById('create-list');
const logoutBtn = document.getElementById('logout-btn');
const listMenu = document.getElementById('listMenu');

let currentUser = null;

// Funció per mostrar els errors de login
function showError(message) {
    const errorElement = document.getElementById('login-error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 3000);
}

// Funció per mostrar la secció de tasques
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('login-container').classList.add('d-none');
            document.getElementById('todo-section').classList.remove('d-none');
            document.getElementById('logout-btn').classList.remove('d-none');
            loadLists();
        } else {
            showError(data.message || 'Error al iniciar sessió');
        }
    } catch (error) {
        showError('Error de connexió al servidor');
    }
});

// Funció per gestionar el logout
document.getElementById('logout-btn').addEventListener('click', () => {
    fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include',
    })
    .then(() => {
        document.getElementById('login-container').classList.remove('d-none');
        document.getElementById('todo-section').classList.add('d-none');
        document.getElementById('logout-btn').classList.add('d-none');
        document.getElementById('todo-list').innerHTML = '';
        document.getElementById('list-select-container').innerHTML = '';
    });
});

// Funció per carregar les llistes del usuari
async function loadLists() {
    try {
        const response = await fetch('http://localhost:5000/api/lists', {
            credentials: 'include',
        });

        if (response.ok) {
            const lists = await response.json();
            updateListSelect(lists);
            if (lists.length > 0) {
                loadTasks(lists[0]._id);
            }
        }
    } catch (error) {
        console.error('Error al carregar les llistes:', error);
    }
}

// Funció per crear una nova llista
document.getElementById('create-list').addEventListener('click', async (e) => {
    e.preventDefault();
    const listName = document.getElementById('new-list-name').value.trim();
    if (!listName) return;

    try {
        const response = await fetch('http://localhost:5000/api/lists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ name: listName }),
        });

        if (response.ok) {
            const newList = await response.json();
            updateListSelect([newList]);
            loadTasks(newList._id);
            document.getElementById('new-list-name').value = '';
        }
    } catch (error) {
        console.error('Error al crear la llista:', error);
    }
});

// Funció per actualitzar el menú desplegable de llistes
function updateListSelect(lists) {
    const container = document.getElementById('list-select-container');
    container.innerHTML = lists.map(list => `
        <button class="dropdown-item" onclick="loadTasks('${list._id}')">
            ${list.name}
        </button>
    `).join('');
}

// Funció per carregar les tasques d'una llista
async function loadTasks(listId) {
    try {
        const response = await fetch(`http://localhost:5000/api/lists/${listId}/tasks`, {
            credentials: 'include',
        });

        if (response.ok) {
            const tasks = await response.json();
            updateTaskList(tasks);
        }
    } catch (error) {
        console.error('Error al carregar les tasques:', error);
    }
}

// Funció per actualitzar la llista de tasques
function updateTaskList(tasks) {
    const listElement = document.getElementById('todo-list');
    listElement.innerHTML = tasks.map(task => `
        <div class="list-group-item d-flex justify-content-between align-items-center">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" 
                       onchange="toggleTask('${task._id}', ${task.completed})" 
                       ${task.completed ? 'checked' : ''}>
                <label class="form-check-label">${task.text}</label>
            </div>
            <button class="btn btn-danger btn-sm" onclick="deleteTask('${task._id}')">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `).join('');
}

// Funció per afegir una nova tasca
document.getElementById('todo-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = document.getElementById('todo-input').value.trim();
    if (!text) return;

    try {
        const response = await fetch('http://localhost:5000/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ text }),
        });

        if (response.ok) {
            document.getElementById('todo-input').value = '';
            loadTasks();
        }
    } catch (error) {
        console.error('Error al afegir la tasca:', error);
    }
});

// Funció per marcar/desmarcar una tasca com a completada
async function toggleTask(taskId, completed) {
    try {
        await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ completed: !completed }),
        });
        loadTasks();
    } catch (error) {
        console.error('Error al marcar la tasca:', error);
    }
}

// Funció per eliminar una tasca
async function deleteTask(taskId) {
    if (!confirm('¿Estàs segur que vols eliminar aquesta tasca?')) return;

    try {
        await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        loadTasks();
    } catch (error) {
        console.error('Error al eliminar la tasca:', error);
    }
}

init();

function init() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        showTodoSection(savedUser);
    } else {
        showLogin();
    }
}

function showLogin() {
    loginContainer.classList.remove('d-none');
    todoSection.classList.add('d-none');
    logoutBtn.classList.add('d-none');
}

function showTodoSection(username) {
    currentUser = username;
    loginContainer.classList.add('d-none');
    todoSection.classList.remove('d-none');
    logoutBtn.classList.remove('d-none');
    loadLists();
    loadTasks();
}

function addTodo(text, completed) {
    const li = document.createElement('div');
    li.className = 'list-group-item todo-item';
    if (completed) li.classList.add('completed');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'form-check-input me-2';
    checkbox.checked = completed;
    checkbox.addEventListener('change', () => {
        li.classList.toggle('completed', checkbox.checked);
        saveTasks();
    });

    const span = document.createElement('span');
    span.textContent = text;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger btn-sm ms-auto';
    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
    deleteBtn.addEventListener('click', () => {
        li.remove();
        saveTasks();
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    list.appendChild(li);
}

function saveTasks() {
    const lists = getUserLists();
    const selectedList = listMenu.textContent.split(' ')[1];
    lists[selectedList] = Array.from(list.children).map(li => ({
        text: li.querySelector('span').textContent,
        completed: li.classList.contains('completed')
    }));
    saveUserLists(lists);
}

function getUserLists() {
    return JSON.parse(localStorage.getItem(`lists_${currentUser}`) || '{}');
}

function saveUserLists(lists) {
    localStorage.setItem(`lists_${currentUser}`, JSON.stringify(lists));
}

async function hashPassword(pw) {
    const encoder = new TextEncoder();
    const data = encoder.encode(pw);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}
