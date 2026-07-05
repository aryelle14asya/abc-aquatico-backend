const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, u.nome as aluno_nome FROM contratos c
      JOIN usuarios u ON c.aluno_id = u.id
      ORDER BY c.criado_em DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { aluno_id, plano_id, numero, data_inicio, data_renovacao } = req.body;
    const result = await db.query(
      'INSERT INTO contratos (aluno_id, plano_id, numero, status, data_inicio, data_renovacao) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [aluno_id, plano_id, numero, 'ativo', data_inicio, data_renovacao]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

router.put('/:id/cancelar', auth, async (req, res) => {
  try {
    const result = await db.query(
      "UPDATE contratos SET status='cancelado' WHERE id=$1 RETURNING *", [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

module.exports = router;