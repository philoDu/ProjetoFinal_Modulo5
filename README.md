# TaskFlow API

API REST do **TaskFlow**, o gerenciador de tarefas inspirado no Jira, desenvolvida em **Node.js, Express e MongoDB** como projeto final do **Módulo 5** do curso do Senac.

Este repositório contém o **backend** da aplicação. O frontend, construído em Vue.js no Módulo 4, está em um repositório separado:

- 🖥️ **Frontend:** [github.com/philoDu/ProjetoFinal_Modulo4](https://github.com/philoDu/ProjetoFinal_Modulo4) · [aplicação publicada](https://philodu.github.io/ProjetoFinal_Modulo4/)

> O projeto está em construção: a API é desenvolvida em etapas, conforme as entregas do módulo. Veja o [registro de entregas](#registro-de-entregas).

---

## Tecnologias

- **[Node.js](https://nodejs.org/)** (versão LTS) — ambiente de execução
- **[Express](https://expressjs.com/)** — framework web para as rotas da API
- **[MongoDB](https://www.mongodb.com/)** — banco de dados de documentos
- **[Mongoose](https://mongoosejs.com/)** — conexão e modelagem dos dados do MongoDB
- **[dotenv](https://github.com/motdotla/dotenv)** — configuração por variáveis de ambiente
- **[Docker](https://www.docker.com/) e Docker Compose** — ambiente de desenvolvimento em containers

## Como executar

**Pré-requisito:** [Docker](https://www.docker.com/) com o Docker Compose.

```sh
# Clonar o repositório
git clone https://github.com/philoDu/ProjetoFinal_Modulo5.git
cd ProjetoFinal_Modulo5

# Criar o arquivo de configuração a partir do modelo
cp .env.example .env

# Construir e subir a API e o banco de dados
docker compose up --build -d
```

A API ficará disponível em `http://localhost:3000`.

Comandos úteis:

```sh
docker compose logs -f api   # acompanhar os logs da API
docker compose down          # parar e remover os containers
```

Os dados do banco ficam em um volume do Docker e são preservados entre as execuções.

### Executando sem Docker

Também é possível rodar a API diretamente com o Node, desde que haja um MongoDB disponível no endereço configurado no `.env`:

```sh
npm install
npm run dev
```

## Variáveis de ambiente

| Variável | Descrição | Valor padrão no `.env.example` |
|---|---|---|
| `NODE_ENV` | Ambiente de execução | `development` |
| `PORT` | Porta em que a API escuta | `3000` |
| `MONGODB_URI` | Endereço de conexão com o MongoDB | `mongodb://localhost:27017/taskflow` |

Ao rodar com o Docker Compose, o `MONGODB_URI` é substituído automaticamente para apontar para o container do banco (`mongodb://mongo:27017/taskflow`).

## Rotas

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/` | Página de apresentação da API |
| `GET` | `/health` | Diagnóstico: versão do Node, tempo de execução e estado da conexão com o banco |

Exemplo de resposta do `/health`:

```json
{
  "ok": true,
  "node": "v26.13.0",
  "uptime": 13.32,
  "mongo": "conectado"
}
```

## Estrutura do projeto

```
├── src/
│   └── index.js          # Servidor Express, conexão com o banco e rotas
├── .dockerignore         # Arquivos excluídos da imagem Docker
├── .env.example          # Modelo das variáveis de ambiente
├── docker-compose.yml    # Serviços da API e do MongoDB
├── Dockerfile            # Receita da imagem da API
└── package.json          # Dependências e scripts
```

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia a API e a reinicia automaticamente a cada alteração no código |
| `npm start` | Inicia a API sem reinício automático (produção) |

## Registro de entregas

### Entrega 1 — Ambiente e API inicial ✅

- Projeto Node.js criado do zero, com ES Modules.
- Servidor Express com a página de apresentação e a rota de diagnóstico `/health`.
- Configuração por variáveis de ambiente, com `.env.example` como modelo.
- Conexão assíncrona com o MongoDB via Mongoose, tolerante a falhas: a API continua respondendo mesmo se o banco estiver indisponível.
- `Dockerfile` da API e `docker-compose.yml` com dois serviços (API e MongoDB) em uma rede compartilhada.

## Ambiente de desenvolvimento

Desenvolvido em **Linux (Ubuntu) no WSL 2**, com Node.js instalado pelo nvm, Docker Desktop integrado ao WSL e VS Code conectado ao WSL.

## Autor

**Felipe Duarte** — [github.com/philoDu](https://github.com/philoDu)
