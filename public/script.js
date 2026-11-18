const firebaseConfig = {
    apiKey: "AIzaSyAv7LojAw2c_3bpSFyYpbZfCdr3Tm7so2Q",
    authDomain: "fit2101-cc7bc.firebaseapp.com",
    databaseURL: "https://fit2101-cc7bc-default-rtdb.firebaseio.com",
    projectId: "fit2101-cc7bc",
    storageBucket: "fit2101-cc7bc.appspot.com",
    messagingSenderId: "707950173273",
    appId: "1:707950173273:web:42aa3d6f3bf2be4a112548"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Global array that helps with prefilling the edit form
let taskNames = [];

let global_count = 0;

let contributionChart;

let sprintTaskNames=[];

let currentSprint = '';

let burndownChart;

let SprintEvent;

let DoneEvent;

let currentUser = '' // Variable to store the logged in user

let selectedTags = {
    'tags': [],
    'edit-tags': []
};

const colorPriority = {
    'Important': ['#e06708', '#522604'],
    'Medium': ['#e08a00', '#4a2c00'],
    'Low': ['#59AB90', '#2e4d3b'],
    'Urgent': ['#e83013', '#4a0d0a']
}

const colorStatus = {
    'Not Started': ['#f0ad4e', '#4d3a1a'], 
    'In Progress': ['#5bc0de', '#1c4b4f'], 
    'Completed': ['#5cb85c', '#184a18'] 
};

const colorTags = {
    'Frontend': ['#d6b3e6', '#f3e9fd'], // Light Purple
    'Backend': ['#a3d8e6', '#eaf7f9'], // Light Cyan
    'UI': ['#99cfff', '#e6f3ff'], // Light Blue
    'UX': ['#a8e6a1', '#eaf7ea'], // Light Green
    'Database': ['#b3a6e6', '#f0e9fd'], // Light Indigo
    'API': ['#ffc299', '#fff2e6'], // Light Orange
    'Testing': ['#a1e6d1', '#eaf7f3'], // Light Teal
    'Framework': ['#c2c2c2', '#f2f2f2'] // Light Gray
};

const colorStages = {
    'Planning': ['#ba2793', '#591246'],
    'Development': ['#017a8a', '#013238'],
    'Testing': ['#9370DB', '#4B0082'],
    'Integration': ['#f799a0', '#75484b'],
}

// Loads all taskCards from Firebase when the window is loaded
window.onload = function() {
    // Load tasks from Firebase
    // reloadTaskCards();
    sortTasks('date-asc')

    // Hide add sprint button
    const addSprintButton = document.querySelector('.add-sprint-btn');
    if (addSprintButton) {
        addSprintButton.style.display = 'none';
    }

    // Hide the add new member button
    const addMemberButton = document.querySelector('.add-new-member-btn');
    if (addMemberButton) {
        addMemberButton.style.display = 'none';
    }

    showProductBacklog();
    setActiveMenuItem('backlog');
}

// Function to get the appropriate color based on the mode
function getColorForMode(lightColor, darkColor) {
    return document.body.classList.contains('light-mode') ? lightColor : darkColor;
}

window.initialTeamMembers = new Set();

// Fetch team members from Firebase
const fetchTeamMembers = async () => {
    // Clear the initialTeamMembers set
    window.initialTeamMembers.clear();

    try {
        const snapshot = await firebase.database().ref('users').once('value');
        const data = snapshot.val();
        if (data) {
            Object.values(data).forEach(member => {
                if (member.username) {
                    window.initialTeamMembers.add(member.username);
                }
            });
        }
        console.log(Array.from(window.initialTeamMembers));
    } catch (error) {
        console.error('Error fetching team members:', error);
    }
};

// Function to show the overlay (Dims background)
function showOverlay() {
    document.getElementById('overlay').style.display = 'block';
}

// Function to hide the overlay
function hideOverlay() {
    document.getElementById('overlay').style.display = 'none';
}

// Function to show the popup overlay (Dims extended card popup)
function showPopupOverlay() {
    document.getElementById('popupoverlay').style.display = 'block';
}

// Function to hide the popup overlay
function hidePopupOverlay() {
    document.getElementById('popupoverlay').style.display = 'none';
}

// Handle opening and closing the task form
function openTaskForm() {
    document.getElementById("task-popup").style.display = "block";
    showOverlay();
}

function closeTaskForm() {
    document.getElementById("task-popup").style.display = "none";
    hideOverlay();
}

// Function to show the edit form
function openEditTaskForm() {
    let taskName = taskNames[taskNames.length - 1];
    document.getElementById("edit-task-popup").style.display = "block";
    // document.getElementsByClassName("inline-label-input")[12].style.display = "none";
    showPopupOverlay();

    var user_ref = firebase.database().ref('taskCard/' + taskName)
    user_ref.once('value', function(snapshot){
        var data = snapshot.val()
        document.getElementById('edit-task-name').value = data.taskName;
        document.getElementById('edit-task-desc').value = data.taskDesc;
        document.getElementById('edit-priority').value = data.priority;
        document.getElementById('edit-story-points').value = data.storyPoints;
        document.getElementById('edit-Type').value = data.type;
        document.getElementById('edit-status').value = data.status;
        document.getElementById('edit-stage').value = data.stage;
        
        // Prefills the checkbox based on what tags have been selected
        for (let i = 0; i < data.tags.length; i++) {
            (data.tags[i]);
            if (data.tags[i] == "Frontend") {
                document.getElementById('frontend-checkbox').checked = true;
                selectedTags['edit-tags'].push('Frontend');
            } else if (data.tags[i] == "Backend") {
                document.getElementById('backend-checkbox').checked = true;
                selectedTags['edit-tags'].push('Backend');
            } else if (data.tags[i] == "UI") {
                document.getElementById('ui-checkbox').checked = true;
                selectedTags['edit-tags'].push('UI');
            } else if (data.tags[i] == "UX") {
                document.getElementById('ux-checkbox').checked = true;
                selectedTags['edit-tags'].push('UX');
            } else if (data.tags[i] == "Database") {
                document.getElementById('database-checkbox').checked = true;
                selectedTags['edit-tags'].push('Database');
            } else if (data.tags[i] == "API") {
                document.getElementById('api-checkbox').checked = true;
                selectedTags['edit-tags'].push('API');
            } else if (data.tags[i] == "Testing") {
                document.getElementById('testing-checkbox').checked = true;
                selectedTags['edit-tags'].push('Testing');
            } else if (data.tags[i] == "Framework") {
                document.getElementById('framework-checkbox').checked = true;
                selectedTags['edit-tags'].push('Framework');
            }
        }
    })

    // Set the onclick attribute for the save button
    const saveEditsButton = document.getElementById('save-edits-button');
    saveEditsButton.setAttribute('onclick', `saveEdits('${taskName}')`);
}

// Function to close the edit form
function closeEditTaskForm() {
    document.getElementById("edit-task-popup").style.display = "none";
    hidePopupOverlay();
}

// Open and close the delete confirmation popup
function openDeleteConfirmationPopUp() {
    document.getElementById('deletePopUp').style.display = 'block';
}

function closeDeleteConfirmationPopUp() {
    document.getElementById('deletePopUp').style.display = 'none';
}


// Functions below to retrieve array of tags from user through dropdown checkbox
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
    } else {
        dropdown.classList.add('show');
    }
}

function updateTags(checkbox, dropdownId) {
    if (checkbox.checked) {
        selectedTags[dropdownId].push(checkbox.value);
    } else {
        selectedTags[dropdownId] = selectedTags[dropdownId].filter(tag => tag !== checkbox.value);
    }
}

document.addEventListener('click', function(event) {
    if (!event.target.matches('.dropdown-toggle')) {
        var dropdowns = document.getElementsByClassName('dropdown-menu');
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            }
        }
    }
);

/**
 * Creates and appends a task card to the canvas.
 * @param {string} taskName - The name of the task.
 */
function addTaskCard(taskName, canvasToDisplay='.canvas', sprint, ClassName='task-card') {
    // Viewing saved details
    var user_ref = firebase.database().ref('taskCard/' + taskName)
    user_ref.once('value', function(snapshot){
        var data = snapshot.val()

        const canvas = document.querySelector(canvasToDisplay);
        const taskCard = document.createElement('div');
        taskCard.className = ClassName;
        taskCard.dataset.taskName = taskName;
        taskCard.dataset.priority = data.priority;
        taskCard.dataset.date = data.createTime;
        taskCard.dataset.tags = data.tags;
        taskCard.dataset.status = data.status;

        let taskBody='<h3 id="TaskHeader">'+data.taskName+'</h3>'

        taskBody+= '<div class="taskCardContent" id="TaskPriority" style="background-color:'+colorPriority[data.priority][0]+'; color:'+colorPriority[data.priority][1]+';">'+data.priority+'</div>';
        if (!Array.isArray(data.tags)) {
            taskBody += '<div class="taskCardContent" id="TaskTags1">' + data.tags + '</div>';
        } else {
            // Append tags in order from left to right
            taskBody += CreateTags(data.tags,'class="taskCardContent" id="TaskTags1"','class="taskCardContent" id="TaskTags2"','class="taskCardContent" id="TaskTags3"',true);
            
        }

        taskBody+='<div class="taskCardContent" id="TaskStoryPoints">'+data.storyPoints+'</div>';
        taskBody+='<div class="taskCardContent" id="TaskStatus" style="background-color:'+colorStatus[data.status][0]+'; color:'+colorStatus[data.status][1]+';">'+data.status+'</div>';
        taskBody += '<div class="taskCardContent" id="TaskStage" style="background-color:'+colorStages[data.stage][0]+'; color:'+colorStages[data.stage][1]+';">'+data.stage+'</div>';

        taskCard.innerHTML = taskBody;

        // Add click event listener to open the task details popup
        // taskDesc, priority, tags, storyPoints, Type
        taskCard.addEventListener('click', function() {
            if (!sprint){
            showDetailedTaskCard(taskName, data.taskName, data.taskDesc, data.priority, data.storyPoints, data.tags, data.type, data.status, data.stage, data.assignee);
            }
            else{
                const taskCards = Array.from(document.querySelectorAll('.sprint-task-card'));    
                taskCards.forEach(card => {
                    (card.querySelector('#TaskHeader').textContent)
                    if (card.querySelector('#TaskHeader').textContent === data.taskName) {

                        if (!(sprintTaskNames.includes(data.taskName))){
                        const giantTick = document.createElement('div');
                        giantTick.className = 'GiantTick';
                        giantTick.innerHTML = '<i class="fa fa-check" aria-hidden="true"></i>';
                        card.appendChild(giantTick);
                        sprintTaskNames.push(data.taskName);
                        }
                    else{
    
                        card.removeChild(card.querySelector('.GiantTick'));
                        sprintTaskNames = sprintTaskNames.filter(e => e !== data.taskName);
                    }
    
                    return;
                    }
        });
                
            }
        });

        canvas.appendChild(taskCard);
    })
}

/**
 * Submits form data to Firebase and adds a task card to the canvas.
 */
document.getElementById('task-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // If no tags have been selected
    if (selectedTags['tags'].length === 0) {
        alert('Please select at least one tag.');
        return;
    }

    const taskName = document.getElementById('task-name').value;
    const taskDesc = document.getElementById('task-desc').value;
    const priority = document.getElementById('priority').value;
    const storyPoints = document.getElementById('story-points').value;
    const tags = selectedTags['tags'];
    const type = document.getElementById('Type').value;
    const status = document.getElementById('Status').value
    const createTime = new Date().toISOString();
    const stage = document.getElementById('Stage').value;

    // Store data into Firebase database
    firebase.database().ref('taskCard/' + taskName).set({
        taskName: taskName,
        taskDesc: taskDesc,
        priority: priority,
        storyPoints: storyPoints,
        tags: tags,
        type: type,
        status: status,
        createTime: createTime,
        stage: stage,
        assignee: 'Unassigned'
    });

    firebase.database().ref('taskCard/' + taskName + '/log').push().set({
        user: 'admin',
        date: new Date().toString().slice(0,21).replace(/-/g,""),
        action: 'created'
    });

    // Add task card to canvas
    addTaskCard(taskName);

    // Clear the form
    document.getElementById('task-form').reset();

    // Close the form
    closeTaskForm();

    // Clear the selected tags
    selectedTags['tags'] = [];
});

function CreateTags(data, id1, id2, id3, CondensedMode = false) {
    let taskBody = '';

    if (CondensedMode) {
        taskBody += '<div class="taskCardContent condensed-tags">';
        for (let i = 0; i < Math.min(data.length, 8); i++) {
            taskBody += '<div class="tag-circle" style="background-color:' + colorTags[data[i]][0] + ';" title="' + data[i] + '"></div>';
        }
        taskBody += '</div>';
    } else {
        if (data.length > 0) {
            taskBody += '<div ' + id1 + ' style="background-color:' + colorTags[data[0]][0] + ';">';
            taskBody += '<span class="tag">' + data[0] + '</span> ';
            taskBody += '</div>';
        }

        if (data.length > 1) {
            taskBody += '<div ' + id2 + ' style="background-color:' + colorTags[data[1]][0] + ';">';
            taskBody += '<span class="tag">' + data[1] + '</span> ';
            taskBody += '</div>';
        }

        if (data.length > 2) {
            taskBody += '<div ' + id3 + ' style="background-color:' + colorTags[data[2]][0] + ';">';
            taskBody += '<span class="tag">' + data[2] + '</span> ';
            taskBody += '</div>';
        }

        if (data.length > 3) {
            let newData = data.slice(3, data.length);
            newData.forEach(tag => {
                taskBody += '<div class="taskCardContent" id="ExtraTags" style="background-color:' + colorTags[tag][0] + ';">';
                taskBody += '<span class="tag" style="color:black;">' + tag + '</span> ';
                taskBody += '</div>';
            });
        }
    }

    return taskBody;
}

