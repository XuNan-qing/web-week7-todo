const todoInput = document.getElementById('todo-input');
const addTodoButton = document.getElementById('add-todo');
const todoList = document.getElementById('todo-list');
const todoMessage = document.getElementById('todo-message');

// localStorage 中使用的存储键名。
const KEY = 'todos';

// 页面启动时读取任务，todos 仍是唯一数据源。
let todos = load();

// 将数组转成字符串后保存。
function save() {
    localStorage.setItem(KEY, JSON.stringify(todos));
}

// 从本地读取字符串，恢复为数组。
function load() {
    try {
        const raw = localStorage.getItem(KEY);
        if (raw === null) return [];

        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.warn('读取任务失败，使用空列表。', error);
        return [];
    }
}

// 添加：展开运算符生成新数组。
function addTodo(text) {
    const content = text.trim();
    if (content === '') return;

    const newTodo = {
        id: Date.now(),
        text: content,
        completed: false
    };

    todos = [...todos, newTodo];
    save();
    render();
}

// 删除：保留 id 不匹配的任务，生成新数组。
function removeTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    save();
    render();
}

// 切换：生成新数组，并为匹配的任务生成新对象。
function toggleTodo(id) {
    todos = todos.map(todo =>
        todo.id === id
            ? { ...todo, completed: !todo.completed }
            : todo
    );
    save();
    render();
}

// 根据 todos 重画列表。
function render() {
    todoList.innerHTML = '';

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.dataset.id = todo.id;

        const text = document.createElement('span');
        text.className = 'todo-text';
        text.textContent = todo.text;
        li.appendChild(text);

        if (todo.completed) {
            li.classList.add('done');
        }

        li.addEventListener('click', () => {
            toggleTodo(todo.id);
        });

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.textContent = '删除';

        deleteButton.addEventListener('click', event => {
            // 防止删除按钮的点击同时触发 li 的点击。
            event.stopPropagation();
            removeTodo(todo.id);
        });

        li.appendChild(deleteButton);
        todoList.appendChild(li);
    });
}

// 处理输入框：检查空输入，添加后清空。
function handleAdd() {
    const content = todoInput.value.trim();

    if (content === '') {
        todoMessage.textContent = '请输入待办事项。';
        todoInput.focus();
        return;
    }

    addTodo(content);
    todoInput.value = '';
    todoMessage.textContent = '';
    todoInput.focus();
}

addTodoButton.addEventListener('click', handleAdd);

todoInput.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.isComposing) {
        event.preventDefault();
        handleAdd();
    }
});

render();