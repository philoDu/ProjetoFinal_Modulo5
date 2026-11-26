# CLAUDE.md — TaskFlow API

Instruções para o Claude Code neste repositório. Leia antes de qualquer tarefa.

## Sobre o projeto

**TaskFlow API** é o backend de um gerenciador de tarefas inspirado no Jira, que também atende a um fluxo de helpdesk (chamados com solução registrada). É o projeto final do Módulo 5 do curso de Análise e Desenvolvimento de Sistemas do Senac e também um projeto de portfólio.

- Frontend (Vue.js, Módulo 4), em outro repositório: https://github.com/philoDu/ProjetoFinal_Modulo4
- Regras de negócio e modelo de dados: **`docs/dominio.md`** é a fonte da verdade. As regras são numeradas (RN01, RN02...); cite o número ao implementar ou testar uma regra.

## Como trabalhar comigo

- **Sou desenvolvedor júnior e estou aprendendo.** Explique o que está fazendo e por quê, principalmente sintaxe de JavaScript assíncrono, recursos do Node/Express e decisões de arquitetura.
- **Antes de executar uma série de mudanças, mostre a lista de passos** (só os títulos, sem código) e avance um passo por vez.
- **Eu escrevo o código** no VS Code (projeto original no Ubuntu/WSL). Você explica, revisa o que eu mostrar e sugere o próximo passo. Não execute nada no repositório nem na máquina sem eu pedir.
- **Não faça commit nem push.** Eu reviso e faço isso.
- Respostas curtas e diretas, sem enrolação.

## Git

- **Nunca assine commits como Claude**: nada de `Co-Authored-By` do Claude nem outra atribuição ao Claude nas mensagens de commit ou de pull request.
- **O `CLAUDE.md` não vai para o Git** (está no `.gitignore`). Ele é um documento de trabalho, mantido fiel ao projeto, e serve de base para atualizar o `README.md`.

## Convenções de código

- **Código, nomes e comentários em português**, com termos técnicos em inglês quando consagrados (ex.: `repository`, `middleware`, `AppError`). **Não traduza nada para o inglês**: a reescrita em inglês é um projeto futuro, fora do escopo atual.
- **ES Modules** (`"type": "module"`): use `import`/`export`. Imports de arquivos locais **precisam da extensão `.js`**.
- Formatação com Prettier, na configuração padrão: aspas duplas, ponto e vírgula no fim das instruções, indentação de 2 espaços e linhas de até 80 colunas.
- Parâmetros não usados recebem `_` no início (ex.: `_req`).
- Valores de domínio compartilhados (tipos, status, prioridades) ficam em `src/constants/`, nunca repetidos.

## Arquitetura em camadas (escolha pedagógica deliberada)

Cada camada só conversa com a vizinha. Não pule camadas nem misture responsabilidades.

```
requisição → middlewares → routes → controllers → services → repositories → models → MongoDB
```

| Pasta / arquivo | Responsabilidade |
|---|---|
| `src/server.js` | Ponto de entrada: conecta ao banco (top-level await) e liga o servidor |
| `src/app.js` | Monta o Express: middlewares e rotas, nesta ordem |
| `src/config/` | Variáveis de ambiente (`env.js`) e conexão com o banco (`database.js`) |
| `src/constants/` | Valores fixos do domínio |
| `src/middlewares/` | Log, validação de **formato** da entrada, 404 e tratamento de erros |
| `src/routes/` | `express.Router`: liga URL e método ao controller |
| `src/controllers/` | Traduz HTTP: lê a requisição, chama o service, monta a resposta. Sem `try/catch` (o Express 5 encaminha erros de funções `async`) |
| `src/services/` | **Regras de negócio** (as RNs). Não conhece HTTP: sinaliza erros com `AppError` |
| `src/repositories/` | Acesso aos dados. Não conhece regras de negócio |
| `src/models/` | Schemas do Mongoose |
| `src/utils/` | Apoio (ex.: `AppError`) |
| `src/pages/` | HTML da página inicial |

### Decisões que são intencionais (não "corrija")

- **`tarefasMemoryRepository.js` está mantido de propósito**, para testes futuros. O repository em uso é o `tarefasMongoRepository.js`. Os dois expõem os mesmos métodos (inclusive `idsExistentes`).
- **O service filtra os campos editáveis** (proteção contra mass assignment); `id`, `codigo` e datas de sistema nunca vêm do cliente.
- **Pontos são armazenados em centésimos** (inteiro) e convertidos na entrada e na saída do service (RN13).
- **Datas de início e entrega são texto `AAAA-MM-DD`**, para evitar problemas de fuso; `concluidaEm`, `criadoEm` e `atualizadoEm` são datas completas.
- **Código sequencial `TF-n`** vem da coleção `contadores` com `$inc` atômico. Lacunas na sequência são esperadas (RN04 garante só que não se repete).
- **Validação dupla**: o service valida as regras com mensagens claras; o schema do Mongoose é a última barreira. Erros `ValidationError` e `CastError` do Mongoose viram 400 no `tratarErros`.
- **Conexão com o banco**: em `production`, até 5 tentativas e depois encerra (fail fast); fora de produção, tenta indefinidamente.
- **`PATCH` é parcial e `PUT` substitui**: no `PUT`, o `titulo` é obrigatório e os campos editáveis não enviados voltam ao padrão; `id`, `codigo` e `criadoEm` são preservados.
- **`/health` responde `503`** com `ok: false` quando o MongoDB não está conectado.
- **Data de entrega padrão** (criação + 30 dias, RN03) é calculada no fuso `America/Sao_Paulo` (constante no service), porque o container roda em UTC.
- **`vinculadas`** só aceita ids de tarefas existentes, sem repetição; a checagem de existência fica no repository (`idsExistentes`).
- Imagem do Node fixada em `node:26-alpine`; a porta do MongoDB é publicada só em `127.0.0.1`.

