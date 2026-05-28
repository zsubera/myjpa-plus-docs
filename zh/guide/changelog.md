# 更新日志

## v0.0.3

### 功能

- Lambda 类型安全查询构建器 (`QuerySpec`)
- 流式 API 支持 AND/OR/NOT 条件分组
- 条件守卫方法，支持动态查询构建
- JOIN 支持（INNER、LEFT、FETCH、LEFT_FETCH），可嵌套条件
- EXISTS/NOT EXISTS 关联子查询，提供 `correlatedEq` 快捷方式
- 批量更新和删除操作（`UpdateSpec`、`DeleteSpec`）
- UpdateSpec 中的条件 SET
- 软删除支持，使用 `@SoftDelete` 注解
- `MyJpaRepository` 基础接口，提供软删除方法
- `MyJpaTemplate` 便利类，支持流式 API
- `ProjectionSpec` DTO 投影查询
- `EntityGraphHelper` 动态抓取策略
- `PageableHelper` 分页集成
- `InClauseBuilder` 自动批处理（Oracle 兼容）
- `BaseEntity` 审计字段（createdAt、updatedAt）
- Null 安全操作（eq/eq(null) → IS NULL）
- 多字段 LIKE 搜索（`multiLike`）
- 忽略大小写比较（`eqIgnoreCase`、`likeIgnoreCase`）
- 基于 Consumer 的 API，自动关闭分组
- 查询超时和锁模式支持
- Spring Boot 自动配置
- 可配置的最大结果数和深度分页警告
