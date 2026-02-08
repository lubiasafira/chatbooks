# prompts

## prompt 1
implemente um bot para o telegram em js:
1. use a api do Anthropic (versão gratuita)
2. permita que o usuário possa enviar um mensagem ao bot
3. As chaves de api está no `.env`


## prompt 2
Adicione algumas melhorias:
1. separe as seções por usuário para que cada um tenha uma seção única.
2. Defina restrição o bot apenas para recomandas livros sobre deteminado assunto solicitado.
3. O bot deve somente recomendar livros sobre assunto solicitado. Exemplo: "me recomende livros sobre biologia", ou "livros de biologia", "Biologia" ou "citologia".
4. o bot deve enviar a resposta no seguinte formato:
    1. `livro` - `uma breve descrição`
5. O descrição não deve ser muito longa.
6. quando o usuário der o comando `/start` o bot deve se apresentar, cumprimentar o usuário e explicar suas funcionalidade.
7. Os comando devem ser listado no `/help`.
   
## prompt 3
depuração de erros:
1. Faça um teste para captura as mensagens enviadas a ia para reportar erros.
2. Envie mensagem de teste diretamente a ia, se ela responder de erro ou que não corresponde ao que o usuário pediu capture o erro.

## prompt 4
documentação e repositório:
1. crie um repositório local para o projeto.
2. crie um arquivo README.md com as instruções de como instalar e usar o bot.

## prompt 5
deploy:
1. prepare o projeto para ser executado no railway (plano gratuito)

## prompt 6
modificações:
1. Adicione autor nas recomendações dos livros
2. O Novo formata deve ser `livro` por `autor` - `breve descrição do livro`

## prompt 7
adições:
1. O usuário pode solicitar um resumo de algum livro recomandado lista.
2. Ou pode explicitamente citar livro - autor para que o bot envie um resumo do livro.
3. o formato da mensagem:
   1. corpo da mensagem:
    ```markdown
    Nome do livro por autor

    breve descrição

    Resumo do livro
    ```
4. O usuário pode solicitar um resumo de algum livro recomandado lista pelo número ou nome do livro.

5. Deixe os os nome do `livro` por `autor` o com um link direto para uma pesquisa do google.