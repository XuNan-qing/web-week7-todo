# 第9周测试生成约束

请为 TypeScript Todo 模块使用 Vitest 生成测试，并遵守以下契约。

- Todo 包含 id:number、text:string、completed:boolean。ID 为正安全整数。
- addTodo(todos, text:unknown) 原地修改数组，成功返回 true，拒绝返回 false。
- 仅接受字符串。trim 后长度为 1 至 200 个 UTF-16 代码单元。相同文本允许重复，但 ID 必须唯一。
- toggleTodo 原地切换指定任务，不存在或非法 ID 安静返回 false，不改变其他任务。
- parseTodoId 接受 dataset.id，拒绝空白、小数、负数、科学计数法、十六进制和不安全整数，使用 Number 与 Number.isSafeInteger 校验。
- loadTodos 接受 localStorage 原始字符串，JSON.parse 结果用 unknown 接收，校验每条记录并去掉重复 ID，损坏 JSON 返回空数组。
- updateTodo、removeTodo 和 clearCompleted 保持上周功能；编辑失败不修改原数据。

先生成课件任务2的5条基础测试，再生成边界补充。按空值、格式、类型、越界、状态、重复、异步、依赖、安全9个维度审查。每个用例使用独立数组，断言具体内容与副作用，不只使用 toBeDefined。不得使用 any、as、非空断言或 @ts-ignore。同步模块不虚构异步流程。安全维度的 DOM 渲染在浏览器中另行验证。全部测试注明 AI 辅助来源。