// Function to show the detailed view of the task card
/**
 * Displays a detailed task card with the provided task information.
 *
 * @param {string} taskName - The name of the task.
 * @param {string} data_taskName - The display name of the task.
 * @param {string} taskDesc - The description of the task.
 * @param {string} priority - The priority level of the task.
 * @param {number} storyPoints - The story points assigned to the task.
 * @param {string|string[]} tags - The tags associated with the task. Can be a comma-separated string or an array of strings.
 * @param {string} type - The type of the task.
 * @param {string} status - The current status of the task.
 */
function showDetailedTaskCard(taskName, data_taskName, taskDesc, priority, storyPoints, tags, type, status, stage, assignee) {

    global_count += 1;
    
    if (typeof tags === 'string') {
        tags = tags.split(',');
    }

    // This adds html into the div with the id task-details-content
    const taskDetailsContent = document.getElementById('task-details-content');
    taskDetailsContent.innerHTML = `
        <button class = "close-popup" onclick="closeDetailedTaskCard()">×</button>
        <div id = "ExtendStatus"style="background-color:`+colorStatus[status][0]+`; color:`+colorStatus[status][1]+`;">${status}</div>
        <div id="TaskDetailHeader">
            <strong>Task Name:</strong> <!-- Bold header -->
            <p>${data_taskName}</p> <!-- Task name on a new line -->
        </div>
        <div id="TaskDetailDesc">
            <strong>Task Description:</strong> 
            <p id='TaskDetails'>${taskDesc}</p>
        </div>
        <div id='assigned-to'>
            <strong>Assigned To:</strong>
            <p>${assignee}</p>
        </div>
        <div id = "TaskDetailParameters">
            <div id = "TopParametersRow">
                <div id = "LeftTop">
                    <p id = "DetailParameterText">Type</p>
                    <div id = "DetailValue">
                        ${type}
                    </div>
                </div>
                <div id = "RightTop">
                    <p id = "DetailParameterText">Priority</p>
                    <div id = "DetailValue" style="background-color:`+colorPriority[priority][0]+`; color:black;">
                        ${priority}
                    </div>
                </div>
            </div>
            <div id = "BottomParametersRow">
                <div id = "LeftBottom">
                    <p id = "DetailParameterText">Tags</p>
                    <div class="ExtTags">
                        ${CreateTags(tags,`id=ExtTaskTag1`,`id=ExtTaskTag2`,`id=ExtTaskTag3`)}
                    </div>
                </div>
                <div id = "RightBottom">
                    <p id = "DetailParameterText">Story Points</p>
                    <div id = "DetailValue">
                        ${storyPoints}
                    </div>
                </div>
            </div>
            <div id="stage">
                <p id = "DetailParameterText">Stage</strong>
                <div id="DetailValue" style="background-color:`+colorStages[stage][0]+'; color:'+colorStages[stage][1]+`;">${stage}</div>
            </div>
            <div class="action-buttons">
                <button class="show-history-log" onclick="showHistoryLog('${taskName}')">
                    <i class="fa fa-history"></i> Show History Log
                </button>
                <button class="edit-task" onclick="openEditTaskForm('${taskName}')">
                    <i class="far fa-edit"></i> Edit
                </button>
                <button class="DeleteButton" onclick="openDeleteConfirmationPopUp()">
                    <i class="far fa-trash-alt"></i> Delete
                </button>
            </div>
        <div class = "delete-popup" id = "deletePopUp">
            <h2>Are you sure?</h2>
            <p>Do you really want to delete this task? This action cannot be undone.</p>
            <div class = "delete-buttons">
            <button type = "button" class = "cancel" onclick="closeDeleteConfirmationPopUp()">Cancel</button>
            <button type = "button" class = "delete" onclick="deleteTaskCard('${taskName}','${data_taskName}')">Delete</button>
            </div>
        </div>
    </div>`;
    
    // This is for prefilling the edit pop up
    taskNames.push(taskName);

    // Show the detailed view of the task card
    document.getElementById('task-details-popup').style.display = 'block';
    showOverlay();
}

// Function to close the detailed view of the task card by clicking on the x button
function closeDetailedTaskCard() {
    document.getElementById('task-details-popup').style.display = 'none';
    hideOverlay();
}

// Function to delete a task card
function deleteTaskCard(taskName, UITaskName) {
    const canvas = document.querySelector('.canvas');
    // Delete task from Firebase
    const db = firebase.database().ref('taskCard/' + taskName)
    db.remove()
    .then(() => {
        // Now loop through all task cards and hide the deleted one
        const taskCards = Array.from(document.querySelectorAll('.task-card'));    
        taskCards.forEach(card => {
            (card.querySelector('#TaskHeader').textContent)
            if (card.querySelector('#TaskHeader').textContent === UITaskName) {
                canvas.removeChild(card)
            }
        });

        // Close the detailed view of the task card
        closeDetailedTaskCard();
    })
    .catch(error => {
        console.error("Error removing task: ", error);
    });
}

// Function to save the edits made to a task card
function saveEdits(taskName) {
    const newTaskName = document.getElementById('edit-task-name').value;
    const taskDesc = document.getElementById('edit-task-desc').value;
    const priority = document.getElementById('edit-priority').value;
    const storyPoints = document.getElementById('edit-story-points').value;
    const tags = selectedTags['edit-tags'];
    const type = document.getElementById('edit-Type').value;
    const status = document.getElementById('edit-status').value;
    const stage = document.getElementById('edit-stage').value;
    const editor = currentUser;

    // Update the values
    firebase.database().ref('taskCard/' + taskName).update({
        taskName: newTaskName,
        taskDesc: taskDesc,
        priority: priority,
        storyPoints: storyPoints,
        tags: tags,
        type: type,
        status: status,
        stage: stage
    });

    // Update the history log of the task card
    firebase.database().ref('taskCard/' + taskName + '/log').push().set({
        user: editor,
        date: new Date().toString().slice(0,21).replace(/-/g,""),
        action: 'edited'
    });

    const canvas = document.querySelector('.canvas');
    // remove all children from canvas
    while (canvas.firstChild) {
        canvas.removeChild(canvas.firstChild);
    }

    //Then add them all back in based on whats in the database
    reloadTaskCards();
    
    // Close the form
    closeEditTaskForm();
    closeDetailedTaskCard();

    // Clear the selected tags
    selectedTags['edit-tags'] = [];
}

// Function to reload task cards
function reloadTaskCards() {

    // Remove existing task cards from the canvas
    const canvas = document.getElementById('canvas');
    while (canvas.firstChild) {
        canvas.removeChild(canvas.firstChild);
    }

    var user_ref = firebase.database().ref('taskCard')
    user_ref.once('value', function(snapshot){ // make sure to use once instead of on to read data once so no duplicates of data
        var data = snapshot.val()
        for (var key in data){
            addTaskCard(key)
        }
    })
}

// Function to reload sprints in sprintboard for each sprint
function reloadSprintCards() {

    // Remove all sprint cards from the canvas sprint-board
    const sprintBoard = document.getElementById('sprint-board');
    while (sprintBoard.firstChild) {
        sprintBoard.removeChild(sprintBoard.firstChild);
    }

    // Loop through each sprint in sprint backlog
    if (document.querySelector('.sprint-board').children.length === 0) {
        var user_ref = firebase.database().ref('sprintBoard')
        user_ref.once('value', function(snapshot){ // make sure to use once instead of on to read data once so no duplicates of data
            var data = snapshot.val()
            for (var key in data) {
                const sprint = data[key];
                if (currentUser === 'admin') { // Display all sprints to the admin
                    console.log('admin')
                    addSprintCard(key, sprint.sprintStartDate, sprint.sprintEndDate)

                } else {
                    // Check if the current user is in the sprint and display the card to them if they
                    for (memberKey in sprint.sprintMembers) {
                        if (currentUser === sprint.sprintMembers[memberKey]) {
                            addSprintCard(key, sprint.sprintStartDate, sprint.sprintEndDate)
                            break;

                        } else {
                            console.log('User not in sprint');
                        }
                    }
                }
            }
        })
    }
}

/**
 * Filters tasks by tags.
 */
