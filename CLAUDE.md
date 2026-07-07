## Git 工作规则

- 每次修改项目文件后都需要使用 Git 记录，方便随时回滚。
- 修改前后需要查看 `git status`，避免误提交无关文件。
- 每次提交应尽量保持单一目的，只包含本次任务相关文件。
- Git 提交说明中必须包含用户本次发出的原始提示词，方便回看当时执行的命令和需求。
- 如果工作区已有未提交改动，提交前必须区分本次修改和既有改动，不要把无关内容混入同一个提交。

## 文档同步规则

- 项目的功能逻辑说明文档都存放在`/doc`目录下，并且文档格式统一使用`Markdown`
- 每次修改统计口径、同步逻辑、字段映射、表结构、API 取数字段、看板指标计算方式后，必须同步更新对应说明文档。
- 文档更新要和代码修改放在同一个任务链路中完成；若用户只要求补文档，则单独提交文档变更。
- 文档顶部也要维护更新时间和更新内容，方便回看本次口径调整。

# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
