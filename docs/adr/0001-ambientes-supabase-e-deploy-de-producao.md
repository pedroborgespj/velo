# ADR 0001 — Ambientes Supabase separados e estratégia de deploy de produção

- **Status:** Aceito
- **Data:** 2026-07-11
- **Decisores:** Time Velo Sprint

---

## Contexto

O Velo Sprint é um SPA (React + Vite) que grava pedidos em um banco de dados **Supabase**. O deploy é feito na **Vercel**, e o pipeline de CD executa testes automatizados de ponta a ponta (E2E) antes de publicar.

Existia **um único projeto Supabase**, usado tanto pela aplicação em produção quanto pelos testes. Consequência: **toda execução dos testes criava, alterava e apagava pedidos no banco de produção** — poluindo dados reais e, no limite, arriscando apagar dados de clientes.

A correção óbvia — "criar um banco de preview e apontar a preview para ele" — esbarra em um detalhe técnico importante:

> No Vite, variáveis com prefixo `VITE_` (como o endereço do Supabase) são **embutidas no código no momento do build** ("build time"), viram texto fixo dentro do JavaScript final. Elas **não** são lidas quando o app roda no navegador ("runtime").

Isso colide diretamente com o passo de `promote` do pipeline. O comando `vercel promote` **não gera um novo build**: ele apenas **re-aponta o domínio de produção para um build que já existe**. Como o pipeline buildava para *preview*, esse build tinha o **banco de preview "carimbado" dentro dele**. Promovê-lo para produção faria a **produção conversar com o banco de preview** — o oposto do desejado.

**Analogia:** buildar é como *estampar uma camiseta*. Depois de estampada "preview", a tinta está seca. O `promote` só pendura essa mesma camiseta numa arara chamada "Produção" — a estampa continua dizendo "preview". Trocar a arara não reescreve a tinta.

## Decisão

Adotamos **dois projetos Supabase separados** (um para **preview/testes**, outro para **produção**) e mudamos a estratégia de publicação:

**Produção deixa de reutilizar o artefato de preview e passa a ter o seu próprio build.**

Na prática, o job de `promote` foi substituído por um job `deploy-production` que:

1. Baixa as variáveis do ambiente **Production** da Vercel (`vercel pull --environment=production`);
2. Gera um **build novo** com o Supabase de produção carimbado (`vercel build --prod`);
3. Publica esse artefato em produção (`vercel deploy --prebuilt --prod`).

Esse job só roda **após os testes E2E passarem**, mantendo produção protegida.

```
unit-tests → build (preview) → E2E (contra o banco de preview) → build+deploy (produção)
                  ↑ Supabase preview      ↑ banco de preview            ↑ Supabase produção
```

Cada ambiente recebe **o seu próprio build, com o banco correto embutido**. Os testes rodam contra o banco de preview e nunca encostam em produção.

## Alternativa considerada (e por que foi descartada)

**Configuração em runtime (BODM — "build once, deploy many").**
Consistiria em tirar o endereço do Supabase do build e fazer o app **descobri-lo quando roda no navegador** (por exemplo, baixando um `config.json`). Assim, um único artefato serviria os dois ambientes e o `promote` voltaria a ser válido.

Foi descartada porque, para um **site estático**, ela troca um problema simples por riscos concretos:

- Exige **alterar o código da conexão com o Supabase**, que hoje funciona e está testado (risco de regressão no ponto mais crítico do app).
- Adiciona um **passo de rede antes do app funcionar**, com um novo modo de falha (se o `config.json` falhar ou vier de **cache antigo do CDN**, produção pode apontar para o banco errado de forma intermitente e difícil de diagnosticar).
- É **over-engineering** para o objetivo: o único dado que difere entre os ambientes são **duas linhas de texto** (endereço e chave pública do Supabase). Não há benefício que justifique a complexidade.

O ganho teórico dessa alternativa (o artefato de produção ser **byte a byte idêntico** ao testado) é relevante para **serviços de backend/containers**, não para um SPA estático cujo comportamento é idêntico entre os builds — muda apenas o endereço do banco.

## Consequências

**Positivas**
- Produção e preview usam bancos **fisicamente separados**; os testes não tocam mais dados reais.
- O pipeline passa a usar a Vercel **do jeito idiomático** (build por ambiente), alinhado a como Vite e Vercel foram projetados.
- Espelha o fluxo de mercado "testar em QA → se passar, deploy em produção".
- Produção continua **bloqueada pelos testes** (não publica se o E2E falhar).

**Negativas (e mitigação)**
- O artefato publicado em produção é um **rebuild**, não exatamente o que o E2E testou. Como o **commit é o mesmo** e a única diferença são as constantes de conexão, o risco é mínimo; pode ser fechado com um **smoke test pós-deploy** verificando que produção responde corretamente.
- Há **um build a mais** no pipeline (poucos segundos) — impacto desprezível.

## Notas de implementação

- Variáveis `VITE_SUPABASE_*` configuradas **por ambiente** na Vercel (Production → banco de produção; Preview → banco de preview).
- Elas **não** são marcadas como *Sensitive*: são públicas por natureza (vão para o bundle) e, marcadas assim, quebrariam o build externo do CI (o `vercel pull` não consegue baixá-las).
- Os testes E2E fazem seeding direto no banco via `DATABASE_URL`, injetado no CI a partir do segredo `PREVIEW_DATABASE_URL` (aponta para o banco de preview). Segredos ficam fora do repositório (`.env` não é mais versionado; use `.env.example` como modelo).
