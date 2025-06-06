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
        addListOption(name);
        newListName.value = '';
        loadTasks(name);
    }
});

function addListOption(name) {
    const option = document.createElement('div');
    option.className = 'dropdown-item';
    option.textContent = name;
    option.addEventListener('click', () => {
        loadTasks(name);
    });
    listSelectContainer.appendChild(option);
}

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

function loadLists() {
    const lists = getUserLists();
    listSelectContainer.innerHTML = '';
    Object.keys(lists).forEach(name => {
        addListOption(name);
    });
    if (Object.keys(lists).length > 0) {
        loadTasks(Object.keys(lists)[0]);
    }
}

function loadTasks(listName) {
    const lists = getUserLists();
    list.innerHTML = '';
    (lists[listName] || []).forEach(task => {
        addTodo(task.text, task.completed);
    });
    listMenu.textContent = `<i class="bi bi-list"></i> ${listName || 'Llistes'}`;
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
