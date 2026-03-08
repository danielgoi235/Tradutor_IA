# 🧪 TESTE LOCAL - Tradutor IA Chat

## ⚠️ IMPORTANTE: Você DEVE rodar o servidor ANTES de testar!

---

## 📋 Checklist Pré-Teste

- [ ] Terminal 1 pronto para rodar servidor
- [ ] Terminal 2 pronto para rodar frontend
- [ ] Você tem 2 navegadores ou abas (para simular 2 usuários)

---

## 🚀 PASSO A PASSO

### PASSO 1: Iniciar o Servidor Socket.io

**Terminal 1:**
```bash
cd C:\Users\danie\OneDrive\Documentos\GitHub\tradutor-ia-real
npx ts-node server.ts
```

**Espere ver:**
```
╔════════════════════════════════════════════╗
║  🚀 TRADUTOR IA CHAT SERVER RODANDO        ║
║  📍 ws://localhost:3001                    ║
║  💬 Socket.io ativo                        ║
╚════════════════════════════════════════════╝
```

**⚠️ Se NÃO vir essa mensagem = SERVIDOR NÃO INICIOU. PARE E DEBUGUE!**

---

### PASSO 2: Iniciar o Frontend

**Terminal 2:**
```bash
cd C:\Users\danie\OneDrive\Documentos\GitHub\tradutor-ia-real\web
npm run dev
```

**Espere por:**
```
> tradul or-ia-app@2.0.0 dev
> next dev

  ▲ Next.js 14.2.35
  - Local:        http://localhost:3000
```

---

### PASSO 3: Verificar Conexão Socket.io

1. Abra: http://localhost:3000/debug
2. Veja se está "✅ CONECTADO"
3. Se ver "❌ DESCONECTADO" = Debugue usando as dicas da página

---

### PASSO 4: Testar o Fluxo Completo

#### **EM ABA 1 (Usuário A - João)**

1. Digite nome: **João**
2. Selecione idioma: **Português**
3. Clique: **Criar Nova Conversa**
4. **COPIE o código gerado** (ex: ABC123)
5. Veja: "⏳ Aguardando o outro participante..."

#### **EM ABA 2 (Usuário B - John)**

1. Digite nome: **John**
2. Selecione idioma: **English**
3. Clique: **Entrar em Conversa**
4. Cole o código: **ABC123**
5. Clique: **Entrar**
6. Veja: "⏳ Conectando..."

#### **BACK to ABA 1 (João)**

Você verá:
```
👥 Conectando...
✅ Você (🇧🇷 Português)
⏳ John (🇺🇸 English)
```

**Clique:** ✅ Confirmar Conexão

#### **BACK to ABA 2 (John)**

**Clique:** ✅ Confirmar Conexão

#### **AMBAS as Abas**

Agora vocês devem ver:
```
💬 Chat Tradutor
Session: ABC123

Você (🇧🇷 Português) ↔️ John (🇺🇸 English)
```

---

### PASSO 5: Testar Mensagens

#### **ABA 1 (João):**
- Digite: "Olá! Como você está?"
- Clique Send
- Aguarde a tradução aparecer em ABA 2

#### **ABA 2 (John):**
- Deve ver a mensagem traduzida para Inglês
- Digite resposta: "Hello! I am doing great!"
- Clique Send

#### **ABA 1 (João):**
- Deve ver a resposta traduzida para Português

---

## ✅ SUCESSO = Quando Você Ver:

Em **ambas as abas** simultaneamente:
- [ ] Mensagens chegando em tempo real
- [ ] Texto original em um idioma
- [ ] Tradução automática no outro idioma
- [ ] Ambos conseguem enviar/receber

---

## ❌ PROBLEMAS COMUNS

### "❌ DESCONECTADO" no Debug

**Causa:** Servidor não está rodando
**Solução:**
1. Volte ao Terminal 1
2. Veja se rodou: `npx ts-node server.ts`
3. Se ver erro, debugue o servidor

### "Código não gerado"

**Causa:** Socket.io não conectou
**Solução:**
1. Vá para http://localhost:3000/debug
2. Veja se está CONECTADO
3. Se não, o servidor pode estar morto

### "Entrei mas não vejo o outro usuário"

**Causa:** Socket.io não sincronizando
**Solução:**
1. Feche ambas as abas
2. Reinicie o servidor (Ctrl+C no Terminal 1)
3. Espere 3 segundos
4. Rodar de novo: `npx ts-node server.ts`
5. Teste novamente

### "Mensagem não chega"

**Causa:** Gemini API key inválida
**Solução:**
1. A mensagem DEVE chegar mesmo sem tradução
2. Se não chega, é problema de Socket.io
3. Verifique o console do navegador (F12)

---

## 🔍 DEBUGAR NO NAVEGADOR

Abra o Console (F12) e procure por:

```javascript
// Deve ver:
✅ Connected to server
[CREATE] Session ABC123 created by João
[JOIN] John joined session ABC123
[MESSAGE] João (pt-BR): "Olá! Como você está?"
```

Se ver erros como:
- `Cannot reach http://localhost:3001` = Servidor morto
- `CORS error` = Problema de configuração
- `Socket.io connection timeout` = Firewall bloqueando

---

## 📊 O QUE DEVE FUNCIONAR

| Item | Status | Como Testar |
|------|--------|------------|
| Servidor rodando | ✅ | `npx ts-node server.ts` executa sem erro |
| Frontend conecta | ✅ | http://localhost:3000/debug mostra "CONECTADO" |
| Gera código | ✅ | Clica "Criar", vê um código (ex: ABC123) |
| Outro entra | ✅ | Cola o código e consegue entrar |
| Confirmam conexão | ✅ | Botão "Confirmar Conexão" aparece e funciona |
| Mensagens sincronizam | ✅ | Mensagem enviada aparece na outra aba |
| Tradução | ✅ | (Opcional) Se Gemini funcionar |

---

## 🎯 OBJETIVO FINAL

Quando TUDO funcionar você verá:

**Terminal 1 (Servidor):**
```
[2026-03-08T18:37:18] User connected: 4VlOdiv-rUP1ZLcNAAAB
[CREATE] Session ABC123 created by João
[JOIN] John joined session ABC123
[CONFIRM] João confirmed
[CONFIRM] John confirmed
[MESSAGE] João (pt-BR): "Olá! Como você está?"
```

**Abas do Navegador:**
```
ABA 1 (João):
  João: "Olá! Como você está?"

ABA 2 (John):
  João: "Olá! Como você está?"
  (tradução para inglês)
```

---

## ❓ DÚVIDAS?

1. Vá para http://localhost:3000/debug para ver logs em tempo real
2. Abra F12 (DevTools) para ver erros no console
3. Verifique o Terminal 1 para ver o que o servidor está fazendo

---

**BOA SORTE! 🚀**

Assim que TUDO funcionar localmente, podemos fazer deploy seguro no Railway!
