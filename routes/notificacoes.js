const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM notificacoes WHERE usuario_id = $1 ORDER BY criado_em DESC',
      [req.usuario.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { usuario_id, titulo, mensagem, tipo } = req.body;
    const result = await db.query(
      'INSERT INTO notificacoes (usuario_id, titulo, mensagem, tipo) VALUES ($1,$2,$3,$4) RETURNING *',
      [usuario_id, titulo, mensagem, tipo]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

router.put('/:id/lida', auth, async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE notificacoes SET lida=true WHERE id=$1 RETURNING *', [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

module.exports = router;