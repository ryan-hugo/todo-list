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
  if (isChecked) {
    label.style.textDecoration = "line-through";
  }
  const icon = checkbox.querySelector("i");

  checkbox.addEventListener("click", () => {
    const isNowChecked = icon.classList.contains("bi-circle");

    if (isNowChecked) {
      icon.classList.remove("bi-circle");
      icon.classList.add("bi-check-circle");
      label.style.textDecoration = "line-through";
      label.style.color = "gray"
      icon.style.color = "gray"
      taskList[taskId].isChecked = true;
    } else {
      icon.classList.remove("bi-check-circle");
      icon.classList.add("bi-circle");
      label.style.textDecoration = "none";
      label.style.color = "white"
      icon.style.color = "inherit"
      taskList[taskId].isChecked = false;
    }
    localStorage.setItem("taskList", JSON.stringify(taskList));
    console.log(taskList);
  });

  const editBtn = document.createElement("button");
  editBtn.setAttribute("aria-label", "Editar Tarefa");
  editBtn.innerHTML = `<i class="bi bi-pencil" aria-hidden="true"></i>`;
  editBtn.classList.add("edit-btn");

  editBtn.addEventListener("click", () => {
    // Cria um input para edição
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.maxLength = "45";
    editInput.value = label.textContent;
    editInput.classList.add("edit-input");
    label.style.display = "none";
    editBtn.style.display = "none";
    taskContainer.insertBefore(editInput, btnContainer);
    editInput.focus();

    // Salva edição ao perder foco ou pressionar Enter
    function saveEdit() {
      const newValue = editInput.value.trim();
      if (newValue !== "") {
        label.textContent = newValue;
        taskList[taskId].value = newValue;
        localStorage.setItem("taskList", JSON.stringify(taskList));
      }
      label.style.display = "";
      editBtn.style.display = "";
      taskContainer.removeChild(editInput);
    }

    editInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") saveEdit();
    });
    editInput.addEventListener("blur", saveEdit);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.setAttribute("aria-label", "Excluir Tarefa");
  deleteBtn.innerHTML = `<i class="bi bi-trash" aria-hidden="true"></i>`;
  deleteBtn.classList.add("delete-btn");

  deleteBtn.addEventListener("click", () => {
    // Cria o overlay de confirmação
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";


    // Cria o modal de confirmação
    const modal = document.createElement("div");
    modal.classList.add("confirm-modal")

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
      localStorage.setItem("taskList", JSON.stringify(taskList));
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
  });
  noTaskMessage.style.display = "none";

  btnContainer.appendChild(editBtn);
  btnContainer.appendChild(deleteBtn);
  if (taskList[taskId].isChecked === true) {
    label.style.color = "gray"
    icon.style.color = "gray"
  }


  taskContainer.appendChild(checkbox);
  taskContainer.appendChild(label);
  taskContainer.appendChild(btnContainer);

  manageTask.appendChild(taskContainer);
  manageTask.style.display = "flex";
}

function addTask() {
  const taskText = inputText.value.trim();
  if (taskText === "") {
    alert("Por favor, insira uma tarefa.");
    return;
  }
  const taskId = `task-${Date.now()}`;
  taskList[taskId] = { value: taskText, isChecked: false };
  localStorage.setItem("taskList", JSON.stringify(taskList));
  inputText.value = "";
  currentPage = Math.ceil(Object.keys(taskList).length / TASKS_PER_PAGE);
  refreshTasks();
}

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

