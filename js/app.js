// --- 1. GREETING, CLOCK & DATE ---
function updateClockAndGreeting() {
    const now = new Date();
    
    // Format Time (HH:MM:SS)
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('live-clock').textContent = `${hours}:${minutes}:${seconds}`;

    // Format Date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('live-date').textContent = now.toLocaleDateString('en-US', options);

    // Dynamic Greeting
    const hourNum = now.getHours();
    let timeGreeting = "Good morning";
    if (hourNum >= 12 && hourNum < 18) {
        timeGreeting = "Good afternoon";
    } else if (hourNum >= 18) {
        timeGreeting = "Good evening";
    }

    const userName = localStorage.getItem('dash_user_name') || 'Muufa';
    document.getElementById('greeting-text').textContent = `${timeGreeting}, ${userName}`;
}

setInterval(updateClockAndGreeting, 1000);
updateClockAndGreeting();

// Custom Name Challenge Handler
const editNameBtn = document.getElementById('edit-name-btn');
const nameContainer = document.getElementById('name-input-container');
const saveNameBtn = document.getElementById('save-name-btn');
const userNameInput = document.getElementById('user-name-input');

editNameBtn.addEventListener('click', () => {
    nameContainer.classList.toggle('hidden');
    userNameInput.value = localStorage.getItem('dash_user_name') || 'Muufa';
});

saveNameBtn.addEventListener('click', () => {
    const newName = userNameInput.value.trim();
    if (newName) {
        localStorage.setItem('dash_user_name', newName);
        nameContainer.classList.add('hidden');
        updateClockAndGreeting();
    }
});


// --- 2. FOCUS TIMER & CHANGE POMODORO TIME CHALLENGE ---
let timerInterval = null;
let totalSeconds = 25 * 60;
let remainingSeconds = totalSeconds;
let isRunning = false;

const timerDisplay = document.getElementById('timer-display');
const durationInput = document.getElementById('duration-input');

function updateTimerDisplay() {
    const mins = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
    const secs = String(remainingSeconds % 60).padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;
}

durationInput.addEventListener('change', () => {
    if (!isRunning) {
        const val = parseInt(durationInput.value);
        if (val > 0) {
            totalSeconds = val * 60;
            remainingSeconds = totalSeconds;
            updateTimerDisplay();
        }
    }
});

document.getElementById('start-timer').addEventListener('click', () => {
    if (!isRunning) {
        isRunning = true;
        timerInterval = setInterval(() => {
            if (remainingSeconds > 0) {
                remainingSeconds--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                isRunning = false;
                alert('Focus session completed!');
            }
        }, 1000);
    }
});

document.getElementById('stop-timer').addEventListener('click', () => {
    clearInterval(timerInterval);
    isRunning = false;
});

document.getElementById('reset-timer').addEventListener('click', () => {
    clearInterval(timerInterval);
    isRunning = false;
    remainingSeconds = totalSeconds;
    updateTimerDisplay();
});


// --- 3. TO-DO LIST (Local Storage) ---
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');

let tasks = JSON.parse(localStorage.getItem('dash_tasks')) || [];

function saveAndRenderTasks() {
    localStorage.setItem('dash_tasks', JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <input type="checkbox" ${task.completed ? 'checked' : ''} onclick="toggleTask(${index})">
                <span>${task.text}</span>
            </div>
            <button class="btn-warning" style="padding: 4px 8px; font-size: 0.8rem;" onclick="deleteTask(${index})">Delete</button>
        `;
        taskList.appendChild(li);
    });
}

addTaskBtn.addEventListener('click', () => {
    const text = taskInput.value.trim();
    if (text) {
        tasks.push({ text, completed: false });
        taskInput.value = '';
        saveAndRenderTasks();
    }
});

window.toggleTask = function(index) {
    tasks[index].completed = !tasks[index].completed;
    saveAndRenderTasks();
};

window.deleteTask = function(index) {
    tasks.splice(index, 1);
    saveAndRenderTasks();
};

renderTasks();


// --- 4. QUICK LINKS (Local Storage) ---
const linkNameInput = document.getElementById('link-name-input');
const linkUrlInput = document.getElementById('link-url-input');
const addLinkBtn = document.getElementById('add-link-btn');
const quickLinksContainer = document.getElementById('quick-links-container');

let quickLinks = JSON.parse(localStorage.getItem('dash_links')) || [
    { name: 'Google', url: 'https://google.com' },
    { name: 'GitHub', url: 'https://github.com' }
];

function saveAndRenderLinks() {
    localStorage.setItem('dash_links', JSON.stringify(quickLinks));
    renderLinks();
}

function renderLinks() {
    quickLinksContainer.innerHTML = '';
    quickLinks.forEach((link, index) => {
        const a = document.createElement('a');
        a.className = 'quick-link-chip';
        a.href = link.url;
        a.target = '_blank';
        a.innerHTML = `<span>🌐 ${link.name}</span> <span style="color:var(--danger-color); cursor:pointer;" onclick="event.preventDefault(); deleteLink(${index})">✕</span>`;
        quickLinksContainer.appendChild(a);
    });
}

addLinkBtn.addEventListener('click', () => {
    const name = linkNameInput.value.trim();
    let url = linkUrlInput.value.trim();
    if (name && url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        quickLinks.push({ name, url });
        linkNameInput.value = '';
        linkUrlInput.value = '';
        saveAndRenderLinks();
    }
});

window.deleteLink = function(index) {
    quickLinks.splice(index, 1);
    saveAndRenderLinks();
};

renderLinks();


// --- 5. LIGHT / DARK MODE CHALLENGE ---
const themeToggleBtn = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('dash_theme') || 'dark';

if (currentTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    themeToggleBtn.textContent = '🌙 Dark Mode';
}

themeToggleBtn.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'light') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('dash_theme', 'dark');
        themeToggleBtn.textContent = '☀️ Light Mode';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('dash_theme', 'light');
        themeToggleBtn.textContent = '🌙 Dark Mode';
    }
});