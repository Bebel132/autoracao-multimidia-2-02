## Estrutura das pastas

```
/
├── back/
│ ├── index.js
│ ├── fotos_usuarios/
│ └── package.json
│
├── front/
│ ├── index.html
| ├── [outros arquivos html]
│ ├── style/
│ ├── assets/
│ └── scripts/
│
├── index.html
└── readme.md
```

## Como rodar

### 1. Instalação
Clone este repositório ou baixe os arquivos. No terminal, dentro da pasta do back, instale as dependências:

```bash
npm install
```

### 2. Iniciar o Servidor
Execute o comando:

```bash
node server.js
```
O servidor iniciará em: http://localhost:5000

### 3. Iniciar o front
Vá para pasta raiz e abra o arquivo `index.html`, ele redirecionará para a página inicial do projeto, ou entre na pasta `front` e abra o arquivo `index.html`

Esse `index.html` na pasta raiz serve para facilitar o uso do live server