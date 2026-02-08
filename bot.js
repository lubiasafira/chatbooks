require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const Anthropic = require('@anthropic-ai/sdk').default;

// Configuração das APIs
const telegramToken = process.env.TELEGRAM_BOT_API_KEY;
const anthropicApiKey = process.env.ANTHROPICAI_API_KEY;

// Inicializa o cliente do Anthropic
const anthropic = new Anthropic({
  apiKey: anthropicApiKey,
});

// Inicializa o bot do Telegram em modo polling
const bot = new TelegramBot(telegramToken, { polling: true });

// Armazena histórico de conversas por usuário
const userSessions = new Map();

// System prompt para restringir o bot a recomendar livros
const SYSTEM_PROMPT = `Você é um bot especializado em recomendar livros. Suas funções são recomendar livros e fornecer resumos de livros.

REGRAS IMPORTANTES:
1. Você pode recomendar livros e fornecer resumos. Não responda perguntas sobre outros assuntos.
2. Se o usuário pedir algo que não seja recomendação ou resumo de livros, responda educadamente que você só pode recomendar livros e fazer resumos.
3. Aceite pedidos como: "me recomende livros sobre X", "livros de X", apenas o nome do assunto como "Biologia", "História", etc.

FORMATO PARA RECOMENDAÇÕES:
- Liste os livros assim (com link para pesquisa no Google):
   1. [Nome do Livro por Nome do Autor](https://www.google.com/search?q=Nome+do+Livro+Autor) - Breve descrição (máximo 15 palavras)
   2. [Nome do Livro por Nome do Autor](https://www.google.com/search?q=Nome+do+Livro+Autor) - Breve descrição (máximo 15 palavras)
- Recomende entre 3 a 5 livros por assunto.
- Substitua espaços por + na URL do Google.

RESUMOS DE LIVROS:
- O usuário pode pedir resumo de um livro da lista pelo número (ex: "resumo do 2") ou nome.
- O usuário pode citar diretamente "livro - autor" para pedir um resumo.
- FORMATO DO RESUMO:
   [Nome do Livro por Autor](https://www.google.com/search?q=Nome+do+Livro+Autor)

   _Breve descrição do livro_

   Resumo:
   [Resumo do livro em 3-5 parágrafos]

REGRAS GERAIS:
- As descrições devem ser CURTAS e objetivas.
- Sempre responda em português brasileiro.`;

console.log('🤖 Bot iniciado! Aguardando mensagens...');

// Comando /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || 'usuário';

  // Limpa sessão anterior do usuário
  userSessions.delete(chatId);

  const welcomeMessage = `📚 *Olá, ${userName}! Bem-vindo ao ChatBooks!*

Eu sou um bot especializado em *recomendar livros* e *fazer resumos* sobre qualquer assunto que você desejar.

*Como me usar:*
• Envie o nome de um assunto (ex: "Filosofia", "Programação")
• Peça um resumo pelo número (ex: "resumo do 2")
• Ou cite o livro diretamente (ex: "resumo de 1984 - George Orwell")

*Comandos disponíveis:*
/start - Reiniciar conversa
/help - Ver ajuda e comandos

_Qual assunto te interessa? 📖_`;

  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

// Comando /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;

  const helpMessage = `📖 *Ajuda - ChatBooks*

*Comandos:*
• /start - Iniciar/reiniciar o bot
• /help - Mostrar esta mensagem de ajuda

*Como pedir recomendações:*
• Digite apenas o assunto: "Biologia", "Romance", "Ficção científica"
• Ou peça diretamente: "Me recomende livros sobre economia"

*Como pedir resumos:*
• Pelo número da lista: "resumo do 1", "quero o resumo do 3"
• Pelo nome: "resumo de Dom Casmurro"
• Citando livro e autor: "resumo de 1984 - George Orwell"

*Exemplos:*
• "Psicologia"
• "Resumo do 2"
• "Resumo de O Pequeno Príncipe - Antoine de Saint-Exupéry"

_Envie um assunto e receba recomendações! 📚_`;

  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// Responde a todas as mensagens de texto
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  // Ignora comandos (começam com /)
  if (!userMessage || userMessage.startsWith('/')) {
    return;
  }

  // Obtém ou cria sessão do usuário
  if (!userSessions.has(chatId)) {
    userSessions.set(chatId, []);
  }
  const userHistory = userSessions.get(chatId);

  // Adiciona mensagem do usuário ao histórico
  userHistory.push({
    role: 'user',
    content: userMessage,
  });

  // Limita histórico a últimas 10 mensagens para não exceder contexto
  if (userHistory.length > 10) {
    userHistory.splice(0, userHistory.length - 10);
  }

  // Envia indicador de "digitando..."
  bot.sendChatAction(chatId, 'typing');

  try {
    // Chama a API do Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: userHistory,
    });

    // Extrai a resposta do Claude
    const claudeResponse = response.content[0].text;

    // Adiciona resposta ao histórico
    userHistory.push({
      role: 'assistant',
      content: claudeResponse,
    });

    // Envia a resposta ao usuário
    await bot.sendMessage(chatId, claudeResponse, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Erro ao chamar API do Claude:', error.message);
    await bot.sendMessage(
      chatId,
      '❌ Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente mais tarde.'
    );
  }
});

// Tratamento de erros do polling
bot.on('polling_error', (error) => {
  console.error('Erro de polling:', error.message);
});
