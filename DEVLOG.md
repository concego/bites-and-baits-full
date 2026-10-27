# Bites & Baits — Devlog de desenvolvimento

Documento de controle do desenvolvimento, complementar ao GDD. O GDD descreve direção de design e trabalho futuro; este devlog registra o que foi construído, testado, publicado e validado, com o estado conhecido ao fim de 2026-10-03. Mantido no repositório para consulta e download, mas não deve ser anexado às releases nem incluído no pacote executável do jogo.

Este devlog foi consolidado a partir do histórico de desenvolvimento preservado no GDD, nos registros de publicação/QA e nas conversas disponíveis. Onde não há registro suficiente de uma data exata, o marco é descrito por período, sem inventar detalhes. Propostas e decisões ainda sem implementação aparecem apenas na seção final de estado pendente, não como trabalho concluído.

## Como ler os estados

- **Implementado localmente:** existe na cópia de trabalho, mas não necessariamente foi publicado.
- **QA automatizado aprovado:** os testes registrados passaram; isso não equivale a validação manual por Anderson.
- **Publicado no Pages:** a versão de teste pública no GitHub Pages recebeu a alteração.
- **Incluído em release:** a tag indicada foi movida para o commit confirmado.
- **Validado manualmente:** Anderson ou um tester confirmou o fluxo pelo meio registrado. Não inferir validação de TalkBack, NVDA, teclado, sensores ou visual a partir de testes automatizados.

## Visão geral do produto construído

Bites & Baits é um jogo de pesca com modo História e Pesca Livre, criação de personagem, equipamentos, inventário, mapas, embarcações e NPCs. O núcleo jogável combina uma pescaria baseada em ações e controle de tensão, progressão e espécies, com uma vila que oferece serviços e conversas. O projeto prioriza acessibilidade com leitores de tela e teclado, mantendo movimento por sensores como opção/diferencial e não como único meio de jogar.

Ao longo do desenvolvimento, sistemas de História foram integrados ao núcleo: introdução do personagem e chegada à Vila Barra Serena; orientação contextual de Zeca; loja de roupas da Marta; quest de Dani; recompensa persistente de decoração; e conteúdo pós-quest. A versão pública de teste e as três tags de release foram, por autorização de Anderson, alinhadas ao commit `c276447c05fcb75252fb70708b71c3532344e3d3` em 2026-10-02.

## Linha do tempo

### 2026-08-13 a 2026-08-16 — Base jogável

Foi consolidada a primeira estrutura jogável, com telas e navegação, pesca, modos, inventário, mapas e publicação inicial no GitHub Pages. O projeto ganhou uma base funcional sobre a qual foram adicionadas a progressão, a História e os serviços da vila.

Os registros disponíveis identificam esses elementos como parte da base, mas não preservam um inventário detalhado de cada implementação diária desse período. Portanto, este marco não atribui funcionalidades adicionais sem confirmação documental.

### 2026-08-23 — Introdução, vila e progressão inicial

Foi implementado o fluxo de criação/introdução narrativa: correspondência do personagem, resposta, viagem, participação de Vitor na chegada e desembarque na Vila Barra Serena.

A primeira visita aos Artigos de pesca do Zeca passou a apresentar uma recepção e uma entrega única de equipamento inicial. O conjunto concedido é uma Vara Simples (`rod_basic`), Linha Monofilamento (`line_mono`), Anzol Simples (`hook_basic`), Boia Simples (`float_basic`), Cesto Básico (`basket_basic`) e 30 minhocas. O conjunto é equipado automaticamente e o saldo normal inicial é zero moedas.

As descrições e falas do jogador passaram a respeitar os perfis gramaticais feminino, masculino e neutro. A experiência não deve presumir um gênero gramatical incompatível com a escolha do jogador.

Foi implementado o sistema Pessoas presentes com menus persistentes, NPCs ligados aos locais, conversas padrão e eventos contextuais. Zeca não antecipa em conversas comuns o requisito de equipamento do Rio Doce. Depois de uma tentativa frustrada de pesca nesse local com equipamento inadequado, a conversa contextual explica a necessidade de uma Vara Média ou superior.

