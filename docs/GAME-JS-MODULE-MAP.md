# Mapa atual de responsabilidades de `game.js`

> Auditoria estrutural somente de leitura, baseada no branch `main` consultado em 2026-11-15.
> Commit do branch consultado: `6d9a1be149339a42aa684fd5e93ba994a7c21abb`.
> O código de gameplay nessa árvore permanece no commit `c276447c05fcb75252fb70708b71c3532344e3d3`; o commit posterior de `main` adicionou documentação/orientações.
> Este documento não especifica funcionalidade nova nem autoriza refatoração ou publicação. Antes de cada mudança de código, registrar uma especificação de escopo aprovada em `dev-instructions/`.

## Diagnóstico atual

`game.js` contém aproximadamente **3.095 linhas / 126 KB** e instancia um único IIFE `Game`. Ainda concentra inicialização e ligação de eventos, telas de personagem e abertura da História, máquina de estados da pesca, coordenação de combate, entrada de teclado/sensores, HUD, pessoas presentes, navegação, inventário e loja.

O repositório já extraiu módulos coesos de combate numérico, troca de telas, anúncios acessíveis, persistência/apresentação da última captura e renderizadores de telas/painéis. Portanto, a refatoração não deve começar do zero nem duplicar esses módulos: primeiro deve reduzir coordenação e responsabilidades residuais de `Game`, preservando contratos existentes.

O mapa anterior descrevia cerca de 2.943 linhas e apontava a release `v0.1.0` como referência. Está desatualizado; as faixas abaixo foram recalculadas a partir do `game.js` atual.

## Arquitetura e contratos existentes

- `index.html` carrega scripts clássicos via tags `<script>` em ordem fixa. Não usa `type="module"` nem import/export ES Modules. A ordem de carregamento e os nomes globais são contratos implícitos.
- `Game` mantém o estado da sessão dentro do IIFE e expõe atualmente uma API pública pequena (`state()` e `startNormal()`).
- Vários módulos de view já recebem dados e ações via callbacks fornecidos por `Game`; manter esse padrão onde ele evita dependências circulares.
- O código atual inclui `FishingCombat` para regras numéricas da luta, `ScreenNavigation`, `A11yAnnouncer`, `LastCatchStorage` e `LastCatchView`, além de views de pesca, inventário, loja, casa, estaleiro e viagem.
- `i18n.js` tem aproximadamente 2.330 linhas / 147 KB, majoritariamente catálogos de textos localizados em PT, EN e HU; sua divisão por idioma é uma possibilidade de manutenção, mas não deve ser misturada à primeira refatoração de `game.js`.

## Mapa aproximado do `game.js` atual

As faixas são aproximadas e devem ser recalculadas após cada extração. Módulos de destino abaixo são propostas de responsabilidade, não nomes ou arquitetura aprovados para implementação.