function filterTasks() {
    const selectedTags = Array.from(document.querySelectorAll('#filter-dropdown input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);

    const taskCards = document.querySelectorAll('.task-card');
    taskCards.forEach(card => {
        let tags = card.dataset.tags;

        // Check if tags is a string or an array
        if (typeof tags === 'string') {
            tags = tags.split(','); // Convert comma-separated string to array
        }

        // Check if all selected tags are in the array of tags
        const shouldDisplay = selectedTags.length === 0 || selectedTags.every(tag => tags.includes(tag));
        card.style.display = shouldDisplay ? 'block' : 'none';
    });
}

/**
 * Updates the filters and calls the filterTasks function.
 */
function updateFilters() {
    filterTasks();
}

/**
 * Sorts tasks based on the given criteria.
 * @param {string} criteria - The criteria to sort tasks by.
 */
function sortTasks(criteria) {
    const canvas = document.querySelector('.canvas');
    const taskCards = Array.from(document.querySelectorAll('.task-card'));

    taskCards.sort((a, b) => {
        if (criteria === 'date-asc') {
            return new Date(a.dataset.date) - new Date(b.dataset.date);
        } else if (criteria === 'date-desc') {
            return new Date(b.dataset.date) - new Date(a.dataset.date);
        } else if (criteria === 'priority-asc') {
            return getPriorityValue(a.dataset.priority) - getPriorityValue(b.dataset.priority);
        } else if (criteria === 'priority-desc') {
            return getPriorityValue(b.dataset.priority) - getPriorityValue(a.dataset.priority);
        }
    });

    taskCards.forEach(card => canvas.appendChild(card));
}

/**
 * Helper function to get the priority value.
 * @param {string} priority - The priority level.
 * @returns {number} - The numerical value of the priority.
 */
function getPriorityValue(priority) {
    const priorities = {
        'Low': 1,
        'Medium': 2,
        'Important': 3,
        'Urgent': 4
    };
    return priorities[priority] || 0;
}

// Function to show the history log of a task card
function showHistoryLog(taskName) {
    // Display the history log popup
    document.getElementById('task-details-popup').style.display = 'block';
    // Get the date and user info from database
    var log_ref = firebase.database().ref('taskCard/' + taskName + '/log');
    
    // Fetch the data
    log_ref.once('value', function(snapshot) {
        var data = snapshot.val();
        const historyLogContent = document.getElementById('history-log-content');
        
        // Clear the history log content
        historyLogContent.innerHTML = '';
        // Convert the data object to an array of keys
        var keys = Object.keys(data);
        // Reverse the array of keys
        keys.reverse();
        // Iterate over the reversed array of keys
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var logEntry = data[key];
            // Generate HTML for each log entry
            historyLogContent.innerHTML += `
                <div class="entry">
                    <div class="circle"></div>
                    <div class="history-log-entry">
                        <p class="log-date">${logEntry.user} ${logEntry.action} on ${logEntry.date}</p>
                    </div>
                </div>
            `;
        }

        // Show history log popup
        document.getElementById('history-log-popup').style.display = 'block';
        //Overlay
        showPopupOverlay();
    });
}

function closeHistoryLog() {
    document.getElementById('history-log-popup').style.display = 'none';
    hidePopupOverlay();
}

// =====================================================================================================================
//                                   SPRINT BOARD SECTION STARTS HERE
// =====================================================================================================================

// This is to show the Product Backlog when the user clicks on the Product Backlog button
function showProductBacklog() {
    // Removes kanban board
    showSprintBoard()
    // Load tasks from Firebase
    reloadTaskCards();
    sortTasks('date-asc');

    //Placeholder code for hiding button to view average contribution time for members
    const contributionButton = document.getElementById('view-avg-contribution-button');
    contributionButton.style.display = 'none';
    if (contributionButton.classList.contains('active'))
        contributionButton.classList.toggle('active');

    // Show the dashboard button only if the user is an admin
    const adminDashboardButton = document.getElementsByClassName('menu-item-admin-dashboard')[0];
    if (currentUser === 'admin') {
        adminDashboardButton.style.display = 'flex';
    } else {
        adminDashboardButton.style.display = 'none';
    }

    // Show add task button
    const addTaskButton = document.querySelector('.add-task-btn');
    if (addTaskButton) {
        addTaskButton.style.display = 'block';
    }

    // show the log out button
    document.getElementById('log-out-button').style.display = 'block';

    // Hide the add new member button
    const addMemberButton = document.querySelector('.add-new-member-btn');
    if (addMemberButton) {
        addMemberButton.style.display = 'none';
    }

    // Hide add sprint button
    const addSprintButton = document.querySelector('.add-sprint-btn');
    if (addSprintButton) {
        addSprintButton.style.display = 'none';
    }

    // Show the Sort button
    const sortButton = document.querySelector('.top-bar-button i.fa-sort').parentElement;
    if (sortButton) {
        sortButton.style.display = 'block';
    }

    // Show the Filter button
    const filterButton = document.querySelector('.top-bar-button i.fa-filter').parentElement;
    if (filterButton) {
        filterButton.style.display = 'block';
    }

    // Hide the sprint board and show the canvas
    document.getElementById('sprint-board').style.display = 'none';
    document.getElementById('canvas').style.display = 'flex';
    document.getElementById('admin-dashboard').style.display = 'none';

    setActiveMenuItem('backlog');

    // Uncheck all filter checkboxes
    const filterCheckboxes = document.querySelectorAll('#filter-dropdown input[type="checkbox"]');
    filterCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}

// Shows the Sprint Board view when the user clicks on the Sprint Board button
function showSprintBoard() {
    hideOverlay();
    reloadSprintCards();
    closeDetailedTaskCard();
    document.getElementById('canvas').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('sprint-board').style.display = 'block';
    setActiveMenuItem('sprintboard');

    // Update initial team members to choose from 
    fetchTeamMembers();

    //Placeholder code for hiding button to view average contribution time for members
    const contributionButton = document.getElementById('view-avg-contribution-button');
    contributionButton.style.display = 'none';
    if (contributionButton.classList.contains('active'))
        contributionButton.classList.toggle('active');

    // show the log out button
    document.getElementById('log-out-button').style.display = 'block';

    // Hide the Add Task button
    const addTaskButton = document.querySelector('.add-task-btn');
    if (addTaskButton) {
        addTaskButton.style.display = 'none';
    }

    // Hide add new member button
    const addMemberButton = document.querySelector('.add-new-member-btn');
    if (addMemberButton) {
        addMemberButton.style.display = 'none';
    }

    // Hide the Sort button
    const sortButton = document.querySelector('.top-bar-button i.fa-sort').parentElement;
    if (sortButton) {
        sortButton.style.display = 'none';
    }

    // Hide the Filter button
    const filterButton = document.querySelector('.top-bar-button i.fa-filter').parentElement;
    if (filterButton) {
        filterButton.style.display = 'none';
    }

    // Display the Add Task Button
    const addSprintButton = document.querySelector('.add-sprint-btn');
    if (addSprintButton && currentUser === 'admin') {
        addSprintButton.style.display = 'block';
    }

    // Hide the backlog if the backlog
    document.getElementById('sprint-backlog').style.display = 'none';
    document.getElementById('burndown-chart-button').style.display = 'none';

    // Hide the button to show tasks to add
    document.getElementById('add-task-button').style.display = 'none';

    //Placeholder code for hiding toggleButton for tasks view

    const toggleButton = document.getElementById('toggle-sprint-view');
    if (toggleButton.classList.contains('active')) {
        toggleButton.classList.toggle('active');
        document.getElementById("sprint-backlog-list").style.display = 'none';
        document.getElementById("sprint-backlog-kanban").style.display = 'flex';
    }
    toggleButton.style.display = 'none';

    //END of placeholder code
    document.getElementById('add-task-button').removeEventListener('click', SprintEvent);

    document.getElementById('AddSprintDone').removeEventListener('click', DoneEvent);

    // Remove all task cards from the 'Not Started' section
    const notStartedSection = document.querySelector('.task-card-section-not-started');
    while (notStartedSection.firstChild) {
        notStartedSection.removeChild(notStartedSection.firstChild);
    }

    // Remove all task cards from the 'In Progress' section
    const inProgressSection = document.querySelector('.task-card-section-in-progress');
    while (inProgressSection.firstChild) {
        inProgressSection.removeChild(inProgressSection.firstChild);
    }

    // Remove all task cards from the 'Completed' section
    const completedSection = document.querySelector('.task-card-section-completed');
    while (completedSection.firstChild) {
        completedSection.removeChild(completedSection.firstChild);
    }

    // Uncheck all filter checkboxes
    const filterCheckboxes = document.querySelectorAll('#filter-dropdown input[type="checkbox"]');
    filterCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}

// Function to set the active menu item
function setActiveMenuItem(menuItem) {
    const backlogButton = document.querySelector('.menu-item-backlog');
    const sprintBoardButton = document.querySelector('.menu-item-sprintboard');
    const adminDashboardButton = document.querySelector('.menu-item-admin-dashboard');

    if (menuItem === 'backlog') {
        backlogButton.classList.add('active');
        sprintBoardButton.classList.remove('active');
        adminDashboardButton.classList.remove('active');
    } else if (menuItem === 'sprintboard') {
        backlogButton.classList.remove('active');
        sprintBoardButton.classList.add('active');
        adminDashboardButton.classList.remove('active');
    } else if (menuItem === 'admin-dashboard') {
        backlogButton.classList.remove('active');
        sprintBoardButton.classList.remove('active');
        adminDashboardButton.classList.add('active');
    } else {
        console.error('Invalid menu item: ', menuItem);
    }
}
// Global variable to show whether it is edit or add
let isEditSprint = false;

// Function to show the pop form to add sprint
function openAddSprintForm() {
    isEditSprint = false;
    document.getElementById("add-sprint-form").style.display = "block";
    showOverlay()
}

// Function to show the pop form to edit sprint
function openEditSprintForm(sprintName) {
    if (currentUser !== 'admin') {
        alert('Only the admin can edit sprints.');
        return;
    } else {
        isEditSprint = true;
        const sprintRef = firebase.database().ref('sprintBoard/' + sprintName);
        sprintRef.once('value')
            .then((snapshot) => {
                const data = snapshot.val();

                // Check if the sprint status is "Not Started"
                if (data.sprintStatus === "Completed") {
                    alert("Sprint details cannot be edited as it has already been started or completed.");
                    return;
                }

                // Dispatch custom event to update the form state in the React component
                const event = new CustomEvent('prefillSprintForm', {
                    detail: {
                        sprintName: data.sprintName,
                        sprintStartDate: data.sprintStartDate,
                        sprintEndDate: data.sprintEndDate,
                        productOwner: data.sprintPO,
                        scrumMaster: data.sprintScrumMaster,
                        selectedTeamMembers: data.sprintMembers
                    }
                });
                document.dispatchEvent(event);

                // Show the form
                document.getElementById("add-sprint-form").style.display = "block";
                document.getElementById('sprint-name').disabled = true;
                showOverlay();
            })
            .catch((error) => {
                console.error("Error retrieving sprint data: ", error);
            });
    }
}

// Function to save entered details into the database
document.addEventListener('submitSprintForm', (e) => {
    const { sprintName, sprintStartDate, sprintEndDate, productOwner, scrumMaster, selectedTeamMembers } = e.detail;

    if (isEditSprint === false) {
        // Saves the data into the database
        firebase.database().ref('sprintBoard/' + sprintName).set({
            sprintName: sprintName,
            sprintStartDate: sprintStartDate,
            sprintEndDate: sprintEndDate,
            sprintStatus: "Not Started",
            sprintPO: productOwner,
            sprintScrumMaster: scrumMaster,
            sprintMembers: selectedTeamMembers,
            sprintStoryPoints: parseInt(0),
            completedStoryPoints: parseInt(0)
        });

        // Adds the sprint card into the webpage
        addSprintCard(sprintName, sprintStartDate, sprintEndDate);
    } else {
        // Updates the data in the database
        firebase.database().ref('sprintBoard/' + sprintName).update({
            sprintStartDate: sprintStartDate,
            sprintEndDate: sprintEndDate,
            sprintPO: productOwner,
            sprintScrumMaster: scrumMaster,
            sprintMembers: selectedTeamMembers
        });

        // Reload all sprints
        reloadSprintCards();
    }

    closeAddSprintForm();
});

const closeAddSprintForm = () => {
    const form = document.getElementById('add-sprint-form');
    if (form) {
      form.style.display = 'none';
    }
    hideOverlay()
  };

  function openDeleteSprintConfirmationPopUp(sprintName) {
    if (currentUser !== 'admin') {
        alert('Only the admin can delete sprints.');
        return;
    } else {
        const sprintRef = firebase.database().ref('sprintBoard/' + sprintName);
        sprintRef.once('value')
            .then((snapshot) => {
                const data = snapshot.val();
                const sprintStatus = data.sprintStatus;
                if (sprintStatus !== 'Not Started') {
                    alert('This sprint cannot be deleted because it has already started or is completed.');
                } else {
                    // Get all delete pop ups from the sprintBoard
                    var deletePopUps = [].slice.call(document.getElementsByClassName('sprint-board')[0].children);
                    for (let deletePopUp of deletePopUps) {
                        if (deletePopUp.dataset.sprintName === sprintName && deletePopUp.className === 'delete-popup-sprint') {
                            deletePopUp.style.display = 'block';
                            deletePopUp.querySelector('.deleteSprint-popup').style.display = 'block';
                        }
                    }
                }
            })
            .catch((error) => {
                console.error("Error fetching sprint status:", error);
            });
        }
}

function closeDeleteSprintConfirmationPopUp(sprintName) {
    var deletePopUps = [].slice.call(document.getElementsByClassName('sprint-board')[0].children);
    for (deletePopUp in deletePopUps) {
        if (deletePopUps[deletePopUp].dataset.sprintName === sprintName && deletePopUps[deletePopUp].className === 'delete-popup-sprint') {
            deletePopUps[deletePopUp].style.display = 'none';
            deletePopUps[deletePopUp].querySelector('.deleteSprint-popup').style.display = 'none';
        }
    }
}

// Functions adds a sprint card to the sprint board
function addSprintCard(sprintName) {
    const canvas = document.querySelector('.sprint-board');
    const sprintCard = document.createElement('div');
    sprintCard.className = 'Sprint-card';
    sprintCard.dataset.sprintName = sprintName;

    const delete_popup = document.createElement('div');
    delete_popup.className = 'delete-popup-sprint';
    delete_popup.dataset.sprintName = sprintName;

    // Read data from database to get sprint details
    var sprint_ref = firebase.database().ref('sprintBoard/' + sprintName)
    sprint_ref.once('value', function(snapshot){
        var data = snapshot.val()

        // Calculate the status based on the current date
        const currentDate = new Date();
        const startDate = new Date(data.sprintStartDate);
        const endDate = new Date(data.sprintEndDate);
        let status = 'Not Started';

        if (currentDate >= startDate && currentDate <= endDate) {
            status = 'In Progress';
        } else if (currentDate > endDate) {
            status = 'Completed';
        }

        // Update the status in the database if it has changed
        if (data.sprintStatus !== status) {
            sprint_ref.update({ sprintStatus: status });
        }

        const [bgColor, fontColor] = colorStatus[status];

        sprintCard.innerHTML = `<h3 id="TaskHeader"> ${data.sprintName} </h3>`
        sprintCard.innerHTML += `<div id="SprintDate">Start: ${data.sprintStartDate} End: ${data.sprintEndDate}</div>`;
        sprintCard.innerHTML += `<div id="SprintStatus" style="background-color:${bgColor}; color:${fontColor}; border: 1px solid ${fontColor};">${status}</div>`;
        sprintCard.innerHTML += `<div id="SprintSMText">Scrum Master: <div id="SprintSM">${data.sprintScrumMaster}</div></div>`;
        sprintCard.innerHTML += `<div id="SprintPOText">Product Owner: <div id="SprintPO">${data.sprintPO}</div></div>`;
        sprintCard.innerHTML += `<div id="Members">Team Members:<div class="CondensedMembers">`;

        const condensedMembersDiv = sprintCard.querySelector('.CondensedMembers');
        // First check if there is a sprint member key in the data
        if (!data.sprintMembers) {
            console.log('No Members');
        } else {
            for (let i = 0; i < Math.min(data.sprintMembers.length, 8); i++) {
                const memberCircle = document.createElement('div');
                memberCircle.className = 'member-circle';
                memberCircle.title = data.sprintMembers[i];
                condensedMembersDiv.appendChild(memberCircle);
            }
        }

        sprintCard.innerHTML += `</div></div>`;
        sprintCard.innerHTML += `<div id="SprintStoryPoints">${data.completedStoryPoints}/${data.sprintStoryPoints}</div>`;
        sprintCard.innerHTML += `
        <button id ="delete-button" type="button" onclick="openDeleteSprintConfirmationPopUp('${data.sprintName}')" style="right:223px">
        <i class="far fa-trash-alt"></i>
        </button>
        `;
        sprintCard.innerHTML += `
            <button class="sprintEditButton" type="button" onclick="openEditSprintForm('${data.sprintName}')">
                <i class="far fa-edit"></i>
            </button>
        `;

        delete_popup.innerHTML += `
            <div class = "deleteSprint-popup" id ="deleteSprintPopUp">
                <h2>Are you sure?</h2>
                <p>Do you really want to delete this sprint? This action cannot be undone.</p>
                <div class = "delete-buttons">
                <button type = "button" class = "cancel" onclick="closeDeleteSprintConfirmationPopUp('${data.sprintName}')">Cancel</button>
                <button type = "button" class = "delete" onclick="deleteSprintCard('${data.sprintName}')">Delete</button>
                </div>
            </div>
        `;

    })
    
    // Add click event listener to open the sprint backlog
    sprintCard.addEventListener('click', function(event) {
        if (event.target.tagName === 'BUTTON' || event.target.tagName === 'I') {
            console.log('Button clicked');
        } else {
            showSprintBacklog(sprintName);
        }
    });

    // Add it to the sprint board
    canvas.appendChild(sprintCard);
    canvas.appendChild(delete_popup);
}

// Delete sprint card from sprint board
async function deleteSprintCard(sprintName) {
    // Remove all the task cards from the sprint backlog and move them to the product backlog
    var sprint_ref = firebase.database().ref('sprintBoard/' + sprintName + "/sprintBacklog")
    const snapshot = await sprint_ref.once('value');
    const data = snapshot.val();
    for (key in data) {
        firebase.database().ref('taskCard/' + data[key].taskName).set({
            taskName: data[key].taskName,
            createTime: data[key].createTime,
            log: data[key].log,
            priority: data[key].priority,
            stage: data[key].stage,
            status: data[key].status,
            storyPoints: data[key].storyPoints,
            tags: data[key].tags,
            taskDesc: data[key].taskDesc,
            type: data[key].type,
            assignee: 'Unassigned'
        });
    }

    // Remove the sprint card from the sprint board
    // Get all sprint cards from the sprintBoard
    const sprintBoard = document.querySelector('.sprint-board');
    var sprintCards = [].slice.call(document.getElementsByClassName('sprint-board')[0].children);

    for (sprintCard in sprintCards) {
        if (sprintCards[sprintCard].dataset.sprintName === sprintName && sprintCards[sprintCard].className === 'Sprint-card') {
            sprintBoard.removeChild(sprintCards[sprintCard]);
        }
    }

    // Close the confirmation popup
    closeDeleteSprintConfirmationPopUp(sprintName);

    // Remove the sprint from the database
    firebase.database().ref('sprintBoard/' + sprintName).remove();
}

// This function moves the task card details in the database from product backlog to sprint backlog
// Task name should be the key of the card in the database
function moveTaskToSprint(taskName, sprintName) {

    // Get the task details from the database
    var task_ref = firebase.database().ref('taskCard/' + taskName)
    task_ref.once('value', function(snapshot){
        var taskCardData = snapshot.val()

        // Save the task details into the sprint backlog
        firebase.database().ref('sprintBoard/' + sprintName + "/sprintBacklog/" + taskName).set({
            taskName: taskCardData.taskName,
            taskDesc: taskCardData.taskDesc,
            priority: taskCardData.priority,
            storyPoints: taskCardData.storyPoints,
            tags: taskCardData.tags,
            type: taskCardData.type,
            status: taskCardData.status,
            log: taskCardData.log,
            createTime: taskCardData.createTime,
            stage: taskCardData.stage,
            assignee: taskCardData.assignee
        });
        
        // Update the total story points of the sprint
        // Get the sprint story points from the database
        var sprint_ref = firebase.database().ref('sprintBoard/' + sprintName)
        sprint_ref.once('value', function(snapshot){
            var sprintData = snapshot.val()
            var sprintStoryPoints = parseInt(sprintData.sprintStoryPoints) + parseInt(taskCardData.storyPoints)
            firebase.database().ref('sprintBoard/' + sprintName).update({
                sprintStoryPoints: sprintStoryPoints
            });
        });
        
        // Remove the task from the product backlog
        firebase.database().ref('taskCard/' + taskName).remove();

        // Add the task into the sprint backlog not started section
        addTaskCardToSprintBacklog(taskName, sprintName);
    })
}

// Function to add the task card into the actual sprint backlog
function addTaskCardToSprintBacklog(taskName, sprintName) {
    // Viewing saved details
    var user_ref = firebase.database().ref('sprintBoard/' + sprintName + "/sprintBacklog/" + taskName)
    user_ref.once('value', function(snapshot){
        var data = snapshot.val()

        const notStartedCanvas = document.querySelector('.task-card-section-not-started');
        const inProgressCanvas = document.querySelector('.task-card-section-in-progress');
        const completedCanvas = document.querySelector('.task-card-section-completed');
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.id = taskName;
        taskCard.dataset.taskName = taskName;
        taskCard.dataset.priority = data.priority;
        taskCard.dataset.date = data.createTime;
        taskCard.dataset.tags = data.tags;
        taskCard.dataset.stage = data.stage;
        taskCard.dataset.status = data.status;
        taskCard.dataset.type = data.type;
        taskCard.dataset.storyPoints = data.storyPoints;
        taskCard.setAttribute('draggable', 'true');
        taskCard.setAttribute('ondragstart', `drag(event, '${data.status}', '${sprintName}')`);

        let taskBody='<h3 id="TaskHeader">'+data.taskName+'</h3>'

        taskBody+= '<div class="taskCardContent" id="TaskPriority" style="background-color:'+colorPriority[data.priority][0]+'; color:'+colorPriority[data.priority][1]+';">'+data.priority+'</div>';
        if (!Array.isArray(data.tags)) {
            taskBody += '<div class="taskCardContent" id="TaskTags1">' + data.tags + '</div>';
        } else {
            // Append tags in order from left to right
            taskBody += CreateTags(data.tags,'class="taskCardContent" id="TaskTags1"','class="taskCardContent" id="TaskTags2"','class="taskCardContent" id="TaskTags3"',true);
            
        }

        taskBody+='<div class="taskCardContent" id="TaskStoryPoints">'+data.storyPoints+'</div>';
        taskBody+='<div class="taskCardContent" id="TaskStatus" style="background-color:'+colorStatus[data.status][0]+'; color:'+colorStatus[data.status][1]+';">'+data.status+'</div>';
        taskBody += '<div class="taskCardContent" id="TaskStage" style="background-color:'+colorStages[data.stage][0]+'; color:'+colorStages[data.stage][1]+';">'+data.stage+'</div>';

        taskCard.innerHTML = taskBody;

        // Add click event listener to open the task details popup
        // taskDesc, priority, tags, storyPoints, Type
        taskCard.addEventListener('click', function() {
            showSprintDetailedTaskCard(taskName, data.taskName, data.taskDesc, data.priority, data.storyPoints, data.tags, data.type, data.status, sprintName, data.stage, data.assignee);
        });

        // Apply CSS styles directly to the task card
        taskCard.style.transform = 'scale(0.90)'; // Scale down
        taskCard.style.transformOrigin = 'top left'; 
        taskCard.style.border = '1px solid #444'; 

        // Add it to the sprint backlog based on its status
        if (data.status === 'Not Started') {
            notStartedCanvas.appendChild(taskCard);
        } else if (data.status === 'In Progress') {
            inProgressCanvas.appendChild(taskCard);
        } else if (data.status === 'Completed') {
            completedCanvas.appendChild(taskCard);
        }

        // Calculate total story points for the sprint
        var sprint_ref = firebase.database().ref('sprintBoard/' + sprintName);
        sprint_ref.once('value', function(snapshot) {
            var sprintData = snapshot.val();
            var totalStoryPoints = 0;

            // Iterate through each task in the sprint backlog
            for (var task in sprintData.sprintBacklog) {
                if (sprintData.sprintBacklog.hasOwnProperty(task)) {
                    var taskData = sprintData.sprintBacklog[task];
                    totalStoryPoints += parseInt(taskData.storyPoints);
                }
            }

            // Update the total story points in the sprint board
            firebase.database().ref('sprintBoard/' + sprintName).update({
                sprintStoryPoints: totalStoryPoints
            });
        });
    });
}


function allowDrop(ev) {
    ev.preventDefault();
}
  
function drag(ev,sprintStatus, SprintName) {
    ev.dataTransfer.setData("text", ev.target.id);

    if (sprintStatus === 'Not Started') {
        sprintStatusOriginal = '.task-card-section-not-started';
    } else if (sprintStatus === 'In Progress') {
        sprintStatusOriginal = '.task-card-section-in-progress';
    } else if (sprintStatus === 'Completed') {
        sprintStatusOriginal = '.task-card-section-completed';
    }
    ev.dataTransfer.setData("sprintStatus", sprintStatusOriginal);
    ev.dataTransfer.setData("sprintName", SprintName);
}

function drop(ev,sprintStatus) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var sprintStatusOriginal = ev.dataTransfer.getData("sprintStatus");
    var sprintName=ev.dataTransfer.getData("sprintName");
    var task=document.getElementById(data);
    moveTask(task.id,task.dataset.taskName,sprintName,sprintStatusOriginal,sprintStatus);
}

