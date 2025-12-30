import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // --- GET: 获取文章列表或单篇文章 ---
        if (req.method === 'GET') {
            const { id, tag, search } = req.query;

            if (id) {
                const { rows } = await sql`SELECT p.*, u.nickname FROM blog_posts p JOIN blog_users u ON p.author_sub = u.google_sub WHERE p.id = ${id}`;
                return res.status(200).json(rows[0]);
            }

            let query;
            if (search) {
                query = await sql`SELECT p.*, u.nickname FROM blog_posts p JOIN blog_users u ON p.author_sub = u.google_sub WHERE p.title ILIKE ${'%' + search + '%'} ORDER BY p.created_at DESC`;
            } else if (tag) {
                query = await sql`SELECT p.*, u.nickname FROM blog_posts p JOIN blog_users u ON p.author_sub = u.google_sub WHERE ${tag} = ANY(p.tags) ORDER BY p.created_at DESC`;
            } else {
                query = await sql`SELECT p.*, u.nickname FROM blog_posts p JOIN blog_users u ON p.author_sub = u.google_sub ORDER BY p.created_at DESC`;
            }
            return res.status(200).json(query.rows);
        }

        // --- POST: 发表或更新文章 ---
        if (req.method === 'POST') {
            const { sub, nickname, title, content, tags, cover_image, summary } = req.body;

            // 1. 自动注册/更新用户信息
            await sql`
                INSERT INTO blog_users (google_sub, nickname) 
                VALUES (${sub}, ${nickname}) 
                ON CONFLICT (google_sub) DO UPDATE SET nickname = ${nickname}
            `;

            // 2. 插入文章
            const result = await sql`
                INSERT INTO blog_posts (author_sub, title, content, tags, cover_image, summary)
                VALUES (${sub}, ${title}, ${content}, ${tags}, ${cover_image}, ${summary})
                RETURNING id
            `;
            return res.status(200).json({ success: true, id: result.rows[0].id });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}