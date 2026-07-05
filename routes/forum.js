const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, u.nome as autor_nome,
      COUNT(DISTINCT c.id) as total_comentarios,
      COUNT(DISTINCT cu.id) as total_curtidas
      FROM posts_forum p
      JOIN usuarios u ON p.autor_id = u.id
      LEFT JOIN comentarios c ON c.post_id = p.id
      LEFT JOIN curtidas cu ON cu.post_id = p.id
      GROUP BY p.id, u.nome
      ORDER BY p.criado_em DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { titulo, mensagem, tipo } = req.body;
    const result = await db.query(
      'INSERT INTO posts_forum (autor_id, titulo, mensagem, tipo) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.usuario.id, titulo, mensagem, tipo]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

router.get('/:id/comentarios', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, u.nome as autor_nome FROM comentarios c
      JOIN usuarios u ON c.autor_id = u.id
      WHERE c.post_id = $1 ORDER BY c.criado_em ASC
    `, [req.params.id]);
    res.json(result.rows);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

router.post('/:id/comentarios', auth, async (req, res) => {
  try {
    const { texto } = req.body;
    const result = await db.query(
      'INSERT INTO comentarios (post_id, autor_id, texto) VALUES ($1,$2,$3) RETURNING *',
      [req.params.id, req.usuario.id, texto]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

router.post('/:id/curtir', auth, async (req, res) => {
  try {
    const jaExiste = await db.query(
      'SELECT id FROM curtidas WHERE post_id=$1 AND usuario_id=$2',
      [req.params.id, req.usuario.id]
    );
    if (jaExiste.rows[0]) {
      await db.query('DELETE FROM curtidas WHERE post_id=$1 AND usuario_id=$2', [req.params.id, req.usuario.id]);
      res.json({ curtido: false });
    } else {
      await db.query('INSERT INTO curtidas (post_id, usuario_id) VALUES ($1,$2)', [req.params.id, req.usuario.id]);
      res.json({ curtido: true });
    }
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

module.exports = router;