function showSprintDetailedTaskCard(taskName, data_taskName, taskDesc, priority, storyPoints, tags, type, status, sprintName, stage, assignee) {
    global_count += 1;
    if (typeof tags === 'string') {
        tags = tags.split(',');
    }

    if (assignee === undefined) { assignee = 'Unassigned'; }

    const taskDetailsContent = document.getElementById('task-details-content');
    taskDetailsContent.innerHTML = `
        <button class="close-popup" onclick="closeDetailedTaskCard()">×</button>
        <div id="ExtendStatus" style="background-color:${colorStatus[status][0]}; color:${colorStatus[status][1]};">${status}</div>
        <div id="TaskDetailHeader">
            <strong>Task Name:</strong>
            <p>${data_taskName}</p>
        </div>
        <div id="TaskDetailDesc">
            <strong>Task Description:</strong> 
            <p id='TaskDetails'>${taskDesc}</p>
        </div>
        <div id='assigned-to'>
            <strong>Assigned To:</strong>
            <p>${assignee}</p>
            <button class="assign-to-me-button" onclick="assignTask('${taskName}', '${data_taskName}','${sprintName}')">
                <i class="fas fa-user"></i> Assign To Me
            </button>
        </div>
        <div id="TaskDetailParameters">
            <div id="TopParametersRow">
                <div id="LeftTop">
                    <p id="DetailParameterText">Type</p>
                    <div id="DetailValue">
                        ${type}
                    </div>
                </div>
                <div id="RightTop">
                    <p id="DetailParameterText">Priority</p>
                    <div id="DetailValue" style="background-color:${colorPriority[priority][0]}; color:black;">
                        ${priority}
                    </div>
                </div>
            </div>
            <div id="BottomParametersRow">
                <div id="LeftBottom">
                    <p id="DetailParameterText">Tags</p>
                    <div class="ExtTags">
                        ${CreateTags(tags, 'id=ExtTaskTag1', 'id=ExtTaskTag2', 'id=ExtTaskTag3')}
                    </div>
                </div>
                <div id="RightBottom">
                    <p id="DetailParameterText">Story Points</p>
                    <div id="DetailValue">
                        ${storyPoints}
                    </div>
                    <p id="DetailParameterText">Total Time Contribution</p>
                    <div id="DetailValue" style="width: 150px;">
                        <p id="total-time-contribution-value">Loading...</p>
                    </div>
                </div>
            </div>
            <div id="stage">
                <p id="DetailParameterText">Stage</p>
                <div id="DetailValue" style="background-color:${colorStages[stage][0]}; color:${colorStages[stage][1]};">${stage}</div>
            </div>
            <div class="action-buttons" style="margin-top: 75px;">
                <button class="show-history-log" onclick="showHistoryLogSprint('${taskName}', '${sprintName}')">
                    <i class="fa fa-history"></i> Show History Log
                </button>
                <button class="edit-task" onclick="checkSprintStatusAndEdit('${sprintName}')">
                    <i class="far fa-edit"></i> Edit
                </button>
            </div>
            <h2>Sprint Actions</h2>
            <div class="action-buttons-sprint">
                <button class="remove-from-sprint-backlog" id="remove-from-sprint-backlog" onclick="openRemoveConfimationPopUp()">
                    <i class="fa fa-minus-circle"></i> Remove from Sprint
                </button>
                <button class="add-contribution-time" onclick="openAddContributionTimeForm('${taskName}','${sprintName}')">
                    <i class="fa fa-clock"></i> Add Contribution Time
                </button>
                <button class="view-contribution-graph" onclick="openViewContributionGraph('${taskName}','${sprintName}')">
                    <i class="fa fa-chart-line"></i> View Contribution Graph
                </button>
            </div>
            <div class="remove-from-sprint-popup" id="remove-from-sprint-popup">
                <h2>Are you sure?</h2>
                <p>Do you really want to remove this task? This action cannot be undone.</p>
                <div class="delete-buttons">
                    <button type="button" class="cancel" onclick="closeRemoveConfirmationPopUp()">Cancel</button>
                    <button type="button" class="delete" onclick="removeTaskFromSprint('${taskName}', '${data_taskName}', '${sprintName}')">Remove</button>
                </div>
            </div>
        </div>
    `;

    taskNames.push(taskName);

    // Hide the assign to me button if the assignee is not 'Unassigned'
    if (assignee !== 'Unassigned') {
        document.querySelector('.assign-to-me-button').style.display = 'none';
    }

    document.getElementById('task-details-popup').style.display = 'block';
    showOverlay();

    const taskRef = firebase.database().ref('sprintBoard/' + sprintName + "/sprintBacklog/" + taskName);
    taskRef.child('totalTimeContribution').on('value', (snapshot) => {
        let totalTimeContribution = snapshot.val();
        totalTimeContribution = totalTimeContribution ? (totalTimeContribution / 60).toFixed(2) : 0;
        document.getElementById('total-time-contribution-value').innerText = `${totalTimeContribution} hours`;
    });
}

function checkSprintStatusAndEdit(sprintName) {
    const sprintRef = firebase.database().ref('sprintBoard/' + sprintName);
    sprintRef.once('value')
        .then((snapshot) => {
            const data = snapshot.val();
            const sprintStatus = data.sprintStatus;
            if (sprintStatus === 'Completed') {
                alert('This task cannot be edited because the sprint is complete.');
            } else {
                openEditSprintTaskForm(sprintName);
            }
        })
        .catch((error) => {
            console.error("Error fetching sprint status:", error);
        });
}

// Function to show history log of a task card in sprint backlog
function showHistoryLogSprint(taskName, sprintName) {
    // Display the history log popup
    document.getElementById('task-details-popup').style.display = 'block';
    // Get the date and user info from database
    var log_ref = firebase.database().ref('sprintBoard/' + sprintName + '/sprintBacklog/' + taskName + '/log');
    
    // Fetch the data
    log_ref.once('value', function(snapshot) {
        var data = snapshot.val();
        // var historyLogHtml = '<div class="history-log-container"><ol class="relative border-s border-gray-200 dark:border-gray-700">';
        const historyLogContent = document.getElementById('history-log-content');

        // if (!historyLogContent.hasChildNodes()) {
        
        // Clear the inner html
        historyLogContent.innerHTML = '';
        // Convert the data object to an array of keys
        var keys = Object.keys(data);
        // Reverse the array of keys
        keys.reverse();
        // Iterate over the reversed array of keys
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var logEntry = data[key];
            // Generate HTML for each log entry
            historyLogContent.innerHTML += `
                <div class="entry">
                    <div class="circle"></div>
                    <div class="history-log-entry">
                        <p class="log-date">Admin ${logEntry.action} on ${logEntry.date}</p>
                    </div>
                </div>
            `;
        }

        // Show history log popup
        document.getElementById('history-log-popup').style.display = 'block';
        //Overlay
        showPopupOverlay();
    });
}

