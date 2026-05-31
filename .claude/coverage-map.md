# Coverage Map — Cobertura E2E

Mapeamento de quais funcionalidades da aplicação estão cobertas (ou não) por testes E2E.

## Legenda

- ✅ Coberto por teste
- ⚠️ Parcialmente coberto
- ❌ Sem cobertura

---

## Rotas da Aplicação

| Rota           | Página       | Status | Observação                            |
|----------------|--------------|--------|---------------------------------------|
| `/`            | Landing      | ⚠️     | Só smoke test (título). Sem teste de seções, header, FAQ, specs |
| `/configure`   | Configurator | ✅     | Cor, rodas, opcionais (acúmulo de preço) e navegação para checkout |
| `/order`       | Order        | ✅     | Validação de campos, pagamento à vista e regras de crédito do financiamento |
| `/success`     | Success      | ⚠️     | Heading de status (aprovado/em análise/reprovado) validado. Detalhes/navegação/redirect não |
| `/lookup`      | OrderLookup  | ✅     | Boa cobertura: 3 status, not found, formato inválido, input vazio |
| `/termos`      | Terms        | ❌     | Sem teste                             |
| `/privacidade` | Privacy      | ❌     | Sem teste                             |
| `/*`           | NotFound     | ❌     | Sem teste para rota 404               |

---

## Funcionalidades Detalhadas

### Landing (`/`)

| Funcionalidade              | Status | Spec / Teste                      |
|-----------------------------|--------|-----------------------------------|
| App online (título)         | ✅     | `online.spec.ts` → "webapp should be online" |
| Header / navegação          | ❌     |                                   |
| Hero section                | ❌     |                                   |
| Specs section               | ❌     |                                   |
| CTA section                 | ❌     |                                   |
| FAQ section                 | ❌     |                                   |
| Footer                      | ❌     |                                   |

### Configurator (`/configure`)

| Funcionalidade                        | Status | Spec / Teste                                    |
|---------------------------------------|--------|--------------------------------------------------|
| Trocar cor exterior                   | ✅     | `configurator.spec.ts` → "changing color"        |
| Imagem atualiza com cor               | ✅     | `configurator.spec.ts` → "changing color"        |
| Preço não muda ao trocar cor          | ✅     | `configurator.spec.ts` → "changing color"        |
| Trocar tipo de roda                   | ✅     | `configurator.spec.ts` → "changing wheels"       |
| Preço atualiza com rodas sport        | ✅     | `configurator.spec.ts` → "changing wheels"       |
| Imagem atualiza com tipo de roda      | ✅     | `configurator.spec.ts` → "changing wheels"       |
| Reverter roda para aero               | ✅     | `configurator.spec.ts` → "changing wheels"       |
| Selecionar cor interior               | ❌     |                                                  |
| Toggle Precision Park (+R$ 5.500)     | ✅     | `configurator.spec.ts` → "adding and removing optionals" |
| Toggle Flux Capacitor (+R$ 5.000)     | ✅     | `configurator.spec.ts` → "adding and removing optionals" |
| Preço acumula opcionais + rodas       | ✅     | `configurator.spec.ts` → "adding and removing optionals" (acúmulo/remoção) |
| Botão "Monte o Seu" navega p/ /order  | ✅     | `configurator.spec.ts` → "adding and removing optionals" (finishConfigurator + expectedLoaded) |
| Todas as 3 cores (glacier, midnight, lunar) | ⚠️ | Só testa glacier→midnight. Lunar white não testada |

### Order / Checkout (`/order`)

Cobertos por `checkout.spec.ts` (12 testes em 2 grupos: "Validações de campos obrigatórios" e
"Payment and Confirmation").

| Funcionalidade                              | Status | Spec / Teste                                                        |
|---------------------------------------------|--------|---------------------------------------------------------------------|
| Validação de todos os campos em branco      | ✅     | "should validate all required fields when left blank"               |
| Mínimo de caracteres (nome/sobrenome)       | ✅     | "should validate minimum character limit for Name and Lastname"     |
| Formato de email inválido                   | ✅     | "should display error for invalid email format"                     |
| CPF inválido                                | ✅     | "should display error for invalid CPF"                              |
| Exigir aceite dos termos                    | ✅     | "should require terms acceptance when submitting with valid data"   |
| Pagamento à vista (pedido aprovado)         | ✅     | "should successfully create an order for cash payment"              |
| Financiamento — score > 700 aprova          | ✅     | "should automatically approve credit when the CPF score is greater than 700" |
| Financiamento — score 501–700 → EM_ANALISE  | ✅     | "should set the order to EM_ANALISE when the CPF score is between 501 and 700" |
| Financiamento — score ≤ 500, entrada 0 → reprovado | ✅ | "...REPROVADO when the CPF score is 500 or less and entry is 0"     |
| Financiamento — score ≤ 500, entrada < 50% → reprovado | ✅ | "...REPROVADO when ... entry is below 50%"                      |
| Financiamento — score ≤ 500, entrada = 50% → aprovado | ✅ | "...approve ... but entry is equal to 50%"                       |
| Financiamento — score ≤ 500, entrada > 50% → aprovado | ✅ | "...approve ... but entry is higher than 50%"                    |
| Resumo lateral do veículo (total)           | ✅     | `expectSummaryTotal()` no fluxo à vista e de opcionais              |
| Análise de crédito (mock da function)        | ✅     | `mockCreditScore()` em todos os testes de financiamento            |
| Máscara de telefone e CPF                   | ❌     | Inputs preenchidos com valor já formatado; máscara em si não testada |
| Seleção de cor interior                     | ❌     |                                                                     |

