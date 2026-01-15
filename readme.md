## Como rodar

### 1. Instalação
Clone este repositório ou baixe os arquivos. No terminal, dentro da pasta do projeto, instale as dependências:

```bash
npm install
```

### 2. Iniciar o Servidor
Execute o comando:

```bash
node server.js
```
O servidor iniciará em: http://localhost:5000


## Documentação da API
**POST /cadastrar_usuario**

Envia os dados do formulário para o servidor.


- Body (form-data):
    - `nome:` String (mín. 3 caracteres)
    - `email:` String (deve conter @)
    - `senha:` String (mín. 6 caracteres)
    - `cep:` String (formato 00000-000)
    - `cidade:` String
    - `foto:` Arquivo de imagem (Máx 5MB)

Respostas:

- `200 OK:` Cadastro realizado com sucesso.

- `500 Internal Server Error:` Retorna um JSON com a lista de erros encontrados.

**GET /listar_usuarios**

Exibe uma página HTML com a tabela paginada (simulada) de todos os usuários cadastrados.

## Regras de Segurança Implementadas

O sistema possui um filtro de sanitização que percorre todos os campos enviados. Se houver a presença de:

- `SELECT`, `CREATE`, `DELETE` ou `UPDATE`

A requisição é imediatamente rejeitada com status 500, protegendo a integridade da aplicação (Simulação de SQL Injection).