// Function to edit task card in sprint backlog
function openEditSprintTaskForm(sprintName) {
    // First make sure status of the sprint is Not Started
    var sprint_ref = firebase.database().ref('sprintBoard/' + sprintName)
    sprint_ref.once('value', function(snapshot){
        var sprintData = snapshot.val()
        let taskName = taskNames[taskNames.length - 1];
        document.getElementById("edit-task-popup").style.display = "block";
        showPopupOverlay();

        var user_ref = firebase.database().ref('sprintBoard/' + sprintName + "/sprintBacklog/" + taskName)
        user_ref.once('value', function(snapshot){
            var data = snapshot.val()
            document.getElementById('edit-task-name').value = data.taskName;
            document.getElementById('edit-task-desc').value = data.taskDesc;
            document.getElementById('edit-priority').value = data.priority;
            document.getElementById('edit-story-points').value = data.storyPoints;
            document.getElementById('edit-Type').value = data.type;
            document.getElementById('edit-status').value = data.status;
            document.getElementById('edit-stage').value = data.stage;
            
            // Prefills the checkbox based on what tags have been selected
            for (let i = 0; i < data.tags.length; i++) {
                (data.tags[i]);
                if (data.tags[i] == "Frontend") {
                    document.getElementById('frontend-checkbox').checked = true;
                    selectedTags['edit-tags'].push('Frontend');
                } else if (data.tags[i] == "Backend") {
                    document.getElementById('backend-checkbox').checked = true;
                    selectedTags['edit-tags'].push('Backend');
                } else if (data.tags[i] == "UI") {
                    document.getElementById('ui-checkbox').checked = true;
                    selectedTags['edit-tags'].push('UI');
                } else if (data.tags[i] == "UX") {
                    document.getElementById('ux-checkbox').checked = true;
                    selectedTags['edit-tags'].push('UX');
                } else if (data.tags[i] == "Database") {
                    document.getElementById('database-checkbox').checked = true;
                    selectedTags['edit-tags'].push('Database');
                } else if (data.tags[i] == "API") {
                    document.getElementById('api-checkbox').checked = true;
                    selectedTags['edit-tags'].push('API');
                } else if (data.tags[i] == "Testing") {
                    document.getElementById('testing-checkbox').checked = true;
                    selectedTags['edit-tags'].push('Testing');
                } else if (data.tags[i] == "Framework") {
                    document.getElementById('framework-checkbox').checked = true;
                    selectedTags['edit-tags'].push('Framework');
                }
            }
        })

        // Set the onclick attribute for the save button
        const saveEditsButton = document.getElementById('save-edits-button');
        saveEditsButton.setAttribute('onclick', `saveSprintTaskEdits('${taskName}', '${sprintName}')`);
    });
}

// Function to save the edited details into the database
function saveSprintTaskEdits(taskName, sprintName) {
    const newTaskName = document.getElementById('edit-task-name').value;
    const taskDesc = document.getElementById('edit-task-desc').value;
    const priority = document.getElementById('edit-priority').value;
    const storyPoints = document.getElementById('edit-story-points').value;
    const tags = selectedTags['edit-tags'];
    const type = document.getElementById('edit-Type').value;
    const status = document.getElementById('edit-status').value;
    const stage = document.getElementById('edit-stage').value;

    // Update the values
    firebase.database().ref('sprintBoard/' + sprintName + "/sprintBacklog/" + taskName).update({
        taskName: newTaskName,
        taskDesc: taskDesc,
        priority: priority,
        storyPoints: storyPoints,
        tags: tags,
        type: type,
        status: status,
        stage: stage
    });

    // Update the history log of the task card
    firebase.database().ref('sprintBoard/' + sprintName + "/sprintBacklog/" + taskName+ '/log').push().set({
        user: 'admin',
        date: new Date().toString().slice(0,21).replace(/-/g,""),
        action: 'edited'
    });
    
    // Remove all task cards from the sprint backlog and readd them
    var sprint_backlog_canvas = document.querySelector('.task-card-section-not-started');
    var taskCards = [].slice.call(sprint_backlog_canvas.children);
    for (taskCard in taskCards) {
        sprint_backlog_canvas.removeChild(taskCards[taskCard]);
    }

    var backlog_ref = firebase.database().ref('sprintBoard/' + sprintName + "/sprintBacklog")
    backlog_ref.once('value', function(snapshot){
        var data = snapshot.val()
        for (var key in data){
            addTaskCardToSprintBacklog(key, sprintName);
        }
    })

    // Close the form
    closeEditTaskForm();
    closeDetailedTaskCard();

    // Clear the selected tags
    selectedTags['edit-tags'] = [];
}

// Function to open the remove confirmation popup
function openRemoveConfimationPopUp() {
    document.getElementById('remove-from-sprint-popup').style.display = 'block';
    showOverlay();
}

// Function to close the remove confirmation popup
function closeRemoveConfirmationPopUp() {
    document.getElementById('remove-from-sprint-popup').style.display = 'none';
    hideOverlay();
}

// Function to remove task card from sprint backlog and add it back to product backlog
function removeTaskFromSprint(taskName, UITaskName, sprintName) {
    // If the sprint status is anything but not started, the task cannot be removed
    var sprint_ref = firebase.database().ref('sprintBoard/' + sprintName)
    sprint_ref.once('value', function(snapshot){
        var sprintData = snapshot.val()
        if (sprintData.sprintStatus !== "Not Started") {
            alert("The task cannot be removed from the sprint as the sprint has already started.")
            return;
        } else {
            var sprint_backlog_canvas = document.querySelector('.task-card-section-not-started');

            // Get the task details from the database
            var task_ref = firebase.database().ref('sprintBoard/' + sprintName + "/sprintBacklog/" + taskName)
            task_ref.once('value', function(snapshot){
                var taskCardData = snapshot.val()

                // Save the task details into the product backlog
                firebase.database().ref('taskCard/' + taskName).set({
                    taskName: taskCardData.taskName,
                    taskDesc: taskCardData.taskDesc,
                    priority: taskCardData.priority,
                    storyPoints: taskCardData.storyPoints,
                    tags: taskCardData.tags,
                    type: taskCardData.type,
                    status: taskCardData.status,
                    log: taskCardData.log,
                    createTime: taskCardData.createTime,
                    stage: taskCardData.stage,
                    assignee: 'Unassigned'
                });

                // Update the total story points of the sprint
                // Get the sprint story points from the database
                var sprint_ref = firebase.database().ref('sprintBoard/' + sprintName)
                sprint_ref.once('value', function(snapshot){
                    var sprintData = snapshot.val()
                    var sprintStoryPoints = parseInt(sprintData.sprintStoryPoints) - parseInt(taskCardData.storyPoints)
                    firebase.database().ref('sprintBoard/' + sprintName).update({
                        sprintStoryPoints: sprintStoryPoints
                    });
                });

                // Remove the task from the sprint backlog canvas
                var taskCards = [].slice.call(sprint_backlog_canvas.children);
                for (taskCard in taskCards) {
                    if (taskCards[taskCard].dataset.taskName === UITaskName) {
                        sprint_backlog_canvas.removeChild(taskCards[taskCard]);
                    }
                }

                // Remove the task from the sprint backlog and the canvas it is in
                firebase.database().ref('sprintBoard/' + sprintName + "/sprintBacklog/" + taskName).remove()
            })
        }
    });

    // Close the pop up
    closeDetailedTaskCard();
    try {
        closeRemoveConfirmationPopUp();
    }
    catch (err) {
        console.log('Remove confirmation popup not open');
    }
}

// Function to delete task from sprint
function deleteTaskFromSprint(taskName, UITaskName, sprintName) {
    // First check if the sprint status is not started, if it is not then we cannot delete the task
    var sprint_ref = firebase.database().ref('sprintBoard/' + sprintName)
    sprint_ref.once('value', function(snapshot){
        var sprintData = snapshot.val()
        if (sprintData.sprintStatus !== "Not Started") {
            alert("The task cannot be deleted from the sprint as the sprint has already started.")
            return;
        } else {
            // Otherwise we can delete the task
            // Remove the task from the sprint backlog canvas
            var sprint_backlog_canvas = document.querySelector('.task-card-section-not-started');
            var taskCards = [].slice.call(sprint_backlog_canvas.children);
            for (taskCard in taskCards) {
                if (taskCards[taskCard].dataset.taskName === UITaskName) {
                    sprint_backlog_canvas.removeChild(taskCards[taskCard]);
                }
            }

            // Delete it from the databse
            firebase.database().ref('sprintBoard/' + sprintName + "/sprintBacklog/" + taskName).remove()
        }
    });

    // Close the detailed card view and the pop up
    closeDetailedTaskCard();
    closeDeleteConfirmationPopUp();
}

// Function to show the pop up for the sprint backlog
// Parameter is used to read data form the database
function showSprintBacklog(sprintName) {
    currentSprint = sprintName;
    // Hide board item and show sprint backlog
    document.getElementById('sprint-board').style.display = 'none';
    document.getElementById('add-sprint-btn').style.display = 'none';
    document.getElementById('sprint-backlog').style.display = 'block';
    
    var sprint_ref = firebase.database().ref('sprintBoard/' + sprintName);
    sprint_ref.once('value', function(snapshot) {
        var sprintData = snapshot.val();
        if (sprintData.sprintStatus === 'Not Started') {
            document.getElementById('add-task-button').style.display = 'block';
        } else {
            document.getElementById('add-task-button').style.display = 'none';
        }
    });

    //Placeholder code for showing toggleButton for tasks view
    document.getElementById('toggle-sprint-view').style.display = 'flex';

    // Show the Burndown Chart button
    document.getElementById('burndown-chart-button').style.display = 'block';

    // When showing the sprint backlog on the tasks in the backlog of the sprint it self should be shown
    // This is done by reading the data from the database and looking at the sprint itself, then showing and hiding the right tasks
    var taskCards = [].slice.call(document.getElementsByClassName('task-card-section-not-started')[0].children);
    taskCards.forEach(card => {
        card.style.display = 'none';
    });

    var taskCards = [].slice.call(document.getElementsByClassName('task-card-section-in-progress')[0].children);
    taskCards.forEach(card => {
        card.style.display = 'none';
    });

    var taskCards = [].slice.call(document.getElementsByClassName('task-card-section-completed')[0].children);
    taskCards.forEach(card => {
        card.style.display = 'none';
    });

    var backlog_ref = firebase.database().ref('sprintBoard/' + sprintName + "/sprintBacklog")
    backlog_ref.once('value', function(snapshot){
        var data = snapshot.val()
        for (var key in data){
            addTaskCardToSprintBacklog(key, sprintName);
        }
    })


    SprintEvent = function() {
        showTasksToAddToSprint(sprintName);
    }
    document.getElementById('add-task-button').addEventListener('click', SprintEvent);

    // Will need to update the sections based on whats in the sprint itself
}

// Add event listener to the Burndown Chart button
document.getElementById('burndown-chart-button').addEventListener('click', showBurndownChartPopup);

// Function to display the Burndown Chart
function showBurndownChartPopup() {
    // Show the popup
    document.getElementById('burndown-chart-popup').style.display = 'block';
    showOverlay();

    // Retrieve sprint data from Firebase
    const sprintRef = firebase.database().ref('sprintBoard/' + currentSprint);
    sprintRef.once('value')
        .then((snapshot) => {
            const data = snapshot.val();
            const sprintStartDate = moment(data.sprintStartDate, 'YYYY-MM-DD');
            const sprintEndDate = moment(data.sprintEndDate, 'YYYY-MM-DD');
            const totalDays = sprintEndDate.diff(sprintStartDate, 'days') + 1;
            const totalStoryPoints = data.sprintStoryPoints;

            // Calculate ideal trend
            const idealTrend = [totalStoryPoints];
            for (let i = 1; i <= totalDays; i++) {
                idealTrend.push(totalStoryPoints - (totalStoryPoints / totalDays) * i);
            }

            // Retrieve actual sprint velocity data from Firebase
            const burndownRef = firebase.database().ref('sprintBoard/' + currentSprint + '/burndown');
            burndownRef.once('value')
                .then((burndownSnapshot) => {
                    const burndownData = burndownSnapshot.val() || {};
                    const sprintVelocity = [totalStoryPoints];
                    const currentDate = moment().startOf('day');
                    const currentDay = currentDate.diff(sprintStartDate, 'days') + 1;

                    let cumulativeStoryPointsCompleted = 0;

                    for (let i = 1; i <= totalDays; i++) {
                        if (i <= currentDay) {
                            const storyPointsCompleted = burndownData[i] ? burndownData[i].storyPointsCompleted : 0;
                            cumulativeStoryPointsCompleted += storyPointsCompleted;
                            sprintVelocity.push(totalStoryPoints - cumulativeStoryPointsCompleted);
                        } else {
                            sprintVelocity.push(null);
                        }
                    }

                    // Calculate story points completed for the current day
                    const totalCompletedStoryPoints = data.completedStoryPoints || 0;
                    const previousDaysCompletedStoryPoints = Object.keys(burndownData)
                        .filter(day => day < currentDay)
                        .reduce((sum, day) => sum + (burndownData[day].storyPointsCompleted || 0), 0);
                    const currentDayCompletedStoryPoints = totalCompletedStoryPoints - previousDaysCompletedStoryPoints;

                    // Update Firebase with the current day's completed story points
                    burndownRef.child(currentDay).set({
                        day: currentDay,
                        storyPointsCompleted: currentDayCompletedStoryPoints
                    });

                    // Destroy existing chart instance if it exists
                    if (burndownChart) {
                        burndownChart.destroy();
                    }

                    // Create the chart
                    const ctx = document.getElementById('burndownChart').getContext('2d');
                    burndownChart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: ['Day 0', ...Array.from({ length: totalDays }, (_, i) => 'Day ' + (i + 1))],
                            datasets: [
                                {
                                    label: 'Ideal Trend',
                                    data: idealTrend,
                                    borderColor: 'rgba(75, 192, 192, 1)',
                                    borderWidth: 2,
                                    fill: false
                                },
                                {
                                    label: 'Sprint Velocity',
                                    data: sprintVelocity,
                                    borderColor: 'rgba(255, 99, 132, 1)',
                                    borderWidth: 2,
                                    fill: false
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                title: {
                                    display: true,
                                    text: 'Burndown Chart',
                                    color: getColorForMode('#333333', '#cccccc')
                                }
                            },
                            scales: {
                                x: {
                                    display: true,
                                    title: {
                                        display: true,
                                        text: 'Days of the Sprint',
                                        color: getColorForMode('#333333', '#cccccc')
                                    },
                                    ticks: {
                                        autoSkip: false,
                                        color: getColorForMode('#333333', '#cccccc')
                                    }
                                },
                                y: {
                                    display: true,
                                    title: {
                                        display: true,
                                        text: 'Remaining Effort (Story Points)',
                                        color: getColorForMode('#333333', '#cccccc')
                                    },
                                    ticks: {
                                        color: getColorForMode('#333333', '#cccccc')
                                    },
                                    beginAtZero: true
                                }
                            }
                        }
                    });
                })
                .catch((error) => {
                    console.error("Error retrieving burndown data: ", error);
                });
        })
        .catch((error) => {
            console.error("Error retrieving sprint data: ", error);
        });
}

