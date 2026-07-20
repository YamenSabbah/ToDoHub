const checkSvg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const sampleTasks = [
    { name: 'Design new landing page', desc: 'Create wireframes and mockups for the new homepage layout.', day: 'Sunday', done: false },
    { name: 'Build auth system', desc: 'Implement login, register, and password reset functionality.', day: 'Sunday', done: false },
    { name: 'Ship feature v2.0', desc: 'Deploy the latest version to production environment.', day: 'Saturday', done: true },
];

let tasks = JSON.parse(localStorage.getItem('tasks')) || sampleTasks;

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getToday() {
    return days[new Date().getDay()];
}

function renderTasks() {
    const board = document.getElementById('taskBoard');
    board.innerHTML = '';

    const grouped = {};
    tasks.forEach(function (task, index) {
        if (!grouped[task.day]) grouped[task.day] = [];
        grouped[task.day].push({ ...task, index: index });
    });

    const today = getToday();
    const dayOrder = [];
    const todayIdx = days.indexOf(today);
    for (let i = 0; i < 7; i++) {
        dayOrder.push(days[(todayIdx + i) % 7]);
    }

    dayOrder.forEach(function (day) {
        if (!grouped[day]) return;

        const section = document.createElement('div');
        section.className = 'day-section';

        const isToday = day === today;
        section.innerHTML = `
            <div class="day-header d-flex align-items-center gap-2 mb-3">
                <span class="day-label text-warning">${day}</span>
                ${isToday ? '<span class="badge bg-primary rounded-pill">Today</span>' : ''}
                <span class="task-count text-white-50 small">${grouped[day].length} task${grouped[day].length > 1 ? 's' : ''}</span>
            </div>
            <div class="d-flex flex-column gap-3 day-tasks"></div>
        `;

        const container = section.querySelector('.day-tasks');

        grouped[day].forEach(function (task) {
            const row = document.createElement('div');
            row.className = 'task-row d-flex align-items-center justify-content-between p-4 rounded-4';
            row.innerHTML = `
                <div class="d-flex flex-row align-items-center gap-3 flex-grow-1 text-start">
                    <div class="task-check ${task.done ? 'completed' : ''}" data-index="${task.index}">
                        ${task.done ? checkSvg : ''}
                    </div>
                    <div>
                        <h6 class="text-white fw-bold mb-1 ${task.done ? 'text-decoration-line-through' : ''}">${task.name}</h6>
                        <small class="text-white-50">${task.desc}</small>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <button class="btn btn-success btn-task-action btn-update px-3 py-1 rounded-3 fw-semibold" data-index="${task.index}">Update</button>
                    <button class="btn btn-danger btn-task-action btn-delete px-3 py-1 rounded-3 fw-semibold" data-index="${task.index}">Delete</button>
                </div>
            `;
            container.appendChild(row);
        });

        board.appendChild(section);
    });

    attachEvents();
}

function attachEvents() {
    document.querySelectorAll('.task-check').forEach(function (check) {
        check.style.cursor = 'pointer';
        check.addEventListener('click', function () {
            const idx = parseInt(this.dataset.index);
            tasks[idx].done = !tasks[idx].done;
            saveTasks();
            renderTasks();
        });
    });

    document.querySelectorAll('.btn-delete').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const idx = parseInt(this.dataset.index);
            tasks.splice(idx, 1);
            saveTasks();
            renderTasks();
        });
    });
}
//*--------------------------> Function for button add Task <----------------------------------

document.getElementById('addTaskForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('taskName').value.trim();
    const desc = document.getElementById('taskDesc').value.trim();
    const day = document.getElementById('taskDay').value;
    if (!name || !desc) return;

    tasks.unshift({
        name: name,
        desc: desc,
        day: day,
        done: false
    });

    saveTasks();
    renderTasks();
    this.reset();
    populateDaySelect();
    bootstrap.Modal.getInstance(document.getElementById('addTaskModal')).hide();
});

function populateDaySelect() {
    const select = document.getElementById('taskDay');
    select.innerHTML = '';
    days.forEach(function (day) {
        const option = document.createElement('option');
        option.value = day;
        option.textContent = day + (day === getToday() ? ' (Today)' : '');
        if (day === getToday()) option.selected = true;
        select.appendChild(option);
    });
}

populateDaySelect();
renderTasks();
