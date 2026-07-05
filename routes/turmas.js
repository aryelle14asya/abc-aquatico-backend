const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT t.*, u.nome as professor_nome,
      COUNT(m.id) as total_alunos
      FROM turmas t
      LEFT JOIN usuarios u ON t.professor_id = u.id
      LEFT JOIN matriculas m ON t.id = m.turma_id AND m.status = 'ativo'
      WHERE t.ativo = true
      GROUP BY t.id, u.nome
      ORDER BY t.dia_semana, t.horario
    `);
    res.json(result.rows);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { nome, dia_semana, horario, capacidade } = req.body;
    const result = await db.query(
      'INSERT INTO turmas (nome, dia_semana, horario, professor_id, capacidade) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [nome, dia_semana, horario, req.usuario.id, capacidade || 12]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

router.get('/:id/alunos', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.nome, u.telefone, m.status,
      COUNT(CASE WHEN p.presente = true THEN 1 END) as presencas,
      COUNT(CASE WHEN p.presente = false THEN 1 END) as faltas
      FROM matriculas m
      JOIN usuarios u ON m.aluno_id = u.id
      LEFT JOIN presencas p ON p.aluno_id = u.id AND p.turma_id = m.turma_id
      WHERE m.turma_id = $1
      GROUP BY u.id, u.nome, u.telefone, m.status
    `, [req.params.id]);
    res.json(result.rows);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

module.exports = router;