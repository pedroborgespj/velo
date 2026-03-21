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
| `/configure`   | Configurator | ⚠️     | Cor e rodas testadas. Opcionais, interior e navegação não |
| `/order`       | Order        | ❌     | Nenhum teste para o fluxo de checkout |
| `/success`     | Success      | ❌     | Nenhum teste para a tela de sucesso   |
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
| Toggle Precision Park (+R$ 5.500)     | ❌     |                                                  |
| Toggle Flux Capacitor (+R$ 5.000)     | ❌     |                                                  |
| Preço acumula opcionais + rodas       | ❌     |                                                  |
| Botão "Monte o Seu" navega p/ /order  | ❌     |                                                  |
| Todas as 3 cores (glacier, midnight, lunar) | ⚠️ | Só testa glacier→midnight. Lunar white não testada |

### Order / Checkout (`/order`)

| Funcionalidade                          | Status |
|-----------------------------------------|--------|
| Formulário dados pessoais               | ❌     |
| Validação de campos (Zod)               | ❌     |
| Máscara de telefone e CPF               | ❌     |
| Seleção de loja                         | ❌     |
| Pagamento à vista                       | ❌     |
| Pagamento financiamento (12x + juros)   | ❌     |
| Valor de entrada (financiamento)        | ❌     |
| Aceitar termos                          | ❌     |
| Submit do pedido                        | ❌     |
| Análise de crédito (Supabase function)  | ❌     |
| Regras de decisão (score + entrada)     | ❌     |
| Resumo lateral do veículo               | ❌     |

### Success (`/success`)

| Funcionalidade                          | Status |
|-----------------------------------------|--------|
| Exibição de status (aprovado/reprovado) | ❌     |
| Detalhes do pedido                      | ❌     |
| Navegação para consultar pedido         | ❌     |
| Navegação para configurar outro         | ❌     |
| Redirect quando sem order no state      | ❌     |

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

| Componente                    | Status | Observação                                    |
|-------------------------------|--------|-----------------------------------------------|
| Feature Actions: OrderLookup  | ✅     | Completa com elements, ações e validações     |
| Feature Actions: Configurator | ❌     | Testes usam `page` direto, sem action dedicada |
| Feature Actions: Order        | ❌     | Não existe                                    |
| Feature Actions: Success      | ❌     | Não existe                                    |
| Feature Actions: Landing      | ❌     | Não existe                                    |
| Custom fixture (`app`)        | ✅     | Só tem orderLockup registrado                 |
| Helper: generateOrderCode     | ✅     | Usado no teste de not found                   |

---

## Resumo de Cobertura

| Métrica                     | Valor   |
|-----------------------------|---------|
| Total de specs              | 3 arquivos |
| Total de testes             | 8       |
| Rotas com cobertura total   | 1/8 (`/lookup`) |
| Rotas com cobertura parcial | 2/8 (`/`, `/configure`) |
| Rotas sem cobertura         | 5/8 (`/order`, `/success`, `/termos`, `/privacidade`, `/*`) |

### Maiores Gaps

1. **Fluxo completo de compra** — nenhum teste cobre configurar → checkout → success
2. **Checkout (`/order`)** — formulário, validação, pagamento e análise de crédito sem testes
3. **Opcionais do configurador** — Precision Park e Flux Capacitor não testados
4. **Financiamento** — cálculo de parcelas, entrada e regras de crédito sem testes
5. **Feature Actions para Configurator** — testes ainda usam `page` direto em vez do padrão do projeto
