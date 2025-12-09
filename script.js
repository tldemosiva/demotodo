document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todo-input');
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
                <span>${todo}</span>
                <button class="edit-btn" data-index="${index}">Edit</button>
            `;
            todoList.appendChild(li);
        });
    };

    addBtn.addEventListener('click', () => {
        const todoText = todoInput.value.trim();
        if (todoText) {
            if (isEditing) {
                todos[currentTodoIndex] = todoText;
                isEditing = false;
                currentTodoIndex = null;
                addBtn.textContent = 'Add';
            } else {
                todos.push(todoText);
            }
            saveTodos();
            renderTodos();
            todoInput.value = '';
        }
    });

    todoList.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const index = e.target.getAttribute('data-index');
            todoInput.value = todos[index];
            isEditing = true;
            currentTodoIndex = index;
            addBtn.textContent = 'Update';
        }
    });

    renderTodos();
});