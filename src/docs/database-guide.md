# Better-SQLite3 数据库集成指南

本文档介绍了如何在 Electron 应用中使用 Better-SQLite3 数据库。

## 集成概述

数据库集成通过以下组件实现：

1. **主进程 (main.js)**：负责实际的数据库操作
2. **预加载脚本 (preload.js)**：暴露数据库 API 给渲染进程
3. **渲染进程**：通过 IPC 调用数据库功能

## API 接口

### 1. 查询数据 (dbQuery)
```typescript
const result = await window.electronAPI.dbQuery<T>(
  'SELECT * FROM users WHERE id = ?', 
  [userId]
);
```

### 2. 执行语句 (dbExecute)
```typescript
const result = await window.electronAPI.dbExecute(
  'INSERT INTO users (name, email) VALUES (?, ?)', 
  ['John Doe', 'john@example.com']
);
```

### 3. 创建表 (dbCreateTable)
```typescript
const result = await window.electronAPI.dbCreateTable(
  'users', 
  {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    name: 'TEXT NOT NULL',
    email: 'TEXT UNIQUE NOT NULL',
    created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
  }
);
```

## 返回值格式

所有数据库操作返回统一格式的对象：

```typescript
{
  success: boolean,      // 操作是否成功
  data?: any,           // 成功时的数据
  error?: string        // 失败时的错误信息
}
```

## 示例用法

```typescript
// 在组件中使用数据库功能
const addRecord = async () => {
  if (!window.electronAPI) {
    console.error('数据库功能只能在 Electron 环境中使用');
    return;
  }

  try {
    // 创建表
    const createResult = await window.electronAPI.dbCreateTable('users', {
      id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
      name: 'TEXT NOT NULL',
      email: 'TEXT UNIQUE NOT NULL'
    });

    if (!createResult.success) {
      console.error('创建表失败:', createResult.error);
      return;
    }

    // 插入记录
    const insertResult = await window.electronAPI.dbExecute(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      ['John Doe', 'john@example.com']
    );

    if (insertResult.success) {
      console.log('记录插入成功');
    } else {
      console.error('插入失败:', insertResult.error);
    }

    // 查询记录
    const queryResult = await window.electronAPI.dbQuery(
      'SELECT * FROM users ORDER BY id DESC'
    );

    if (queryResult.success) {
      console.log('查询结果:', queryResult.data);
    } else {
      console.error('查询失败:', queryResult.error);
    }
  } catch (error) {
    console.error('数据库操作失败:', error);
  }
};
```

## 注意事项

1. **仅限 Electron 环境**：数据库功能只能在 Electron 环境中使用，不能在浏览器中直接运行
2. **安全性**：所有数据库操作都在主进程中进行，避免了渲染进程的安全风险
3. **错误处理**：始终检查返回结果的 success 属性来判断操作是否成功
4. **参数绑定**：使用参数绑定来防止 SQL 注入攻击
5. **开发 vs 生产环境**：
   - 开发环境：数据库文件位于 `./data/app.db`
   - 生产环境：数据库文件位于用户数据目录下

## 数据库位置

- **开发环境**：`${cwd}/data/app.db`
- **生产环境**：`${userDataDirectory}/app.db`

其中 `userDataDirectory` 是 Electron 的用户数据目录。