// Closes the burndown chart popup
function closeBurndownChartPopup() {
    document.getElementById('burndown-chart-popup').style.display = 'none';
    hideOverlay();
}

// Contribution Input data
function openAddContributionTimeForm(taskName, sprintName) {
    document.getElementById('contributionTimePopup').style.display = 'block';
    showPopupOverlay();

    document.getElementById('submitContributionTime').onclick = function(event) {
        event.preventDefault(); // Prevent the default form submission

        const hours = document.getElementById('hours').value;
        const minutes = document.getElementById('minutes').value;

        if (hours === '' || minutes === '') {
            alert('Please fill in both hours and minutes.');
            return;
        }

        // Call the function to submit contribution time
        submitContributionTime(taskName, sprintName);
    };
}

// Closes the contribution time pop up
function closeContributionTimePopup() {
    document.getElementById('contributionTimePopup').style.display = 'none';
    hidePopupOverlay();
}

// Saves the input contribution time to the database
function submitContributionTime(taskName, sprintName) {
    const hours = parseInt(document.getElementById('hours').value);
    const minutes = parseInt(document.getElementById('minutes').value);
    const totalMinutes = hours * 60 + minutes;

    const sprintRef = firebase.database().ref('sprintBoard/' + sprintName);
    sprintRef.child('sprintStartDate').once('value')
        .then((snapshot) => {
            const sprintStartDateStr = snapshot.val();
            const sprintStartDate = new Date(sprintStartDateStr);
            sprintStartDate.setHours(0, 0, 0, 0); // Normalize sprint start date

            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize current date

            const dayInSprint = Math.floor((today - sprintStartDate) / (1000 * 60 * 60 * 24)) + 1;

            const backlogRef = firebase.database().ref('sprintBoard/' + sprintName + "/sprintBacklog/" + taskName + "/contributions/day" + dayInSprint);

            backlogRef.once('value')
                .then((snapshot) => {
                    let existingTime = 0;
                    if (snapshot.exists()) {
                        existingTime = snapshot.val().time;
                    }

                    const newTime = existingTime + totalMinutes;

                    backlogRef.set({ day: dayInSprint, time: newTime })
                        .then(() => {
                            // Calculate total time contribution
                            const contributionsRef = firebase.database().ref('sprintBoard/' + sprintName + "/sprintBacklog/" + taskName + "/contributions");
                            contributionsRef.once('value')
                                .then((contributionsSnapshot) => {
                                    let totalTimeContribution = 0;
                                    contributionsSnapshot.forEach((daySnapshot) => {
                                        totalTimeContribution += daySnapshot.val().time;
                                    });

                                    // Save total time contribution to the database
                                    const taskRef = firebase.database().ref('sprintBoard/' + sprintName + "/sprintBacklog/" + taskName);
                                    taskRef.update({ totalTimeContribution: totalTimeContribution })
                                        .then(() => {
                                            closeContributionTimePopup();
                                            openViewContributionGraph(taskName, sprintName); // Update the graph after adding contribution
                                        })
                                        .catch((error) => {
                                            console.error("Error updating total time contribution: ", error);
                                        });
                                })
                                .catch((error) => {
                                    console.error("Error retrieving contributions: ", error);
                                });
                        })
                        .catch((error) => {
                            console.error("Error adding contribution time: ", error);
                        });
                })
                .catch((error) => {
                    console.error("Error retrieving existing contribution: ", error);
                });
        })
        .catch((error) => {
            console.error("Error retrieving sprint start date: ", error);
        });
}

// Opens the contribution graph popup
function openViewContributionGraph(taskName, sprintName) {
    document.getElementById('contribution-graph-popup').style.display = 'flex';
    showPopupOverlay();
    const backlogRef = firebase.database().ref('sprintBoard/' + sprintName + "/sprintBacklog/" + taskName + "/contributions");
    backlogRef.once('value')
        .then((snapshot) => {
            const contributions = [];
            snapshot.forEach((childSnapshot) => {
                contributions.push(childSnapshot.val());
            });
            displayContributionGraph(contributions);
        })
        .catch((error) => {
            console.error("Error retrieving contributions: ", error);
        });
}

// Actually displays the graph
function displayContributionGraph(contributions) {
    const ctx = document.getElementById('contributionGraph').getContext('2d');
    
    // Add "Day 0" to the beginning of the days array
    const days = ['Day 0', ...contributions.map(contribution => `Day ${contribution.day}`)];
    
    // Accumulate times
    let accumulatedTime = 0;
    const times = [0]; // Start with 0 hours for "Day 0"
    contributions.forEach(contribution => {
        accumulatedTime += contribution.time / 60; // Convert minutes to hours and accumulate
        times.push(accumulatedTime);
    });

    // Destroy the existing chart instance if it exists
    if (contributionChart) {
        contributionChart.destroy();
    }

    // Create a new chart instance
    contributionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Accumulated Contribution Time (hours)',
                data: times,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Accumulation of Effort',
                    color: getColorForMode('#333333', '#cccccc'),
                    font: {
                        size: 18
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Day in Sprint',
                        color: getColorForMode('#333333', '#cccccc')
                    },
                    ticks: {
                        color: getColorForMode('#333333', '#cccccc')
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Time Contributed (hours)',
                        color: getColorForMode('#333333', '#cccccc')
                    },
                    ticks: {
                        color: getColorForMode('#333333', '#cccccc') 
                    }
                }
            }
        }
    });
}

function closeContributionGraphPopup() {
    document.getElementById('contribution-graph-popup').style.display = 'none';
    hidePopupOverlay();
}

// This opens up the pop up to choose tasks to add to the sprint
function showTasksToAddToSprint(SprintName) {
    document.getElementById('add-sprint-popup').style.display = 'flex';
    document.getElementById('add-task-button').style.display = 'none';
    document.getElementById('AddSprintDone').style.display = 'block';
    showOverlay();

    // Get all task cards from the product backlog
    var user_ref = firebase.database().ref('taskCard')
    user_ref.once('value', function(snapshot){ // make sure to use once instead of on to read data once so no duplicates of data
        var data = snapshot.val()
        for (var key in data){
            addTaskCard(key,'#add-sprint-popup',true,'sprint-task-card')
        }
    })

    // Add event listener to the add button
    const DoneButton=document.getElementById('AddSprintDone')
    DoneEvent=function() {AddSprintTaskDone(SprintName)}
    DoneButton.addEventListener('click', DoneEvent);
}

function AddSprintTaskDone(sprintName) {
    canvas=document.querySelector('#add-sprint-popup');
    const taskCards = Array.from(document.querySelectorAll('.sprint-task-card'));    
        taskCards.forEach(card => {
            (card.querySelector('#TaskHeader').textContent)
                canvas.removeChild(card)
        });

    sprintTaskNames.forEach(taskName => {
        moveTaskToSprint(taskName, sprintName);})

    document.getElementById('add-sprint-popup').style.display = 'none';
    document.getElementById('add-task-button').style.display = 'block';
    document.getElementById('AddSprintDone').style.display = 'none';
    hideOverlay();
    sprintTaskNames = [];

}

// move task to inprogress section THIS IS A MOCK DO NOT ACTUALLY USE THIS FUNCTION
function moveTask(taskName, UITaskName, sprintName,statusOriginal,statusNew) {
    // Remove and move the task from the not started section to the completed section by removing it from its list of children
    var sprintBacklogNotStarted = document.querySelector(statusOriginal);
    var sprintBacklogCompleted = document.querySelector(statusNew);
    var StatusOriginalTaskCards = [].slice.call(document.getElementsByClassName(statusOriginal.substr(1))[0].children)

    for (taskCard in StatusOriginalTaskCards) {
        if (StatusOriginalTaskCards[taskCard].dataset.taskName === UITaskName) {
            sprintBacklogNotStarted.removeChild(StatusOriginalTaskCards[taskCard]);
            sprintBacklogCompleted.appendChild(StatusOriginalTaskCards[taskCard]);
            let newStatus;
            if (statusNew === '.task-card-section-completed') {
                newStatus = 'Completed';
            } else if (statusNew === '.task-card-section-in-progress') {
                newStatus = 'In Progress';
            } else {
                newStatus = 'Not Started';
            }
            const taskStatusDiv = StatusOriginalTaskCards[taskCard].querySelector('#TaskStatus');
            const ActualTaskCard = StatusOriginalTaskCards[taskCard];
            if (taskStatusDiv) {
                taskStatusDiv.textContent = newStatus;
                taskStatusDiv.style.backgroundColor = colorStatus[newStatus][0];
                taskStatusDiv.style.color = colorStatus[newStatus][1];
                StatusOriginalTaskCards[taskCard].removeEventListener('click', function() {
                    showSprintDetailedTaskCard(taskName, ActualTaskCard.dataset.taskName, ActualTaskCard.dataset.taskDesc, ActualTaskCard.dataset.priority, ActualTaskCard.dataset.storyPoints, ActualTaskCard.dataset.tags, ActualTaskCard.dataset.type, ActualTaskCard.dataset.status, sprintName, ActualTaskCard.dataset.stage, ActualTaskCard.dataset.assignee);
                });
                StatusOriginalTaskCards[taskCard].addEventListener('click', function() {
                    showSprintDetailedTaskCard(taskName, ActualTaskCard.dataset.taskName, ActualTaskCard.dataset.taskDesc, ActualTaskCard.dataset.priority, ActualTaskCard.dataset.storyPoints, ActualTaskCard.dataset.tags, ActualTaskCard.dataset.type, newStatus, sprintName, ActualTaskCard.dataset.stage, ActualTaskCard.dataset.assignee);
                });
            }
            


            StatusOriginalTaskCards[taskCard].dataset.status = newStatus;
            StatusOriginalTaskCards[taskCard].setAttribute('ondragstart', `drag(event, '${newStatus}', '${sprintName}')`);
    }}

    // Update the status of the task as well
    firebase.database().ref('sprintBoard/' + sprintName + "/sprintBacklog/" + taskName).update({
        status: statusNew === '.task-card-section-in-progress' ? 'In Progress' :
                statusNew === '.task-card-section-completed' ? 'Completed' :
                'Not Started'
    });

    // Update total story points completed of sprint
    var sprint_ref = firebase.database().ref('sprintBoard/' + sprintName);
    sprint_ref.once('value', function(snapshot) {
        var sprintData = snapshot.val();
        var totalCompletedStoryPoints = 0;

        // Iterate through each task in the sprint backlog
        for (var task in sprintData.sprintBacklog) {
            if (sprintData.sprintBacklog.hasOwnProperty(task)) {
                var taskData = sprintData.sprintBacklog[task];
                // Check if the task status is 'Completed'
                if (taskData.status === 'Completed') {
                    totalCompletedStoryPoints += parseInt(taskData.storyPoints);
                }
            }
        }

        // Update the completed story points in the sprint board
        firebase.database().ref('sprintBoard/' + sprintName).update({
            completedStoryPoints: totalCompletedStoryPoints
        });
    });
}

// Function to toggle Sprint View between kanban view and list view
function toggleSprintView() {
    const toggleButton = document.getElementById("toggle-sprint-view");

    toggleButton.classList.toggle('active');
    if (toggleButton.classList.contains('active')) {
        document.getElementById("sprint-backlog-kanban").style.display = 'none';
        document.getElementById("sprint-backlog-list").style.display = 'block';
        populateListView(currentSprint);
    } else {
        document.getElementById("sprint-backlog-kanban").style.display = 'flex';
        document.getElementById("sprint-backlog-list").style.display = 'none';
    }
}

