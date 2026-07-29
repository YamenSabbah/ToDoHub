const checkSvg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];



document.addEventListener('DOMContentLoaded', async () => {
    const user = await getUser();
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    document.querySelector("nav .fw-bold").textContent = user.username;
    renderTasks();
    populateDaySelect();
});

let tasks = [];

function getToday() {
    return days[new Date().getDay()];
}

async function renderTasks() {
    const res = await fetch("/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            query: `{ getAllTasks { id name description day isCompleted } }`
        })
    });

    const data = await res.json();
    tasks = data.data.getAllTasks;
    renderTaskBoard(tasks);
}

function renderTaskBoard(taskList) {
    const board = document.getElementById('taskBoard');
    board.innerHTML = '';

    const grouped = {};
    taskList.forEach(function (task, index) {
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
                    <div class="task-check ${task.isCompleted ? 'completed' : ''}" data-index="${task.id}">
                        ${task.isCompleted ? checkSvg : ''}
                    </div>
                    <div>
                        <h6 class="text-white fw-bold mb-1 ${task.isCompleted ? 'text-decoration-line-through' : ''}">${task.name}</h6>
                        <small class="text-white-50">${task.description}</small>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <button class="btn btn-success btn-task-action btn-update px-3 py-1 rounded-3 fw-semibold" data-index="${task.id}">Edit</button>
                    <button class="btn btn-danger btn-task-action btn-delete px-3 py-1 rounded-3 fw-semibold" data-index="${task.id}">Delete</button>
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
        check.addEventListener('click', async function () {
            const id = this.dataset.index;
            const task = tasks.find(t => String(t.id) === id);
            if (!task) return;

            // Optimistic update: toggle immediately for instant feedback
            const prevState = task.isCompleted;
            task.isCompleted = !prevState;
            renderTaskBoard(tasks);

            // Sync to server in the background
            try {
                const res = await fetch("/graphql", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        query: `
                            mutation UpdateTaskChecked($id: ID!, $isCompleted: Boolean!) {
                                updateTaskChecked(id: $id, isCompleted: $isCompleted) {
                                    id
                                    isCompleted
                                }
                            }
                        `,
                        variables: {
                            id: id,
                            isCompleted: task.isCompleted,
                        },
                    }),
                });
                const result = await res.json();
                if (result.errors) {
                    // Rollback on error
                    task.isCompleted = prevState;
                    renderTaskBoard(tasks);
                    console.error("Failed to update task:", result.errors);
                }
            } catch (err) {
                // Rollback on network error
                task.isCompleted = prevState;
                renderTaskBoard(tasks);
                console.error("Network error:", err);
            }
        });
    });

    document.querySelectorAll('.btn-update').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const id = this.dataset.index;
            const task = tasks.find(t => String(t.id) === id);
            if (!task) return;

            // Pre-fill the edit form with current task data
            document.getElementById('editTaskId').value = task.id;
            document.getElementById('editTaskName').value = task.name;
            document.getElementById('editTaskDesc').value = task.description;

            // Populate and set the day select
            const daySelect = document.getElementById('editTaskDay');
            populateDaySelectForEdit(daySelect, task.day);

            // Show the edit modal
            const editModal = new bootstrap.Modal(document.getElementById('editTaskModal'));
            editModal.show();
        });
    });

    document.querySelectorAll('.btn-delete').forEach(function (btn) {
        btn.addEventListener('click', async function () {
            const id = this.dataset.index;
            if (!confirm('Are you sure you want to delete this task?')) return;

            // Save the task for rollback before removing it
            const deletedTask = tasks.find(t => String(t.id) === id);
            if (!deletedTask) return;

            // Optimistic removal from UI
            tasks = tasks.filter(t => String(t.id) !== id);
            renderTaskBoard(tasks);

            try {
                const res = await fetch("/graphql", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        query: `
                            mutation DeleteTask($id: ID!) {
                                deleteTask(id: $id)
                            }
                        `,
                        variables: { id },
                    }),
                });
                const result = await res.json();
                if (result.errors) {
                    throw new Error(result.errors[0].message);
                }
            } catch (err) {
                // Rollback: restore the task
                tasks.push(deletedTask);
                renderTaskBoard(tasks);
                console.error("Failed to delete task:", err);
                alert("Failed to delete task. Please try again.");
            }
        });
    });
}
//*--------------------------> Function for button add Task <----------------------------------

