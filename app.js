
;(function () {
    const input = document.getElementById("taskInput");
    const addBtn = document.getElementById("addBtn");
    const list = document.getElementById("taskList");

    let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
    let currentFilter = 'all';

    function saveToLocalStorage() {
        localStorage.setItem('myTasks', JSON.stringify(tasks));
    }

    //créer l'élément dans le DOM
    function renderTask(taskObj) {
        const li = document.createElement('li');
        const label = document.createElement('label');
        const inputCheck = document.createElement('input');
        const span = document.createElement('span');
        const delBtn = document.createElement('button');

        inputCheck.type = 'checkbox';
        inputCheck.checked = taskObj.completed;
        span.textContent = taskObj.text;
        delBtn.id = "delBtn";
        delBtn.title = "delete";
        delBtn.textContent = '🗑';

        if (taskObj.completed) {
            span.style.textDecoration = 'line-through';
            li.style.opacity = '0.5';
        }

        delBtn.onclick = () => {
            li.style.transform = "translateX(100px)";
            li.style.opacity = "0";

            setTimeout(() => {
                tasks = tasks.filter(t => t.id !== taskObj.id);
                saveToLocalStorage();
                renderAllTask();
            }, 300);
        };

        inputCheck.onchange = () => {
            taskObj.completed = inputCheck.checked;
            span.classList.toggle("completed", taskObj.completed);
            li.classList.toggle("opac", taskObj.completed);
            saveToLocalStorage();
            renderAllTask();
        };

        label.append(inputCheck, span);
        li.append(label, delBtn);
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
        input.value = "";
    }

    // Initialisation : Afficher les tâches stockées
    function renderAllTask() {
        list.innerHTML = "";
        let filtered = tasks.filter(task => {
            if (currentFilter === "active") return !task.completed;
            if (currentFilter === "completed") return task.completed;
            return true;
        });

        filtered.forEach(task => renderTask(task));
    };

    renderAllTask();

    addBtn.onclick = () => createNewTask(input.value);
    input.onkeydown = (e) => {
        if (e.key === 'Enter') createNewTask(input.value);
    };

    document.querySelectorAll('.filtres button').forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            renderAllTask();
        });
    });
})();