// Function to populate the list view with tasks from the specified sprint
function populateListView(sprintName) {
    const listView = document.getElementById("task-card-list");
    listView.innerHTML = ''; // Clear existing list

    const sprintRef = firebase.database().ref('sprintBoard/' + sprintName + '/sprintBacklog');
    sprintRef.once('value')
        .then((snapshot) => {
            const tasks = snapshot.val();
            for (const taskName in tasks) {
                const task = tasks[taskName];
                const listCard = document.createElement('div');
                listCard.className = 'list-task-card';

                listCard.innerHTML = `
                    <div class="list-task-name">${task.taskName}</div>
                    <div class="list-task-priority" style="background-color:${colorPriority[task.priority][0]}; color:${colorPriority[task.priority][1]}; border: 2.5px solid ${colorPriority[task.priority][1]};">${task.priority}</div>
                    <div class="list-task-stage" style="background-color:${colorStages[task.stage][0]}; color:${colorStages[task.stage][1]}; border: 2.5px solid ${colorStages[task.stage][1]};">${task.stage}</div>
                    <div class="list-task-status" style="background-color:${colorStatus[task.status][0]}; color:${colorStatus[task.status][1]}; border: 2.5px solid ${colorStatus[task.status][1]};">${task.status}</div>
                    <div class="list-task-story-point">${task.storyPoints}</div>
                    <div class="list-condensed-tags">${createListTagCircles(task.tags)}</div>
                `;

                listView.appendChild(listCard);
            }
        })
        .catch((error) => {
            console.error("Error retrieving tasks: ", error);
        });
}

// Function to create tag circles with hover effect
function createListTagCircles(tags) {
    if (typeof tags === 'string') {
        tags = tags.split(',');
    }

    return tags.map(tag => {
        const [bgColor, textColor] = colorTags[tag.trim()] || ['#ccc', '#fff'];
        return `<div class="list-tag-circle" title="${tag.trim()}" style="background-color:${bgColor}; color:${textColor};"></div>`;
    }).join('');
}

// Add event listener to toggle-sprint-view button
document.getElementById('toggle-sprint-view').addEventListener('click', () => {
    toggleSprintView();
});

/**
 * Filters tasks by tags.
 */
