# Mapa de responsabilidades de `game.js`

> Documento de análise estrutural. Esta primeira etapa não altera comportamento, HTML, CSS, dados ou acessibilidade.
>
> Referência analisada: release `v0.1.0`, commit `0e0ee41`.

## Diagnóstico

`game.js` é um monólito de aproximadamente 2.943 linhas encapsulado em `const Game = (() => { ... })();`. O encapsulamento reduz o escopo global, mas o módulo ainda concentra responsabilidades de aplicação, domínio, renderização, entrada, persistência e acessibilidade.

O projeto já possui módulos úteis — `inventory.js`, `audio.js`, `i18n.js`, `game-time.js`, catálogos e dados visuais — porém `game.js` conhece diretamente quase todos eles e também acessa muitos elementos do `index.html` por ID.

## Dependências diretas

### Serviços e módulos usados por `game.js`

- `I18n` — textos e idioma;
- `A11y` — preferências, escala de tempo, háptica e narração;
- `Audio` — música, efeitos, vibração e reel;
- `Sensors` — inclinação e chacoalhamento;
- `GameTime` — relógio e tempo da cidade;
- `Inventory` — equipamentos, peixes, iscas, moedas, barcos e zonas;
- `Character` — identidade e aparência;
- `getCharacterVisualCategories` — categorias da aparência;
- `FISH_CATALOG` — espécies e física;
- `MAP_CATALOG` — mapas e zonas;
- `SHOP_CATALOG` — equipamentos e preços;
- `VESSELS_CATALOG` — barcos;
- `BAIT_CATALOG` — iscas.

### Dependência estrutural atual

Os scripts são carregados globalmente pelo `index.html` em ordem fixa. Não há `import`/`export` nativos. Portanto, a ordem dos scripts e os nomes globais funcionam como um contrato implícito.

## Mapa por faixa de código

As linhas são aproximadas e devem ser revistas após cada extração.

| Faixa | Responsabilidade atual | Destino provável |
|---|---|---|
| 15–83 | IIFE, seletores DOM, estado global, peixe ativo e variáveis da linha | `game-context.js` / `dom.js` |
| 23–42 | Aplicação inicial de i18n e sincronização de controles | `ui-i18n.js` |
| 88–230 | Inicialização, parâmetros de teste, coleta de referências DOM e configuração inicial | `app.js` / `game-context.js` |
| 230–366 | Menu principal, hub, acesso à Loja/Inventário, barra inferior e preferências | `game-navigation.js` / `settings-ui.js` |
| 367–503 | Criação visual e identidade da personagem | `character-screen.js` |
| 504–571 | Construção e atualização da linha SVG | `fishing-renderer.js` |
| 572–735 | Peixe ativo, animação e física de aproximação/fuga | `fishing-physics.js` |
| 736–753 | Seleção de idioma e perfil de áudio ambiente | `app.js` / `audio-profile.js` |
| 754–816 | Início de jogo, configuração de HUD, sensores e modo | `game-session.js` |
| 817–1063 | Máquina de estados da pescaria e resolução da captura | `fishing-state-machine.js` |
| 1064–1104 | Entrada de inclinação | `game-input.js` |
| 1105–1118 | Entrada de chacoalhamento | `game-input.js` |
| 1119–1244 | Loop de tensão, força, cansaço, recuperação e ações de puxar/soltar | `fishing-physics.js` / `fishing-state-machine.js` |
| 1245–1286 | Peixes decorativos de fundo | `fishing-renderer.js` |
| 1287–1361 | Mordida, equipamento visual, isca HUD, capacidade e carga | `game-hud.js` / `fishing-session-ui.js` |
| 1362–1470 | Última captura, persistência, resumo e foco acessível | `last-catch.js` / `accessibility-ui.js` |
| 1471–1627 | Painéis de equipamento, carga e liberação de peixes | `game-panels.js` |
| 1628–1661 | Agendamento da próxima mordida e influência da isca | `fishing-session.js` |
| 1662–1782 | Resultado, retorno ao menu, hub, música, mapa ativo e HUD da cidade | `game-navigation.js` / `city-hub.js` |
| 1783–1958 | Casa e Estaleiro, compra/equipamento de barcos | `house-screen.js` / `vessel-screen.js` |
| 1959–2176 | Regras de mapa, barco permitido, viagem e zonas de pesca | `travel-screen.js` / `map-session.js` |
| 2177–2454 | Abas e renderização do Inventário | `inventory-screen.js` |
| 2455–2822 | Abas, renderização, compra, venda e equipamento da Loja | `shop-screen.js` |
| 2823–2864 | Troca de telas e helpers gerais de UI | `game-navigation.js` / `ui.js` |
| 2865–2929 | Narração, pontuação, tensão, indicadores e timers | `accessibility-announcer.js` / `game-hud.js` |
| 2930–2943 | Inicialização automática e API pública `Game` | `app.js` |

## Estado que precisa ser protegido

A refatoração não pode alterar estes conceitos:

- `gameMode`: `normal` ou `free`;
- `state`: estados da máquina de pescaria;
- `currentFish`;
- `fishTired`;
- `tension`;
- `_lureX`, `_lureY`;
- `score` e `best`;
- `activeMap` e `activeZone`;
- timers de mordida, espera, recuperação e tensão;
- chaves de persistência da última captura;
- equipamentos obtidos/equipados no `Inventory`.

## Fronteiras recomendadas

### 1. Núcleo de contexto

Responsável somente por estado, configuração e referências compartilhadas. Não deve criar cartões de Loja nem renderizar peixes.

### 2. Domínio da pescaria

A máquina de estados e a física devem receber dados e emitir eventos/resultado. A lógica não deve depender diretamente de detalhes de CSS ou de texto visual.

### 3. Interface

Renderizadores de HUD, Loja, Inventário, Casa, Estaleiro e painéis devem manipular seus próprios elementos e expor ações claras.

### 4. Acessibilidade

Anúncios, foco, live region e regras de silêncio do TalkBack devem ficar em uma camada identificável. Os textos continuam independentes da arte.

### 5. Navegação

A troca de telas, retorno ao menu e música de cada tela devem ficar juntos, sem misturar física da pescaria ou renderização de catálogo.

## Ordem segura de extração

1. Criar um módulo de seletores DOM e contexto, sem mudar nomes;
2. Extrair helpers de acessibilidade e anúncios;
3. Extrair persistência de última captura;
4. Extrair navegação e troca de telas;
5. Extrair HUD e indicadores;
6. Extrair painéis de equipamento/carga;
7. Extrair Loja e Inventário;
8. Extrair Casa, Estaleiro, viagem e zonas;
9. Extrair entrada de teclado/sensores;
10. Extrair renderização da cena;
11. Extrair física;
12. Isolar a máquina de estados;
13. Trocar scripts globais por módulos ES, somente depois de estabilizar as fronteiras.

## Critério de cada etapa

Cada extração deve:

- Entrar em um commit próprio na `main`;
- Gerar um novo deploy no GitHub Pages;
- Preservar o HTML e os IDs existentes;
- Passar por um smoke test de Loja, Inventário e Pesca Livre;
- Manter a árvore acessível e a leitura do TalkBack;
- Ter um ponto de retorno identificável por commit ou tag;
- Não misturar refatoração com funcionalidade nova.

## Conclusão

O maior ganho não virá de dividir o `index.html`, e sim de reduzir o papel de `game.js` de “dono de tudo” para um coordenador que conecta módulos menores. O release `v0.1.0` é o ponto de retorno antes da primeira extração.
