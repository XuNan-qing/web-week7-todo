// AI 辅助参考实现；不作为“独立手写”证明。
import { test, expect } from 'vitest';
import { addTodo, toggleTodo, type Todo } from '../src/todo.js';

// 捕获新增后文本错误、初始状态错误或没有入库。
test('正常添加：保存具体文本和未完成状态', () => {
  const todos: Todo[] = [];
  addTodo(todos, '学习TS');
  expect(todos).toHaveLength(1);
  expect(todos[0]?.text).toBe('学习TS');
  expect(todos[0]?.completed).toBe(false);
});

test('纯空格：拦截且不改变已有数据', () => {
  const todos: Todo[] = [{ id: 1, text: '原任务', completed: false }];
  addTodo(todos, '   ');
  expect(todos).toEqual([{ id: 1, text: '原任务', completed: false }]);
});

test('空字符串：拦截', () => {
  const todos: Todo[] = [];
  addTodo(todos, '');
  expect(todos).toEqual([]);
});

// 捕获切错对象或同时切换所有任务。
test('正常切换：只翻转目标任务', () => {
  const todos: Todo[] = [
    { id: 1, text: '学习TS', completed: false },
    { id: 2, text: '写报告', completed: true },
  ];
  toggleTodo(todos, 1);
  expect(todos).toEqual([
    { id: 1, text: '学习TS', completed: true },
    { id: 2, text: '写报告', completed: true },
  ]);
});

test('不存在的ID：不抛错且所有数据不变', () => {
  const todos: Todo[] = [{ id: 1, text: '原任务', completed: false }];
  expect(() => toggleTodo(todos, 999)).not.toThrow();
  expect(todos).toEqual([{ id: 1, text: '原任务', completed: false }]);
});
