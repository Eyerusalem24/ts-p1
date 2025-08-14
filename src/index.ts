const readline = require('readline');
const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, 'tasks.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Task type
interface Task {
  id: number;
  title: string;
  completed: boolean;
}

// Array to hold tasks
let tasks: Task[] = [];

// Load tasks from file
function loadTasks() {
  if (fs.existsSync(dataFilePath)) {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    try {
      tasks = JSON.parse(data);
    } catch {
      tasks = [];
      console.log("Warning: tasks.json is corrupted. Starting with empty task list.");
    }
  }
}

// Save tasks to file
function saveTasks() {
  fs.writeFileSync(dataFilePath, JSON.stringify(tasks, null, 2), 'utf8');
}

// Helper to ask user for input
function askQuestion(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

// List all tasks
async function listTasks() {
  if (tasks.length === 0) {
    console.log('No tasks found.');
  } else {
    console.log('Tasks:');
    tasks.forEach(task => {
      console.log(`${task.id}. ${task.title} [${task.completed ? 'x' : ' '}]`);
    });
    console.log('');
  }
}

// Add a new task
async function addTask() {
  const title = await askQuestion('Enter task title: ');
  const newTask: Task = {
    id: tasks.length > 0 ? (tasks[tasks.length - 1]?.id ?? 0) + 1 : 1,
    title,
    completed: false
  };
  tasks.push(newTask);
  saveTasks();
  console.log(`Task "${title}" added.\n`);
}

// Complete a task
async function completeTask() {
  const id = parseInt(await askQuestion('Enter task ID to complete: '), 10);
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = true;
    saveTasks();
    console.log(`Task "${task.title}" marked as completed.\n`);
  } else {
    console.log(`Task with ID ${id} not found.\n`);
  }
}

// Delete a task
async function deleteTask() {
  const id = parseInt(await askQuestion('Enter task ID to delete: '), 10);
  const index = tasks.findIndex(t => t.id === id);
  if (index !== -1) {
    const [deletedTask] = tasks.splice(index, 1); // destructuring guarantees defined value
    saveTasks();
    if (deletedTask) {
      console.log(`Task "${deletedTask.title}" deleted.\n`);
    } else {
      console.log('Task deleted, but title is unavailable.\n');
    }
  } else {
    console.log(`Task with ID ${id} not found.\n`);
  }
}

// Main menu loop
async function mainMenu() {
  loadTasks();
  while (true) {
    console.log('Task Manager');
    console.log('1. List tasks');
    console.log('2. Add task');
    console.log('3. Complete task');
    console.log('4. Delete task');
    console.log('5. Exit');

    const choice = await askQuestion('Choose an option: ');
    switch (choice) {
      case '1':
        await listTasks();
        break;
      case '2':
        await addTask();
        break;
      case '3':
        await completeTask();
        break;
      case '4':
        await deleteTask();
        break;
      case '5':
        console.log('Goodbye!');
        rl.close();
        return;
      default:
        console.log('Invalid option. Please try again.\n');
    }
  }
}

// Start the app
mainMenu().catch(err => {
  console.error('Unexpected error:', err);
  rl.close();
});
