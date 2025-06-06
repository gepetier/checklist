const loginContainer = document.getElementById('login-container');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const todoSection = document.getElementById('todo-section');

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const listSelect = document.getElementById('list-select');
const newListName = document.getElementById('new-list-name');
const createListBtn = document.getElementById('create-list');
const logoutBtn = document.getElementById('logout-btn');

let currentUser = null;

init();

function init() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        showTodoSection(savedUser);
    } else {
        showLogin();
    }
}

loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    if (!username || !password) return;
    const hashed = await hashPassword(password);
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username]) {
        if (users[username] !== hashed) {
            loginError.textContent = 'Contrasenya incorrecta';
            return;
        }
    } else {
        users[username] = hashed;
        localStorage.setItem('users', JSON.stringify(users));
    }
    localStorage.setItem('currentUser', username);
    showTodoSection(username);
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    showLogin();
});

createListBtn.addEventListener('click', () => {
    const name = newListName.value.trim();
    if (!name) return;
    const lists = getUserLists();
    if (!lists[name]) {
        lists[name] = [];
        saveUserLists(lists);
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        listSelect.appendChild(option);
        listSelect.value = name;
        newListName.value = '';
        loadTasks();
    }
});

listSelect.addEventListener('change', loadTasks);

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const text = input.value.trim();
    if (text !== '') {
        addTodo(text, false);
        input.value = '';
        input.focus();
        saveTasks();
    }
});

function addTodo(text, completed) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    if (completed) li.classList.add('completed');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = completed;
    checkbox.addEventListener('change', () => {
        li.classList.toggle('completed', checkbox.checked);
        saveTasks();
    });

    const span = document.createElement('span');
    span.textContent = text;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Esborra';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => {
        list.removeChild(li);
        saveTasks();
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    list.appendChild(li);
}

function showLogin() {
    loginContainer.style.display = 'block';
    todoSection.style.display = 'none';
    loginError.textContent = '';
    loginForm.reset();
}

function showTodoSection(username) {
    currentUser = username;
    loginContainer.style.display = 'none';
    todoSection.style.display = 'block';
    loadLists();
}

function loadLists() {
    const lists = getUserLists();
    listSelect.innerHTML = '';
    for (const name in lists) {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        listSelect.appendChild(option);
    }
    if (listSelect.options.length > 0) {
        listSelect.value = listSelect.options[0].value;
        loadTasks();
    } else {
        list.innerHTML = '';
    }
}

function loadTasks() {
    list.innerHTML = '';
    const lists = getUserLists();
    const tasks = lists[listSelect.value] || [];
    tasks.forEach(task => addTodo(task.text, task.completed));
}

function saveTasks() {
    const lists = getUserLists();
    const tasks = [];
    document.querySelectorAll('#todo-list .todo-item').forEach(li => {
        tasks.push({
            text: li.querySelector('span').textContent,
            completed: li.classList.contains('completed')
        });
    });
    lists[listSelect.value] = tasks;
    saveUserLists(lists);
}

function getUserLists() {
    return JSON.parse(localStorage.getItem('lists_' + currentUser) || '{}');
}

function saveUserLists(lists) {
    localStorage.setItem('lists_' + currentUser, JSON.stringify(lists));
}

async function hashPassword(pw) {
    const encoder = new TextEncoder();
    const data = encoder.encode(pw);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}
