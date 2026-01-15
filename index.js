const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

const storage = multer.diskStorage({
    destination: './fotos_usuarios',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

let usuarios = [];

const validarUsuario = (dados) => {
    const erros = [];
    const { nome, email, senha, cep } = dados;
    const sqlKeywords = ["SELECT", "CREATE", "DELETE", "UPDATE"];

    for (let campo in dados) {
        if (typeof dados[campo] === 'string') {
            const contemSQL = sqlKeywords.some(keyword =>
                dados[campo].toUpperCase().includes(keyword)
            );
            if (contemSQL) {
                erros.push(`Tentativa de injeção SQL no campo "${campo}"`);
            }
        }
    }

    if (!nome || nome.length < 3) {
        erros.push("Nome inválido (mínimo 3 caracteres).");
    }

    if (!email || !email.includes('@')) {
        erros.push("Email inválido.");
    }

    if (!senha || senha.length < 6) {
        erros.push("Senha fraca (mínimo 6 caracteres).");
    }

    if (!cep || !cep.match(/^\d{5}-\d{3}$/)) {
        erros.push("CEP em formato inválido (00000-000).");
    }

    return erros;
};

app.post('/cadastrar_usuario', upload.single('foto'), (req, res) => {
    try {
        const erros = validarUsuario(req.body);
        
        if (erros.length > 0) {
            return res.status(500).json({ erros });
        }

        const novoUsuario = {
            ...req.body,
            id: Date.now(),
            foto: req.file ? req.file.path : null
        };

        usuarios.push(novoUsuario);
        res.status(200).send("OK");

    } catch (error) {
        res.status(500).json({
            erros: ["Erro interno no servidor."]
        });
    }
});

app.get('/listar_usuarios', (req, res) => {
    let html = `
        <html>
        <head>
            <title>Lista de Usuários</title>
            <style>
                table { width: 100%; border-collapse: collapse; font-family: sans-serif; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                img { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; }
            </style>
        </head>
        <body>
            <h1>Usuários Cadastrados</h1>
            <table>
                <tr>
                    <th>Foto</th><th>Nome</th><th>Email</th><th>Cidade</th>
                </tr>
                ${usuarios.map(u => `
                    <tr>
                        <td><img src="/${u.foto}" alt="foto"></td>
                        <td>${u.nome}</td>
                        <td>${u.email}</td>
                        <td>${u.cidade}</td>
                    </tr>
                `).join('')}
            </table>
        </body>
        </html>
    `;
    res.send(html);
});

app.use('/fotos_usuarios', express.static('fotos_usuarios'));

const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));