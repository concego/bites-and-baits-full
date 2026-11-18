# Especificação — Descrição opcional de personagens nos diálogos

**Status:** requisitos de produto aprovados; detalhes de interface e conteúdo ainda precisam ser fechados antes da implementação.
**Origem:** prioridade de acessibilidade definida por Anderson em 2026-11-18.
**Escopo:** permitir que o jogador consulte por iniciativa própria uma descrição textual da aparência de personagens presentes em diálogos.

## Objetivo

Dar a jogadores cegos acesso opcional a informações sobre como são visualmente os personagens que aparecem nas conversas, sem impor a descrição a quem não a solicita e sem inventar características ausentes dos dados do jogo.

## Requisitos confirmados

- A descrição é uma ação explícita, opcional e solicitada pelo jogador durante o diálogo.
- O acesso à ação não depende de uma troca de roupa nem de qualquer outra mudança de aparência. Ela pode ser usada quantas vezes o jogador quiser, inclusive repetidamente sem que o estado visual tenha mudado.
- Cada solicitação deve refletir os dados atuais da aparência e da roupa que o personagem está usando no momento; não usar um texto fixo ou desatualizado quando esses dados mudarem.
- Se a aparência do personagem ainda não estiver definida, o jogo deve informar isso claramente. Não inventar, inferir nem preencher características ausentes.
- A descrição não deve ser anunciada automaticamente nem interromper o diálogo sem solicitação.
- O recurso deve funcionar de forma acessível por teclado e leitor de tela, seguindo os padrões gerais do repositório para foco, rótulos, semântica e anúncios.
- Incluir textos em português do Brasil, inglês e húngaro, conforme o suporte de localização atual do jogo.
- A descrição deve ser derivada somente de dados conhecidos do jogo. Não afirmar detalhes visuais que não estejam representados nos dados disponíveis.

## Relação com a criação de NPCs

A direção de design é criar uma ferramenta de autoria de NPCs que reutilize o sistema modular do personagem do jogador e facilite definir aparência, representação física e descrições. A descrição consultada durante o diálogo deve refletir apenas dados efetivamente definidos para aquele personagem e suas roupas atuais; se os dados relevantes não estiverem definidos, informar isso sem inventar características.

A forma concreta do criador (ferramenta externa de autoria ou interface no próprio jogo) ainda não está decidida e não deve ser presumida nesta especificação. As decisões pendentes abaixo sobre alvo, integração, conteúdo e estado incompleto continuam bloqueando a implementação do botão de descrição até serem resolvidas.

## Restrições

- Não alterar aparência, roupa, identidade narrativa, atributos, economia ou gameplay.
- Não acrescentar áudio próprio ou TTS para ler a descrição.
- Não tornar a descrição requisito para avançar, aceitar ou concluir uma conversa.
- Não remover nem substituir o texto atual dos diálogos.

## Decisões ainda necessárias — bloquear implementação até resolver

1. **Alvo em diálogos com várias pessoas:** determinar como o jogador escolhe qual personagem descrever quando uma cena inclui, por exemplo, o jogador e um NPC. Definir se haverá uma ação por pessoa ou outro mecanismo inequívoco e acessível. Não escolher por suposição.
2. **Locais de integração:** identificar todos os diálogos e cenas narrativas que exibem personagem e estabelecer se a primeira entrega cobre todos ou um recorte. A prioridade se refere a personagens nos diálogos, mas o código atual tem mais de um fluxo de conversa.
3. **Conteúdo e nível de detalhe:** definir quais componentes da aparência e roupa devem ser mencionados e em que ordem, considerando apenas dados existentes. Não inventar uma ficha completa por analogia com o criador.
4. **Dados incompletos:** definir a mensagem exata por idioma e se, havendo apenas parte da aparência definida, a descrição apresenta somente os dados conhecidos ou informa que a descrição está incompleta.
5. **Apresentação e anúncios:** definir como a resposta solicitada é exposta no fluxo de diálogo e como pode ser relida sem mover foco inesperadamente nem criar anúncios redundantes.

## Critério de bloqueio

A IA pode inspecionar os componentes atuais de diálogos, dados de aparência, roupas e localização para preparar uma proposta de implementação. Não deve editar código até as decisões acima que afetem o escopo e a experiência estarem respondidas e os requisitos aprovados estiverem completos. A criação desta especificação não autoriza publicar no Pages, atualizar releases nem alterar a demo.

## Validação necessária após implementação futura

- Confirmar que a ação permanece disponível e pode ser repetida sem mudança de roupa ou aparência.
- Trocar a roupa/aparência de cada tipo de personagem coberto e confirmar que a solicitação seguinte descreve o estado atual, sem informação antiga em cache.
- Confirmar que aparência indefinida ou incompleta nunca leva a características inventadas.
- Testar os fluxos cobertos em português, inglês e húngaro, com teclado e leitor de tela.
- Confirmar que nenhuma fala/descrição ocorre automaticamente e que o diálogo continua utilizável sem acionar o recurso.
- Separar resultados de QA automatizado e validação manual; não declarar aprovação manual sem confirmação de Anderson.
