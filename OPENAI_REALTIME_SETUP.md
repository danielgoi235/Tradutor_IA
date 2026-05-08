# OpenAI Realtime - Configuracao do MVP

Este projeto agora tem um MVP de traducao voz-para-voz usando OpenAI Realtime API com WebRTC.

## O que foi adicionado

- Tela principal em `web/components/RealtimeTranslator.tsx`
- Rota segura em `web/app/api/realtime/session/route.ts`
- Modelo padrao: `gpt-realtime-translate`
- Deteccao de fala: `semantic_vad`
- Voz padrao: `marin`
- Legendas ao vivo com transcricao original e transcricao da traducao

## Como configurar

Crie ou edite o arquivo `web/.env.local`:

```powershell
OPENAI_API_KEY=sua_chave_openai_aqui
OPENAI_REALTIME_MODEL=gpt-realtime-translate
```

Depois rode:

```powershell
cd C:\Users\danie\OneDrive\Documentos\GitHub\tradutor-ia-real\web
npm run dev
```

Abra:

```text
http://localhost:3000
```

## Como testar

1. Escolha o idioma que voce vai falar.
2. Escolha o idioma que quer ouvir.
3. Clique em `Iniciar`.
4. Permita o uso do microfone no navegador.
5. Fale uma frase curta, por exemplo: `Ola, eu gostaria de marcar uma reuniao amanha.`
6. O navegador deve tocar a traducao em voz.

## Observacoes importantes

- A chave OpenAI fica no servidor Next.js, nao no navegador.
- Nunca cole a chave em arquivos do codigo-fonte, README, GitHub ou no chat.
- O navegador envia audio para a OpenAI por WebRTC.
- Este MVP traduz a sua fala para audio em outro idioma e mostra legendas ao vivo.
- Ele ainda nao conecta duas pessoas em uma mesma sala.
- Para conversa entre duas pessoas, o proximo passo e decidir entre:
  - cada participante usar sua propria sessao Realtime; ou
  - integrar telefonia/SIP para chamadas reais.

## Configurar no Vercel

No painel da Vercel:

1. Abra o projeto.
2. Entre em `Settings`.
3. Entre em `Environment Variables`.
4. Adicione:

```text
OPENAI_API_KEY = sua_chave_openai
OPENAI_REALTIME_MODEL = gpt-realtime-translate
```

5. Salve para os ambientes `Production`, `Preview` e `Development`, se quiser usar em todos.
6. Faca um novo deploy.
