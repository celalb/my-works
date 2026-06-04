const STORAGE_KEY = "todos";

const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");

const readTodos = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (todo) =>
        todo &&
        typeof todo.id === "string" &&
        typeof todo.text === "string" &&
        typeof todo.completed === "boolean"
    );
  } catch {
    return [];
  }
};

let todos = readTodos();

let lastTimestamp = 0;
let sameMsCounter = 0;

const createId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const now = Date.now();
  if (now === lastTimestamp) {
    sameMsCounter += 1;
  } else {
    lastTimestamp = now;
    sameMsCounter = 0;
  }

  return `${now}-${sameMsCounter}`;
};

const saveTodos = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
};

const setEmptyState = () => {
  emptyState.hidden = todos.length > 0;
};

const deleteTodo = (id) => {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
};

const toggleTodo = (id) => {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos();
  renderTodos();
};

const createTodoElement = (todo) => {
  const item = document.createElement("li");
  item.className = `todo-item${todo.completed ? " completed" : ""}`;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;
  checkbox.id = `todo-checkbox-${todo.id}`;
  checkbox.setAttribute("aria-label", `Toggle ${todo.text}`);
  checkbox.addEventListener("change", () => toggleTodo(todo.id));

  const label = document.createElement("label");
  label.htmlFor = checkbox.id;
  label.textContent = todo.text;

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-btn";
  deleteButton.textContent = "Delete";
  deleteButton.setAttribute("aria-label", `Delete ${todo.text}`);
  deleteButton.addEventListener("click", () => deleteTodo(todo.id));

  item.append(checkbox, label, deleteButton);
  return item;
};

const renderTodos = () => {
  todoList.replaceChildren();
  todos.forEach((todo) => {
    todoList.append(createTodoElement(todo));
  });
  setEmptyState();
};

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;

  todos.unshift({
    id: createId(),
    text,
    completed: false,
  });

  saveTodos();
  renderTodos();
  todoForm.reset();
  todoInput.focus();
});

renderTodos();
