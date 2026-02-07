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
const SYSTEM_PROMPT = `Você é um bot especializado em recomendar livros. Sua única função é recomendar livros sobre assuntos solicitados pelo usuário.

REGRAS IMPORTANTES:
1. Você SOMENTE pode recomendar livros. Não responda perguntas sobre outros assuntos.
2. Se o usuário pedir algo que não seja recomendação de livros, responda educadamente que você só pode recomendar livros e peça para ele informar um assunto.
3. Aceite pedidos como: "me recomende livros sobre X", "livros de X", apenas o nome do assunto como "Biologia", "História", etc.
4. FORMATO OBRIGATÓRIO de resposta - liste os livros assim:
   1. **Nome do Livro** - Breve descrição (máximo 15 palavras)
   2. **Nome do Livro** - Breve descrição (máximo 15 palavras)
   (e assim por diante)
5. Recomende entre 3 a 5 livros por assunto.
6. As descrições devem ser CURTAS e objetivas.
7. Sempre responda em português brasileiro.`;

console.log('🤖 Bot iniciado! Aguardando mensagens...');

// Comando /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || 'usuário';

  // Limpa sessão anterior do usuário
  userSessions.delete(chatId);

  const welcomeMessage = `📚 *Olá, ${userName}! Bem-vindo ao ChatBooks!*

Eu sou um bot especializado em *recomendar livros* sobre qualquer assunto que você desejar.

*Como me usar:*
• Envie o nome de um assunto (ex: "Filosofia", "Programação")
• Ou peça diretamente (ex: "Me recomende livros sobre história")

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

*Exemplos:*
• "Psicologia"
• "Livros de programação"
• "Me recomende livros sobre culinária"

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
      max_tokens: 1024,
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
