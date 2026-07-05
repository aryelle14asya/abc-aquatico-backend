const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

router.post('/cadastro', async (req, res) => {
  try {
    const { nome, email, senha, tipo, telefone, data_nascimento } = req.body;
    const senhaHash = await bcrypt.hash(senha, 10);
    const result = await db.query(
      `INSERT INTO usuarios (nome, email, senha, tipo, telefone, data_nascimento)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nome, email, tipo`,
      [nome, email, senhaHash, tipo, telefone, data_nascimento]
    );
    const token = jwt.sign({ id: result.rows[0].id, tipo }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ usuario: result.rows[0], token });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (!result.rows[0]) return res.status(401).json({ erro: 'Usuário não encontrado' });
    const senhaOk = await bcrypt.compare(senha, result.rows[0].senha);
    if (!senhaOk) return res.status(401).json({ erro: 'Senha incorreta' });
    const { senha: _, ...usuario } = result.rows[0];
    const token = jwt.sign({ id: usuario.id, tipo: usuario.tipo }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ usuario, token });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

module.exports = router;