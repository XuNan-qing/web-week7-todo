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
        text.textContent = todo.text;

        if (todo.completed) {
            li.classList.add('done');
        }

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.dataset.action = 'delete';

        // 保留内部元素，方便测试点击按钮内部文字的情况。
        const deleteLabel = document.createElement('span');
        deleteLabel.textContent = '删除';
        deleteButton.appendChild(deleteLabel);

        li.append(text, deleteButton);
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

// 只绑定一次，列表重新渲染后仍然有效。
todoList.addEventListener('click', event => {
    // 防御一：确认点击目标是元素。
    if (!(event.target instanceof Element)) return;

    // 防御二：找到所属任务，点击列表空白处时直接结束。
    const item = event.target.closest('li');
    if (!item || !todoList.contains(item)) return;

    // 防御三：确认任务 ID 存在。
    const rawId = item.dataset.id;
    if (!rawId) return;

    // dataset 读出来是字符串，原来的任务 ID 是数字。
    const id = Number(rawId);
    if (!Number.isFinite(id)) return;

    // 点击按钮内部的 span，也能找到删除按钮。
    const deleteButton =
        event.target.closest('[data-action="delete"]');

    if (deleteButton && item.contains(deleteButton)) {
        removeTodo(id);
    } else {
        toggleTodo(id);
    }
});
render();
