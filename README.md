# MyJpa-Plus Documentation

MyJpa-Plus 是一个类型安全的 JPA Specification 构建器，为 Spring Data JPA 提供流畅的 Lambda API，消除硬编码字段名字符串。

## 特性

- 类型安全的查询构建 - 使用方法引用替代字符串
- 流畅的 API 设计 - 支持 AND/OR 条件组合
- 软删除支持 - 自动过滤已删除记录
- 批量操作 - 类型安全的批量更新和删除
- UPSERT 支持 - 跨数据库的合并插入操作
- 字段加密和脱敏
- 审计字段自动填充

## 文档

访问文档站点: https://zsubera.github.io/myjpa-plus-docs/

## 本地开发

```bash
yarn install
yarn start
```

## 构建

```bash
yarn build
```

## 部署

```bash
GIT_USER=<Your GitHub username> USE_SSH=true yarn deploy
```

## 许可证

MIT License