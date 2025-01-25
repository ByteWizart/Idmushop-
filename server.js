const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Banco de dados em memória (substitua por um banco de dados real)
const users = {};

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kaiovitorpg@gmail.com', // Seu e-mail
    pass: 'mopd achb tgoy ldcz' // Sua senha de aplicativo do Gmail
  }
});

// Middleware para lidar com os dados da requisição
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Função para enviar o e-mail de verificação
function sendVerificationEmail(email, verificationToken) {
  const verificationLink = `http://localhost:${port}/verify-email/${verificationToken}`;
  const mailOptions = {
    from: 'kaiovitorpg@gmail.com',
    to: email,
    subject: 'Verificação de E-mail',
    text: `Clique no link para verificar seu e-mail: ${verificationLink}`
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log('Erro ao enviar o e-mail:', error);
    } else {
      console.log('E-mail de verificação enviado: ' + info.response);
    }
  });
}

// Rota para o registro do usuário
app.post('/register', (req, res) => {
  const { email, password } = req.body;

  // Verifica se o usuário já existe
  if (users[email]) {
    return res.status(400).send('Usuário já registrado');
  }

  // Gera um token de verificação único
  const verificationToken = crypto.randomBytes(20).toString('hex');
  
  // Armazena o usuário com o token de verificação e status de verificação
  users[email] = {
    password: password,
    isVerified: false,
    verificationToken: verificationToken
  };

  // Envia o e-mail de verificação
  sendVerificationEmail(email, verificationToken);

  res.send('Registro bem-sucedido! Verifique seu e-mail para ativar sua conta.');
});

// Rota para verificar o e-mail
app.get('/verify-email/:token', (req, res) => {
  const { token } = req.params;

  // Encontra o usuário com o token de verificação
  const user = Object.values(users).find(user => user.verificationToken === token);

  if (!user) {
    return res.status(400).send('Token inválido ou expirado');
  }

  // Marca o usuário como verificado
  user.isVerified = true;

  res.send('E-mail verificado com sucesso! Sua conta agora está ativa.');
});

// Página inicial (rota para retornar a página HTML com o formulário de registro)
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Registro de Usuário</h1>
        <form action="/register" method="POST">
          <label for="email">E-mail:</label><br>
          <input type="email" id="email" name="email" required><br><br>
          <label for="password">Senha:</label><br>
          <input type="password" id="password" name="password" required><br><br>
          <input type="submit" value="Registrar">
        </form>
      </body>
    </html>
  `);
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
