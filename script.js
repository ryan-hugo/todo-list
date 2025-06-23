const inputText = document.querySelector(".add_task-container input");
const addBtn = document.getElementById("add-btn");

function addTask() {
  const taskText = inputText.value.trim();
  if (taskText === "") {
    alert("Por favor, insira uma tarefa.");
    return;
  }

  const taskContainer = document.createElement("div");
  taskContainer.classList.add("task");

  const btnContainer = document.createElement("div");
  btnContainer.classList.add("btn-container");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("task-checkbox");

  const taskId = `task-${Date.now()}`;
  checkbox.id = taskId;

  const label = document.createElement("label");
  label.textContent = taskText;

  const editBtn = document.createElement("button");
  editBtn.textContent = "Editar";
  editBtn.classList.add("edit-btn");

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Excluir";
  deleteBtn.classList.add("delete-btn");

  deleteBtn.addEventListener("click", () => {
    taskContainer.remove();
  });

  taskContainer.appendChild(checkbox);
  taskContainer.appendChild(label);
  taskContainer.appendChild(deleteBtn);
  taskContainer.appendChild(editBtn);

  document.querySelector(".manage_task-container").appendChild(taskContainer);

  inputText.value = "";
}

addBtn.addEventListener("click", addTask);