document.getElementById('addTaskForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const name = document.getElementById('taskName').value.trim();
    const desc = document.getElementById('taskDesc').value.trim();
    const day = document.getElementById('taskDay').value;
    if (!name || !desc) return;

    // Create temp task locally for instant display
    const tempId = `temp-${Date.now()}`;
    const tempTask = {
        id: tempId,
        name,
        description: desc,
        day,
        isCompleted: false,
    };

    tasks.unshift(tempTask);
    renderTaskBoard(tasks);

    // Close modal and reset form immediately
    this.reset();
    populateDaySelect();
    bootstrap.Modal.getInstance(document.getElementById('addTaskModal')).hide();

    // Sync to server in the background
    try {
        const res = await fetch("/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                query: `
                    mutation CreateTask($name: String!, $desc: String!, $day: Day!) {
                        createTask(name: $name, description: $desc, day: $day) {
                            id
                            name
                            description
                            day
                            isCompleted
                        }
                    }
                `,
                variables: {
                    name: name,
                    desc: desc,
                    day: day,
                },
            }),
        });
        const result = await res.json();
        if (result.errors) {
            throw new Error(result.errors[0].message);
        }

        // Swap temp task with the real task from server
        const realTask = result.data.createTask;
        const tempIndex = tasks.findIndex(t => t.id === tempId);
        if (tempIndex !== -1) {
            tasks[tempIndex] = { ...realTask, description: realTask.description || desc };
            renderTaskBoard(tasks);
        }
    } catch (err) {
        // Remove temp task on error
        tasks = tasks.filter(t => t.id !== tempId);
        renderTaskBoard(tasks);
        console.error("Failed to create task:", err);
    }
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

function populateDaySelectForEdit(select, selectedDay) {
    select.innerHTML = '';
    days.forEach(function (day) {
        const option = document.createElement('option');
        option.value = day;
        option.textContent = day + (day === getToday() ? ' (Today)' : '');
        if (day === selectedDay) option.selected = true;
        select.appendChild(option);
    });
}
//>--------------------------------------------------------------------------
//> ------------------ Render the name of the account <----------------------
//>--------------------------------------------------------------------------


async function getUser() {
    const res = await fetch("/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            query: `{ getUser { username email } }`
        })
    });
    const result = await res.json();
    return result.data?.getUser || null;
}

//*--------------------------> Function for Edit Task Form Submit (Optimistic) <---------------

document.getElementById('editTaskForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const id = document.getElementById('editTaskId').value;
    const name = document.getElementById('editTaskName').value.trim();
    const desc = document.getElementById('editTaskDesc').value.trim();
    const day = document.getElementById('editTaskDay').value;
    if (!name || !desc) return;

    // Find the task and save previous state for rollback
    const taskIndex = tasks.findIndex(t => String(t.id) === id);
    if (taskIndex === -1) return;
    const prevTask = { ...tasks[taskIndex] };

    // Optimistic update: apply changes immediately
    tasks[taskIndex] = { ...tasks[taskIndex], name, description: desc, day };
    renderTaskBoard(tasks);

    // Close modal and reset form
    this.reset();
    bootstrap.Modal.getInstance(document.getElementById('editTaskModal')).hide();

    // Sync to server in the background
    try {
        const res = await fetch("/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                query: `
                    mutation EditTask($id: ID!, $name: String!, $desc: String!, $day: Day!) {
                        editTask(id: $id, name: $name, description: $desc, day: $day) {
                            id
                            name
                            description
                            day
                        }
                    }
                `,
                variables: {
                    id: id,
                    name: name,
                    desc: desc,
                    day: day,
                },
            }),
        });
        const result = await res.json();
        if (result.errors) {
            throw new Error(result.errors[0].message);
        }

        // Sync the server response (e.g. sanitized description) to local state
        const serverTask = result.data.editTask;
        if (serverTask) {
            tasks[taskIndex] = { ...tasks[taskIndex], ...serverTask, description: serverTask.description || desc };
            renderTaskBoard(tasks);
        }
    } catch (err) {
        // Rollback to previous state on error
        tasks[taskIndex] = prevTask;
        renderTaskBoard(tasks);
        console.error("Failed to update task:", err);
        alert("Failed to save changes. The task has been reverted.");
    }
});

