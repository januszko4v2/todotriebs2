let tasks = [];

function updateTasksLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(tasks))
}
function getNewestTasksLocalStorageOrEmpty() {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
}

// zeby nie sprawdzal tasks tylko aktualnie wyswietlone taski
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
                <div class='task-container ${task.done ? "done" : ""}'>
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
function printOutTasksAtoZ() {
    tasks = getNewestTasksLocalStorageOrEmpty();
    tasks.sort((a, b) => a.taskName.localeCompare(b.taskName));
    updateTasksLocalStorage();
    printOutNewestTasks();
}
function printOutTasksByDate() {
    tasks = getNewestTasksLocalStorageOrEmpty();
    tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    updateTasksLocalStorage();
    printOutNewestTasks();
}
function verifyTaskName() {
    const taskName = getTaskNameInput();

    if ((taskName.trim().length < 3)) {
        return false;
    }
    return true;
}

function addTaskAndUpdateLocalStorage() {
    const taskNameInput = getTaskNameInput();
    const newTask = {id: getNewTaskId(), taskName: taskNameInput, done: false, createdAt: new Date};
    tasks.push(newTask);

    $("#new-task").val("");
    updateTasksLocalStorage();
    updateCounter();
}
function printOutDoneTasks() {
    tasks = getNewestTasksLocalStorageOrEmpty();
    const doneTasks = tasks.filter(it => it.done == true);
    const tasksList = $("#list");
    tasksList.empty();
    if (doneTasks.length == 0) {
        tasksList.append("<p>No done tasks found.</p>");
        return;
    }
    
    doneTasks.forEach(function(task) {
        const newTaskHTMLstring = `
            <li>
                <div class='task-container ${task.done ? "done" : ""}'>
                    <h2>${task.taskName}</h2>
                    <p>id: ${task.id}</p>
                    <input type='hidden' value='${task.id}'>
                    Done: <input type='checkbox' class='doneCheckbox' ${task.done ? "checked" : ""}>
                    <p>Created at: ${task.createdAt}</p>
                    <button class='delete-btn'>delete task</button>
                </div>
            </li>
        `;
        const $newTask = $(newTaskHTMLstring).hide();
        tasksList.append($newTask);
        $newTask.fadeIn(400);
    });
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
$("#sort-alpha").click(() => {
    printOutTasksAtoZ();
    $("#search").val("");
});
$("#sort-added").click(() => {
    printOutTasksByDate();
    $("#search").val("");
});
$("[data-filter='done']").click(() => {
    printOutDoneTasks();
});
$("[data-filter='all']").click(() => {
    printOutNewestTasks();  
});
$("#deleteDoneTasksConfirm-btn").click(() => {
    if (confirm("Delete all done tasks?")) {
        tasks = getNewestTasksLocalStorageOrEmpty();

        tasks = tasks.filter(it => it.done == false);
        tasks.forEach((task, index) => task.id = index + 1);

        updateTasksLocalStorage();

        // Update UI and counter
        printOutNewestTasks();
        updateCounter();
    }
});

$("#search").on("input", () => {
    tasks = getNewestTasksLocalStorageOrEmpty();
    let searchText = $("#search").val();

    let tasksStartingWithSearch = tasks.filter(it => it.taskName.toLowerCase().includes(searchText.toLowerCase()));


    $("#list").empty();
    tasksStartingWithSearch.forEach(function(task) {
    const newTaskHTMLstring = `
        <li>
            <div class='task-container ${task.done ? "done" : ""}'>
                <h2>${task.taskName}</h2>
                <p>id: ${task.id}</p>
                <input type='hidden' value='${task.id}'>
                Done: <input type='checkbox' class='doneCheckbox' ${task.done ? "checked" : ""}>
                <p>Created at: ${task.createdAt}</p>
                <button class='delete-btn'>delete task</button>
            </div>
        </li>
    `;
    $("#list").append(newTaskHTMLstring);
    });
});


$("#list").on("change", ".doneCheckbox", function(){
    tasks = getNewestTasksLocalStorageOrEmpty();
    
    const $taskContainer = $(this).closest(".task-container");
    const hiddenInput = $(this).closest(".task-container").find("input[type='hidden']");
    const taskId = hiddenInput.val();

    let task = tasks.find(it => it.id == taskId);
    if (task) {
        task.done = $(this).is(":checked");
    }
    $taskContainer.toggleClass("done", task.done);
    
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

$("#export-btn").click(function() {
    $("#export-textarea").val(JSON.stringify(getNewestTasksLocalStorageOrEmpty()));
});

$("#import-btn").click(function() {
    try {
        tasks = JSON.parse($("#import-textarea").val())
        updateTasksLocalStorage();

        printOutNewestTasks();
        updateCounter();
        $("#import-textarea").val("");
    }
    catch (e) {
        alert("Invalid JSON");
    }
});