export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// 本实验的显式业务选择：trim 后至多 200 个 UTF-16 代码单元。
const MAX_TEXT_LENGTH = 200;

function validId(id: number): boolean {
  return Number.isSafeInteger(id) && id > 0;
}

function normalizeText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const content = value.trim();
  return content.length > 0 && content.length <= MAX_TEXT_LENGTH
    ? content : null;
}

// 数组由调用者持有；核心函数原地更新，不依赖 DOM 或存储。
export function addTodo(todos: Todo[], text: unknown): boolean {
  const content = normalizeText(text);
  if (content === null) return false;
  let id = 1;
  for (const todo of todos) id = Math.max(id, todo.id + 1);
  if (!validId(id)) return false;
  todos.push({ id, text: content, completed: false });
  return true;
}

export function toggleTodo(todos: Todo[], id: number): boolean {
  if (!validId(id)) return false;
  const todo = todos.find(item => item.id === id);
  if (!todo) return false;
  todo.completed = !todo.completed;
  return true;
}

export function parseTodoId(raw: string | undefined): number | null {
  if (raw === undefined || !/^[1-9]\d*$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function isTodo(value: unknown): value is Todo {
  if (typeof value !== 'object' || value === null) return false;
  return 'id' in value && typeof value.id === 'number'
    && validId(value.id)
    && 'text' in value && normalizeText(value.text) !== null
    && 'completed' in value && typeof value.completed === 'boolean';
}

export function loadTodos(raw: string | null): Todo[] {
  if (raw === null) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    const todos: Todo[] = [];
    const ids = new Set<number>();
    for (const item of data) {
      if (!isTodo(item) || ids.has(item.id)) continue;
      ids.add(item.id);
      todos.push({ id: item.id, text: item.text.trim(), completed: item.completed });
    }
    return todos;
  } catch {
    return [];
  }
}

export function updateTodo(todos: Todo[], id: number, text: unknown): boolean {
  const content = normalizeText(text);
  if (!validId(id) || content === null) return false;
  const todo = todos.find(item => item.id === id);
  if (!todo) return false;
  todo.text = content;
  return true;
}

export function removeTodo(todos: Todo[], id: number): boolean {
  if (!validId(id)) return false;
  const index = todos.findIndex(item => item.id === id);
  if (index < 0) return false;
  todos.splice(index, 1);
  return true;
}

export function clearCompleted(todos: Todo[]): void {
  for (let index = todos.length - 1; index >= 0; index--) {
    if (todos[index]?.completed) todos.splice(index, 1);
  }
}
