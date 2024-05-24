document.addEventListener('DOMContentLoaded', () => {

    // Get references to input fields and buttons
    const taskTitle = document.getElementById('taskTitle');
    const taskDescription = document.getElementById('taskDescription');
    const taskDueDate = document.getElementById('taskDueDate');
    const taskCategory = document.getElementById('taskCategory');
    const taskPriority = document.getElementById('taskPriority');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');
    const filterTitle = document.getElementById('filterTitle');
    const filterDueDate = document.getElementById('filterDueDate');
    const filterPriority = document.getElementById('filterPriority');
    const sortTasks = document.getElementById('sortTasks');

    // Event listener for the "Add Task" button
    addTaskButton.addEventListener('click', () => {
        const title = taskTitle.value.trim();
        const description = taskDescription.value.trim();
        const dueDate = taskDueDate.value;
        const category = taskCategory.value;
        const priority = taskPriority.value;

        if (!title || !description || !dueDate) {
            alert('Please fill in all fields');
            return;
        }

        // Generate a unique ID based on timestamp
        const id = new Date().getTime().toString();

        addTask(id, title, description, dueDate, category, priority);
        saveTasks();
        clearInputs(); // Clear input fields
    });

    // Function to add a task to the list
    function addTask(id, title, description, dueDate, category, priority) {
        const taskItem = document.createElement('div');
        taskItem.classList.add('taskItem');
        taskItem.setAttribute('data-id', id);
        taskItem.innerHTML = `
            <h3>${title}</h3>
            <p>${description}</p>
            <small>Due: ${dueDate}</small>
            <small>Category: ${category}</small>
            <small>Priority: ${priority}</small>
            <!-- Other elements -->
            <div class="progress-container">
                <input type="range" min="0" max="100" value="0" class="task-progress">
                <span class="progress-label">0%</span>
            </div>
            <button class="deleteTaskButton">Delete</button>
        `;
        taskList.appendChild(taskItem);

        // Add event listener to the delete button
        taskItem.querySelector('.deleteTaskButton').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this task?')) {
                deleteTask(id);
            }
        });
    }

    // Function to delete a task
    function deleteTask(id) {
        // Remove task from DOM
        const taskItem = document.querySelector(`.taskItem[data-id='${id}']`);
        if (taskItem) {
            taskList.removeChild(taskItem);
        }

        // Remove task from localStorage
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const updatedTasks = tasks.filter(task => task.id !== id);
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));

        // Reload tasks to ensure proper state
        loadTasks();
    }

    // Function to save tasks to localStorage
    function saveTasks() {
        const tasks = [];
        document.querySelectorAll('.taskItem').forEach(taskItem => {
            tasks.push({
                id: taskItem.getAttribute('data-id'),
                title: taskItem.querySelector('h3').innerText,
                description: taskItem.querySelector('p').innerText,
                dueDate: taskItem.querySelector('small').innerText.replace('Due: ', ''),
                category: taskItem.querySelector('small:nth-child(4)').innerText.replace('Category: ', ''),
                priority: taskItem.querySelector('small:nth-child(5)').innerText.replace('Priority: ', ''),
                progress: taskItem.querySelector('.task-progress').value // Include progress
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Function to load tasks from localStorage
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        taskList.innerHTML = ''; // Clear current tasks
        tasks.forEach(task => {
            addTask(task.id, task.title, task.description, task.dueDate, task.category, task.priority);
            const taskItem = document.querySelector(`.taskItem[data-id='${task.id}']`);
            if (taskItem) {
                taskItem.querySelector('.task-progress').value = task.progress || 0; // Set progress
                taskItem.querySelector('.progress-label').textContent = `${task.progress || 0}%`; // Update progress label
            }
        });
    }

    // Function to clear input fields
    function clearInputs() {
        taskTitle.value = '';
        taskDescription.value = '';
        taskDueDate.value = '';
    }

    // Filter tasks function updated to search through title and description
    function filterTasks(tasks) {
        const query = filterTitle.value.toLowerCase();
        const dueDateFilter = filterDueDate.value;
        const categoryFilter = taskCategory.value; // Get category filter value
        const priorityFilter = filterPriority.value; // Get priority filter value
        return tasks.filter(task => {
            return (query === '' || task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query)) &&
                (dueDateFilter === '' || task.dueDate === dueDateFilter) &&
                (categoryFilter === 'All' || task.category === categoryFilter) &&
                (priorityFilter === 'All' || task.priority === priorityFilter);
        });
    }

    // Function to sort tasks list
    function sortTasksList(tasks) {
        const sortBy = sortTasks.value;
        return tasks.sort((a, b) => {
            if (sortBy === 'alphabetical') {
                return a.title.localeCompare(b.title);
            } else if (sortBy === 'reverseAlphabetical') {
                return b.title.localeCompare(a.title);
            } else if (sortBy === 'soonest') {
                return new Date(a.dueDate) - new Date(b.dueDate);
            } else if (sortBy === 'latest') {
                return new Date(b.dueDate) - new Date(a.dueDate);
            }
        });
    }

    // Function to filter and sort tasks
    function filterAndSortTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        let filteredTasks = filterTasks(tasks);
        filteredTasks = sortTasksList(filteredTasks);
        taskList.innerHTML = '';
        filteredTasks.forEach(task => addTask(task.id, task.title, task.description, task.dueDate, task.category, task.priority));
    }

    // Debounce function to improve search performance
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Event listener for input in the filterTitle field with debounce
    filterTitle.addEventListener('input', debounce(filterAndSortTasks, 300)); // Apply debounce

    // Load tasks on page load
    loadTasks();
});
