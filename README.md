# ChatBooks - Bot do Telegram

Bot do Telegram que recomenda livros e fornece resumos sobre qualquer assunto usando inteligência artificial (Claude - Anthropic).

## Requisitos

- Node.js 18+
- Conta no Telegram com bot criado via [@BotFather](https://t.me/BotFather)
- Chave de API do Anthropic

## Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd chatbooks
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente criando um arquivo `.env`:
```env
ANTHROPICAI_API_KEY=sua-chave-anthropic
TELEGRAM_BOT_API_KEY=sua-chave-telegram
```

4. Inicie o bot:
```bash
npm start
```

## Como usar

### Comandos

| Comando | Descrição |
|---------|-----------|
| `/start` | Inicia o bot e exibe mensagem de boas-vindas |
| `/help` | Exibe ajuda e lista de comandos |

### Pedindo recomendações

Envie uma mensagem com o assunto desejado:

- **Assunto direto:** "Biologia", "Filosofia", "Programação"
- **Pedido completo:** "Me recomende livros sobre história"
- **Formato alternativo:** "Livros de economia"

O bot responderá com 3-5 recomendações de livros no formato:
```
1. Nome do Livro por Autor - Breve descrição
2. Nome do Livro por Autor - Breve descrição
...
```

Cada livro inclui um link direto para pesquisa no Google.

### Pedindo resumos

Após receber recomendações, você pode pedir o resumo de um livro:

- **Pelo número:** "resumo do 2", "quero o resumo do 3"
- **Pelo nome:** "resumo de Dom Casmurro"
- **Citando livro e autor:** "resumo de 1984 - George Orwell"

O bot responderá com:
```
Nome do Livro por Autor (link)

Breve descrição do livro

Resumo:
[Resumo detalhado em 3-5 parágrafos]
```

## Estrutura do projeto

```
chatbooks/
├── bot.js          # Código principal do bot
├── test-api.js     # Testes de depuração da API
├── package.json    # Dependências do projeto
├── .env            # Variáveis de ambiente (não versionado)
├── .gitignore      # Arquivos ignorados pelo git
└── README.md       # Este arquivo
```

## Deploy no Railway

1. Faça fork ou suba este repositório no GitHub

2. Acesse [railway.app](https://railway.app) e faça login com GitHub

3. Clique em **New Project** → **Deploy from GitHub repo**

4. Selecione o repositório `chatbooks`

5. Adicione as variáveis de ambiente em **Variables**:
   - `ANTHROPICAI_API_KEY` = sua chave do Anthropic
   - `TELEGRAM_BOT_API_KEY` = sua chave do Telegram

6. O deploy será feito automaticamente

7. Verifique os logs em **Deployments** para confirmar que o bot iniciou

## Tecnologias

- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api) - API do Telegram
- [@anthropic-ai/sdk](https://github.com/anthropics/anthropic-sdk-js) - SDK do Claude (Anthropic)
- [dotenv](https://github.com/motdotla/dotenv) - Gerenciamento de variáveis de ambiente