A exigência de vara é verificada tanto na margem quanto no mapa navegável do Rio Doce. O acesso navegável também requer Barco de Alumínio ou Lancha; o barco não substitui a exigência da vara. A fala sobre correnteza é acionada pela tentativa de pescar, e o bloqueio não consome a isca.

Registros de releases desse período confirmam atualização e validação das tags `v2.3.0-test` e `v2.5.0` no commit `8375e4f2257776116f6aa6339093c871cd2b7531`.

### 2026-08-24 — Direção dos sistemas maiores

O GDD foi reorganizado como documento de projeto e passou a distinguir direção futura de histórico de implementação. Foram registrados os objetivos centrais da História: quitar o financiamento da casa e construir o parque Iscas&mordidas como sandbox. Essa definição foi planejamento, não implementação do financiamento ou do parque.

Também foram registradas referências de design: Action Bas para a pesca; Harvest Moon: Back to Nature para vila, NPCs e calendário; Stardew Valley para refinamento e integração. A divisão da vila em áreas e uma hierarquia de interface por contexto local e informações do personagem foram planejadas, não implementadas como arquitetura completa nessa data.

Stamina, conforto/bem-estar, melhorias da casa, minigames, viagens exploráveis e sistemas do parque foram registrados para planejamento futuro. Não são parte do sistema jogável confirmado neste devlog.

### 2026-09-11 — Medidas individuais dos peixes e Pesca Livre

O sistema de dados físicos dos peixes foi ajustado para usar faixas de referência biológica em vez de limites artificiais de jogo. O tamanho e o peso individuais passaram a participar do cálculo de moedas no modo História e de pontuação na Pesca Livre; a raridade da espécie no mapa permanece distinta da raridade do exemplar capturado.

Foi implementado um protótipo de geração correlacionada de medidas e raridade do exemplar. Os testes registrados cobriram faixas, raridade e pontuação e passaram com 16.813 asserções na execução relatada.

Na Pesca Livre, pontos de captura alimentam progressão por níveis e liberam novas espécies. Foram organizados quatro níveis e quatro encontros de Boss. O jogador precisa capturar o Boss para avançar; fugir reinicia o nível e remove os pontos acumulados nesse nível. O QA lógico registrado passou para avanço e reinício.

### 2026-09-30 — Feedback externo, layout e informação acessível

O tester externo Paulo Ribeiro apontou que o criador de personagem exigia rolagem para comparar opções e avatar, percebeu a posição baixa do pescoço, sugeriu um indicador visual para o movimento do peixe e relatou receber dicas de inclinação no PC. Também avaliou positivamente os sons.

Foram implementados no Pages:

- disposição lateral do criador para facilitar comparação entre avatar e opções;
- ajuste visual da ligação entre pescoço e torso;
- marcador visual para indicar aproximação/afastamento do peixe;
- instruções adaptadas à modalidade de controle, em PT/EN/HU, sem apresentar dicas de inclinação como se todos estivessem usando sensores.

O QA automatizado registrado incluiu sintaxe de 42 arquivos JavaScript, integração dos dados de 14 espécies e 4 mapas, cerca de 16.812 asserções da Pesca Livre, testes de controles, marcador, traduções e 750 SVGs. A disposição e o pescoço foram verificados no navegador a 1366×768; o marcador de aproximação foi observado. Confirmação do estado visual de afastamento, TalkBack/NVDA e sensores físicos ficou pendente. O registro de publicação informa que as quatro frentes chegaram ao Pages; não comprova validação manual completa.

Também foi corrigido o HUD da Pesca Livre: o botão “Menu Principal” sobrepunha informações de recorde e nível. O botão foi movido ao fluxo normal, abaixo do HUD. A disposição foi verificada no Pages em 1366×768. Commit `12ef3f8d83f27b3180d324612f9793b620e4f2d0`; as releases oficial e de teste não foram alteradas nessa correção.

