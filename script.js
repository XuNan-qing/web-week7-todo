const todoInput = document.getElementById('todo-input');
const addTodoButton = document.getElementById('add-todo');
const todoList = document.getElementById('todo-list');
const todoMessage = document.getElementById('todo-message');
const filterButtons = document.querySelectorAll('#todo-filters button');

// 本地存储键名。
const KEY = 'todos';

// todos 是任务数据的唯一来源。
let todos = load();

// 筛选属于视图状态，刷新后回到全部。
let filter = 'all';

// 保存任务数据。
function save() {
    localStorage.setItem(KEY, JSON.stringify(todos));
}

// 页面启动时恢复任务数据。
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

// 添加：生成新数组 → 保存 → 重渲染。
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

// 删除：生成新数组 → 保存 → 重渲染。
function removeTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    save();
    render();
}

// 清除已完成任务：生成新数组 → 保存 → 重渲染。
function clearCompleted() {
    todos = todos.filter(todo => !todo.completed);
    save();
    render();
}

// 切换：生成新数组和新对象 → 保存 → 重渲染。
function toggleTodo(id) {
    todos = todos.map(todo =>
        todo.id === id
            ? { ...todo, completed: !todo.completed }
            : todo
    );

    save();
    render();
}

// 切换筛选条件，任务数据不变。
function setFilter(value) {
    filter = value;
    render();
}

// 根据任务数据和筛选状态重画列表。
function render() {
    todoList.innerHTML = '';

    const shown = todos.filter(todo => {
        if (filter === 'done') return todo.completed;
        if (filter === 'active') return !todo.completed;
        return true;
    });

    // 更新筛选按钮的选中样式。
    filterButtons.forEach(button => {
        const selected = button.dataset.filter === filter;
        button.classList.toggle('is-active', selected);
        button.setAttribute('aria-pressed', String(selected));
    });

    shown.forEach(todo => {
        const li = document.createElement('li');
        li.dataset.id = todo.id;

        const text = document.createElement('span');
        text.className = 'todo-text';

        // 用户输入作为文本显示。
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
            // 防止删除时同时触发任务状态切换。
            event.stopPropagation();
            removeTodo(todo.id);
        });

        li.appendChild(deleteButton);
        todoList.appendChild(li);
    });
}

// 检查输入，添加成功后清空输入框。
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

// 点击按钮添加任务。
addTodoButton.addEventListener('click', handleAdd);

// 按回车添加，避开中文输入法的选词回车。
todoInput.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.isComposing) {
        event.preventDefault();
        handleAdd();
    }
});

// 点击按钮切换筛选条件。
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        setFilter(button.dataset.filter);
    });
});

// 显示启动时恢复的任务。
render();
