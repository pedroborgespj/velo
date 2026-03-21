# Project Context — Playwright Test Suite

## Visão Geral

Suite de testes E2E com Playwright para o Velo Sprint, um configurador de veículos elétricos.
Os testes rodam contra a aplicação local em `http://localhost:5173` (Vite dev server).

## Estrutura

```
playwright/
├── e2e/                         # Specs de teste
│   ├── online.spec.ts           # Smoke test — verifica se a app está no ar
│   ├── configurator.spec.ts     # Configuração do veículo (cor, rodas, preço)
│   └── pedidos.spec.ts          # Consulta de pedidos (busca, status, validações)
├── support/
│   ├── fixtures.ts              # Fixture customizada `app` que agrupa as Feature Actions
│   ├── helpers.ts               # Utilitários (ex: generateOrderCode)
│   └── actions/
│       └── orderLockupActions.ts  # Feature Actions para Order Lookup
```

## Padrão: Feature Actions

O projeto **não usa Page Objects**. Usa o padrão **Feature Actions** — funções factory que retornam
objetos com locators (`elements`) e métodos de ação/validação. A evolução foi:
testes inline → Page Objects → Feature Actions (commit atual).

### Como funciona

1. **Factory function** recebe `Page` e retorna um objeto com:
   - `elements` — locators reutilizáveis (ex: `orderInput`, `searchButton`)
   - Métodos de ação — `open()`, `searchOrder(code)`
   - Métodos de validação — `validateStatusBadge()`, `validateOrderDetails()`, `validateOrderNotFound()`

2. **Fixture** (`fixtures.ts`) compõe as actions num objeto `app`:
   ```ts
   app: {
     orderLockup: createOrderLockupActions(page)
   }
   ```

3. **Specs** usam `{ app }` da fixture:
   ```ts
   test('...', async ({ app }) => {
     await app.orderLockup.open()
     await app.orderLockup.searchOrder('VLO-0D0081')
     await app.orderLockup.validateStatusBadge('APROVADO')
   })
   ```

### Convenções para novas Feature Actions

- Criar em `playwright/support/actions/` com nome `<feature>Actions.ts`
- Exportar uma factory `create<Feature>Actions(page: Page)`
- Expor locators em `elements` para acesso direto nos testes quando necessário
- Tipar dados de entrada (ex: `OrderDetails`, `OrderStatus`)
- Registrar na fixture em `fixtures.ts` dentro do tipo `App` e do objeto `app`
- Usar Aria Snapshots (`toMatchAriaSnapshot`) para validações estruturais complexas

## Estratégias de Localização

Ordem de preferência usada nos testes:
1. `getByRole()` com name/label — principal estratégia
2. `getByTestId()` — para elementos sem role semântico claro
3. `locator()` com seletor CSS — último recurso (ex: `img[alt^="Velô Sprint"]`)

### data-testid disponíveis na app

| Página        | TestId                        | Elemento                    |
|---------------|-------------------------------|-----------------------------|
| Configurator  | `total-price`                 | Preço total                 |
| Configurator  | `section-cores`               | Seção de cores              |
| Configurator  | `section-rodas`               | Seção de rodas              |
| Configurator  | `section-opcionais`           | Seção de opcionais          |
| Configurator  | `color-option-{id}`           | Swatch de cor               |
| Configurator  | `wheel-option-{type}`         | Opção de roda               |
| Configurator  | `opt-precision-park`          | Checkbox Precision Park     |
| Configurator  | `opt-flux-capacitor`          | Checkbox Flux Capacitor     |
| Configurator  | `checkout-button`             | Botão "Monte o Seu"         |
| Order         | `checkout-name`               | Input nome                  |
| Order         | `checkout-surname`            | Input sobrenome             |
| Order         | `checkout-email`              | Input email                 |
| Order         | `checkout-phone`              | Input telefone              |
| Order         | `checkout-cpf`                | Input CPF                   |
| Order         | `checkout-store`              | Select loja                 |
| Order         | `checkout-terms`              | Checkbox termos             |
| Order         | `checkout-submit`             | Botão confirmar pedido      |
| Order         | `payment-avista`              | Botão pagamento à vista     |
| Order         | `payment-financiamento`       | Botão financiamento         |
| Order         | `input-entry-value`           | Input valor de entrada      |
| Order         | `summary-total-price`         | Preço total resumo          |
| Success       | `success-status`              | Status do pedido            |
| Success       | `order-id`                    | Número do pedido            |
| Success       | `goto-consultar`              | Link consultar pedido       |
| Success       | `configure-another`           | Botão configurar outro      |
| OrderLookup   | `search-order-id`             | Input busca de pedido       |
| OrderLookup   | `order-result-{id}`           | Card resultado do pedido    |
| Landing       | `landing-page`                | Container da landing        |
| Landing       | `hero-section`                | Seção hero                  |

## Configuração Playwright

- **Browser**: Chrome (único habilitado)
- **Timeouts**: test 60s, expect 5s, action 5s, navigation 10s
- **CI**: 2 retries, 1 worker | **Local**: 0 retries, parallel
- **Reporter**: HTML
- **Sem webServer**: dev server precisa estar rodando antes dos testes

## Dados de Teste

Os testes de pedidos (`pedidos.spec.ts`) usam dados reais do Supabase:
- `VLO-0D0081` — APROVADO (Pedro Junior)
- `VLO-ZQ33YD` — REPROVADO (Wallace Conen)
- `VLO-PI0ADZ` — EM_ANALISE (João da Silva)

Para testes de "não encontrado", `generateOrderCode()` gera códigos aleatórios no formato `VLO-XXXXXX`.
