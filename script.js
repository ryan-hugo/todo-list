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
    ? `<i class="bi bi-check-square"></i>`
    : `<i class="bi bi-square"></i>`;

  const label = document.createElement("label");
  label.classList.add("taskLabel");
  label.textContent = taskText;
  if (isChecked) {
    label.style.textDecoration = "line-through";
  }

  checkbox.addEventListener("click", () => {
    const icon = checkbox.querySelector("i");
    const isNowChecked = icon.classList.contains("bi-square");

    if (isNowChecked) {
      icon.classList.remove("bi-square");
      icon.classList.add("bi-check-square");
      label.style.textDecoration = "line-through";
      taskList[taskId].isChecked = true;
    } else {
      icon.classList.remove("bi-check-square");
      icon.classList.add("bi-square");
      label.style.textDecoration = "none";
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
    delete taskList[taskId];
    localStorage.setItem("taskList", JSON.stringify(taskList));
    manageTask.removeChild(taskContainer);
    if (Object.keys(taskList).length === 0) {
      manageTask.style.display = "none";
      noTaskMessage.style.display = "flex";
    }
  });
  noTaskMessage.style.display = "none";

  btnContainer.appendChild(editBtn);
  btnContainer.appendChild(deleteBtn);

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

  createTaskElement(taskId, taskText, false);

  inputText.value = "";
}

window.addEventListener("DOMContentLoaded", () => {
  const storedTasks = JSON.parse(localStorage.getItem("taskList"));

  if (storedTasks) {
    taskList = storedTasks;
    Object.keys(taskList).forEach((taskId) => {
      const { value, isChecked } = taskList[taskId];
      createTaskElement(taskId, value, isChecked);
    });
  } else {
    manageTask.style.display = "none";
    noTaskMessage.style.display = "flex";
  }
});
