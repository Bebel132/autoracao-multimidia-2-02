const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const crypto = require("crypto");

const app = express();

app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(cors());

app.use("/fotos_usuarios", express.static("fotos_usuarios"));

// ROTA RAIZ
app.get("/", (req, res) => {
  res.send("Servidor online");
});

const storage = multer.diskStorage({
  destination: "./fotos_usuarios",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

let usuarios = [
  {
    id: 1,
    nome: "Emanuel",
    email: "emanuelmassalegal@mail.com",
    senha: "senha123",
    cep: "12345-678",
    cidade: "São Paulo",
    foto: "fotos_usuarios\\1769087727064-82MeWn_3TT1k_oR7RsLaLb1OLasHxosX0b4_ZZI5wNo.webp"
  },
  {
    id: 2,
    nome: "Emanuel2",
    email: "massalegal@mail.com",
    senha: "senha123",
    cep: "12345-678",
    cidade: "São Paulo",
    foto: "fotos_usuarios\\1769087335581-images (1).jpg"
  },
  {
    id: 3,
    nome: "usuario teste",
    email: "mail@mail.com",
    senha: "123",
    cep: "12345-678",
    cidade: "São Paulo",
    foto: ""
  },
  {
    id: 4,
    nome: "usuaraio teste2",
    email: "mail@mail.com",
    senha: "123",
    cep: "12345-678",
    cidade: "São Paulo",
    foto: ""
  },
];

let pedidosAmizade = [
  {
    id: 1,
    de: 2,
    para: 3
  }
];

let amizades = [
  {
    id: 1,
    usuario1: 1,
    usuario2: 3
  }
]

const sessoes = {};

// Validação
const validarUsuario = (dados) => {
  const erros = [];
  const { nome, email, senha, cep } = dados;
  const sqlKeywords = ["SELECT", "CREATE", "DELETE", "UPDATE"];

  for (let campo in dados) {
    if (typeof dados[campo] === "string") {
      const contemSQL = sqlKeywords.some((keyword) =>
        dados[campo].toUpperCase().includes(keyword)
      );
      if (contemSQL) {
        erros.push(`Tentativa de injeção SQL no campo "${campo}"`);
      }
    }
  }

  if (!nome || nome.length < 3) erros.push("Nome inválido.");
  if (!email || !email.includes("@")) erros.push("Email inválido.");
  if (!senha || senha.length < 6) erros.push("Senha fraca.");
  if (!cep || !cep.match(/^\d{5}-\d{3}$/)) erros.push("CEP inválido.");

  return erros;
};

// Autenticação Middleware
function autenticar(req, res, next) {
  const token = req.headers.authorization;

  if (!token || !sessoes[token]) {
    return res.status(401).json({ erro: "Usuário não autenticado" });
  }

  req.usuario = sessoes[token];
  next();
}

// Cadastro
app.post("/cadastrar_usuario", upload.single("foto"), (req, res) => {
  try {
    const erros = validarUsuario(req.body);
    if (erros.length > 0) {
      return res.status(400).json({ erros });
    }

    const novoUsuario = {
      id: Date.now(),
      nome: req.body.nome,
      email: req.body.email,
      senha: req.body.senha,
      cidade: req.body.cidade,
      cep: req.body.cep,
      foto: req.file ? req.file.path : null,
    };

    usuarios.push(novoUsuario);
    res.status(200).json({ mensagem: "Usuário cadastrado com sucesso", usuarios: usuarios });
  } catch {
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  const usuario = usuarios.find(
    (u) => u.email === email
  );

  if (!usuario) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  if (usuario && usuario.senha === senha) {
    const token = crypto.randomBytes(16).toString("hex");

    sessoes[token] = {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
    }

    res.status(200).json({ message: "Login bem sucedido", token, usuario: sessoes[token] });
  }

});

app.post("/logout", autenticar, (req, res) => {
  const token = req.headers.authorization;
  delete sessoes[token];
  res.status(200).json({ mensagem: "Logout realizado com sucesso" });
});

// Listagem
app.get("/listar_usuarios", (req, res) => {
  let html = `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <title>Usuários Cadastrados</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Segoe UI', Tahoma, sans-serif;
            }

            body {
                min-height: 100vh;
                background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
                padding: 40px;
                color: #fff;
            }

            h2 {
                text-align: center;
                margin-bottom: 40px;
                font-size: 2.2rem;
                letter-spacing: 1px;
            }

            .container {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                gap: 25px;
                max-width: 1200px;
                margin: auto;
            }

            .card {
                background: rgba(255, 255, 255, 0.08);
                border-radius: 15px;
                padding: 25px;
                text-align: center;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.15);
                transition: transform 0.3s, box-shadow 0.3s;
            }

            .card:hover {
                transform: translateY(-8px);
                box-shadow: 0 15px 30px rgba(0,0,0,0.4);
            }

            .avatar {
                width: 90px;
                height: 90px;
                border-radius: 50%;
                object-fit: cover;
                border: 3px solid #00d4ff;
                margin-bottom: 15px;
            }

            .nome {
                font-size: 1.2rem;
                font-weight: 600;
                margin-bottom: 8px;
            }

            .email {
                font-size: 0.9rem;
                opacity: 0.85;
                margin-bottom: 10px;
                word-break: break-word;
            }

            .cidade {
                display: inline-block;
                margin-top: 10px;
                padding: 5px 12px;
                border-radius: 20px;
                background: rgba(0, 212, 255, 0.15);
                font-size: 0.8rem;
                letter-spacing: 0.5px;
            }

            .sem-usuarios {
                text-align: center;
                opacity: 0.7;
                font-size: 1.1rem;
            }

            .voltar {
                position: fixed;
                top: 25px;
                left: 25px;
                padding: 10px 18px;
                border-radius: 30px;
                color: #fff;
                background: rgba(255, 255, 255, 0.15);
                border: 1px solid rgba(255, 255, 255, 0.25);
                backdrop-filter: blur(8px);
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.3s ease;
}

            .voltar:hover {
                box-shadow: 0 8px 20px rgba(0,0,0,0.4);
                background: rgba(0, 212, 255, 0.35);
}

        </style>
    </head>
    <body>

    <button class="voltar" onclick="history.back()">← Voltar</button>


        <h2>Usuários Cadastrados</h2>

        ${
          usuarios.length === 0
            ? `<p class="sem-usuarios">Nenhum usuário cadastrado ainda.</p>`
            : `
            <div class="container">
                ${usuarios
                  .map(
                    (u) => `
                    <div class="card">
                        ${
                          u.foto
                            ? `<img class="avatar" src="/${u.foto}">`
                            : `<img class="avatar" src="https://via.placeholder.com/90">`
                        }
                        <div class="nome">${u.nome}</div>
                        <div class="email">${u.email}</div>
                        <div class="cidade">${
                          u.cidade || "Cidade não informada"
                        }</div>
                    </div>
                `
                  )
                  .join("")}
            </div>
            `
        }

    </body>
    </html>
    `;
  res.send(html);
});

// Dados do usuário autenticado
app.get("/me", autenticar, (req, res) => {
  const usuario = usuarios.find(u => u.email === req.usuario.email);
  
  if (!usuario) {
    return res.status(404).json({ erro: "Usuário não encontrado" });
  }

  res.json({ 
    id: usuario.id,
    nome: usuario.nome, 
    email: usuario.email,
    foto: usuario.foto
  });
});

// Listar todos os usuários (que você pode adicionar como amigo)
app.get("/usuarios", autenticar, (req, res) => {
  res.json(usuarios
    .filter(u => u.email !== req.usuario.email)
    .filter(u => {
      const usuarioLogado = usuarios.find(user => user.email === req.usuario.email);
      const amizadeExistente = amizades.find(a => a.usuario1 === usuarioLogado.id && a.usuario2 === u.id);
      return !amizadeExistente;
    })
    .map(u => ({ 
      id: u.id,
      nome: u.nome, 
      email: u.email, 
      cidade: u.cidade, 
      foto: u.foto 
    }))
  );
});

app.post("/me/upload_foto", autenticar, upload.single("foto"), (req, res) => {
  try {
    const usuario = usuarios.find(u => u.email === req.usuario.email);
    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }
    if (req.file) {
      usuario.foto = req.file.path;
      return res.status(200).json({ mensagem: "Foto atualizada com sucesso", foto: usuario.foto });
    } else {
      return res.status(400).json({ erro: "Nenhuma foto enviada" });
    }
  } catch {
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

app.post("/amizade/pedir/:paraId", autenticar, (req, res) => {
  const deId = usuarios.find(u => u.email === req.usuario.email).id;
  const paraId = parseInt(req.params.paraId);

  if (deId === paraId) {
    return res.status(400).json({ erro: "Você não pode pedir amizade com você mesmo." });
  }

  const pedidoExistente = pedidosAmizade.find(p => p.de === deId && p.para === paraId);
  if (pedidoExistente) {
    return res.status(400).json({ erro: "Pedido de amizade já enviado." });
  }

  const novoPedido = {
    id: pedidosAmizade.length + 1,
    de: deId,
    para: paraId
  };

  pedidosAmizade.push(novoPedido);
  res.status(201).json({ mensagem: "Pedido de amizade enviado com sucesso." });
});

app.get("/amigos", autenticar, (req, res) => {
  const usuarioId = usuarios.find(u => u.email === req.usuario.email).id;
  const amigosIds = amizades
    .filter(a => a.usuario1 === usuarioId || a.usuario2 === usuarioId)
    .map(a => (a.usuario1 === usuarioId ? a.usuario2 : a.usuario1));
  const amigos = usuarios.filter(u => amigosIds.includes(u.id)).map(u => ({
    id: u.id,
    nome: u.nome,
    email: u.email,
    foto: u.foto
  }));
  res.json(amigos);
});

// 🔹 Servidor
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
