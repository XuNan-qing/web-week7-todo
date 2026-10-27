import { addTodo, toggleTodo, updateTodo, removeTodo, parseTodoId, loadTodos, type Todo } from './todo.js';

type Filter = 'all' | 'active' | 'done';
const KEY = 'todos';

function start(): void {
  const input = document.getElementById('todo-input');
  const addButton = document.getElementById('add-todo');
  const list = document.getElementById('todo-list');
  const message = document.getElementById('todo-message');
  const buttons = document.querySelectorAll<HTMLButtonElement>('#todo-filters button');
  if (!(input instanceof HTMLInputElement)
    || !(addButton instanceof HTMLButtonElement)
    || !(list instanceof HTMLUListElement)
    || !(message instanceof HTMLElement)) return;

  let todos: Todo[] = [];
  let filter: Filter = 'all';
  try { todos = loadTodos(localStorage.getItem(KEY)); }
  catch { message.textContent = '读取失败，当前使用空列表。'; }

  function saveAndRender(): void {
    if (!(message instanceof HTMLElement)) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(todos));
      message.textContent = '';
    } catch {
      message.textContent = '保存失败，当前更改只保留在本次页面中。';
    }
    render();
  }

  function render(): void {
    if (!(list instanceof HTMLUListElement)) return;
    list.replaceChildren();
    buttons.forEach(button => {
      const selected = button.dataset.filter === filter;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    const shown = todos.filter(todo => filter === 'all'
      || (filter === 'done' ? todo.completed : !todo.completed));
    for (const todo of shown) {
      const item = document.createElement('li');
      item.dataset.id = String(todo.id);
      item.classList.toggle('done', todo.completed);
      const text = document.createElement('span');
      text.className = 'todo-text';
      text.textContent = todo.text;
      item.appendChild(text);
      for (const action of ['edit', 'delete']) {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.action = action;
        const label = document.createElement('span');
        label.textContent = action === 'edit' ? '编辑' : '删除';
        button.appendChild(label);
        item.appendChild(button);
      }
      list.appendChild(item);
    }
  }

  function handleAdd(): void {
    if (!(input instanceof HTMLInputElement) || !(message instanceof HTMLElement)) return;
    if (!addTodo(todos, input.value)) {
      message.textContent = '请输入1至200字的待办事项。';
      input.focus();
      return;
    }
    input.value = '';
    saveAndRender();
    input.focus();
  }

  addButton.addEventListener('click', handleAdd);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.isComposing) {
      event.preventDefault();
      handleAdd();
    }
  });
  buttons.forEach(button => button.addEventListener('click', () => {
    const value = button.dataset.filter;
    if (value !== 'all' && value !== 'active' && value !== 'done') return;
    filter = value;
    render();
  }));
  list.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const item = event.target.closest('li');
    if (!(item instanceof HTMLLIElement) || !list.contains(item)) return;
    const id = parseTodoId(item.dataset.id);
    if (id === null) return;
    const actionButton = event.target.closest('button[data-action]');
    if (actionButton && !item.contains(actionButton)) return;
    const action = actionButton instanceof HTMLButtonElement ? actionButton.dataset.action : undefined;
    if (action === 'delete') {
      if (removeTodo(todos, id)) saveAndRender();
    } else if (action === 'edit') {
      const todo = todos.find(task => task.id === id);
      if (!todo) return;
      const content = window.prompt('修改任务', todo.text);
      if (content === null) return;
      if (updateTodo(todos, id, content)) saveAndRender();
      else message.textContent = '编辑内容须为1至200字。';
    } else if (action === undefined) {
      if (toggleTodo(todos, id)) saveAndRender();
    }
  });
  render();
}

start();