Em resposta à dificuldade de perceber diferenças entre puxar, manter neutro e soltar a linha, foi detalhada a mecânica desejada: puxar dá progresso e aumenta tensão; neutro estabiliza tensão enquanto o peixe luta e se cansa; soltar reduz tensão sem cansar, mas perde progresso. Essa especificação foi discutida como necessidade de protótipo. A ficha de contexto posterior confirma que o protótipo IDEA-031 foi implementado e publicado no Pages e nas pré-releases beta/risk, preservando a linha rompendo em tensão 100. A regra de projeto é manter compatibilidade entre teclado e sensores. Os registros fornecidos aqui não incluem detalhes suficientes para documentar todos os testes desse protótipo ou declarar sua validação manual.

### 2026-10-01 — Relato da captura e Bosses

A informação automática após a captura foi reformulada para soar como um relato dirigido ao jogador, em vez de uma sequência de rótulos técnicos. Foram mantidos porte, espécie, medidas, raridade e valor/pontuação/local conforme o modo; detalhes completos seguem consultáveis por comando de releitura. O resumo automático deve ser conciso para não interromper o ritmo entre pescarias.

Os testes registrados para essa etapa incluíram sintaxe de 42 arquivos JS, integração de 14 espécies/4 mapas, 16.815 asserções de Pesca Livre, QA do feedback e verificações focadas em traduções e campos opcionais/zero. A validação manual com TalkBack/NVDA e revisão da naturalidade, especialmente em húngaro, ficaram pendentes na data do registro inicial.

Bosses foram definidos como exemplares de comprimento e peso extremos, mas biologicamente plausíveis, com qualidade de troféu e resistência máxima prevista. Na Pesca Livre, eles são encontros nos marcos da progressão. A geração de extremos para 14 espécies passou no QA, incluindo 16.862 asserções da Pesca Livre. O recurso foi publicado no Pages e incluído em `v2.6.0-test` e `v2.6.0-risk` no commit `0fd9ca4024f4d653710a5cd5e968f93fdd2bf4e3`; a release oficial não foi movida nessa etapa. A validação manual acessível permaneceu pendente.

Na História, Bosses foram planejados para encontros de missões principais ou secundárias, não como aparições periódicas automáticas; as quests são o meio de contextualizar esses encontros.

### 2026-10-02 — Loja de roupas, criador e quest de Dani

#### Loja de roupas da Marta

Foi criada a loja de roupas como estabelecimento acessado inicialmente pelo hub da vila. Marta foi definida como atendente e NPC. A loja foi implementada antes de liberar a primeira quest, pois a existência/carregamento do módulo da loja é um dos requisitos de disponibilidade de Dani.

O catálogo atual é composto por 38 variantes de cor organizadas em 16 modelos. Os nomes apresentam tipo/corte da peça separadamente de sua cor. Uma variante por modelo aparece na rotação diária, determinada pelo calendário do jogo; reabrir a loja não rerrola o estoque e roupas já compradas continuam acessíveis. Os preços registrados, entre 8 e 22 moedas, são provisórios. Peças dos conjuntos escolhidos na criação são concedidas gratuitamente.

A primeira versão da loja foi publicada no Pages no commit `06252296cf8d0779ce950aabdd6a6460166e99d9`; nessa primeira versão havia 20 peças. Uma revisão posterior publicada no commit `b4e058753ae4fe1ccf02f159286fa43aeb7b2a69` elevou o catálogo a 38 variantes em 16 modelos. O build `37011055081` concluiu e os arquivos foram conferidos no Pages.

A seleção de roupas do criador também foi refinada. Os cinco conjuntos de chegada e cinco de pesca passaram a ser opções de rádio com descrições das peças sob demanda, cada conjunto com botão para abrir/fechar a descrição. A lista fica recolhida inicialmente; a prévia, o resumo e a validação são atualizados com a seleção. O catálogo é compartilhado com a loja, e as descrições estão em PT/EN/HU. QA local confirmou as dez opções, botões e mudança de resumo, além da sintaxe e integração de dados.

