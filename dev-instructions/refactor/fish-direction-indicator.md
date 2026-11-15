# Especificação de refatoração — apresentação do indicador de direção do peixe

## Estado e limites

Esta especificação foi executada como o primeiro passo de código da sequência aprovada por Anderson em 2026-11-15: refatorações isoladas, com testes após cada passo. Foi uma refatoração somente de apresentação, sem novo comportamento ou conteúdo de jogo.

## Escopo

Mover para o módulo existente `FishingHudView` a atualização DOM do indicador visual/acessível de peixe se aproximando ou se afastando. `Game` continua dono do estado anterior da fase/lado e da decisão de quando atualizar o indicador; física, animação, máquina de estados, sensores e timers permanecem inalterados.

## Contrato que deve ser preservado

- Fases válidas: `approaching` e `retreating`; qualquer outra fase oculta o indicador, remove classes de lado/fase e limpa o anúncio, retornando fase/lado anteriores a `null`.
- Lado inválido ou ausente normaliza para `right`.
- `approaching` aplica seta apontando para dentro; `retreating` aplica seta apontando para fora, com o sentido determinado pelo lado.
- A mensagem de fase é traduzida e anunciada somente quando a fase muda; a mudança de lado pode atualizar a seta sem repetir o anúncio.
- A apresentação deve conservar classes CSS, texto visual, live-region acessível, IDs de DOM, comportamento quando o indicador não está presente e atualização apenas quando referência de seta/lado ou fase exigir.
- A API pública de `Game`, ordem de scripts clássicos, tradução, acessibilidade e gameplay não mudam.

## Implementação

Adicionado `FishingHudView.setFishDirection`, que recebe fase/lado, estado anterior, referências dos elementos e callback de tradução; atualiza o DOM e retorna fase/lado resultantes. Em `Game`, `_setFishDirectionIndicator` permaneceu como adaptador que fornece referências, chama a view e guarda o estado retornado. Cache-buster do script de HUD foi atualizado.

## Resultado e testes/aceitação

Implementado somente na branch `refactor-step-1-module-map`, no primeiro recorte de código após o mapa de responsabilidades. `main`, Pages, tags de release e demo não foram alterados.


1. Novo QA focalizado verifica fases, seta por lado, classes, anúncio em mudança de fase, ausência de repetição ao mudar apenas o lado, limpeza e elementos ausentes.
2. Executar `qa_clothing_shop.py`, `qa_dani_quest.py`, `qa_dani_quest_inventory.py`, `qa_home_decorations.py` e verificar sintaxe JavaScript com o motor disponível.
3. Revisão estática confirmou que `game.js` chama o mesmo adaptador nos mesmos cinco pontos (spawn/destruição/estados de aproximação e recuo); não foram alterados CSS, dados, regras ou strings. O HTML mudou apenas o cache-buster do módulo existente.
4. Não publicar Pages, alterar releases ou tocar na demo nesta etapa.

### Execução em 2026-11-15

- `qa_fishing_direction_view.py`: passou, 17 asserções sobre as duas fases, direção da seta, classes, anúncio de mudança de fase, ausência de repetição ao mudar só o lado, reset, lado padrão e elementos ausentes.
- `qa_clothing_shop.py`: passou, cobrindo catálogo, rotação, starter sets, compra, migração, persistência e equipagem contextual.
- `qa_dani_quest.py`: passou, 155 asserções.
- `qa_dani_quest_inventory.py`: passou, 21 asserções com Inventory real.
- `qa_home_decorations.py`: passou.
- Sintaxe: 51 arquivos JavaScript foram analisados pelo engine DukPy disponível; todos passaram. `node --check` não estava disponível porque Node.js não está instalado no ambiente.
- Smoke test manual do jogo, teclado, TalkBack/NVDA e sensores não foi realizado nesta etapa. A validação manual continua pendente; os testes automatizados não a substituem.

## Fora do escopo

- Mover física, animação, estado da pescaria, sensores, timers ou tradução.
- Reformular ou renomear mensagens/classes/IDs.
- Migrar para ES Modules.