| Linhas aprox. | Conteúdo atual | Observação / destino conceitual |
|---|---|---|
| 1–91 | IIFE, seletores, estado global da sessão, `applyI18n` | Contexto/controlador central; reduzir dependências globais somente quando houver especificação. |
| 92–426 | `init`, reset e parâmetros de QA, caches de telas/DOM, registro de listeners e navegação inicial | Inicialização e composição da aplicação; primeira função grande (~335 linhas), mas extração exige mapear cuidadosamente callbacks e ordem de boot. |
| 427–531 | Preferências/toggles, categorias visuais, resumo e presença da aparência do personagem | UI de personagem/preferências; pode ser candidato de baixo risco se estiver isolado dos contratos da abertura. |
| 532–955 | Estado e renderização da abertura narrativa, diálogos/áudio, criação/edição de personagem e handlers | Fluxos de abertura e criação; responsabilidade coesa grande, com persistência/narração e acessibilidade. |
| 956–1066 | Montagem/atualização da linha SVG e criação/destruição do peixe ativo | Renderização da cena de pesca. |
| 1067–1196 | Física/animação de peixe e ciclo `tick` | Física e renderização temporal da cena; acoplado ao estado e aos elementos SVG. |
| 1197–1322 | Seleção de idioma, perfil de áudio, `startGame`, preparação da sessão | Inicialização de sessão/modo e dependências de HUD/persistência. |
| 1323–1642 | Silêncio TalkBack, falha de Boss, `enterState`, transições e consequências da máquina de pesca | Núcleo de estado da pescaria; função `enterState` ~304 linhas, maior risco de regressão. |
| 1643–1831 | Handlers de inclinação/sacudida, loop da tensão, puxar e aliviar | Adaptadores de entrada + coordenação do combate; cálculos numéricos parcialmente isolados em `FishingCombat`. |
| 1832–1956 | Peixes de fundo, indicadores/equipamento/carga, anúncio e releitura da última captura | Cena/HUD e coordenação da última captura. `LastCatchStorage`, `LastCatchView` e `A11yAnnouncer` já existem. |
| 1967–2024 | Painéis de equipamento/carga e listas de isca | `FishingPanels`, `HoldPanelView` e `BaitPanelView` já existem; confirmar se ainda resta lógica de domínio no controlador. |
| 2025–2142 | Próxima mordida, resultado, retorno, HUD da cidade, hub e mapa ativo | Sessão de pesca e navegação/hub entre modos. |
| 2143–2264 | Casa, estaleiro, requisitos de vara/barco e viagem | `HouseView`, `VesselView`, `TravelView` já renderizam telas; regras e composição permanecem no controlador. |
| 2265–2313 | Modal de zonas e HUD de zona | Coordenação de mapa/zona. |
| 2314–2410 | Delegação de cliques internos, navegação da loja/inventário e tabs | Navegação dos painéis e abas; listeners/delegação devem permanecer idempotentes. |
| 2411–2564 | Feedback e composição de `renderInventory` | Renderers de peixe, isca, roupa e decoração já são módulos; verificar callbacks e regras de compra/venda antes de extrair mais. |
| 2565–2844 | Diálogos de Zeca, lista/conversa de NPCs, Pessoas presentes, agradecimento da Marta | Domínio social/narrativo e interface estão misturados; respeitar estado persistente, condições de descoberta e localização. |
| 2845–2966 | Acesso/renderização da loja de roupa, loja geral, compra, venda e equipagem | `ClothingShopView`, `ShopBuyView` e `ShopSellView` já existem; manter regras de economia e callbacks numa fronteira clara. |
| 2967–3095 | Modificadores de equipamento, troca/foco de telas, narração, controles, indicadores e timers | Helpers transversais atualmente agregados; separar só quando a coesão e a dependência forem claras. |

## Módulos existentes que devem ser reutilizados

### Domínio e persistência

- `fishing-combat.js` — regras numéricas de progresso, tensão e fadiga.
- `inventory.js` — inventário, moedas, equipamento, peixes, proteção de quest, barcos, casa e zonas.
- `score-system.js` — pontuação/progressão da Pesca Livre.
- `last-catch-storage.js` — leitura/gravação da última captura.
- `game-time.js` — calendário/relógio.
- `dani-quest.js` — quest fixa, Boss ambiental pós-quest e presente da Marta.

### Acessibilidade, navegação e apresentação

- `accessibility-announcer.js` — fala via leitor de tela/live region, sem TTS próprio.
- `screen-navigation.js` — ativação/bloqueio/foco inicial das telas.
- `last-catch-view.js`, `fishing-hud-view.js`, `fishing-panels.js`, `hold-panel-view.js`, `bait-panel-view.js`.
- `inventory-fish-view.js`, `inventory-bait-view.js`, `inventory-clothing-view.js`, `inventory-decoration-view.js`.
- `shop-buy-view.js`, `shop-sell-view.js`, `clothing-shop-view.js`, `house-view.js`, `vessel-view.js`, `travel-view.js`, `zone-view.js`, `result-view.js`.

### Dados/catálogos