A publicação dessa interface ocorreu no Pages no commit `78aaa744c531c77c93acb8356a3d0adc3aff862c`, em 2026-10-02 às 15:11. O fluxo foi conferido no navegador, inclusive com reconhecimento dos grupos/opções e botões de descrição. Somente a tag `v2.6.0-risk` foi movida para esse commit às 15:27; oficial e beta permaneceram no commit anterior. Às 14:18, uma revisão antecedente de detalhamento de roupas do criador havia sido publicada no Pages e apenas a tag risk atualizada para `80860d0d08f508e4cece03915e01bc8a94cb169b`; às 14:30, após confirmação de Anderson, as três tags foram alinhadas a esse commit.

O fluxo local foi refatorado para que as roupas compradas entrem no inventário do jogador e possam ser equipadas pela aba Roupas, em contextos separados de dia a dia e pesca. Vestir e trocar roupas não exige um móvel. Foi contemplada migração dos dados antigos de `bb_wardrobe_v1`, mantendo roupas iniciais, propriedade, equipagem e persistência.

O guarda-roupa como móvel de armazenamento foi explicitamente adiado e não deve ser exposto/desbloqueado na versão inicial. O parentesco Marta–Dani deve permanecer secreto até a conclusão da quest: não aparece na loja, em Pessoas presentes nem em falas comuns da Marta.

O QA local registrado para a revisão da loja cobriu 38 variantes/16 modelos, rotação nos dois contextos, peças iniciais, compra sem cobrança duplicada, equipagem independente, persistência, migração e traduções PT/EN/HU; também passaram sintaxe (49 arquivos JS em uma execução) e integração de dados (14 espécies/4 mapas). A revisão local não deve ser confundida com publicação; o estado público final está descrito abaixo.

#### Quest fixa “O lambari de Dani”

Foi implementada a primeira quest da História, com Daniel “Dani”, garoto de aproximadamente 10 anos. Ela só fica disponível depois da entrega do equipamento inicial de Zeca e com a loja de roupas carregada. Dani pede que o jogador encontre de manhã, na zona Margem do Lago (`lago_margem` / `margem`), um lambari excepcional que ele observou.

A quest dispara um Boss lambari exclusivo da História, com comprimento/peso máximos biologicamente plausíveis, qualidade de troféu e resistência de Boss baseada no nível máximo atual. O estado persiste; a recompensa é idempotente. O peixe da quest fica vinculado/protegido contra venda, descarte e venda em lote; ao entregá-lo a Dani, o peixe é removido. A comunicação da captura e a solicitação de retorno foram combinadas para evitar interrupção desnecessária no fluxo acessível.

A recompensa inclui o desenho do lambari registrado como item persistente de Decoração e 10 moedas provisórias (não é valor final aprovado). O saldo foi corrigido para atualizar o HUD e a mensagem de recompensa informa tanto o valor recebido quanto o saldo total. A grafia usada por Dani em português é “piau”.

Depois de concluir a quest, um Boss lambari ambiental distinto tem 5% de chance por dia do jogo de aparecer pela manhã na Margem do Lago. O sorteio é persistido e consumido para evitar novo sorteio ou encontro duplicado no mesmo dia. Esse exemplar não é o peixe de missão e pode ser vendido por 10 moedas. A camiseta lisa verde-sálvia `top_marta_courtesy` é um presente único de Marta após a conclusão, fora da rotação comercial; se a conversa for interrompida antes da entrega, o presente fica disponível na próxima entrada. Só o diálogo de retorno após a captura revela que Marta é mãe de Dani.

O primeiro QA focado passou com 108 verificações; após as clarificações e conteúdo pós-quest, `qa_dani_quest.py` passou com 155 verificações e `qa_dani_quest_inventory.py` com 21 verificações de integração com Inventory real. Também passaram `qa_home_decorations.py`, `qa_clothing_shop.py`, `qa_data_integration.py`, `qa_free_fishing.py` (16.864 asserções na execução registrada), `qa_fishing_dynamics.py` e `qa_syntax.py` (51 arquivos JavaScript). As contagens de Pesca Livre podem variar entre execuções devido à progressão aleatória.

