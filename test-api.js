require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk').default;

const anthropicApiKey = process.env.ANTHROPICAI_API_KEY;

const anthropic = new Anthropic({
  apiKey: anthropicApiKey,
});

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

// Casos de teste
const testCases = [
  {
    name: 'Teste 1: Assunto direto',
    message: 'Biologia',
    expectedBehavior: 'Deve recomendar livros de biologia',
  },
  {
    name: 'Teste 2: Pedido completo',
    message: 'Me recomende livros sobre programação',
    expectedBehavior: 'Deve recomendar livros de programação',
  },
  {
    name: 'Teste 3: Mensagem fora do escopo',
    message: 'Qual é a capital do Brasil?',
    expectedBehavior: 'Deve recusar e pedir um assunto para recomendar livros',
  },
  {
    name: 'Teste 4: Formato "livros de X"',
    message: 'livros de história',
    expectedBehavior: 'Deve recomendar livros de história',
  },
];

async function runTests() {
  console.log('🧪 Iniciando testes da API do Anthropic...\n');
  console.log('='.repeat(60) + '\n');

  for (const testCase of testCases) {
    console.log(`📝 ${testCase.name}`);
    console.log(`   Mensagem: "${testCase.message}"`);
    console.log(`   Esperado: ${testCase.expectedBehavior}`);
    console.log('');

    try {
      const startTime = Date.now();

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: testCase.message }],
      });

      const endTime = Date.now();
      const responseText = response.content[0].text;

      console.log(`   ✅ Resposta recebida (${endTime - startTime}ms):`);
      console.log('   ' + '-'.repeat(50));
      console.log(responseText.split('\n').map(line => '   ' + line).join('\n'));
      console.log('   ' + '-'.repeat(50));

      // Validações básicas
      const issues = [];

      // Verifica se mensagem fora do escopo foi tratada corretamente
      if (testCase.name.includes('fora do escopo')) {
        const hasBookRecommendation = responseText.includes('**') && responseText.match(/\d\.\s+\*\*/);
        if (hasBookRecommendation) {
          issues.push('⚠️  ERRO: Recomendou livros para pergunta fora do escopo');
        }
      } else {
        // Verifica formato para recomendações
        if (!responseText.includes('**')) {
          issues.push('⚠️  AVISO: Formato pode não estar correto (sem ** para negrito)');
        }
        if (!responseText.match(/\d\.\s+/)) {
          issues.push('⚠️  AVISO: Formato pode não estar numerado');
        }
      }

      if (issues.length > 0) {
        console.log('\n   Problemas encontrados:');
        issues.forEach(issue => console.log(`   ${issue}`));
      } else {
        console.log('\n   ✅ Teste passou!');
      }

    } catch (error) {
      console.log(`   ❌ ERRO: ${error.message}`);

      if (error.status === 401) {
        console.log('   → Verifique se a API key está correta no .env');
      } else if (error.status === 429) {
        console.log('   → Limite de requisições atingido. Aguarde um momento.');
      } else if (error.status === 400) {
        console.log('   → Erro na requisição. Verifique os parâmetros.');
      }
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Aguarda 1 segundo entre testes para evitar rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('🏁 Testes finalizados!');
}

runTests();
