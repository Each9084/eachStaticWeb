import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET') {
            const { search, tag } = req.query;

            // 注意：这里使用 blog_posts 和 blog_users，必须与你 SQL Editor 里创的一致
            if (search) {
                const { rows } = await sql`
                    SELECT p.*, u.nickname 
                    FROM blog_posts p 
                    JOIN blog_users u ON p.author_sub = u.google_sub 
                    WHERE p.title ILIKE ${'%' + search + '%'} 
                    ORDER BY p.created_at DESC`;
                return res.status(200).json(rows);
            } else if (tag) {
                const { rows } = await sql`
                    SELECT p.*, u.nickname 
                    FROM blog_posts p 
                    JOIN blog_users u ON p.author_sub = u.google_sub 
                    WHERE ${tag} = ANY(p.tags) 
                    ORDER BY p.created_at DESC`;
                return res.status(200).json(rows);
            } else {
                const { rows } = await sql`
                    SELECT p.*, u.nickname 
                    FROM blog_posts p 
                    LEFT JOIN blog_users u ON p.author_sub = u.google_sub 
                    ORDER BY p.created_at DESC`;
                return res.status(200).json(rows);
            }
        }

        if (req.method === 'POST') {
            const { sub, nickname, title, content, tags, summary } = req.body;

            // 1. 确保用户存在 (Upsert)
            await sql`
                INSERT INTO blog_users (google_sub, nickname)
                VALUES (${sub}, ${nickname})
                ON CONFLICT (google_sub) DO UPDATE SET nickname = ${nickname}
            `;

            // 2. 插入文章
            await sql`
                INSERT INTO blog_posts (author_sub, title, content, tags, summary)
                VALUES (${sub}, ${title}, ${content}, ${tags}, ${summary})
            `;

            return res.status(200).json({ success: true });
        }
    } catch (error) {
        // 关键：将错误详情返回给前端预览
        console.error("Database Error:", error);
        return res.status(500).json({ error: error.message, detail: error.stack });
    }
}