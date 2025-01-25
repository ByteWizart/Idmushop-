const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração do Nodemailer com credenciais diretamente no código
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com", // Substitua pelo host do SMTP que você está usando
  port: 587, // Porta para TLS
  secure: false, // Use "true" para a porta 465
  auth: {
    user: "kaiovitorpg@gmail.com", // Seu e-mail
    pass: "dohl geth najb grcy", // Sua senha ou senha de aplicativo
  },
});

// HTML integrado ao código
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cadastro e Login</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: Arial, sans-serif;
    }
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #f6d365, #fda085);
      color: #333;
    }
    .container {
      background: #fff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 400px;
      text-align: center;
    }
    h1 {
      margin-bottom: 20px;
      color: #444;
    }
    form {
      display: flex;
      flex-direction: column;
    }
    input {
      padding: 10px;
      margin: 10px 0;
      border: 1px solid #ccc;
      border-radius: 5px;
      font-size: 16px;
    }
    button {
      padding: 10px;
      background: #f6d365;
      border: none;
      border-radius: 5px;
      color: #fff;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.3s ease;
    }
    button:hover {
      background: #f3a683;
    }
    .link {
      margin-top: 10px;
      color: #f6d365;
      cursor: pointer;
      text-decoration: underline;
    }
    .link:hover {
      color: #f3a683;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Cadastro & Login</h1>
    <form action="/register" method="POST">
      <h2>Cadastro</h2>
      <input type="email" name="email" placeholder="Digite seu e-mail" required>
      <input type="password" name="password" placeholder="Crie uma senha" required>
      <button type="submit">Registrar</button>
    </form>
    <form action="/login" method="POST">
      <h2>Login</h2>
      <input type="email" name="email" placeholder="Digite seu e-mail" required>
      <input type="password" name="password" placeholder="Digite sua senha" required>
      <button type="submit">Entrar</button>
    </form>
    <div class="link" onclick="remind()">Lembrar novamente</div>
  </div>
  <script>
    function remind() {
      alert("Clique no botão de registro ou login e insira seu e-mail novamente!");
    }
  </script>
</body>
</html>
`;

// Rota para servir o HTML
app.get("/", (req, res) => {
  res.send(htmlContent);
});

// Rota para registro
app.post("/register", (req, res) => {
  const { email } = req.body;

  const mailOptions = {
    from: "kaiovitorpg@gmail.com",
    to: email,
    subject: "Verifique sua conta!",
    text: `Obrigado por se registrar! Clique no link abaixo para verificar sua conta:\n\nhttps://seusite.render.com/verify?email=${email}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.send("Erro ao enviar o e-mail.");
    } else {
      console.log("E-mail enviado: " + info.response);
      res.send("Verifique seu e-mail para concluir o registro!");
    }
  });
});

// Rota para login (simulação básica)
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  // Aqui você pode implementar lógica de validação com banco de dados
  console.log(`Login tentado por: ${email}`);
  res.send(`Bem-vindo de volta, ${email}!`);
});

// Inicia o servidor
app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