O Pages recebeu a implementação completa no commit `c276447c05fcb75252fb70708b71c3532344e3d3`; o build `1256007559` concluiu como `built`. A página e scripts foram verificados ao vivo. Às 19:44, por autorização explícita de Anderson, as tags `v2.6.0`, `v2.6.0-test` e `v2.6.0-risk` foram todas movidas para esse commit. Os textos e anexos das releases não foram alterados. A validação manual final da atualização com navegador, teclado e TalkBack continua pendente segundo o último registro.

### 2026-10-03 — Planejamento retomado; sem implementação de código

Nesta data foram discutidos inventário unificado, atributos, Stamina, Conforto, Saciedade, Presença, Inteligência, loja de móveis, tipos de casa, cômodos, freezer, eventos em casa e novos estabelecimentos da vila. As conversas resultaram em atualizações ao GDD e ao backlog; não há implementação de código confirmada para esses pontos.

O estado observado do código nessa discussão era: categorias de inventário filtram a lista visual, mas usam coleções separadas; peixes são instâncias individuais, iscas se agrupam por tipo, e roupas, equipamentos e decoração têm armazenamentos próprios. Os limites de pesca existentes são separados: cesto básico 8, reforçado 12, grande 16; embarcações variam de 8 a 250. Não existia um limite global de peso/carga do personagem nem o novo limite proposto de 12 tipos distintos.

A categoria Decoração e o item persistente `dani_lambari_drawing` já estavam implementados e publicados, mas a colocação física na casa não existia. As reformas e expansões discutidas como serviço da construtora, inventário da casa por peso/volume, freezer, loja de móveis e os cômodos/atividades são planejamento futuro, não sistemas implementados.

## Sistemas jogáveis confirmados no último estado documentado

### Pesca e modos

- Núcleo de pesca com estados de lançamento, espera, mordida e combate, integrado a vara, linha, anzol, boia, isca e capacidade de carga.
- História e Pesca Livre como modos distintos.
- Em História, a captura converte dados individuais do peixe em moedas; na Pesca Livre, gera pontuação e progressão.
- Comprimento e peso do exemplar são tratados como medidas individuais baseadas em faixas biológicas de referência.
- Pesca Livre inclui progressão por pontos, níveis e encontros Boss; escapar do Boss reinicia o nível corrente e remove os pontos daquele nível.
- Sistema de tensão/combate e diretrizes de puxar, neutralizar e aliviar; IDEA-031 está publicada no Pages/beta/risk, mas a validação manual continua pendente.
- Resumo de captura em linguagem natural, com detalhes consultáveis por releitura; o aviso automático é curto para preservar o ritmo.

### Personagem, controles e acessibilidade

- Criação de personagem com perfis gramaticais feminino, masculino e neutro e opções de aparência/roupas.
- Opções de roupa no criador apresentadas como grupos de rádio, com descrições de conjuntos sob demanda.
- Controle por teclado como alternativa funcional aos sensores; as mensagens são adaptadas ao controle ativo.
- TalkBack/leitores de tela fazem parte da interface; o jogo não adiciona TTS próprio que duplique a fala do leitor.
- Uso de headings, regiões acessíveis e anúncios semânticos conforme os módulos e fluxos implementados.
- Não declarar acessibilidade manual completa sem validação por Anderson ou tester no dispositivo/leitor relevante.

### Vila, NPCs e economia

- Introdução narrativa, chegada à Vila Barra Serena e presença de Vitor.
- Artigos de pesca do Zeca com entrega inicial única.
- Conversas padrão e eventos contextuais em Pessoas presentes.
- Bloqueio de pesca no Rio Doce com requisito de Vara Média ou superior; acesso navegável também requer barco adequado.
- Estaleiro e sistema de embarcações vinculados aos níveis atuais de casa/garagem/doca.
- Loja da Marta com catálogo rotativo de roupas, preços provisórios, inventário/equipagem e presente de pós-quest.
- Quest de Dani e conteúdo pós-conclusão conforme descrito na cronologia.

