document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todo-input');
    const labelInput = document.getElementById('label-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');

    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let isEditing = false;
    let currentTodoIndex = null;

    const saveTodos = () => {
        localStorage.setItem('todos', JSON.stringify(todos));
    };

    const renderTodos = () => {
        todoList.innerHTML = '';
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
    };

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
