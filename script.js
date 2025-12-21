document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todo-input');
    const labelInput = document.getElementById('label-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');

    const groupBtn = document.getElementById('group-btn');

    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let isEditing = false;
    let currentTodoIndex = null;
    let isGrouped = false;

    const saveTodos = () => {
        localStorage.setItem('todos', JSON.stringify(todos));
    };

    const renderTodos = () => {
        todoList.innerHTML = '';

        if (isGrouped) {
            const groupedTodos = todos.reduce((acc, todo) => {
                const label = todo.label || 'No Label';
                if (!acc[label]) {
                    acc[label] = [];
                }
                acc[label].push(todo);
                return acc;
            }, {});

            for (const label in groupedTodos) {
                const groupContainer = document.createElement('div');
                groupContainer.classList.add('todo-group');
                const groupHeader = document.createElement('h2');
                groupHeader.textContent = label;
                groupContainer.appendChild(groupHeader);

                const groupList = document.createElement('ul');
                groupedTodos[label].forEach(todo => {
                    const li = document.createElement('li');
                    const originalIndex = todos.indexOf(todo);
                    li.innerHTML = `
                        <div class="todo-item">
                            <span>${todo.text}</span>
                        </div>
                        <div class="button-container">
                            <button class="edit-btn" data-index="${originalIndex}">Edit</button>
                            <button class="delete-btn" data-index="${originalIndex}">Delete</button>
                        </div>
                    `;
                    groupList.appendChild(li);
                });
                groupContainer.appendChild(groupList);
                todoList.appendChild(groupContainer);
            }
        } else {
            todos.forEach((todo, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="todo-item">
                        <span>${todo.text}</span>
                        ${todo.label ? `<span class="todo-label">${todo.label}</span>` : ''}
                    </div>
                    <div class="button-container">
                        <button class="edit-btn" data-index="${index}">Edit</button>
                        <button class="delete-btn" data-index="${index}">Delete</button>
                    </div>
                `;
                todoList.appendChild(li);
            });
        }
    };

    groupBtn.addEventListener('click', () => {
        isGrouped = !isGrouped;
        renderTodos();
    });

    addBtn.addEventListener('click', () => {
        const todoText = todoInput.value.trim();
        const labelText = labelInput.value.trim();
        if (todoText) {
            const newTodo = { text: todoText, label: labelText };
            if (isEditing) {
                todos[currentTodoIndex] = newTodo;
                isEditing = false;
                currentTodoIndex = null;
                addBtn.textContent = 'Add';
            } else {
                todos.push(newTodo);
            }
            saveTodos();
            renderTodos();
            todoInput.value = '';
            labelInput.value = '';
        }
    });

    todoList.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const index = e.target.getAttribute('data-index');
            const todo = todos[index];
            todoInput.value = todo.text;
            labelInput.value = todo.label || '';
            isEditing = true;
            currentTodoIndex = index;
            addBtn.textContent = 'Update';
        } else if (e.target.classList.contains('delete-btn')) {
            const index = e.target.getAttribute('data-index');
            todos.splice(index, 1);
            saveTodos();
            renderTodos();
        }
    });

    renderTodos();
});
