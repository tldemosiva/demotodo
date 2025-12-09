document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const viewSwitcher = document.getElementById('view-switcher');
    const listView = document.getElementById('list-view');
    const kanbanView = document.getElementById('kanban-view');

    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let isEditing = false;
    let currentTodoId = null;
    let currentView = 'list'; // 'list' or 'kanban'

    // Migrate old string-based todos to new object format
    const migrateTodos = () => {
        if (todos.length > 0 && typeof todos[0] === 'string') {
            todos = todos.map((todoText, index) => ({
                id: Date.now() + index,
                text: todoText,
                status: 'todo' // Default status
            }));
            saveTodos();
        }
    };

    const saveTodos = () => {
        localStorage.setItem('todos', JSON.stringify(todos));
    };

    const renderListView = () => {
        todoList.innerHTML = '';
        todos.forEach(todo => {
            const li = document.createElement('li');
            li.setAttribute('data-id', todo.id);
            li.innerHTML = `
                <span class="todo-text">${todo.text}</span>
                <div>
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;
            todoList.appendChild(li);
        });
    };

    const renderKanbanView = () => {
        const todoColumn = document.getElementById('todo-column');
        const inprogressColumn = document.getElementById('inprogress-column');
        const doneColumn = document.getElementById('done-column');

        todoColumn.innerHTML = '';
        inprogressColumn.innerHTML = '';
        doneColumn.innerHTML = '';

        todos.forEach(todo => {
            const card = document.createElement('div');
            card.classList.add('kanban-card');
            card.setAttribute('draggable', true);
            card.setAttribute('data-id', todo.id);
            card.innerHTML = `
                <span class="todo-text">${todo.text}</span>
                <input type="text" class="edit-input hidden" value="${todo.text}">
                <button class="delete-btn">X</button>
            `;

            if (todo.status === 'inprogress') {
                inprogressColumn.appendChild(card);
            } else if (todo.status === 'done') {
                doneColumn.appendChild(card);
            } else { // 'todo'
                todoColumn.appendChild(card);
            }
        });
    };

    const render = () => {
        if (currentView === 'list') {
            listView.classList.remove('hidden');
            kanbanView.classList.add('hidden');
            renderListView();
        } else {
            listView.classList.add('hidden');
            kanbanView.classList.remove('hidden');
            renderKanbanView();
        }
    };

    addBtn.addEventListener('click', () => {
        const todoText = todoInput.value.trim();
        if (todoText) {
            if (isEditing) {
                const todo = todos.find(t => t.id === currentTodoId);
                todo.text = todoText;
                isEditing = false;
                currentTodoId = null;
                addBtn.textContent = 'Add';
            } else {
                const newTodo = {
                    id: Date.now(),
                    text: todoText,
                    status: 'todo'
                };
                todos.push(newTodo);
            }
            saveTodos();
            render();
            todoInput.value = '';
        }
    });

    viewSwitcher.addEventListener('click', () => {
        currentView = currentView === 'list' ? 'kanban' : 'list';
        viewSwitcher.textContent = currentView === 'list' ? 'Kanban View' : 'List View';
        render();
    });

    // Event delegation for edit and delete in list view
    todoList.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (!li) return;
        const todoId = parseInt(li.getAttribute('data-id'));

        if (e.target.classList.contains('delete-btn')) {
            todos = todos.filter(todo => todo.id !== todoId);
            saveTodos();
            render();
        } else if (e.target.classList.contains('edit-btn')) {
            isEditing = true;
            currentTodoId = todoId;
            const todo = todos.find(t => t.id === todoId);
            todoInput.value = todo.text;
            addBtn.textContent = 'Update';
            todoInput.focus();
        }
    });

    // Drag and drop functionality for Kanban view
    kanbanView.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('kanban-card')) {
            e.dataTransfer.setData('text/plain', e.target.getAttribute('data-id'));
            setTimeout(() => {
                e.target.classList.add('dragging');
            }, 0);
        }
    });

    kanbanView.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('kanban-card')) {
            e.target.classList.remove('dragging');
        }
    });

    kanbanView.addEventListener('dragover', (e) => {
        e.preventDefault();
        const column = e.target.closest('.kanban-cards');
        if (column) {
            // Optional: add visual feedback
        }
    });

    kanbanView.addEventListener('drop', (e) => {
        e.preventDefault();
        const column = e.target.closest('.kanban-cards');
        if (!column) return;

        const todoId = parseInt(e.dataTransfer.getData('text/plain'));
        const todo = todos.find(t => t.id === todoId);

        const newStatus = column.id.replace('-column', '');
        todo.status = newStatus;

        saveTodos();
        renderKanbanView();
    });

    // Event delegation for delete in Kanban view
    kanbanView.addEventListener('click', (e) => {
        const card = e.target.closest('.kanban-card');
        if (!card) return;
        const todoId = parseInt(card.getAttribute('data-id'));

        if (e.target.classList.contains('delete-btn')) {
            todos = todos.filter(todo => todo.id !== todoId);
            saveTodos();
            render();
        } else if (e.target.classList.contains('todo-text')) {
             const textSpan = e.target;
             const input = card.querySelector('.edit-input');
             textSpan.classList.add('hidden');
             input.classList.remove('hidden');
             input.focus();

             const endEdit = () => {
                 const newText = input.value.trim();
                 if (newText) {
                     const todo = todos.find(t => t.id === todoId);
                     todo.text = newText;
                     saveTodos();
                 }
                 render(); // Re-render to show updated text
             };

             input.addEventListener('blur', endEdit);
             input.addEventListener('keydown', (e) => {
                 if (e.key === 'Enter') {
                     endEdit();
                 }
             });
        }
    });


    // Initial setup
    migrateTodos();
    render();
});