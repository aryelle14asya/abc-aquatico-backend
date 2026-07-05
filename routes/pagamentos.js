const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, u.nome as aluno_nome FROM pagamentos p
      JOIN usuarios u ON p.aluno_id = u.id
      ORDER BY p.criado_em DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { valor, forma, plano_id } = req.body;
    const result = await db.query(
      'INSERT INTO pagamentos (aluno_id, valor, forma, status, plano_id) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.usuario.id, valor, forma, 'pendente', plano_id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

router.put('/:id/aprovar', auth, async (req, res) => {
  try {
    const result = await db.query(
      "UPDATE pagamentos SET status='pago' WHERE id=$1 RETURNING *", [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

router.put('/:id/rejeitar', auth, async (req, res) => {
  try {
    const result = await db.query(
      "UPDATE pagamentos SET status='pendente' WHERE id=$1 RETURNING *", [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

module.exports = router;