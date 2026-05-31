# Project Context — Playwright Test Suite

## Visão Geral

Suite de testes E2E com Playwright para o Velo Sprint, um configurador de veículos elétricos.
Os testes rodam contra a aplicação local em `http://localhost:5173` (Vite dev server).

## Estrutura

```
playwright/
├── e2e/                         # Specs de teste
│   ├── online.spec.ts           # Smoke test — verifica se a app está no ar
│   ├── configurator.spec.ts     # Configuração do veículo (cor, rodas, opcionais, preço)
│   ├── checkout.spec.ts         # Checkout: validação de campos, pagamento, análise de crédito
│   └── pedidos.spec.ts          # Consulta de pedidos (busca, status, validações)
├── support/
│   ├── fixtures.ts              # Fixture customizada `app` que agrupa as Feature Actions
│   ├── helpers.ts               # Utilitários (ex: generateOrderCode)
│   ├── actions/
│   │   ├── orderLockupActions.ts   # Feature Actions para Order Lookup
│   │   ├── configuratorActions.ts  # Feature Actions para o Configurador
│   │   └── checkoutActions.ts      # Feature Actions para o Checkout
│   ├── database/                # Camada de seed via Kysely
│   │   ├── database.ts          # Cliente/conexão Kysely (pg + SSL Supabase)
│   │   ├── schema.ts            # Interfaces TypeScript das tabelas
│   │   └── orderRepository.ts   # insertOrder, deleteOrderByNumber, deleteOrdersByEmail
│   └── fixtures/
│       └── orders.json          # Dados de pedidos usados por pedidos.spec.ts
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
     orderLockup: createOrderLockupActions(page),
     configurator: createConfiguratorActions(page),
     checkout: createCheckoutActions(page),
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

Feature Actions são **wrappers finos** sobre a API do Playwright. Comece com a versão mais simples
possível e só adicione abstração quando o uso no spec exigir.

- Criar em `playwright/support/actions/` com nome `<feature>Actions.ts`
- Exportar uma factory `create<Feature>Actions(page: Page)`
- Registrar na fixture em `fixtures.ts` dentro do tipo `App` e do objeto `app`
- **Sem tipos/enums de domínio**: aceite valores raw (`string`, `string | RegExp`) e deixe o teste explícito
  sobre o que está clicando. Tipe entrada só quando há um shape real reutilizado (ex: `OrderDetails`).
- **Sem objeto `elements` por padrão**: crie locators dentro de cada método. Só exponha `elements` quando o
  spec precisar do locator para assertions diretas (como `orderLockupActions` com `orderInput`/`searchButton`,
  ou `checkoutActions` com `terms`/`alerts`).
- **Testes passam valores de display**: `selectColor('Midnight Black')`, não chaves abstratas como
  `selectColor('midnight-black')` — o teste deve mostrar exatamente o que acontece na UI.
- Usar Aria Snapshots (`toMatchAriaSnapshot`) para validações estruturais complexas

> Referência viva: `configuratorActions.ts` segue o estilo fino (sem `elements`, locators inline);
> `orderLockupActions.ts` e `checkoutActions.ts` expõem `elements` apenas onde o spec realmente usa.

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
| Order         | `checkout-lastname`           | Input sobrenome             |
| Order         | `checkout-email`              | Input email                 |
| Order         | `checkout-phone`              | Input telefone              |
| Order         | `checkout-document`           | Input CPF                   |
| Order         | `checkout-store`              | Select loja                 |
| Order         | `checkout-terms`              | Checkbox termos             |
| Order         | `checkout-submit`             | Botão confirmar pedido      |
| Order         | `payment-avista`              | Botão pagamento à vista     |
| Order         | `payment-financiamento`       | Botão financiamento         |
| Order         | `input-entry-value`           | Input valor de entrada      |
| Order         | `summary-total-price`         | Preço total resumo          |
| Order         | `error-name`                  | Mensagem de erro — nome     |
| Order         | `error-lastname`              | Mensagem de erro — sobrenome|
| Order         | `error-email`                 | Mensagem de erro — email    |
| Order         | `error-phone`                 | Mensagem de erro — telefone |
| Order         | `error-document`              | Mensagem de erro — CPF      |
| Order         | `error-store`                 | Mensagem de erro — loja     |
| Order         | `error-terms`                 | Mensagem de erro — termos   |
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

### Order Lookup — seed por teste via Kysely

`pedidos.spec.ts` **não** depende de linhas pré-existentes no Supabase. Cada teste semeia o próprio pedido
no banco (`deleteOrderByNumber` + `insertOrder` de `support/database/orderRepository.ts`) usando os dados de
`support/fixtures/orders.json` (importado com import assertion `with { type: 'json' }`):
- `approved` → `VLO-0D0081` — APROVADO (Pedro Junior)
- `reproved` → `VLO-ZQ33YD` — REPROVADO (Wallace Conen)
- `inAnalysis` → `VLO-PI0ADZ` — EM_ANALISE (João da Silva)

Para testes de "não encontrado", `generateOrderCode()` gera códigos aleatórios no formato `VLO-XXXXXX`.

### Checkout — dados inline + cleanup por email

`checkout.spec.ts` define o `customer` inline em cada teste e limpa pedidos anteriores com
`deleteOrdersByEmail(email)` antes de submeter, garantindo isolamento.

### Mock da análise de crédito

A function `credit-analysis` do Supabase pode ser interceptada via `app.checkout.mockCreditScore(score)`
(usa `page.route('**/functions/v1/credit-analysis', ...)`). Os testes de financiamento usam isso para forçar
scores determinísticos e exercitar as regras de decisão (score + percentual de entrada).
