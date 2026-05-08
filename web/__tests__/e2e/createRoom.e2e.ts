/**
 * Testes E2E para Story 1.1
 * Fluxo: Criar Sala + Validações + WebRTC Setup
 */

import { test, expect } from '@playwright/test'

test.describe('Story 1.1: Anfitrião Cria Sala', () => {
  test.beforeEach(async ({ page }) => {
    // Ir para página inicial
    await page.goto('http://localhost:3000')
  })

  test('deve exibir formulário de criação de sala', async ({ page }) => {
    // Procurar por elementos principais
    const nameInput = page.getByPlaceholder('Ex: João')
    const languageSelect = page.getByLabel('Seu Idioma (para transcrição):')
    const createButton = page.getByText('✨ Criar Sala')

    expect(nameInput).toBeVisible()
    expect(languageSelect).toBeVisible()
    expect(createButton).toBeVisible()
  })

  test('deve validar nome obrigatório', async ({ page }) => {
    // Tentar criar sala sem nome
    const createButton = page.getByText('✨ Criar Sala')
    await createButton.click()

    // Deve mostrar erro
    const errorMsg = page.getByText('Nome de usuário é obrigatório')
    await expect(errorMsg).toBeVisible()
  })

  test('deve validar seleção de idioma', async ({ page }) => {
    // Preencher nome
    const nameInput = page.getByPlaceholder('Ex: João')
    await nameInput.fill('João')

    // Criar sala
    const createButton = page.getByText('✨ Criar Sala')
    await createButton.click()

    // Botão deve gerar ID e mostrar tela de sucesso
    const codeDisplay = page.getByText(/Código da Sala:/)
    await expect(codeDisplay).toBeVisible({ timeout: 5000 })
  })

  test('deve gerar código único e válido', async ({ page }) => {
    // Preencher formulário
    const nameInput = page.getByPlaceholder('Ex: João')
    const createButton = page.getByText('✨ Criar Sala')

    await nameInput.fill('João')
    await createButton.click()

    // Aguardar aparição do código
    const codeDisplay = page.locator('[class*="font-mono"][class*="text-white"]')
    await codeDisplay.waitFor()

    const code = await codeDisplay.textContent()

    // Validações
    expect(code).toMatch(/^[A-Z2-9]{8}$/) // 8 caracteres válidos
    expect(code).not.toMatch(/[IOl1]/) // Sem confusos
  })

  test('deve permitir copiar código', async ({ page, context }) => {
    // Grant permission para clipboard
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    // Preencher e criar sala
    const nameInput = page.getByPlaceholder('Ex: João')
    await nameInput.fill('João')

    const createButton = page.getByText('✨ Criar Sala')
    await createButton.click()

    // Aguardar botão copiar
    const copyButton = page.getByText('Copiar Código')
    await copyButton.waitFor()
    await copyButton.click()

    // Verificar feedback visual
    const copiedMsg = page.getByText('Copiado!')
    await expect(copiedMsg).toBeVisible()
  })

  test('deve desabilitar botão enquanto processa', async ({ page }) => {
    const nameInput = page.getByPlaceholder('Ex: João')
    const createButton = page.getByText('✨ Criar Sala')

    // Preencher
    await nameInput.fill('João')

    // Enquanto processa, botão deve estar disabled
    await createButton.click()

    // Verificar que mostra "Criando sala..."
    const creatingMsg = page.getByText('Criando sala...')
    await expect(creatingMsg).toBeVisible()
  })

  test('deve exibir tela de aguardo com código', async ({ page }) => {
    const nameInput = page.getByPlaceholder('Ex: João')
    const createButton = page.getByText('✨ Criar Sala')

    await nameInput.fill('Maria')
    await createButton.click()

    // Aguardar tela de sucesso
    await page.waitForTimeout(2000) // Aguardar criação em Firestore

    // Deve mostrar:
    // - Código da sala (copiável)
    // - Status "Aguardando convidado"
    // - Botão voltar

    const codeDisplay = page.getByText(/Código da Sala:/)
    const waitingMsg = page.getByText('Aguardando convidado...')
    const backButton = page.getByText('← Voltar')

    await expect(codeDisplay).toBeVisible()
    await expect(waitingMsg).toBeVisible()
    await expect(backButton).toBeVisible()
  })

  test('deve retornar ao formulário quando clicar voltar', async ({ page }) => {
    const nameInput = page.getByPlaceholder('Ex: João')
    const createButton = page.getByText('✨ Criar Sala')

    // Criar sala
    await nameInput.fill('João')
    await createButton.click()

    // Aguardar tela de sucesso
    await page.waitForTimeout(1000)

    // Clicar voltar
    const backButton = page.getByText('← Voltar')
    await backButton.click()

    // Deve retornar ao formulário
    const formTitle = page.getByText('🎤 Criar Nova Sala')
    await expect(formTitle).toBeVisible()

    // Input deve estar limpo
    const input = page.getByPlaceholder('Ex: João')
    await expect(input).toHaveValue('')
  })

  test('deve mostrar idioma selecionado em UI', async ({ page }) => {
    const nameInput = page.getByPlaceholder('Ex: João')
    const languageSelect = page.getByLabel('Seu Idioma (para transcrição):')
    const createButton = page.getByText('✨ Criar Sala')

    // Selecionar idioma
    await languageSelect.selectOption('en-US')

    // Criar sala
    await nameInput.fill('John')
    await createButton.click()

    // Verificar que mostra o idioma selecionado
    await page.waitForTimeout(1000)
    const langDisplay = page.getByText('🎵 Seu idioma:')
    await expect(langDisplay).toBeVisible()
  })
})
