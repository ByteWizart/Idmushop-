const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com", // SMTP do Outlook
  port: 587, // Porta correta para TLS
  secure: false, // False porque não estamos usando a porta 465
  auth: {
    user: "kaiovitorpg@gmail.com", // Seu e-mail
    pass: "lxrv ckmu mret xjhk", // Senha do app ou senha do Outlook
  },
});

// Teste de conexão do transporter
transporter.verify((error, success) => {
  if (error) {
    console.error("Erro na configuração do SMTP:", error);
  } else {
    console.log("Servidor SMTP configurado corretamente:", success);
  }
});

// Rota para servir o formulário
app.get("/", (req, res) => {
  res.send(`
    <form action="/register" method="POST">
      <input type="email" name="email" placeholder="Digite seu e-mail" required>
      <button type="submit">Registrar</button>
    </form>
  `);
});

// Rota para envio de e-mail
app.post("/register", (req, res) => {
  const { email } = req.body;

  const mailOptions = {
    from: "kaiovitorpg@gmail.com", // O e-mail remetente
    to: email, // E-mail do destinatário
    subject: "Verifique sua conta!",
    text: `Obrigado por se registrar! Clique no link abaixo para verificar sua conta:\n\nhttps://seusite.com/verify?email=${email}`,
  };

  // Envio do e-mail com captura de erro detalhado
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Erro ao enviar o e-mail:", error); // Log do erro completo
      res.status(500).send("Erro ao enviar o e-mail. Verifique os logs para mais detalhes.");
    } else {
      console.log("E-mail enviado com sucesso:", info.response);
      res.send("E-mail enviado! Verifique sua caixa de entrada.");
    }
  });
});

// Inicia o servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
