const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM competicoes ORDER BY data ASC');
    res.json(result.rows);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { nome, data, local, descricao } = req.body;
    const result = await db.query(
      'INSERT INTO competicoes (nome, data, local, descricao, status) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [nome, data, local, descricao, 'em_breve']
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

router.get('/:id/categorias', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM categorias_competicao WHERE competicao_id = $1', [req.params.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

router.post('/:id/inscrever', auth, async (req, res) => {
  try {
    const { categoria_id, forma_pagamento } = req.body;
    const result = await db.query(
      'INSERT INTO inscricoes_competicao (aluno_id, categoria_id, forma_pagamento, status) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.usuario.id, categoria_id, forma_pagamento, 'pendente']
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

module.exports = router;