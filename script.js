let tasks = [];

function updateTasksLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(tasks))
}
function getNewestTasksLocalStorageOrEmpty() {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
}

function updateCounter() {
    tasks = getNewestTasksLocalStorageOrEmpty();
    let tasksCount = tasks.length;
    let doneTasksCount = tasks.filter(it => it.done == true).length;
    
    $("#counter").text(`${tasksCount} zadań, ${doneTasksCount} wykonane`);
}

function getNewTaskId() {
    return getNewestTasksLocalStorageOrEmpty().length + 1;
}

function getTaskNameInput() {
    return $("#new-task").val();
}

function printOutNewestTasks() {
    tasks = getNewestTasksLocalStorageOrEmpty();
    
    const tasksList = $("#list");
    tasksList.empty();
    
    tasks.forEach(function(task) {
        const newTaskHTMLstring = `
            <li>
                <div class='task-container'>
                    <h2>${task.taskName}</h2>
                    <p>id: ${task.id}</p>
                    <input type='hidden' value='${task.id}'>
                    Done: <input type='checkbox' class='doneCheckbox' ${task.done ? "checked" : ""}>
                    <p>Created at: ${task.createdAt}</p>
                    <button class='delete-btn'>delete task</button>
                </div>
            </li>
        `;

        // Convert HTML string to a jQuery object so we can animate it
        const $newTask = $(newTaskHTMLstring).hide();

        // Append first, then fade in
        tasksList.append($newTask);
        $newTask.fadeIn(400); // 400ms is the default duration
    });
}
function verifyTaskName() {
    const taskName = getTaskNameInput();

    if ((taskName.length < 3) || (taskName.trim() == "")) {
        return false;
    }
    return true;
}

function reautoIncrementTasks() {
    tasks.forEach((task, index) => {
        task.id = index + 1;
    });
    updateTasksLocalStorage();
}

function addTaskAndUpdateLocalStorage() {
    const taskNameInput = getTaskNameInput();
    const newTask = {id: getNewTaskId(), taskName: taskNameInput, done: false, createdAt: new Date};
    tasks.push(newTask);

    $("#new-task").val("");
    updateTasksLocalStorage();
    updateCounter();
}

$("#add-form").on("submit", function(e) {
    e.preventDefault();
    if (verifyTaskName()){
        addTaskAndUpdateLocalStorage();
        updateCounter();
        printOutNewestTasks();
    }
});

$("#clearStorageTest").click(() => {
    localStorage.removeItem("tasks");
    printOutNewestTasks();
    updateCounter();
});

$(document).ready(() => {
    printOutNewestTasks();
    updateCounter();
});

$("#list").on("change", ".doneCheckbox", function(){
    tasks = getNewestTasksLocalStorageOrEmpty();
    
    const hiddenInput = $(this).closest(".task-container").find("input[type='hidden']");
    const taskId = hiddenInput.val();

    let task = tasks.find(it => it.id == taskId);
    if (task) {
        task.done = $(this).is(":checked");
    }
    
    localStorage.setItem("tasks", JSON.stringify(tasks));
    updateCounter();
});

$("#list").on("click", ".delete-btn", function() {
    tasks = getNewestTasksLocalStorageOrEmpty();

    const $li = $(this).closest("li"); // fade the whole <li>
    const taskId = parseInt($li.find("input[type='hidden']").val(), 10);

    // Animate fade out, then update tasks and re-render
    $li.fadeOut(400, () => {
        // Remove task from array
        tasks = tasks.filter(task => task.id !== taskId);

        // Reassign IDs
        tasks.forEach((task, index) => task.id = index + 1);

        // Save to localStorage
        updateTasksLocalStorage();

        // Update UI and counter
        printOutNewestTasks();
        updateCounter();
    });
});