function filterBacklogTasks(sprintStatus) {
    const selectedTags = Array.from(document.querySelectorAll('#filter-dropdown input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);

    const taskCards = document.querySelectorAll(`.task-card[data-status="${sprintStatus}"]`);
    taskCards.forEach(card => {
        // Check if the task card matches the sprintStatus
        if (card.querySelector('#TaskStatus').textContent !== sprintStatus) {
            card.style.display = 'none';
            return;
        }
        let tags = card.dataset.tags;

        // Check if tags is a string or an array
        if (typeof tags === 'string') {
            tags = tags.split(','); // Convert comma-separated string to array
        }

        // Check if all selected tags are in the array of tags
        const shouldDisplay = selectedTags.length === 0 || selectedTags.every(tag => tags.includes(tag));
        card.style.display = shouldDisplay ? 'block' : 'none';
    });
}

/**
 * Updates the filters and calls the filterTasks function.
 */
function updateBacklogFilters(sprintStatus) {
    filterBacklogTasks(sprintStatus);
}

function sortBacklogTasks(criteria, sprintStatus) {
    let canvas;
    if (sprintStatus === ('Not Started')) {
        canvas = document.querySelector('.task-card-section-not-started');
        var taskCards = [].slice.call(document.getElementsByClassName('task-card-section-not-started')[0].children)
    }
    else if (sprintStatus === ('In Progress')) {
        canvas = document.querySelector('.task-card-section-in-progress');
        var taskCards = [].slice.call(document.getElementsByClassName('task-card-section-in-progress')[0].children)
    }
    else {
        canvas = document.querySelector('.task-card-section-completed');
        var taskCards = [].slice.call(document.getElementsByClassName('task-card-section-completed')[0].children)
    }

    taskCards.sort((a, b) => {
        if (criteria === 'priority-asc') {
            return getPriorityValue(a.dataset.priority) - getPriorityValue(b.dataset.priority);
        } else if (criteria === 'priority-desc') {
            return getPriorityValue(b.dataset.priority) - getPriorityValue(a.dataset.priority);
        }
    });

    taskCards.forEach(card => canvas.appendChild(card));
}

var lightModeSwitch = document.querySelector("#toggleButton");

lightModeSwitch.addEventListener("click", function(){
    document.querySelector("body").classList.toggle("light-mode");
});

// Function to assign task to the currently logged in user
function assignTask(taskName, UITaskName, sprintName) {
    // Update the firebase database to store the assignee in to the right task
    const taskRef = firebase.database().ref('sprintBoard/' + sprintName + "/sprintBacklog/" + taskName);
    taskRef.update({ assignee: currentUser });

    // Show pop-up to confirm assignment
    document.getElementById('assign-task-popup').style.display = 'block';

    // Close the detailed task card
    closeDetailedTaskCard();
    showPopupOverlay();

    // Remove the task card from the sprint backlog canvas and add it back in
    var sprint_backlog_canvas = document.querySelector('.task-card-section-not-started');
    var taskCards = [].slice.call(sprint_backlog_canvas.children);
    for (taskCard in taskCards) {
        sprint_backlog_canvas.removeChild(taskCards[taskCard]);
    }

    var backlog_ref = firebase.database().ref('sprintBoard/' + sprintName + "/sprintBacklog")
    backlog_ref.once('value', function(snapshot){
        var data = snapshot.val()
        for (var key in data){
            addTaskCardToSprintBacklog(key, sprintName);
        }
    })
}

// Function to close the assign confimation pop up
function closeAssignTaskPopUp() {
    document.getElementById('assign-task-popup').style.display = 'none';
    hidePopupOverlay();
}

// =====================================================================================================================
//                                   Admin and User Authentication Here
// =====================================================================================================================

// Function to show the admin dashboard
function showAdminDashboard() {
    const adminDashBoard = document.getElementById('admin-dashboard');

    adminDashBoard.style.display = 'flex';
    document.getElementById('canvas').style.display = 'none';
    document.getElementById('sprint-board').style.display = 'none';
    setActiveMenuItem('admin-dashboard');
    document.getElementById('toggle-sprint-view').style.display = 'none';  

    document.getElementById('view-avg-contribution-button').innerHTML = "View Contribution Time";
    
    //Placeholder code for button for viewing average time contribution for members

    if (adminDashBoard.classList.contains('active'))
        adminDashBoard.classList.toggle('active');
    document.getElementsByClassName('MembersTableTitlePassword')[0].innerHTML = "Password";
    document.getElementById('view-avg-contribution-button').style.display = 'block';

    //End of Placeholder code

    // Hide the Add Task button
    const addTaskButton = document.querySelector('.add-task-btn');
    if (addTaskButton) {
        addTaskButton.style.display = 'none';
    }

    // Show add new member button
    const addMemberButton = document.querySelector('.add-new-member-btn');
    if (addMemberButton) {
        addMemberButton.style.display = 'block';
    }

    // Hide the Sort button
    const sortButton = document.querySelector('.top-bar-button i.fa-sort').parentElement;
    if (sortButton) {
        sortButton.style.display = 'none';
    }

    // Hide the Filter button
    const filterButton = document.querySelector('.top-bar-button i.fa-filter').parentElement;
    if (filterButton) {
        filterButton.style.display = 'none';
    }

    // Hide the Add Task Button
    const addSprintButton = document.querySelector('.add-sprint-btn');
    if (addSprintButton) {
        addSprintButton.style.display = 'none';
    }

    // Hide the backlog
    document.getElementById('sprint-backlog').style.display = 'none';
    document.getElementById('burndown-chart-button').style.display = 'none';

    // Hide the button to show tasks to add
    document.getElementById('add-task-button').style.display = 'none';

    // Hide the log out button
    document.getElementById('log-out-button').style.display = 'none';
    document.getElementById('view-avg-contribution-time').style.display = 'block';

    const canvas = document.querySelector('#MembersTable');
    const memberCards = ([].slice.call(canvas.children)).slice(1);
    memberCards.forEach(card => canvas.removeChild(card));

    var user_ref = firebase.database().ref('users')
    user_ref.once('value', function(snapshot){ // make sure to use once instead of on to read data once so no duplicates of data
        var data = snapshot.val()
        for (var key in data){
            addMemberToDashBoard(key)
        }
    })

}

// Function to show the add new user form
function openAddNewMemberForm() {
    document.getElementById('add-new-member-form').style.display = 'block';
    showPopupOverlay();
}

// Function to close the add new member form
closeAddNewMemberForm = function() {
    document.getElementById('add-new-member-form').style.display = 'none';
    hidePopupOverlay();
}

// Function to save the details of the new user form into the database
document.getElementById('member-task-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Save the new user details into the database
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Modify the username to use the first four letters of the name (lowercase) and 4 random digits
    const randomDigits = Math.floor(Math.random() * 10000);
    if (username.length < 4) {
        var authUsername = username.toLowerCase() + randomDigits;
    } else {
        var authUsername = username.substring(0, 4).toLowerCase() + randomDigits;
    }

    firebase.database().ref('users/' + authUsername).set({
        username: authUsername,
        password: password
    })

    closeAddNewMemberForm();

    // Pause for a second to allow the database to update
    setTimeout(function() {
        // Add the user card to the dashboard
        addMemberToDashBoard(authUsername);
    }, 1000);

})

// Function to add the user card onto the dashboard
function addMemberToDashBoard(user){
    var user_ref = firebase.database().ref('users/' + user)
    user_ref.once('value', function(snapshot){
        var data = snapshot.val();
        console.log(data);
        
        if (data.username === 'admin') {
            console.log('admin account');
        } else {
            const canvas = document.querySelector('#MembersTable');
            const newMember = document.createElement('div');
            newMember.className = 'memberCard';
            newMember.dataset.username = data.username;
            newMember.dataset.password = data.password;
            newMember.innerHTML = `
                <div class="member-username">${data.username}</div>
                <div class="member-password" type="password">${data.password}</div>
                <div class="action-buttonsMember">
                    <button class="edit-taskM" onclick = "openEditMemberPopup('${data.username}')">
                        <i class="far fa-edit"></i>
                    </button>
                    <button class="DeleteButtonM" onclick="openDeleteMemberPopup('${data.username}')">
                        <i class="far fa-trash-alt"></i>
                    </button>
                    <button class="show-history-logM" onclick = "openBarChartPopup('${data.username}')">
                        <i class="fa fa-chart-line"></i>
                    </button>
                </div>

            `;
            
            const delete_popup = document.createElement('div');
            delete_popup.className = 'delete-popup';
            delete_popup.dataset.username = data.username;
            delete_popup.innerHTML += `
                <div id="delete-member-popup">
                    <h2>Are you sure?</h2>
                    <p>Do you really want to remove this member? This action cannot be undone.</p>
                    <div class = "delete-buttons">
                    <button type = "button" class = "cancel" onclick="closeDeleteMemberPopup('${data.username}')">Cancel</button>
                    <button type = "button" class = "delete" onclick="removeMember('${data.username}')">Delete</button>
                    </div>
                </div>
            `;

            canvas.appendChild(newMember);
            canvas.appendChild(delete_popup);
        }
    });

}

// Function to delete user from the database
function removeMember(username) {
    // Remove the user card TODO
    // Get all the user cards in the admin dashboard members table canvas
    const memberCards = document.querySelectorAll('.memberCard');
    // Loop through each card and determine if the card username matches the input username
    for (memberCard in memberCards) {
        if (memberCards[memberCard].dataset.username === username) {
            memberCards[memberCard].remove();
            break;
        }
    }

    // Reference the user database and delete the database data
    firebase.database().ref('users/' + username).remove();

    // Then for each sprint, we remove this user from the sprint if the status of the sprint is not Completed
    const sprint_ref = firebase.database().ref('sprintBoard');
    sprint_ref.once('value', function(snapshot) {
        const data = snapshot.val();
        for (sprint in data) {
            if (data[sprint].sprintStatus !== 'Completed' || data[sprint].sprintStatus !== 'In Progressb') {
                for (member in data[sprint].sprintMembers) {
                    if (data[sprint].sprintMembers[member] === username) {
                        firebase.database().ref('sprintBoard/' + sprint + '/sprintMembers/' + member).remove();
                    }
                }

                // Then for each task, if the assignee of the task is the removed member, change it to unassgined
                for (task in data[sprint].sprintBacklog) {
                    if (data[sprint].sprintBacklog[task].assignee === username) {
                        firebase.database().ref('sprintBoard/' + sprint + '/sprintBacklog/' + task + '/assignee').set('Unassigned');
                    }
                }

            } else {
                console.log('Sprint is completed');
                
            }
        }
    });

    // Close the pop up
    closeDeleteMemberPopup(username);
}

function openDeleteMemberPopup(username) {
    // Get all the delete popups in the admin dashbord members table canvas
    const deletePopups = document.querySelectorAll('.delete-popup');
    // Loop through each pop up and determine if the pop up username matches the input username
    for (delete_popups in deletePopups) {
        if (deletePopups[delete_popups].dataset.username === username) {
            deletePopups[delete_popups].style.display = 'block';
            deletePopups[delete_popups].style.transform = 'translate(-50%, -50%)';
            // deletePopups[delete_popups].querySelector('.delete-member-popup').style.display = 'block';
            break;
        }
    }
}

function closeDeleteMemberPopup(username) {
    document.getElementById('delete-member-popup').style.display = 'none';
    // Get all the delete popups in the admin dashbord members table canvas
    const deletePopups = document.querySelectorAll('.delete-popup');
    // Loop through each pop up and determine if the pop up username matches the input username
    for (delete_popups in deletePopups) {
        if (deletePopups[delete_popups].dataset.username === username) {
            deletePopups[delete_popups].style.display = 'none';
            // deletePopups[delete_popups].querySelector('.delete-member-popup').style.display = 'none';
            break;
        }
    }
}

//Placeholder code for opening / closing popup for editing members
let editMemberUsername = '';
function openEditMemberPopup(name) {
    document.getElementById('edit-member-popup').style.display = 'flex';
    editMemberUsername = name;
    showPopupOverlay();
}

function closeEditMemberPopup() {
    document.getElementById('edit-member-popup').style.display = 'none';
    hidePopupOverlay();
}

//End of placeholder code

async function openBarChartPopup(username) {
    document.getElementById('bar-chart-member').style.display = "flex";
    showPopupOverlay();

    const data = await calculateContributionData(username);
    renderBarChart(data);
}

function closeBarChartPopup() {
    document.getElementById('bar-chart-member').style.display = "none";
    hidePopupOverlay();
}

async function calculateContributionData(username) {
    console.log(`Fetching sprints for user: ${username}`);
    const sprintRef = firebase.database().ref('sprintBoard');
    const snapshot = await sprintRef.once('value');

    const contributionsByDate = {};
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Normalize current date
    console.log(`Current Date: ${currentDate}`);

    const sprints = snapshot.val();
    let earliestDate = currentDate;

    for (const sprintKey in sprints) {
        if (sprints.hasOwnProperty(sprintKey)) {
            const sprintData = sprints[sprintKey];
            const sprintStartDate = new Date(sprintData.sprintStartDate);
            sprintStartDate.setHours(0, 0, 0, 0); // Normalize sprint start date
            console.log(`Sprint Start Date: ${sprintStartDate}`);

            // Update earliest date to the earliest sprint start date
            if (sprintStartDate < earliestDate) {
                earliestDate = sprintStartDate;
            }

            if (sprintData.sprintMembers && sprintData.sprintMembers.includes(username)) {
                console.log(`User ${username} is part of sprint: ${sprintKey}`);
                const backlogRef = firebase.database().ref(`sprintBoard/${sprintKey}/sprintBacklog`);
                const backlogSnapshot = await backlogRef.once('value');

                const tasks = backlogSnapshot.val();
                for (const taskKey in tasks) {
                    if (tasks.hasOwnProperty(taskKey)) {
                        const taskData = tasks[taskKey];
                        if (taskData.assignee === username) {
                            console.log(`User ${username} is assigned to task: ${taskKey}`);
                            const contributionsRef = firebase.database().ref(`sprintBoard/${sprintKey}/sprintBacklog/${taskKey}/contributions`);
                            const contributionsSnapshot = await contributionsRef.once('value');

                            const contributions = contributionsSnapshot.val();
                            for (const dayKey in contributions) {
                                if (contributions.hasOwnProperty(dayKey)) {
                                    const dayData = contributions[dayKey];
                                    const dayDate = new Date(sprintStartDate);
                                    dayDate.setDate(dayDate.getDate() + dayData.day - 1);
                                    dayDate.setHours(0, 0, 0, 0); // Normalize contribution date
                                    console.log(`Contribution Date: ${dayDate}`);

                                    // Check if the dayDate is within the sprint start date and current date range
                                    if (dayDate >= sprintStartDate && dayDate <= currentDate) {
                                        const dateString = dayDate.toISOString().split('T')[0];
                                        if (!contributionsByDate[dateString]) {
                                            contributionsByDate[dateString] = 0;
                                        }
                                        contributionsByDate[dateString] += dayData.time / 60; // Convert minutes to hours
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Fill in missing days with 0 contributions
    let dateIterator = new Date(earliestDate);
    dateIterator.setHours(0, 0, 0, 0); // Normalize date iterator
    while (dateIterator <= currentDate) {
        const dateString = dateIterator.toISOString().split('T')[0];
        if (!contributionsByDate[dateString]) {
            contributionsByDate[dateString] = 0;
        }
        dateIterator.setDate(dateIterator.getDate() + 1);
    }

    // Increment each date in contributionsByDate by 1 day
    const updatedContributionsByDate = {};
    Object.keys(contributionsByDate).forEach((date) => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + 1);
        const newDateString = newDate.toISOString().split('T')[0];
        updatedContributionsByDate[newDateString] = contributionsByDate[date];
    });

    // Sort updatedContributionsByDate in ascending order
    const sortedContributionsByDate = Object.keys(updatedContributionsByDate)
        .sort((a, b) => new Date(a) - new Date(b)) // Sort by date
        .reduce((obj, key) => {
            obj[key] = updatedContributionsByDate[key];
            return obj;
        }, {});

    console.log(sortedContributionsByDate);
    return sortedContributionsByDate;
}

function renderBarChart(data) {
    const ctx = document.getElementById('barChart').getContext('2d');
    const labels = Object.keys(data);
    const values = Object.values(data);

    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Hours Spent on Tasks',
            data: values,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: false
        }]
    };

    const chartOptions = {
        plugins: {
            title: {
                display: true,
                text: 'Contribution Time by Date',
                color: getColorForMode('#333333', '#cccccc'),
                font: {
                    size: 18
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Date',
                    color: getColorForMode('#333333', '#cccccc')
                },
                ticks: {
                    color: getColorForMode('#333333', '#cccccc')
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Hours',
                    color: getColorForMode('#333333', '#cccccc')
                },
                ticks: {
                    color: getColorForMode('#333333', '#cccccc')
                }
            }
        }
    };

    // Destroy the existing chart instance if it exists
    if (window.barChartInstance) {
        window.barChartInstance.destroy();
    }

    // Create a new chart instance
    window.barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: chartOptions
    });
}

const searchInput=document.querySelector("[data-search]");

searchInput.addEventListener("input", (e)=>{
    const value = e.target.value.toLowerCase();
    const canvas = document.querySelector('#MembersTable');
    const memberCards = ([].slice.call(canvas.children)).slice(1);
    const deletePopups = document.querySelectorAll('.delete-popup');
    memberCards.forEach(card => {
        if (card.dataset.username.toLowerCase().includes(value)) {
            card.style.display = 'flex';
            // document.getElementById('delete-popup').style.display = 'none';
            for (delete_popup in deletePopups) {
                try {
                    if (deletePopups[delete_popup].dataset.username.toLowerCase().includes(value)) {
                        deletePopups[delete_popup].style.display = 'none';
                        // break;
                    }
                } catch (error) {
                    console.error("Error processing delete popup");
                }
            }
        } else {
            card.style.display = 'none';
        }
    });
});

// Save the edits made to member details
document.getElementById('edit-member-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const password = document.getElementById('edit-password').value;

    firebase.database().ref('users/' + editMemberUsername).update({
        password: password
    });

    closeEditMemberPopup();
    showAdminDashboard();
});

// Redirect to login.html if not already on it
if (!window.location.href.includes('login.html') && !sessionStorage.getItem('redirected')) {
    sessionStorage.setItem('redirected', 'true');
    window.location.href = '/public/login.html';
}

// Function to check login credentials
function checkLoginCredentials() {
    const user = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (!user || !password) {
        alert("Username and password fields cannot be empty.");
        return;
    }

    firebase.database().ref('users/' + user).once('value', function(snapshot) {
        if (!snapshot.exists()) {
            alert("Username does not exist. Please try again.");
            return;
        }

        const data = snapshot.val();
        const username = data.username;
        const storedPassword = data.password;

        if (username === user && storedPassword === password) {
            sessionStorage.setItem('currentUser', user);
            window.location.href = '/public/index.html';
        } else {
            alert("Invalid username or password. Please try again.");
        }
    });
}

// Function to log out the user
function logOut() {
    sessionStorage.removeItem('currentUser');
    window.location.href = '/public/login.html';
}

// Save the current user globally
currentUser = sessionStorage.getItem('currentUser');

// Function to toggle password visibility
function togglePasswordVisibility() {
    const passwordFields = document.querySelectorAll('input[type="password"], input[type="text"]');
    passwordFields.forEach(field => {
        if (field.type === 'password') {
            field.type = 'text';
        } else if (field.type === 'text' && field.id !== 'login-username') {
            field.type = 'password';
        }
    });
}

//Placeholder function to toggle between user views

async function showContributionTime(contributionStartDate, contributionEndDate) {
    const adminDashBoard = document.getElementById('admin-dashboard');
    const editButton = document.getElementsByClassName('edit-taskM');
    const deleteButton = document.getElementsByClassName('DeleteButtonM');
    const historyLogButton = document.getElementsByClassName('show-history-logM');
    const contributionButton = document.getElementById('view-avg-contribution-button');

    closeContributionTimeMembersPopup();

    adminDashBoard.classList.toggle('active');
    contributionButton.classList.toggle('active');

    const memberCards = document.getElementsByClassName('memberCard');

    if (adminDashBoard.classList.contains('active')) {
        for (let i = 0; i < editButton.length; i++) {
            editButton[i].style.display = 'none';
        }
        for (let i = 0; i < deleteButton.length; i++) {
            deleteButton[i].style.display = 'none';
        }
        for (let i = 0; i < historyLogButton.length; i++) {
            historyLogButton[i].style.display = 'none';
        }

        contributionButton.innerHTML = "View User Cards";
        document.getElementsByClassName('MembersTableTitlePassword')[0].innerHTML = "Contribution Time (avg hours / day)";

        // Set the member-password div to show contribution time
        for (let i = 0; i < memberCards.length; i++) {
            const passwordDiv = memberCards[i].querySelector('.member-password');
            const username = memberCards[i].dataset.username;

            console.log(`Calculating average contribution time for user: ${username}`);
            try {
                const avgTime = await calculateAverageContributionTime(username, contributionStartDate, contributionEndDate);
                console.log(`Average contribution time for user ${username}: ${avgTime.toFixed(2)} hours/day`);
                passwordDiv.innerHTML = avgTime.toFixed(2);
            } catch (error) {
                console.error(`Error calculating average contribution time for user ${username}: `, error);
                passwordDiv.innerHTML = "0.00";
            }
        }

    } else {
        for (let i = 0; i < editButton.length; i++) {
            editButton[i].style.display = 'flex';
        }
        for (let i = 0; i < deleteButton.length; i++) {
            deleteButton[i].style.display = 'flex';
        }
        for (let i = 0; i < historyLogButton.length; i++) {
            historyLogButton[i].style.display = 'flex';
        }

        contributionButton.innerHTML = "View Contribution Time";
        document.getElementsByClassName('MembersTableTitlePassword')[0].innerHTML = "Password";

        // Set the member-password div to show the actual password
        for (let i = 0; i < memberCards.length; i++) {
            const passwordDiv = memberCards[i].querySelector('.member-password');
            const username = memberCards[i].dataset.username;
            const user_ref = firebase.database().ref('users/' + username);
            user_ref.once('value', function(snapshot) {
                const data = snapshot.val();
                passwordDiv.innerHTML = data.password;
            });
        }
    }
}

async function calculateAverageContributionTime(username, startDate, endDate) {
    console.log(`Fetching sprints for user: ${username}`);
    const sprintRef = firebase.database().ref('sprintBoard');
    const snapshot = await sprintRef.once('value');

    let totalMinutes = 0;
    let totalDays = 0;

    const sprints = snapshot.val();
    for (const sprintKey in sprints) {
        if (sprints.hasOwnProperty(sprintKey)) {
            const sprintData = sprints[sprintKey];
            const sprintStartDate = new Date(sprintData.sprintStartDate);
            const sprintEndDate = new Date(sprintData.sprintEndDate);

            if (sprintData.sprintMembers && sprintData.sprintMembers.includes(username)) {
                console.log(`User ${username} is part of sprint: ${sprintKey}`);
                const backlogRef = firebase.database().ref(`sprintBoard/${sprintKey}/sprintBacklog`);
                const backlogSnapshot = await backlogRef.once('value');

                const tasks = backlogSnapshot.val();
                for (const taskKey in tasks) {
                    if (tasks.hasOwnProperty(taskKey)) {
                        const taskData = tasks[taskKey];
                        if (taskData.assignee === username) {
                            console.log(`User ${username} is assigned to task: ${taskKey}`);
                            const contributionsRef = firebase.database().ref(`sprintBoard/${sprintKey}/sprintBacklog/${taskKey}/contributions`);
                            const contributionsSnapshot = await contributionsRef.once('value');

                            const contributions = contributionsSnapshot.val();
                            for (const dayKey in contributions) {
                                if (contributions.hasOwnProperty(dayKey)) {
                                    const dayData = contributions[dayKey];
                                    const dayDate = new Date(sprintStartDate);
                                    dayDate.setDate(dayDate.getDate() + dayData.day - 1);

                                    // Check if the dayDate is within the startDate and endDate range
                                    if (dayDate >= new Date(startDate) && dayDate <= new Date(endDate)) {
                                        console.log(`Adding ${dayData.time} minutes for day ${dayData.day} in sprint ${sprintKey}`);
                                        totalMinutes += dayData.time;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Ensure startDate and endDate have their time components set to zero
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    const daysInRange = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    totalDays = daysInRange > 0 ? daysInRange : 1;

    const avgTime = totalMinutes / (totalDays * 60);
    console.log(`Total minutes: ${totalMinutes}, Total days: ${totalDays}, Average time: ${avgTime}`);
    return avgTime;
}

function openContributionTimePopup() {
    const contributionButton = document.getElementById('view-avg-contribution-button');

    if (contributionButton.classList.contains('active'))
    {
        console.log("Hi");
        showContributionTime();
    }
    else
    {
        document.getElementById("contribution-time-popup").style.display = "flex";
        showOverlay();
    }
}

function closeContributionTimeMembersPopup() {
    document.getElementById("contribution-time-popup").style.display = "none";
    hideOverlay();
}

function sortMembers(order) {
    const membersTable = document.querySelector('#MembersTable');
    const memberCards = Array.from(membersTable.querySelectorAll('.memberCard'));

    memberCards.sort((a, b) => {
        const usernameA = a.dataset.username.toLowerCase();
        const usernameB = b.dataset.username.toLowerCase();

        if (order === 'up') {
            return usernameA.localeCompare(usernameB);
        } else {
            return usernameB.localeCompare(usernameA);
        }
    });

    // Remove only the member cards
    memberCards.forEach(card => membersTable.removeChild(card));

    // Re-append the sorted member cards
    memberCards.forEach(card => membersTable.appendChild(card));
}