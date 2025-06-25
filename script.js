const inputText = document.querySelector(".add_task-container input");
const addBtn = document.getElementById("add-btn");
const manageTask = document.querySelector(".manage_task-container");
const noTaskMessage = document.getElementById("noTask-message");
let taskList = {};

//Enviar task via tecla "Enter"
inputText.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addBtn.click();
  }
});

addBtn.addEventListener("click", addTask);

// Utilitário para atualizar localStorage e recarregar tarefas
function updateTaskListAndRefresh() {
  localStorage.setItem("taskList", JSON.stringify(taskList));
  refreshTasks();
}

// Função para validar entrada de tarefa
function isValidTaskInput(text) {
  return text.trim() !== "" && !Object.values(taskList).some(task => task.value === text.trim());
}

function createTaskElement(taskId, taskText, isChecked = false) {
  const taskContainer = document.createElement("div");
  taskContainer.classList.add("task");

  const btnContainer = document.createElement("div");
  btnContainer.classList.add("btn-container");

  const checkbox = document.createElement("button");
  checkbox.setAttribute("aria-label", "Checkbox");
  checkbox.classList.add("task-checkbox");
  checkbox.id = taskId;
  checkbox.innerHTML = isChecked
    ? `<i class="bi bi-check-circle"></i>`
    : `<i class="bi bi-circle"></i>`;

  const label = document.createElement("label");
  label.classList.add("taskLabel");
  label.textContent = taskText;
  label.setAttribute("tabindex", "0"); // Acessibilidade
  if (isChecked) {
    label.style.textDecoration = "line-through";
    label.style.color = "gray";
  }
  const icon = checkbox.querySelector("i");

  function toggleCheck() {
    const isNowChecked = icon.classList.contains("bi-circle");
    if (isNowChecked) {
      icon.classList.remove("bi-circle");
      icon.classList.add("bi-check-circle");
      label.classList.add("checked");
      taskList[taskId].isChecked = true;
    } else {
      icon.classList.remove("bi-check-circle");
      icon.classList.add("bi-circle");
      label.classList.remove("checked");
      taskList[taskId].isChecked = false;
    }
    updateTaskListAndRefresh();
  }

  checkbox.addEventListener("click", toggleCheck);

  // Permite marcar/desmarcar com espaço (acessibilidade)
  label.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggleCheck();
    }
  });

  const editBtn = document.createElement("button");
  editBtn.setAttribute("aria-label", "Editar Tarefa");
  editBtn.innerHTML = `<i class="bi bi-pencil" aria-hidden="true"></i>`;
  editBtn.classList.add("edit-btn");

  function handleEdit() {
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.maxLength = "65";
    editInput.value = label.textContent;
    editInput.classList.add("edit-input");
    editInput.setAttribute("aria-label", "Editar texto da tarefa");
    label.style.display = "none";
    editBtn.style.display = "none";
    taskContainer.insertBefore(editInput, btnContainer);
    editInput.focus();

    function saveEdit() {
      const newValue = editInput.value.trim();
      if (isValidTaskInput(newValue)) {
        label.textContent = newValue;
        taskList[taskId].value = newValue;
        updateTaskListAndRefresh();
      }
      label.style.display = "";
      editBtn.style.display = "";
      if (taskContainer.contains(editInput)) {
        taskContainer.removeChild(editInput);
      }
    }

    editInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") saveEdit();
      if (e.key === "Escape") {
        label.style.display = "";
        editBtn.style.display = "";
        if (taskContainer.contains(editInput)) {
          taskContainer.removeChild(editInput);
        }
      }
    });
    editInput.addEventListener("blur", saveEdit);
  }

  editBtn.addEventListener("click", handleEdit);

  const deleteBtn = document.createElement("button");
  deleteBtn.setAttribute("aria-label", "Excluir Tarefa");
  deleteBtn.innerHTML = `<i class="bi bi-trash" aria-hidden="true"></i>`;
  deleteBtn.classList.add("delete-btn");

  deleteBtn.addEventListener("click", () => {
    // Overlay de confirmação
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.setAttribute("tabindex", "0");

    // Modal de confirmação
    const modal = document.createElement("div");
    modal.classList.add("confirm-modal");

    const msg = document.createElement("p");
    msg.id = "modalText";
    msg.textContent = "Tem certeza que deseja excluir esta tarefa?";

    const btnYes = document.createElement("button");
    btnYes.textContent = "Sim";
    btnYes.className = "confirm-yes-btn";

    const btnNo = document.createElement("button");
    btnNo.textContent = "Não";
    btnNo.className = "confirm-no-btn";

    btnYes.addEventListener("click", () => {
      delete taskList[taskId];
      updateTaskListAndRefresh();
      document.body.removeChild(overlay);
      const totalPages = Math.ceil(
        Object.keys(taskList).length / TASKS_PER_PAGE
      );
      if (currentPage > totalPages) currentPage = totalPages || 1;
      refreshTasks();
    });

    btnNo.addEventListener("click", () => {
      document.body.removeChild(overlay);
    });

    modal.appendChild(msg);
    modal.appendChild(btnYes);
    modal.appendChild(btnNo);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    btnNo.focus();
  });
  noTaskMessage.style.display = "none";

  btnContainer.appendChild(editBtn);
  btnContainer.appendChild(deleteBtn);

  // Use classes para estilos ao invés de inline
  if (taskList[taskId].isChecked === true) {
    label.classList.add("checked");
    icon.style.color = "gray";
  }

  taskContainer.appendChild(checkbox);
  taskContainer.appendChild(label);
  taskContainer.appendChild(btnContainer);

  manageTask.appendChild(taskContainer);
  manageTask.style.display = "flex";
}

