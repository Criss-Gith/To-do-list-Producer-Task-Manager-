// Modelo de datos
let tasks = [];
let currentFilter = "all";

// Cargar / guardar storage
function loadTasks() {
  const stored = localStorage.getItem("producerTasks");
  if (stored) {
    tasks = JSON.parse(stored);
  } else {
    tasks = [];
  }
}

function saveTasks() {
  localStorage.setItem("producerTasks", JSON.stringify(tasks));
}

// Agregar tarea
function addTask(title, project, priority, dueDate, status) {
  if (!title.trim()) return false;
  const newTask = {
    id: Date.now(),
    title: title.trim(),
    project: project.trim() || "Sin proyecto",
    priority: priority,
    dueDate: dueDate,
    status: status,
    createdAt: new Date().toISOString()
  };
  tasks.push(newTask);
  saveTasks();
  renderTasks();
  return true;
}

// Eliminar tarea
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

// Cambiar estado (pendiente -> progreso -> completada)
function changeStatus(id, newStatus) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.status = newStatus;
    saveTasks();
    renderTasks();
  }
}

// Limpiar tareas completadas
function clearCompleted() {
  tasks = tasks.filter(t => t.status !== "completada");
  saveTasks();
  renderTasks();
}

// Editar campo rápido (por simplicidad, editar título)
function editTaskTitle(id, newTitle) {
  if (!newTitle.trim()) return;
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.title = newTitle.trim();
    saveTasks();
    renderTasks();
  }
}

// Renderizado con filtro
function renderTasks() {
  const container = document.getElementById("taskList");
  if (!container) return;

  let filteredTasks = tasks;
  if (currentFilter !== "all") {
    filteredTasks = tasks.filter(t => t.status === currentFilter);
  }

  if (filteredTasks.length === 0) {
    container.innerHTML = `<li class="empty-message">📭 No hay tareas con este filtro. ¡Crea una nueva!</li>`;
    return;
  }

  let html = "";
  filteredTasks.forEach(task => {
    // Prioridad legible
    let priorityClass = "";
    let priorityText = "";
    switch (task.priority) {
      case "alta": priorityClass = "alta"; priorityText = "🔴 Alta"; break;
      case "media": priorityClass = "media"; priorityText = "🟡 Media"; break;
      case "baja": priorityClass = "baja"; priorityText = "🟢 Baja"; break;
      default: priorityClass = "media"; priorityText = "Media";
    }
    // Estado legible
    let statusText = "";
    switch (task.status) {
      case "pendiente": statusText = "⏳ Pendiente"; break;
      case "progreso": statusText = "⚙️ En progreso"; break;
      case "completada": statusText = "✅ Completada"; break;
      default: statusText = task.status;
    }
    // Fecha formateada
    const dueDateFormatted = task.dueDate ? task.dueDate : "Sin fecha";

    html += `
      <li class="task-card" data-id="${task.id}">
        <div class="task-header">
          <span class="task-title">${escapeHtml(task.title)}</span>
          <span class="task-project">📁 ${escapeHtml(task.project)}</span>
        </div>
        <div class="task-details">
          <span class="priority ${priorityClass}">${priorityText}</span>
          <span class="due-date">📅 ${dueDateFormatted}</span>
          <span class="status ${task.status}">${statusText}</span>
        </div>
        <div class="task-actions">
          <button class="edit-btn" data-action="edit" title="Editar título">✏️</button>
          <button class="delete-btn" data-action="delete" title="Eliminar">🗑️</button>
          <select class="status-select" data-action="status">
            <option value="pendiente" ${task.status === "pendiente" ? "selected" : ""}>⏳ Pendiente</option>
            <option value="progreso" ${task.status === "progreso" ? "selected" : ""}>⚙️ En progreso</option>
            <option value="completada" ${task.status === "completada" ? "selected" : ""}>✅ Completada</option>
          </select>
        </div>
      </li>
    `;
  });
  container.innerHTML = html;

  // Adjuntar eventos dinámicos
  document.querySelectorAll(".task-card").forEach(card => {
    const id = Number(card.dataset.id);
    const editBtn = card.querySelector(".edit-btn");
    const deleteBtn = card.querySelector(".delete-btn");
    const statusSelect = card.querySelector(".status-select");

    if (editBtn) {
      editBtn.addEventListener("click", () => {
        const newTitle = prompt("Editar título de la tarea:", tasks.find(t => t.id === id)?.title);
        if (newTitle) editTaskTitle(id, newTitle);
      });
    }
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        if (confirm("¿Eliminar esta tarea?")) deleteTask(id);
      });
    }
    if (statusSelect) {
      statusSelect.addEventListener("change", (e) => {
        changeStatus(id, e.target.value);
      });
    }
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// Inicialización
function init() {
  loadTasks();
  renderTasks();

  // Botón agregar tarea
  const addBtn = document.getElementById("addTaskBtn");
  const titleInput = document.getElementById("taskTitle");
  const projectInput = document.getElementById("taskProject");
  const prioritySelect = document.getElementById("taskPriority");
  const dueDateInput = document.getElementById("taskDueDate");
  const statusSelect = document.getElementById("taskStatus");

  addBtn.addEventListener("click", () => {
    const title = titleInput.value;
    const project = projectInput.value;
    const priority = prioritySelect.value;
    const dueDate = dueDateInput.value;
    const status = statusSelect.value;
    if (addTask(title, project, priority, dueDate, status)) {
      titleInput.value = "";
      projectInput.value = "";
      dueDateInput.value = "";
      prioritySelect.value = "media";
      statusSelect.value = "pendiente";
      titleInput.focus();
    } else {
      alert("Escribe al menos el título de la tarea");
    }
  });

  // Filtros
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderTasks();
    });
  });

  // Limpiar completadas
  const clearCompletedBtn = document.getElementById("clearCompletedBtn");
  if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener("click", () => {
      if (confirm("¿Eliminar todas las tareas completadas?")) clearCompleted();
    });
  }
}

document.addEventListener("DOMContentLoaded", init);