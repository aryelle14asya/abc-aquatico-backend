const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', require('./routes/auth'));
app.use('/alunos', require('./routes/alunos'));
app.use('/turmas', require('./routes/turmas'));
app.use('/pagamentos', require('./routes/pagamentos'));
app.use('/forum', require('./routes/forum'));
app.use('/competicoes', require('./routes/competicoes'));
app.use('/loja', require('./routes/loja'));
app.use('/contratos', require('./routes/contratos'));
app.use('/notificacoes', require('./routes/notificacoes'));

app.get('/', (req, res) => res.json({ status: '✅ ABC Aquático API online!' }));

app.listen(process.env.PORT || 3000, () => {
  console.log(`✅ Servidor rodando na porta ${process.env.PORT || 3000}`);
});