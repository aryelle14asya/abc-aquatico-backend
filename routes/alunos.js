const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/perfil', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, nome, email, telefone, data_nascimento, foto_url FROM usuarios WHERE id = $1',
      [req.usuario.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

router.put('/perfil', auth, async (req, res) => {
  try {
    const { nome, email, telefone } = req.body;
    const result = await db.query(
      'UPDATE usuarios SET nome=$1, email=$2, telefone=$3 WHERE id=$4 RETURNING id, nome, email, telefone',
      [nome, email, telefone, req.usuario.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query("SELECT id, nome, email, telefone FROM usuarios WHERE tipo = 'aluno'");
    res.json(result.rows);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

module.exports = router;