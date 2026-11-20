// ==========================================
// 1. CLOCK, GREETING & CUSTOM NAME
// ==========================================
const clockEl = document.getElementById("clock");
const dateEl = document.getElementById("date");
const greetingTextEl = document.getElementById("greeting-text");
const userNameEl = document.getElementById("user-name");
const editNameBtn = document.getElementById("edit-name-btn");

function updateClockAndGreeting() {
  const now = new Date();

  // Format time (HH:MM:SS)
  clockEl.textContent = now.toLocaleTimeString("en-GB");

  // Format date (e.g., Tuesday, January 27, 2026)
  const dateOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  dateEl.textContent = now.toLocaleDateString("en-US", dateOptions);

  // Greeting based on hour
  const hour = now.getHours();
  if (hour < 12) {
    greetingTextEl.textContent = "Good Morning";
  } else if (hour < 18) {
    greetingTextEl.textContent = "Good Afternoon";
  } else {
    greetingTextEl.textContent = "Good Evening";
  }
}

// Load saved custom name
const savedName = localStorage.getItem("dashboard_userName");
if (savedName) {
  userNameEl.textContent = savedName;
}

function changeUserName() {
  const currentName = userNameEl.textContent;
  const newName = prompt("Enter your name:", currentName);
  if (newName && newName.trim() !== "") {
    userNameEl.textContent = newName.trim();
    localStorage.setItem("dashboard_userName", newName.trim());
  }
}

editNameBtn.addEventListener("click", changeUserName);
userNameEl.addEventListener("click", changeUserName);

setInterval(updateClockAndGreeting, 1000);
updateClockAndGreeting();

// ==========================================
// 2. LIGHT / DARK MODE
// ==========================================
const themeToggleBtn = document.getElementById("theme-toggle");

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggleBtn.textContent = "☀️ Light Mode";
  } else {
    document.body.classList.remove("dark-mode");
    themeToggleBtn.textContent = "🌙 Dark Mode";
  }
}

const savedTheme = localStorage.getItem("dashboard_theme") || "light";
applyTheme(savedTheme);

themeToggleBtn.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark-mode");
  const nextTheme = isDark ? "light" : "dark";
  localStorage.setItem("dashboard_theme", nextTheme);
  applyTheme(nextTheme);
});

// ==========================================
// 3. FOCUS TIMER (25 MINUTES)
// ==========================================
const timerDisplay = document.getElementById("timer-display");
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const resetBtn = document.getElementById("reset-btn");

const DEFAULT_TIME = 25 * 60;
let timeLeft = DEFAULT_TIME;
let timerInterval = null;

function renderTimer() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

startBtn.addEventListener("click", () => {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      renderTimer();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
      alert("Focus session complete! Take a break.");
    }
  }, 1000);
});

stopBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  timerInterval = null;
});

resetBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  timerInterval = null;
  timeLeft = DEFAULT_TIME;
  renderTimer();
});

renderTimer();

// ==========================================
// 4. TO-DO LIST (CRUD + PREVENT DUPLICATES)
// ==========================================
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskError = document.getElementById("task-error");

let tasks = JSON.parse(localStorage.getItem("dashboard_tasks")) || [];

function saveTasks() {
  localStorage.setItem("dashboard_tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "task-item";

    const leftDiv = document.createElement("div");
    leftDiv.className = "task-left";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => {
      tasks[index].completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const span = document.createElement("span");
    span.className = `task-text ${task.completed ? "completed" : ""}`;
    span.textContent = task.text;

    leftDiv.appendChild(checkbox);
    leftDiv.appendChild(span);

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-secondary";
    editBtn.style.padding = "0.35rem 0.65rem";
    editBtn.style.fontSize = "0.85rem";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => {
      const updated = prompt("Edit task:", task.text);
      if (updated && updated.trim() !== "") {
        const isDuplicate = tasks.some(
          (t, i) => i !== index && t.text.toLowerCase() === updated.trim().toLowerCase()
        );
        if (isDuplicate) {
          alert("That task already exists!");
          return;
        }
        tasks[index].text = updated.trim();
        saveTasks();
        renderTasks();
      }
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);

    li.appendChild(leftDiv);
    li.appendChild(actionsDiv);
    taskList.appendChild(li);
  });
}

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  // Challenge: Prevent duplicate tasks
  const duplicate = tasks.some((t) => t.text.toLowerCase() === text.toLowerCase());
  if (duplicate) {
    taskError.classList.remove("hidden");
    return;
  }

  taskError.classList.add("hidden");
  tasks.push({ text, completed: false });
  saveTasks();
  renderTasks();
  taskInput.value = "";
});

renderTasks();

// ==========================================
// 5. QUICK LINKS
// ==========================================
const linkForm = document.getElementById("link-form");
const linkNameInput = document.getElementById("link-name");
const linkUrlInput = document.getElementById("link-url");
const linksContainer = document.getElementById("links-container");

let quickLinks = JSON.parse(localStorage.getItem("dashboard_links")) || [
  { name: "Google", url: "https://www.google.com" },
  { name: "Gmail", url: "https://mail.google.com" },
  { name: "Calendar", url: "https://calendar.google.com" }
];

function saveLinks() {
  localStorage.setItem("dashboard_links", JSON.stringify(quickLinks));
}

function renderLinks() {
  linksContainer.innerHTML = "";
  quickLinks.forEach((link, index) => {
    const pill = document.createElement("div");
    pill.className = "link-pill";

    const anchor = document.createElement("a");
    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = link.name;

    const removeBtn = document.createElement("button");
    removeBtn.className = "delete-link-btn";
    removeBtn.textContent = "×";
    removeBtn.title = "Remove link";
    removeBtn.addEventListener("click", () => {
      quickLinks.splice(index, 1);
      saveLinks();
      renderLinks();
    });

    pill.appendChild(anchor);
    pill.appendChild(removeBtn);
    linksContainer.appendChild(pill);
  });
}

linkForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = linkNameInput.value.trim();
  let url = linkUrlInput.value.trim();

  if (!name || !url) return;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  quickLinks.push({ name, url });
  saveLinks();
  renderLinks();
  linkNameInput.value = "";
  linkUrlInput.value = "";
});

renderLinks();