### Casa e inventários: capacidades atuais e limites

- A tela da casa mostra nível atual, próxima melhoria e informações de armazenamento de barcos. Os níveis codificados são Barraco, Casa Simples, Casa com Garagem e Casa com Doca Privada.
- O modelo codificado segue upgrades lineares, com valores e capacidades definidos em `house-data.js`; não corresponde ainda à proposta de tipos de casa com reformas independentes e compatibilidade por estrutura.
- Itens de decoração são persistidos e consultáveis no inventário; colocação e interação física na casa ainda não existem.
- Não existe ainda inventário doméstico geral com capacidade por peso/volume, freezer, loja de móveis, cômodos instaláveis ou usos por objeto.

## Publicação e versões conhecidas

- GitHub Pages é o ambiente público de teste do projeto.
- Última publicação integral confirmada neste histórico: `c276447c05fcb75252fb70708b71c3532344e3d3`.
- Build Pages correspondente: `1256007559`, status `built`.
- Após autorização de Anderson em 2026-10-02 19:44, `v2.6.0`, `v2.6.0-test` e `v2.6.0-risk` apontavam todas para `c276447c05fcb75252fb70708b71c3532344e3d3`.
- Não foram alteradas notas nem anexos das releases no alinhamento final.
- A revisão manual de acessibilidade da atualização final, com navegador, teclado e TalkBack, não estava confirmada no registro.

## Pendências de validação relativas ao conteúdo já implementado

Estas pendências não significam que o código não exista; indicam verificações humanas ainda não confirmadas:

- Validar manualmente no Pages os fluxos recentes da quest de Dani e da loja, com navegador, teclado e TalkBack.
- Confirmar os anúncios e a navegação de inventário/decoração com TalkBack.
- Validar o criador, a loja de roupas e os perfis de controle no uso manual; QA automatizado não substitui esse passo.
- Concluir a verificação manual de IDEA-031 com teclado, TalkBack/NVDA e sensores físicos.
- Obter/confirmar retorno visual externo para marcador de aproximação/afastamento quando disponível.

## Planejamento ainda não implementado (não contar como entregas)

Registrado no GDD em 2026-10-03:

- Inventário pessoal unificado por filtros, 12 tipos de itens distintos, pilhas de unidades iguais e peso por unidade; peso máximo e relação com cestos/barcos ainda sem definição.
- Atributos Força, Presença e Inteligência, além de Stamina, Conforto e Saciedade; escalas, fórmulas, progressão e efeitos ainda por definir.
- Sistema da casa revisto: tipos/estilos com diferentes cômodos e melhorias, reformas e expansões por construtora (cobradas separadamente da dívida recorrente), compatibilidades por estrutura e inventário doméstico limitado por peso/volume.
- Freezer: peixes guardados deixam de contar como vivos, podem ser consumidos, usados em quests de comida ou vendidos a comerciantes específicos; criadores não comprariam e eles não poderiam abastecer o parque.
- Cômodos e itens funcionais, como fogão, com requisitos de utensílios, ingredientes, receitas e habilidade.
- Eventos e atividades em casa, inspirados em Popmundo, sem restringir-se a esporte e festas.
- Loja de móveis e novos estabelecimentos planejados para a vila: restaurante, academia, escola, pub, prefeitura, mercado pequeno e correios. Funções específicas da prefeitura, mercado e correios ainda não definidas.
- Definir aparências visuais ainda ausentes para os NPCs Zeca, Marta e Dani; Vitor já tem preset.

Nada nesta lista foi implementado por causa da discussão de 2026-10-03; foi registrado apenas como planejamento.

## Manutenção deste devlog

Ao concluir uma etapa futura, registrar data, objetivo, implementação real, sistemas/arquivos afetados, migrações e persistência, testes, validação manual, problemas corrigidos, publicação/commit e release autorizada. Manter separados os estados local, QA, Pages, release e validação do produtor. Atualizar este documento quando houver progresso relevante; não transformar propostas de GDD em entregas concluídas.
