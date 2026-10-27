// 按 Prompt.md 约束生成的 AI 辅助边界测试。
import { test, expect } from 'vitest';
import {
  addTodo, toggleTodo, parseTodoId, loadTodos,
  updateTodo, removeTodo, clearCompleted, type Todo,
} from '../src/todo.js';

// 空值、类型：删除 typeof 防御会导致崩溃或错误入库。
test.each([null, undefined, 123, true, {}, []])('拒绝非字符串 %j', (value) => {
  const todos: Todo[] = [];
  expect(addTodo(todos, value)).toBe(false);
  expect(todos).toEqual([]);
});

test('格式：去除首尾空白并保留正文', () => {
  const todos: Todo[] = [];
  expect(addTodo(todos, '  学习 TS  ')).toBe(true);
  expect(todos[0]?.text).toBe('学习 TS');
});

test('越界：200可添加，201拒绝且已有数据不变', () => {
  const todos: Todo[] = [];
  expect(addTodo(todos, '中'.repeat(200))).toBe(true);
  const before = JSON.stringify(todos);
  expect(addTodo(todos, '中'.repeat(201))).toBe(false);
  expect(JSON.stringify(todos)).toBe(before);
  expect(todos[0]?.text).toBe('中'.repeat(200));
});

test('重复：允许同名任务但ID不重复', () => {
  const todos: Todo[] = [];
  addTodo(todos, '学习TS');
  addTodo(todos, '学习TS');
  expect(todos.map(todo => todo.text)).toEqual(['学习TS', '学习TS']);
  expect(todos[0]?.id).not.toBe(todos[1]?.id);
});

test('越界：ID空间耗尽时拒绝新增', () => {
  const todos: Todo[] = [{ id: Number.MAX_SAFE_INTEGER, text: '原任务', completed: false }];
  expect(addTodo(todos, '新任务')).toBe(false);
  expect(todos).toEqual([{ id: Number.MAX_SAFE_INTEGER, text: '原任务', completed: false }]);
});

test('状态：切换两次恢复原状态', () => {
  const todos: Todo[] = [{ id: 1, text: '原任务', completed: false }];
  toggleTodo(todos, 1);
  toggleTodo(todos, 1);
  expect(todos).toEqual([{ id: 1, text: '原任务', completed: false }]);
});

test.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('拒绝非法切换ID %j', (id) => {
  const todos: Todo[] = [{ id: 1, text: '原任务', completed: false }];
  expect(toggleTodo(todos, id)).toBe(false);
  expect(todos).toEqual([{ id: 1, text: '原任务', completed: false }]);
});

test.each([undefined, '', '   ', '123abc', '1.5', '0', '-1', '1e2', '0x10', '9007199254740992'])('格式：拒绝脏dataset.id %j', (raw) => {
  expect(parseTodoId(raw)).toBeNull();
});

test('格式：合法十进制字符串转为数字', () => {
  expect(parseTodoId('123')).toBe(123);
});

test.each([null, '{broken', '{}', 'null'])('依赖：损坏或非数组存储回退 %j', (raw) => {
  expect(loadTodos(raw)).toEqual([]);
});

test('依赖：过滤脏记录与重复ID，保留合法对象', () => {
  const raw = JSON.stringify([
    { id: 1, text: '合法', completed: false },
    { id: 1, text: '重复ID', completed: true },
    { id: '2', text: '错误类型', completed: false },
    { id: 3, text: '   ', completed: false },
    { id: 4, text: '状态错误', completed: 'false' }, null,
  ]);
  expect(loadTodos(raw)).toEqual([{ id: 1, text: '合法', completed: false }]);
});

test('安全：HTML样式文本作为普通文本保留', () => {
  const todos: Todo[] = [];
  addTodo(todos, '<img src=x onerror=alert(1)>');
  expect(todos[0]?.text).toBe('<img src=x onerror=alert(1)>');
  // 此断言只验证模型层。浏览器另验 textContent 不生成 img 节点。
});

test('编辑：合法更新；空白或错误类型不覆盖原文', () => {
  const todos: Todo[] = [{ id: 1, text: '旧文', completed: true }];
  expect(updateTodo(todos, 1, ' 新文 ')).toBe(true);
  expect(updateTodo(todos, 1, '   ')).toBe(false);
  expect(updateTodo(todos, 1, null)).toBe(false);
  expect(updateTodo(todos, 999, '无效')).toBe(false);
  expect(todos).toEqual([{ id: 1, text: '新文', completed: true }]);
});

test('删除：只删除目标，未知ID不改变数据', () => {
  const todos: Todo[] = [
    { id: 1, text: '任务1', completed: false },
    { id: 2, text: '任务2', completed: true },
  ];
  expect(removeTodo(todos, 1)).toBe(true);
  expect(removeTodo(todos, 999)).toBe(false);
  expect(todos).toEqual([{ id: 2, text: '任务2', completed: true }]);
});

test('清除：仅移除已完成任务', () => {
  const todos: Todo[] = [
    { id: 1, text: '保留', completed: false },
    { id: 2, text: '清除', completed: true },
  ];
  clearCompleted(todos);
  expect(todos).toEqual([{ id: 1, text: '保留', completed: false }]);
});