function addTask() {
  const taskText = inputText.value.trim();
  if (!isValidTaskInput(taskText)) {
    alert("Por favor, insira uma tarefa válida e não duplicada.");
    return;
  }
  const taskId = `task-${Date.now()}`;
  taskList[taskId] = { value: taskText, isChecked: false };
  updateTaskListAndRefresh();
  inputText.value = "";
  currentPage = Math.ceil(Object.keys(taskList).length / TASKS_PER_PAGE);
  refreshTasks();
}

// Desabilita botão "Adicionar" se campo estiver vazio
inputText.addEventListener("input", () => {
  addBtn.disabled = inputText.value.trim() === "";
});
addBtn.disabled = true;

// Atualize o carregamento inicial para usar renderTasksPage
window.addEventListener("DOMContentLoaded", () => {
  const storedTasks = JSON.parse(localStorage.getItem("taskList"));
  if (storedTasks) {
    taskList = storedTasks;
  } else {
    manageTask.style.display = "none";
    noTaskMessage.style.display = "flex";
  }
  renderTasksPage(currentPage);
});

// Paginação de tarefas
const TASKS_PER_PAGE = 7;
let currentPage = 1;

function renderTasksPage(page = 1) {
  manageTask.innerHTML = "";
  const taskIds = Object.keys(taskList);
  const totalPages = Math.ceil(taskIds.length / TASKS_PER_PAGE);
  if (taskIds.length === 0) {
    manageTask.style.display = "none";
    noTaskMessage.style.display = "flex";
    removePagination();
    return;
  }
  manageTask.style.display = "flex";
  noTaskMessage.style.display = "none";
  const start = (page - 1) * TASKS_PER_PAGE;
  const end = start + TASKS_PER_PAGE;
  taskIds.slice(start, end).forEach((taskId) => {
    const { value, isChecked } = taskList[taskId];
    createTaskElement(taskId, value, isChecked);
  });
  renderPagination(totalPages, page);
}

function renderPagination(totalPages, page) {
  removePagination();
  if (totalPages <= 1) return;
  const pagination = document.createElement("div");
  pagination.className = "pagination";
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === page ? "active" : "";
    if(btn.classList.contains("active")){
      btn.style.background = "linear-gradient(to right, #740101, #161616)"
    }
    btn.addEventListener("click", () => {
      currentPage = i;
      renderTasksPage(currentPage);
    });
    pagination.appendChild(btn);
  }
  manageTask.parentNode.appendChild(pagination);
}

function removePagination() {
  const oldPagination = document.querySelector(".pagination");
  if (oldPagination) oldPagination.remove();
}

// Substitui a chamada de createTaskElement por renderTasksPage
function refreshTasks() {
  renderTasksPage(currentPage);
}