### Success (`/success`)

| Funcionalidade                          | Status | Spec / Teste                                            |
|-----------------------------------------|--------|---------------------------------------------------------|
| Exibição de status (heading)            | ✅     | `checkout.spec.ts` via `expectSuccessStatus()` (aprovado/em análise/reprovado) |
| Detalhes do pedido                      | ❌     |                                                         |
| Navegação para consultar pedido         | ❌     |                                                         |
| Navegação para configurar outro         | ❌     |                                                         |
| Redirect quando sem order no state      | ❌     |                                                         |

### Order Lookup (`/lookup`)

| Funcionalidade                          | Status | Spec / Teste                                          |
|-----------------------------------------|--------|-------------------------------------------------------|
| Navegar via landing page                | ✅     | `pedidos.spec.ts` → open() na action                  |
| Buscar pedido APROVADO                  | ✅     | `pedidos.spec.ts` → "approved order"                  |
| Buscar pedido REPROVADO                 | ✅     | `pedidos.spec.ts` → "reproved order"                  |
| Buscar pedido EM_ANALISE               | ✅     | `pedidos.spec.ts` → "in analysis order"               |
| Badge de status (cor, ícone, texto)     | ✅     | `validateStatusBadge()` na action                     |
| Detalhes do pedido (aria snapshot)      | ✅     | `validateOrderDetails()` na action                    |
| Pedido não encontrado                   | ✅     | `pedidos.spec.ts` → "order is not found"              |
| Código fora do padrão esperado          | ✅     | `pedidos.spec.ts` → "outside the expected pattern"    |
| Input vazio desabilita busca            | ✅     | `pedidos.spec.ts` → "empty or whitespace"             |
| Buscar pedido com financiamento (12x)   | ❌     | Todos os pedidos de teste são "À Vista"               |

---

## Infraestrutura de Suporte

| Componente                    | Status | Observação                                          |
|-------------------------------|--------|-----------------------------------------------------|
| Feature Actions: OrderLookup  | ✅     | Completa com elements, ações e validações           |
| Feature Actions: Configurator | ✅     | `configuratorActions.ts` — open, cor, rodas, opcionais, preço, navegação |
| Feature Actions: Checkout     | ✅     | `checkoutActions.ts` — dados, loja, pagamento, entrada, termos, submit, mock de crédito |
| Feature Actions: Success      | ⚠️     | Sem action dedicada; status validado via `checkout.expectSuccessStatus()` |
| Feature Actions: Landing      | ❌     | Não existe                                          |
| Camada de seed (Kysely)       | ✅     | `database/` — insertOrder, deleteOrderByNumber, deleteOrdersByEmail |
| Dados de teste (orders.json)  | ✅     | `support/fixtures/orders.json` seeda os pedidos do lookup |
| Custom fixture (`app`)        | ✅     | 3 actions registradas: orderLockup, configurator, checkout |
| Helper: generateOrderCode     | ✅     | Usado no teste de not found                         |

---

## Resumo de Cobertura

| Métrica                     | Valor   |
|-----------------------------|---------|
| Total de specs              | 4 arquivos |
| Total de testes             | 22 (online 1 + configurator 3 + pedidos 6 + checkout 12) |
| Rotas com cobertura total   | 3/8 (`/configure`, `/order`, `/lookup`) |
| Rotas com cobertura parcial | 2/8 (`/`, `/success`) |
| Rotas sem cobertura         | 3/8 (`/termos`, `/privacidade`, `/*`) |

### Maiores Gaps

1. **Success (`/success`)** — só o heading de status é validado; detalhes do pedido, navegação (consultar/configurar outro) e redirect sem `order` no state não têm teste
2. **Landing (`/`)** — apenas smoke test do título; header, hero, specs, FAQ, CTA e footer sem cobertura
3. **Rotas estáticas** — `/termos`, `/privacidade` e o 404 (`/*`) sem teste
4. **Financiamento no Order Lookup** — todos os pedidos de `orders.json` são "À Vista"; consulta de pedido financiado (12x) não coberta
5. **Cor interior e máscaras de input** — seleção de interior e validação das máscaras de telefone/CPF ainda sem teste