## Entrega 4: decisões combinadas

O enunciado (validações no model `Tarefa`, model `Usuario`, relação tarefa–usuário, rotas de usuários e tarefas por usuário) é o requisito mínimo. Decidimos ir além e **implementar todas as regras pendentes do `dominio.md`** (RN02 parcial, RN06 a RN09, projeto obrigatório e as entidades Usuário, Equipe e Projeto). Regras novas que surgirem entram primeiro no `dominio.md`.

- **A.** A relação 1-para-muitos do enunciado (`usuario` na tarefa) é o nosso campo **`criadoPor`**. Até existir autenticação, o id vem no corpo da requisição (RN02 parcial); depois, virá do token.
- **B.** A **senha** do usuário fica para a entrega de autenticação, junto com o *hash*.
- **C.** **Título com no mínimo 3 caracteres**, como no enunciado: regra nova, a registrar no `dominio.md`.
- **D.** **CRUD completo de usuários**, com as mesmas camadas das tarefas.
- **E.** **`responsaveis`** passa a referenciar `Usuario`, validado como as `vinculadas`.
- **F.** **Excluir um usuário que tem tarefas é recusado com `409`.**
- **G.** **Dados existentes** (`TF-1`, `TF-9`) são migrados com `mongosh`.
- Validações no schema com mensagens em português (validação dupla), índice em `criadoPor` e `.populate()` para trazer os dados do usuário, como cita o enunciado.

A definir ao longo da entrega: rotas e regras de equipes e projetos, como o `Usuario` registra as suas equipes (RN07), o cálculo e a preservação das equipes da tarefa (RN08, RN09) e como a RN06 (atrasada) aparece na resposta.

## Diferenças em relação ao template do professor

O template original usava um único container com Node e MongoDB juntos (imagem `papadopoli/curso-node`), scripts `.bat` para Windows e um `index.js` único. Este projeto foi refeito do zero: Linux (Ubuntu no WSL 2), dois serviços no Docker Compose (API com `Dockerfile` próprio e MongoDB oficial com volume nomeado) e código em camadas. As entregas do professor servem só como **requisito mínimo**; as decisões de modelagem são minhas.

## Ambiente e comandos

- Ubuntu no WSL 2, Node.js LTS via nvm, Docker Desktop integrado ao WSL.
- Configuração: copiar `.env.example` para `.env`. O `.env` **nunca** vai para o Git.

```bash
# Modo usado no desenvolvimento: banco no Docker, API no Ubuntu
docker compose up -d mongo
npm run dev                      # node --watch src/server.js

# Tudo no Docker
docker compose up --build -d
docker compose logs -f api
docker compose down

# Inspecionar o banco
docker compose exec mongo mongosh taskflow --eval "db.tarefas.find()"
```

- Não rode a API no Ubuntu e no Docker ao mesmo tempo (ambas usam a porta 3000).
- Testes manuais das rotas com `curl` (use `-i` para ver o código HTTP).

## Rotas atuais

| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Página inicial |
| GET | `/health` | Diagnóstico: Node, ambiente, uptime e estado do MongoDB (`503` sem banco) |
| GET | `/tarefas` | Lista as tarefas, das mais novas para as mais antigas |
| GET | `/tarefas/:id` | Busca uma tarefa (`404` se não existir ou se o id for inválido) |
| POST | `/tarefas` | Cria (só `titulo` é exigido; o resto tem padrão — RN01, RN03) |
| PATCH | `/tarefas/:id` | Atualiza só os campos enviados |
| PUT | `/tarefas/:id` | Substitui a tarefa (`titulo` obrigatório; o que não vier volta ao padrão) |
| DELETE | `/tarefas/:id` | Exclui e remove dos vínculos (RN11) |

Erros em JSON no formato `{ "erro": "..." }` (com `campos` nos erros do Mongoose).

## Entregas do curso

1. ✅ Ambiente com Docker, página inicial e `/health`
2. ✅ `express.Router` e middlewares de validação
3. ✅ CRUD de tarefas com MongoDB
4. ⏳ Models e relacionamentos: validações no model `Tarefa`, model `Usuario`, relação entre tarefa e usuário, rotas de usuários e rotas de tarefas por usuário; além do enunciado, equipes, projetos e as regras pendentes do `dominio.md` (ver "Entrega 4: decisões combinadas") — pendente

## Próximos passos previstos

Autenticação com JWT (completa a RN02); relatórios de produção por equipe e por usuário; integração com o frontend (CORS e Axios); testes automatizados; documentação OpenAPI; publicação no Render com MongoDB Atlas.
