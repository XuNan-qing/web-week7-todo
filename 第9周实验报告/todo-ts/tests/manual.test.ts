import { test, expect } from 'vitest';
import { addTodo, toggleTodo, type Todo } from '../src/todo.js';

test('正常添加任务', () => {
  const todos: Todo[] = [];

  addTodo(todos, '学习TS');

  expect(todos).toHaveLength(1);
  expect(todos[0]?.text).toBe('学习TS');
  expect(todos[0]?.completed).toBe(false);
});
test('纯空格不添加任务', () => {
  const todos: Todo[] = [];

  addTodo(todos, '   ');

  expect(todos).toEqual([]);
});
test('空字符串不添加任务', () => {
  const todos: Todo[] = [];

  addTodo(todos, '');

  expect(todos).toEqual([]);
});
test('只切换指定任务的完成状态', () => {
  const todos: Todo[] = [
    { id: 1, text: '学习TS', completed: false },
    { id: 2, text: '写报告', completed: false },
  ];

  toggleTodo(todos, 1);

  expect(todos).toEqual([
    { id: 1, text: '学习TS', completed: true },
    { id: 2, text: '写报告', completed: false },
  ]);
});
test('不存在的ID不报错且数据不变', () => {
  const todos: Todo[] = [
    { id: 1, text: '学习TS', completed: false },
  ];

  expect(() => toggleTodo(todos, 999)).not.toThrow();

  expect(todos).toEqual([
    { id: 1, text: '学习TS', completed: false },
  ]);
});