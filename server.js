const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const session = require('express-session');

const app = express();
const port = 3000;

// Banco de dados em memória (substitua por um banco de dados real)
const users = {};

// Configuração do Nodemailer para envio de e-mail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kaiovitorpg@gmail.com', // Altere para o e-mail de envio
    pass: 'mopd achb tgoy ldcz'     // Altere para a senha do e-mail ou use App Password
  }
});

// Middleware para lidar com os dados da requisição
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuração da sessão
app.use(session({
  secret: 'secret-key', // chave secreta para criptografar a sessão
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Defina como 'true' em produção com HTTPS
}));

// Rota para a página inicial
app.get('/', (req, res) => {
  res.send('Bem-vindo à página inicial!');
});

// Função para gerar o link de verificação (com base no token)
function generateVerificationLink(email, verificationToken) {
  return `http://localhost:${port}/verify-email/${verificationToken}`;
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

  // Criação do link de verificação
  const verificationLink = generateVerificationLink(email, verificationToken);

  // Configuração do e-mail de verificação
  const mailOptions = {
    from: 'kaiovitorpg@gmail.com',
    to: email,
    subject: 'Verifique seu e-mail',
    text: `Clique no link abaixo para verificar seu e-mail e ativar sua conta:\n\n${verificationLink}`
  };

  // Envio do e-mail
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
      return res.status(500).send('Erro ao enviar o e-mail de verificação');
    } else {
      console.log('Email de verificação enviado: ' + info.response);
      res.send(`
        <html>
          <head>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                background-color: #f4f7fc;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
              }

              .container {
                background: white;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                padding: 30px;
                width: 100%;
                max-width: 500px;
              }

              h1 {
                font-size: 2em;
                color: #333;
                text-align: center;
                margin-bottom: 20px;
              }

              p {
                color: #555;
                font-size: 1.1em;
                text-align: center;
              }

              a {
                color: #007BFF;
                text-decoration: none;
                font-weight: bold;
                display: inline-block;
                margin-top: 15px;
                text-align: center;
              }

              a:hover {
                text-decoration: underline;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Registro bem-sucedido!</h1>
              <p>Verifique seu e-mail para ativar sua conta.</p>
              <p>Se não recebeu o e-mail, verifique sua caixa de spam.</p>
            </div>
          </body>
        </html>
      `);
    }
  });
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

  res.send(`
    <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f7fc;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }

          .container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            padding: 30px;
            width: 100%;
            max-width: 500px;
          }

          h1 {
            font-size: 2em;
            color: #333;
            text-align: center;
            margin-bottom: 20px;
          }

          p {
            color: #555;
            font-size: 1.1em;
            text-align: center;
          }

          .welcome {
            color: green;
            font-size: 1.2em;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>E-mail Verificado!</h1>
          <p class="welcome">Sua conta foi ativada com sucesso!</p>
        </div>
      </body>
    </html>
  `);
});

// Rota para o login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = users[email];

  if (!user) {
    return res.status(400).send('Usuário não encontrado');
  }

  if (user.password !== password) {
    return res.status(400).send('Senha incorreta');
  }

  // Verifica se o usuário está verificado
  if (!user.isVerified) {
    return res.status(400).send('Por favor, verifique seu e-mail antes de fazer login');
  }

  // Inicia a sessão
  req.session.user = { email: user.email };

  res.send(`
    <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f7fc;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }

          .container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            padding: 30px;
            width: 100%;
            max-width: 500px;
          }

          h1 {
            font-size: 2em;
            color: #333;
            text-align: center;
            margin-bottom: 20px;
          }

          p {
            color: #555;
            font-size: 1.1em;
            text-align: center;
          }

          .welcome {
            color: green;
            font-size: 1.2em;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Login Bem-sucedido!</h1>
          <p class="welcome">Bem-vindo, ${email}!</p>
        </div>
      </body>
    </html>
  `);
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
