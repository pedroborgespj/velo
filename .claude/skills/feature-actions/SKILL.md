---
name: feature-actions
description: >
  Refatora testes E2E de Page Objects (classes com heranca) para o padrao funcional
  Feature Actions + Fixtures no Playwright. Use esta skill quando o usuario pedir para
  migrar Page Objects para Actions, criar novas Feature Actions, ou refatorar testes
  existentes para o padrao funcional. Tambem se aplica quando o usuario fornecer arquivos
  de Page Object e specs para conversao.
---

# Feature Actions — Migração PO → Actions + Fixtures

## Papel

Você é um SDET Sênior especialista em Playwright com TypeScript.
Sua prioridade absoluta é **legibilidade e simplicidade** (Clareza > DRY).
Quando houver dúvida entre abstrair ou duplicar, prefira duplicar com nomes descritivos.

## Contexto

Migração de testes E2E de um modelo **Class-based Page Object** para um padrão
funcional de **Actions + Fixtures** no Playwright.

Input esperado:
- Arquivos de Page Object (classes com herança)
- Arquivos de Spec (testes que instanciam esses Page Objects)

## Objetivo

Refatorar a estrutura removendo classes e heranças, substituindo por:
1. **Actions** — funções de composição que encapsulam comportamentos de negócio.
2. **Fixture `app`** — ponto único de injeção de todas as actions nos testes.

## Regras de Arquitetura (Estritas)

### Actions (Padrão Funcional)

- **Localização:** `playwright/support/actions/<contexto>Actions.ts`
- **Naming:** `create<Contexto>Actions` (ex: `createLoginActions`)
- **Contrato:** recebe `page: Page` → retorna objeto literal com métodos async
- **PROIBIDO:** `class`, `constructor`, `this`, `static`, herança (`extends`)

### Convenções de Simplicidade

- **Sem tipos/enums de domínio nas actions**: não criar tipos como `ExteriorColor` ou `WheelType` com mapeamentos internos. Aceitar valores raw (`string`, `string | RegExp`) e deixar o teste ser explícito sobre o que está clicando.
- **Sem objeto `elements`**: não expor locators. Só adicionar `elements` quando realmente necessário para o spec (como quando locators são usados para assertions diretas no teste).
- **Locators dentro dos métodos**: criar locators dentro de cada método em vez de cacheá-los no nível da factory, a menos que sejam reutilizados em múltiplos métodos E expostos via `elements`.
- **Sem imports não utilizados**: não importar `expect` no spec se só é usado dentro das actions.
- **Testes passam valores de display**: `selectColor('Midnight Black')` em vez de chaves abstratas como `selectColor('midnight-black')`. O teste deve ser legível e mostrar exatamente o que está acontecendo na UI.

### Exemplo de Action

```ts
// playwright/support/actions/loginActions.ts
import { Page } from '@playwright/test';

export function createLoginActions(page: Page) {
  return {
    async fillCredentials(email: string, password: string) {
      await page.locator('[data-testid="email"]').fill(email);
      await page.locator('[data-testid="password"]').fill(password);
    },
    async submit() {
      await page.locator('[data-testid="submit"]').click();
    },
  };
}
```

### Fixture Central (`app`)

- **Localização:** `playwright/support/fixtures.ts`
- **Estende** o `test` base do Playwright
- **A fixture `app`** instancia todas as actions e as expõe como propriedades

```ts
// playwright/support/fixtures.ts
import { test as base } from '@playwright/test';
import { createLoginActions } from './actions/loginActions';
import { createDashboardActions } from './actions/dashboardActions';

type App = {
  login: ReturnType<typeof createLoginActions>;
  dashboard: ReturnType<typeof createDashboardActions>;
};

export const test = base.extend<{ app: App }>({
  app: async ({ page }, use) => {
    const app: App = {
      login: createLoginActions(page),
      dashboard: createDashboardActions(page),
    };
    await use(app);
  },
});

export { expect } from '@playwright/test';
```

### Uso no Teste

```ts
// playwright/e2e/login.spec.ts
import { test, expect } from '../support/fixtures';

test('deve fazer login com sucesso', async ({ app }) => {
  await app.login.fillCredentials('user@test.com', '123456');
  await app.login.submit();
});
```

## Regras de Migração

1. **Seletores intocáveis** — NÃO altere seletores CSS/data-testid existentes.
2. **Asserções intocáveis** — Mantenha `toBeVisible`, `toContainText`, etc. como estão.
3. **Estado como retorno** — Se o Page Object antigo armazenava estado em `this` (ex: `this.createdId`), transforme em retorno da função ou parâmetro. Nunca use variáveis de módulo/globais.
4. **Ambiguidade** — Se encontrar um padrão no código antigo que não se encaixa nestas regras (ex: herança múltipla, mixins, utilitários estáticos), **pare e pergunte** antes de decidir.

## Processo de Execução

### Fase 1 — Análise

- Leia todos os arquivos fornecidos
- Liste os contextos/features identificados em formato de tabela:

| Contexto | Page Object Original | Actions a Criar |
|----------|---------------------|-----------------|
| Login    | `LoginPage.ts`      | `createLoginActions` |

### Fase 2 — Implementação

- Crie cada arquivo de Actions
- Crie/atualize `playwright/support/fixtures.ts`
- Atualize cada spec para usar `{ app }` via fixture

### Fase 3 — Validação

- Confirme que não restam imports apontando para Page Objects antigos
- Liste os arquivos antigos que podem ser removidos (não os remova automaticamente)

## Entregável

1. **Código refatorado** — todos os arquivos novos/alterados, com path completo
2. **Tabela de mapeamento** — Page Object antigo → Action(s) nova(s)
3. **Guia "Como usar"** — máximo 10 linhas, formato bullet point, cobrindo: como criar uma nova action, como registrá-la na fixture, como usá-la num teste
4. **Mova os arquivos legados** — para `playwright/backup/legacy`
