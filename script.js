const todoInput = document.getElementById('todo-input');
const addTodoButton = document.getElementById('add-todo');
const todoList = document.getElementById('todo-list');
const todoMessage = document.getElementById('todo-message');

function addTodo() {
    // trim() 去除首尾空格，阻止空内容或纯空格内容被添加。
    const content = todoInput.value.trim();
    if (content === '') {
        todoMessage.textContent = '请输入待办事项。';
        todoInput.focus();
        return;
    }

    const listItem = document.createElement('li');
    // 使用 textContent 将用户输入作为文本显示。
    listItem.textContent = content;
    todoList.appendChild(listItem);

    todoInput.value = '';
    todoMessage.textContent = '';
    todoInput.focus();
}

addTodoButton.addEventListener('click', addTodo);
// 支持按回车快速添加。
todoInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !event.isComposing) {
        event.preventDefault();
        addTodo();
    }
});
