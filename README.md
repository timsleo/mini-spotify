# 🎵 Mini Spotify API

API REST para gerenciar músicas e playlists no estilo Spotify, com autenticação JWT e banco de dados **Azure Cosmos DB**.

Cada usuário cria a própria conta, cadastra músicas e organiza essas músicas em playlists. Todas as rotas de músicas e playlists são protegidas por token, e cada usuário só acessa os próprios dados.

## Stack

- **Node.js** + **Express** (ES Modules)
- **Azure Cosmos DB** (API NoSQL) via `@azure/cosmos`
- **JWT** (`jsonwebtoken`) para autenticação
- **bcryptjs** para hash de senhas
- **express-validator** para validação de entrada

## Arquitetura

```
src/
├── config/database.js       # Conexão com o Cosmos DB e criação automática do banco/containers
├── controllers/             # Lógica de autenticação (registro, login, update, delete)
├── middleware/auth.js       # Verifica o token JWT no header x-auth-token
├── models/                  # User, Song, Playlist (acesso ao Cosmos DB)
├── routes/                  # Rotas /api/auth, /api/songs, /api/playlists
├── utils/                   # Validadores e tratamento centralizado de erros
└── server.js                # Ponto de entrada
```

### Modelagem no Cosmos DB

| Container   | Partition key | Por quê |
|-------------|---------------|---------|
| `users`     | `/email`      | Login e cadastro buscam o usuário pelo e-mail |
| `playlists` | `/userId`     | Toda consulta é "playlists deste usuário", então elas ficam na mesma partição |
| `songs`     | `/userId`     | Mesmo motivo: isola os dados por usuário |

O banco e os containers são criados automaticamente na primeira execução (`createIfNotExists`).

## Como rodar

### Pré-requisitos

- Node.js 18 ou superior
- Uma conta Azure Cosmos DB (API NoSQL). O [plano gratuito](https://learn.microsoft.com/azure/cosmos-db/free-tier) atende, ou use o [emulador local](https://learn.microsoft.com/azure/cosmos-db/emulator).

### Configurando o Azure Cosmos DB

1. No [Portal do Azure](https://portal.azure.com), crie um recurso **Azure Cosmos DB** e escolha a API **NoSQL**.
2. Depois de criado, abra o recurso e vá em **Settings → Keys**.
3. Copie a **URI** (vai em `COSMOS_ENDPOINT`) e a **Primary Key** (vai em `COSMOS_KEY`).

Não é preciso criar o banco nem os containers à mão: a API faz isso ao iniciar.

### Instalação

```bash
git clone https://github.com/timsleo/mini-spotify.git
cd mini-spotify
npm install
cp .env.example .env   # preencha com seus valores
npm run dev            # ou: npm start
```

### Variáveis de ambiente

| Variável          | Descrição |
|-------------------|-----------|
| `COSMOS_ENDPOINT` | URI da conta Cosmos DB |
| `COSMOS_KEY`      | Primary key da conta |
| `COSMOS_DATABASE` | Nome do banco (ex.: `mini-spotify`) |
| `JWT_SECRET`      | Secret para assinar os tokens. Gere com `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `PORT`            | Porta do servidor (padrão `3000`) |

> O servidor não sobe sem `JWT_SECRET`, para evitar rodar com um secret vazio ou previsível.

## Endpoints

Rotas marcadas com 🔒 exigem o header `x-auth-token: <token>`.

### Autenticação — `/api/auth`

| Método | Rota        | Descrição |
|--------|-------------|-----------|
| POST   | `/register` | Cria a conta (`name`, `email`, `password`) e retorna o token |
| POST   | `/login`    | Autentica (`email`, `password`) e retorna o token |
| PUT    | `/update` 🔒 | Atualiza nome, e-mail ou senha |
| DELETE | `/delete` 🔒 | Remove a conta |

### Músicas — `/api/songs`

| Método | Rota    | Descrição |
|--------|---------|-----------|
| POST   | `/` 🔒   | Cadastra uma música (`title`, `artist`, `duration` em segundos) |
| GET    | `/:id` 🔒 | Busca uma música do usuário |

### Playlists — `/api/playlists`

| Método | Rota                          | Descrição |
|--------|-------------------------------|-----------|
| POST   | `/` 🔒                         | Cria uma playlist (`name`) |
| GET    | `/` 🔒                         | Lista as playlists do usuário |
| PUT    | `/:id` 🔒                      | Renomeia uma playlist |
| DELETE | `/:id` 🔒                      | Remove uma playlist |
| POST   | `/:playlistId/songs/:songId` 🔒 | Adiciona uma música à playlist |

### Exemplo

```bash
# Criar conta
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Leo","email":"leo@email.com","password":"123456"}'

# Criar playlist com o token retornado
curl -X POST http://localhost:3000/api/playlists \
  -H "Content-Type: application/json" \
  -H "x-auth-token: <TOKEN>" \
  -d '{"name":"Favoritas"}'
```

## Status

Projeto de estudo de 2024, focado em APIs REST, autenticação JWT e modelagem NoSQL no Azure. O deploy original (Azure App Service + GitHub Actions) foi desativado. Para rodar, use sua própria conta Cosmos DB, como descrito acima.

### Próximos passos

- [ ] Testes automatizados com Jest + Supertest
- [ ] Listar e remover músicas; remover música de uma playlist
- [ ] Front-end em React
