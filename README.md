# Tradutor_IA

Tradutor de voz em tempo real.

## MVP atual

A tela principal usa OpenAI Realtime API com WebRTC e `gpt-realtime-translate` para capturar sua voz no navegador, devolver audio traduzido em baixa latencia e mostrar legendas ao vivo.

Veja o guia de configuracao em [OPENAI_REALTIME_SETUP.md](./OPENAI_REALTIME_SETUP.md).

## Comandos principais

```powershell
cd C:\Users\danie\OneDrive\Documentos\GitHub\tradutor-ia-real\web
npm run dev
```

Para validar:

```powershell
npm run build
npm test
```
