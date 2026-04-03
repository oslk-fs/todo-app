
; (function () {
    const input = document.getElementById("taskInput");
    const addBtn = document.getElementById("addBtn");
    const list = document.getElementById("taskList");
    const clearBtn = document.getElementById("clearBtn");

    let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
    let currentFilter = 'all';

    function saveToLocalStorage() {
        localStorage.setItem('myTasks', JSON.stringify(tasks));
    }

    //créer l'élément dans le DOM
    function renderTask(taskObj) {
        const li = document.createElement('li');
        const inputCheck = document.createElement('input');
        const span = document.createElement('span');
        const spanDrag = document.createElement('span');
        const editBtn = document.createElement('button');
        const delBtn = document.createElement('button');

        inputCheck.type = 'checkbox';
        inputCheck.title = "completed";
        inputCheck.checked = taskObj.completed;
        span.title = "double click to edit";
        span.textContent = taskObj.text;
        spanDrag.className = "drag-handle";
        spanDrag.innerHTML = '<img src="assets/icons/drag_handle.png" alt="icon drag handle" title="Drag&Drop a task">';
        editBtn.className = "editBtn";
        editBtn.title = "edit";
        editBtn.innerHTML = '<img src="assets/icons/edit.png" alt="icon edit">';
        delBtn.className = "delBtn";
        delBtn.title = "delete";
        delBtn.innerHTML = '<img src="assets/icons/delete.png" alt="icon delete">';

        if (taskObj.completed) {
            li.classList.add('completed');
        } else {
            li.classList.remove('completed');
        }

        // Edition de la tâche
        const editTask = () => {
            if (taskObj.completed) {
                alert("Impossible de modifier une tâche terminée.");
                return;
            }

            span.contentEditable = true;
            span.focus();
            editBtn.style.display = 'none';

            const saveChanges = () => {
                span.contentEditable = false;
                editBtn.style.display = 'block';
                updateTask(taskObj.id, span.textContent);
            };

            span.addEventListener('blur', saveChanges, {once: true});
            span.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveChanges();
                }
            }, {once: true});
        };

        editBtn.addEventListener('click', editTask);
        span.addEventListener('dblclick', () => {
            editTask();
            span.style.cursor = 'text';
            if(taskObj.completed) {
                span.style.outline = '1px dashed #ef4444';
            } else {
                span.style.outline = '1px dashed #6366f1';
            }
        });

        // Toggle completion status
        const toggleComplete = () => {
            taskObj.completed = inputCheck.checked;
            saveToLocalStorage();
            renderAllTask();
        }

        inputCheck.addEventListener('change', toggleComplete);

        // suppression de la tâche
        delBtn.addEventListener('click', () => {
            li.style.transform = "translateX(100px)";
            li.style.opacity = "0";

            setTimeout(() => {
                tasks = tasks.filter(t => t.id !== taskObj.id);
                saveToLocalStorage();
                renderAllTask();
            }, 300);
        });

        // Drag&Drop system
        li.draggable = true;
        li.dataset.taskId = taskObj.id;

        li.addEventListener('dragstart', (e) => {
            li.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('taskId', taskObj.id);
        });

        li.addEventListener('dragend', () => {
            li.classList.remove('dragging');
        });

        li.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            const draggingItem = list.querySelector('.dragging');
            if (draggingItem !== li) {
                li.style.borderTop = '3px solid #6366f1';
            }
        });

        li.addEventListener('dragleave', () => {
            li.style.borderTop = 'none';
        });

        li.addEventListener('drop', (e) => {
            e.preventDefault();
            li.style.borderTop = 'none';
            const draggedTaskId = Number.parseInt(e.dataTransfer.getData('taskId'));

            if (draggedTaskId !== taskObj.id) {
                const draggedIndex = tasks.findIndex(t => t.id === draggedTaskId);
                const targetIndex = tasks.findIndex(t => t.id === taskObj.id);

                const [draggedTask] = tasks.splice(draggedIndex, 1);
                tasks.splice(targetIndex, 0, draggedTask);

                saveToLocalStorage();
                renderAllTask();
            }
        });

        li.append(spanDrag, inputCheck, span, editBtn, delBtn);

        list.appendChild(li);
    }

    //Ajouter une nouvelle tâche
    function createNewTask(value) {
        const text = value.trim();
        if (!text) return;

        const newTask = {
            id: Date.now(),
            text: text,
            completed: false
        };

        tasks.push(newTask);
        renderTask(newTask);
        saveToLocalStorage();
        renderAllTask();

        input.value = "";
    }

    //update task 
    function updateTask(taskId, newText) {
        const task = tasks.find(t => t.id === taskId);
        if (task && (newText !== "" || newText !== undefined || newText !== null)) {
            task.text = newText;
            saveToLocalStorage();
            renderAllTask();
        }
    }


    // Initialisation : Afficher les tâches stockées
    function renderAllTask() {
        list.innerHTML = "";
        let filtered = tasks.filter(task => {
            if (currentFilter === "active") return !task.completed;
            if (currentFilter === "completed") return task.completed;
            return true;
        });

        function message(value) {
            const empty = document.createElement('p');
            empty.textContent = value;
            empty.style.color = "#6366f1";
            empty.style.textAlign = "center";
            empty.style.textTransform = "uppercase";
            empty.style.margin = "70px 0";
            empty.style.animation = "blink 3s ease-in-out infinite";
            list.appendChild(empty);
        }

        if (filtered.length === 0 && currentFilter === "all") {
            message("Veuillez ajouter une tâche");
            return;
        } else if (filtered.length === 0 && currentFilter === "active") {
            message("Aucune tâche active");
            return;
        } else if (filtered.length === 0 && currentFilter === "completed") {
            message("Aucune tâche completé");
        }

        if (currentFilter === "all") {
            const activeTask = filtered.filter(t => !t.completed);
            const completedTask = filtered.filter(t => t.completed);
            filtered = [...activeTask, ...completedTask];
        }

        filtered.forEach(task => renderTask(task));
    };

    renderAllTask();

    addBtn.onclick = () => createNewTask(input.value);
    input.onkeydown = (e) => {
        if (e.key === 'Enter') createNewTask(input.value);
    };

    const delBtnTaskCompleted = document.createElement('button');
    const delBtnTaskActive = document.createElement('button');
    delBtnTaskCompleted.className = "delBtnTaskCompleted";
    delBtnTaskActive.className = "delBtnTaskActive";
    delBtnTaskCompleted.title = "delete completed tasks";
    delBtnTaskActive.title = "delete active tasks";
    delBtnTaskCompleted.innerHTML = '<img src="assets/icons/delete_sweep.png" alt="icon delete sweep">';
    delBtnTaskActive.innerHTML = '<img src="assets/icons/delete_sweep.png" alt="icon delete sweep">';

    function updateDeleteButtons() {
        const controlsTask = document.querySelector('.controls-task');
        controlsTask.innerHTML = "";

        if (currentFilter === "completed" && tasks.some(t => t.completed)) {
            controlsTask.classList.add('show');
            controlsTask.appendChild(delBtnTaskCompleted);
        } else if (currentFilter === "active" && tasks.some(t => !t.completed)) {
            controlsTask.classList.add('show');
            controlsTask.appendChild(delBtnTaskActive);
        } else {
            controlsTask.classList.remove('show');
        }
    }

    document.querySelectorAll('.filtres button').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.add('active');
            document.querySelectorAll('.filtres button').forEach(otherBtn => {
                if (otherBtn !== btn) otherBtn.classList.remove('active');
            });
            currentFilter = btn.dataset.filter;
            renderAllTask();
            updateDeleteButtons();
        });
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (tasks.length === 0) {
                list.innerHTML = "";
                list.style.textAlign = "center";
                alert("Aucune tâche à supprimer.");
                return;
            }

            if (confirm("Êtes-vous sûr de vouloir supprimer toutes les tâches ?")) {
                tasks = [];
                saveToLocalStorage();
                renderAllTask();
                updateDeleteButtons();
            }
        });
    }

    delBtnTaskCompleted.addEventListener('click', () => {
        if (confirm("Supprimer toutes les tâches terminées ?")) {
            tasks = tasks.filter(t => !t.completed);
            saveToLocalStorage();
            renderAllTask();
            updateDeleteButtons();
        }
    });

    delBtnTaskActive.addEventListener('click', () => {
        if (confirm("Supprimer toutes les tâches actives ?")) {
            tasks = tasks.filter(t => t.completed);
            saveToLocalStorage();
            renderAllTask();
            updateDeleteButtons();
        }
    });

    // Afficher les boutons appropriés au chargement
    updateDeleteButtons();
})();