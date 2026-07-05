const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/produtos', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM produtos WHERE ativo = true ORDER BY categoria');
    res.json(result.rows);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

router.post('/produtos', auth, async (req, res) => {
  try {
    const { nome, descricao, preco, estoque, categoria } = req.body;
    const result = await db.query(
      'INSERT INTO produtos (nome, descricao, preco, estoque, categoria) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [nome, descricao, preco, estoque, categoria]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

router.post('/pedidos', auth, async (req, res) => {
  try {
    const { itens, total } = req.body;
    const pedido = await db.query(
      'INSERT INTO pedidos (aluno_id, total, status) VALUES ($1,$2,$3) RETURNING *',
      [req.usuario.id, total, 'pendente']
    );
    for (const item of itens) {
      await db.query(
        'INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, preco) VALUES ($1,$2,$3,$4)',
        [pedido.rows[0].id, item.produto_id, item.quantidade, item.preco]
      );
    }
    res.json(pedido.rows[0]);
  } catch (err) { res.status(400).json({ erro: err.message }); }
});

module.exports = router;