`fish-data.js`, `fish-metrics.js`, `map-data.js`, `shop-data.js`, `house-data.js`, `home-decoration-data.js`, `clothing-catalog.js`, `clothing-stock.js`, `character-data.js`, `character-visual-data.js`, `npc-data.js` e `creature-profile.js` mantêm dados fora do controlador.

## Estado e comportamentos que toda extração deve preservar

- Modo `normal` (História) e `free` (Pesca Livre), incluindo inventários, históricos e pontuação separados onde especificado.
- Estados da máquina de pesca (`IDLE`, `CASTING`, `WAITING`, `BITING`, `REELING`, `CAUGHT`, `SNAPPED`) e ordem das transições/eventos.
- Peixe, linha e combate: `currentFish`, `fishTired`, tensão, estado retornado por `FishingCombat`, impulsos e coordenadas da isca.
- Pontuação/recorde, progressão do Boss e tratamento da fuga.
- Timers de espera, mordida, recuperação, loop de tensão e animação; limpar e reiniciar uma única vez nos fluxos apropriados.
- Controle de teclado e sensores com a mesma mecânica; não simplificar nem bifurcar a física do teclado.
- Chaves de persistência e compatibilidade com saves/migrações existentes.
- Foco, live regions, anúncios concisos e regras de silêncio para TalkBack; não adicionar fala própria duplicada.
- Fluxos narrativos condicionais de Zeca, Dani e Marta; nenhuma informação pode surgir antes do estado correto.
- IDs existentes do HTML, ordem dos scripts globais, tradução PT/EN/HU e seleção de conteúdo conforme idioma.
- Loja, equipagem, capacidade e economia; nenhuma alteração de balanceamento deve ser introduzida sob a cobertura de uma refatoração.

## Prioridade sugerida e etapas independentes

1. **Atualizar mapa:** concluído nesta branch; faixas e limites foram conferidos contra `main` consultada em 2026-11-15.
2. **Primeira extração de apresentação:** concluída nesta branch. A atualização do indicador de direção do peixe foi movida para a função `FishingHudView.setFishDirection`; `Game` preserva o estado de fase/lado e chama a view nos mesmos pontos. Especificação: `dev-instructions/refactor/fish-direction-indicator.md`.
3. **Testar após cada passo:** nesta extração passaram o QA focalizado (17 asserções), as quatro suítes de regressão disponíveis e a análise de sintaxe de 51 arquivos JS com DukPy. Smoke test manual de navegador/leitor de tela/sensores segue pendente.
4. **Próximo passo ainda não iniciado:** revisar a etapa seguinte, identificar a próxima fronteira de baixo risco, registrar especificação aprovada e só então alterar código. Não combinar múltiplas extrações. `init`, `enterState`, timers, física, sensores e migração para ES Modules continuam em fases posteriores separadas.

## Testes e limitações registrados na auditoria

No `main` consultado foram encontrados QA automatizados específicos: `qa_clothing_shop.py`, `qa_dani_quest.py`, `qa_dani_quest_inventory.py` e `qa_home_decorations.py`. Não foi encontrado um script geral no inventário consultado. Para a extração do indicador, foi adicionado `qa_fishing_direction_view.py`. Testes automatizados não equivalem a smoke test do site ou validação manual de acessibilidade.

Em 2026-11-15, antes e depois da extração, as quatro suítes existentes passaram. Depois da extração, passaram também 17 asserções focadas do indicador e a análise sintática de todos os 51 arquivos JavaScript via DukPy. `node` não está instalado, então `node --check` não foi executado. Nenhum teste manual do jogo, com sensores, NVDA ou TalkBack foi realizado nesta etapa. Repetir testes relevantes após cada mudança e criar QA focalizado quando a extração tocar áreas ainda não cobertas.

## Fonte e rastreabilidade

A auditoria comparou o `main` consultado em 2026-11-15 com a documentação e os arquivos vigentes dessa árvore. Este mapa é uma fotografia estrutural e pode ficar desatualizado após cada commit. Antes de uma extração, recalcular linhas e conferir o código real; não usar números desta tabela como substituto da leitura do subsistema.
