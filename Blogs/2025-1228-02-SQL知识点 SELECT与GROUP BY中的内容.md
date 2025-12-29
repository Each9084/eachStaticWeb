## SQL的SELECT和GROUP BY中的内容

> 问: 为什么要GROUP BY d.dept_no, d.dept_name而不是d.dept_no一个就能满足?
>
> 遇到这种情况 我要怎么知道要写哪些上去?

```sql
SELECT d.dept_no,d.dept_name,COUNT(s.emp_no) as sum 
FROM departments d JOIN dept_emp de 
ON d.dept_no = de.dept_no
JOIN salaries s 
ON de.emp_no = s.emp_no
GROUP BY d.dept_no, d.dept_name
ORDER BY d.dept_no;
```



很多开发者都会对这一点感到疑惑：**“既然一个 `dept_no` 就能唯一确定一个部门了，为什么非要把 `dept_name` 也塞进 `GROUP BY` 里？”**

答案分为两个层面：一个是**为了通过“SQL 警察”的检查**（语法规范），另一个是**为了防止“数据分裂”**（逻辑严谨）。

------

### 1. 语法要求:非聚合列必须进 GROUP BY

在标准 SQL（SQL-92 标准及以后）中，有一个铁律：

> **如果在 `SELECT` 中出现了一个字段，且它没有被包裹在聚合函数（如 `SUM`, `COUNT`, `MAX`）里，那么它必须出现在 `GROUP BY` 子句中。**

为什么会有这个规定？

想象一下，如果一个 `dept_no` 对应了两个不同的 `dept_name`（虽然在数据库设计上这不合理，但在 SQL 引擎看来是有可能的）。

如果只按 `dept_no` 分组，SQL 引擎在处理 `SELECT dept_name` 时就会陷入混乱：“这一组里有俩名字，到底要我显示哪一个？”

为了消除这种“不确定性”，标准 SQL 要求开发者把所有要显示的非聚合字段都写进 `GROUP BY`。

------

### 2. 我怎么知道要写哪些字段上去？

不需要刻意去背，只需要遵循一个简单的**“过滤检查法”**：

#### 第一步：检查 `SELECT`

列出 SELECT 后面所有的字段。

例如：SELECT `d.dept_no`, `d.dept_name`, `COUNT(s.salary)`

#### 第二步：剔除“函数”

把带 `SUM()`、`COUNT()`、`AVG()` 等函数的字段划掉。

剩下：`d.dept_no`, `d.dept_name`

#### 第三步：无脑复制

剩下的这些，**全部、一个不漏地**写到 `GROUP BY` 后面。

------

### 3. 特殊情况：MySQL 的“宽容” (MySQL 5.7 以前)

可能会发现，在某些 MySQL 环境下，只写 `GROUP BY d.dept_no` 竟然**不报错**且能跑出正确结果。

这是因为 MySQL 有一个开关叫 `ONLY_FULL_GROUP_BY`。

- **如果关掉它**：MySQL 会“自作聪明”地从每个组里随便挑一个 `dept_name` 显示出来。
- **如果开启它（现代数据库默认开启）**：它会严格遵循标准 SQL，强制要求你写全。



建议：

永远按照“写全”的标准来要求。因为这样代码在 Oracle、PostgreSQL、SQL Server 等所有数据库之间都是通用的。

------

### 4. 逻辑上的“保底”

有时候，两个不同的部门可能叫同一个名字（比如两个不同的校区都有“后勤部”）。

- 如果只 `GROUP BY dept_name`：这两个部门会被**强行合并**成一行，数据就错了。
- 如果写 `GROUP BY dept_no, dept_name`：由于 ID 不同，它们会被正确地分为两行显示。

------

###  总结

> **“选什么，分什么；算什么，留什么。”**

- **选什么（SELECT）**：选出的普通字段，都要去 `GROUP BY` 报道。
- **分什么（GROUP BY）**：分类的依据。
- **算什么（聚合函数）**：不需要去 `GROUP BY`。

