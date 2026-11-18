# Bites & Baits — Brainstorming e reserva de desenvolvimento

**Data de consolidação:** 2026-11-15  
**Repositório-alvo:** `concego/bites-and-baits-full`  
**Propósito:** reunir ideias, decisões de direção e trabalho ainda não consolidado em especificações de implementação. Este arquivo é uma reserva para organizar possibilidades, não uma ordem para a IA implementar tudo o que aparece aqui.

## Como usar este arquivo

- O devlog registra trabalho efetivamente feito, QA, publicação, releases e validação. Este documento registra o que ainda pode ser decidido, planejado, especificado ou prototipado.
- Não alterar o repositório da demo, sincronizar arquivos para ele ou publicar nele sem autorização explícita de Anderson.
- Não iniciar implementação só porque uma ideia aparece aqui ou tem status “direção aprovada”. Primeiro selecionar com Anderson o item ou recorte que será desenvolvido.
- O fluxo de aprovação é explícito: Anderson e Zapia discutem a ideia nesta conversa; Anderson aprova ou rejeita. Rejeitada, ela não vira trabalho de implementação. Aprovada, somente o conteúdo aprovado é extraído para um documento separado de especificação de implementação em `dev-instructions/`, com objetivo, escopo, regras, estados, dependências, persistência, acessibilidade, traduções, testes e critérios de aceitação. Esse documento aprovado é a fonte de instruções para a IA que fará o código.
- A IA de implementação não deve consultar este brainstorming, nem decidir por conta própria que uma ideia aqui está aprovada. Se não houver uma especificação de implementação aprovada para a tarefa, não deve começar a codificar com base neste arquivo.
- Uma especificação aprovada não autoriza automaticamente publicar no Pages nem mover releases. Desenvolvimento, teste, publicação e validação são etapas separadas.
- Depois da implementação, registrar fatos no devlog. Manter aqui o item original como referência, atualizar seu status e apontar a especificação resultante quando existir.
- Preservar a ideia como foi concebida. Se houver conflito, falta de decisão ou várias soluções possíveis, perguntar a Anderson, sem escolher silenciosamente.
- Não marcar item como entregue com base em teste estático ou só por estar mencionado no README. Conferir código e commit; separar QA automatizado de validação manual.

## Status

- **Direção aprovada:** norte de design aceito, mas ainda não significa sistema implementado nem especificação completa.
- **Ideia em análise:** possibilidade a avaliar; não é compromisso de fazer.
- **Pendente de decisão:** falta escolha de Anderson ou regra de design.
- **Pendente de especificação:** a direção está definida, mas faltam regras suficientes para orientar implementação.
- **Pendente de validação:** há implementação conhecida; falta teste manual ou aprovação. Não é automaticamente uma feature nova.
- **Proposta registrada:** consta em snapshot ou anotações, mas precisa ser reconfirmada antes de virar direção ativa.

## Fora deste brainstorming: sistemas já implementados

Não listar aqui como trabalho futuro as funcionalidades que já constam no código de jogo do commit `c276447c05fcb75252fb70708b71c3532344e3d3`, a menos que haja uma melhoria explicitamente pendente:

- pesca principal, História e Pesca Livre;
- medidas individuais de peso/comprimento, raridade e pontuação/progressão por Bosses;
- IDEA-031 e anúncio curto de captura;
- criador de personagem e introdução até a Vila Barra Serena;
- entrega inicial de equipamentos por Zeca, menu Pessoas presentes e bloqueio narrativo/equipamento do Rio Doce;
- sistema atual de equipamentos, iscas, mapas, zonas, inventário, barcos e quatro níveis lineares da casa;
- loja de roupas de Marta, rotação e equipagem pelo inventário;
- quest fixa de Dani, peixe de missão protegido, decoração em inventário, evento ambiental pós-quest e presente de Marta.

O código de quest marca a recompensa narrativa de 10 moedas como valor temporário de balanceamento; não tratar como decisão final. A decoração pode existir no inventário sem haver colocação física na casa.

A validação manual continua sendo tema separado: o devlog mantém pendente a revisão de fluxos recentes com navegador/teclado/TalkBack e de IDEA-031 com leitores de tela e sensores físicos. A pendência de validação não transforma a feature existente em ideia não implementada.

## 1. Nortes de design já aprovados

Estes pontos são compromissos de direção para orientar futuras especificações; não são declarações de que os sistemas estejam implementados.

### 1.1 Dois objetivos centrais da História

- **Financiamento da casa:** objetivo de curto/médio prazo com prazo e cobranças recorrentes; o jogador planeja pagar sem deixar de evoluir.
- **Parque Bites & Baits / Iscas&mordidas:** objetivo de longo prazo, sandbox, sem prazo nem ordem obrigatória de construção.
- O parque é temático sobre pesca. Tanques/viveiros e uma atividade de Pesque e Pague são a base mínima planejada. Parque aquático é expansão opcional, não requisito para realizar o sonho.
- O primeiro jogo deve ter final completo: o jogador escolhe inaugurar, o jogo simula um período de funcionamento e explica o resultado (lucro, prejuízo, falência ou sucesso), encerrando a campanha de gerenciamento.
- O jogo não deve ficar num “beta eterno”. Operação contínua aprofundada pode pertencer a uma eventual continuação/spin-off não canônico.
- No futuro, o jogador deve poder salvar voluntariamente antes da avaliação, conhecer o resultado e carregar o estado anterior para ajustar o parque e tentar de novo, sem sobrescrever o save de preparação.

### 1.2 Casa e liberdade estratégica

- Somente o mínimo de casa/terreno necessário para começar a construção do parque será obrigatório.
- Melhorias adicionais, móveis, comodidades, armazenamento, garagem, doca, conforto e decoração devem ser opções estratégicas, não uma árvore obrigatória de upgrades.
- Serviços de reforma/expansão da construtora são separados da dívida recorrente do financiamento.
- Sistemas da casa devem acrescentar escolhas úteis sem criar microgerenciamento punitivo nem bloquear o arco principal.

### 1.3 Acessibilidade e formas de controle

- Pessoas cegas e videntes participam da mesma experiência, sem uma versão separada.
- Sensores são um diferencial, não o único acesso à pesca, narrativa, relações, progressão ou parque.
- Teclado e celulares sem sensores devem ter uma experiência completa e atraente, não um fallback inferior.
- Não duplicar com TTS próprio o conteúdo que o leitor de tela pode ler. Informações essenciais devem existir em texto acessível.
- Minigames, viagens exploráveis e mecânicas baseadas em movimento devem ter alternativa acessível e não bloquear progressão.

### 1.4 Inspirações, não modelos a copiar

- Action Bas: sensação e núcleo da pescaria.
- Harvest Moon: Back to Nature: funções de NPCs, organização da vila e calendário.
- Stardew Valley: integração, refinamento e liberdade.
- The Sims, Stardew Valley e Popmundo: referências para casa, móveis, utilidade e gestão cotidiana.
- Usar princípios e criar identidade própria para Bites & Baits; não copiar sistemas inteiros.

## 2. Blocos de trabalho ainda não consolidados

### 2.1 Financiamento e economia de longo prazo

**Status: direção aprovada; especificação pendente.**

Definir e, quando escolhido, especificar:

- valor total financiado, parcela, frequência, vencimento e prazo;
- período de carência e possibilidade de antecipar pagamentos;
- como mostrar saldo, parcela seguinte e situação do financiamento;
- consequências proporcionais e reversíveis para atraso; não implementar despejo ou perda definitiva sem decisão explícita;
- como a renda da pesca, vendas, compra de equipamentos, embarcações, casa e parque se equilibram;
- como distinguir a dívida da casa dos serviços posteriores da construtora;
- duração do calendário, passagem de dias e impacto das viagens/atividades;
- critérios de teste que mostrem caminhos viáveis sem uma única sequência obrigatória.

As condições concretas ainda não estão aprovadas. Não inventar valores, datas ou punições.

### 2.2 Construção, operação inicial e final do parque

**Status: direção aprovada; escopo e regras pendentes.**

Ainda precisa de decisão e/ou especificação:

- requisito mínimo exato de casa/terreno para iniciar;
- catálogo inicial de estruturas e atrações diretamente ligadas à pesca;
- como tanques/viveiros e Pesque e Pague funcionam no mínimo do parque;
- terreno, posicionamento, personalização, circulação e acessibilidade das informações espaciais;
- custos, recursos, manutenção e relação com a economia e o financiamento;
- se construções são decorativas, funcionais ou ambas;
- visitantes, demanda, capacidade e fontes de receita;
- relação entre espécies capturadas, exposição, tanques e venda de experiências;
- quais estruturas são necessárias para permitir ao jogador declarar inauguração, sem abrir automaticamente;
- duração e regras da simulação final, determinismo/aleatoriedade e explicação causal do resultado;
- diferenças entre lucro, prejuízo, falência e sucesso;
- conteúdo narrativo de encerramento e apresentação da trajetória do jogador;
- como permitir save voluntário antes da tentativa, preservar o estado e voltar ao desenvolvimento após o relatório.

A avaliação final deve usar o parque real construído e explicar por que teve aquele resultado. Não transformar a inauguração em sorteio opaco ou destruir permanentemente o desenvolvimento.

### 2.3 Peixes em tanques e saúde aquícola

**Status: direção aprovada com opções ainda abertas.**

- Não exigir compra de alevinos nem reprodução para abrir o parque.
- Não assumir que qualquer peixe capturado colocado num tanque se reproduz automaticamente.
- Decidir se peixes capturados podem ser destinados a exposição/criação, quais condições e espécies podem participar e como representar saúde/qualidade da água sem virar outro simulador técnico.
- Alevinos comprados podem ser uma opção previsível, não requisito.
- Veterinário ou especialista em saúde aquícola é investimento opcional de longo prazo, nunca exigência de abertura. Definir custo, frequência e benefícios somente quando selecionado para especificação.
- Definir se quarentena, alimentação, lotação, manutenção, reprodução e saúde entram no primeiro recorte ou ficam para expansão.

### 2.4 Casa, reformas, cômodos e itens

**Status: direção aprovada para opcionalidade; proposta de sistema ainda precisa de projeto.**

- Avaliar diferentes tipos/estilos de casa, cada qual com cômodos, melhorias e ampliações compatíveis, em vez de aplicar a mesma lista de upgrades a todos os modelos.
- Definir relação entre estrutura da casa e garagem/doca/armazenamento de barcos. A proposta cita que uma cabana não comportaria doca privada, mas poderia receber quintal; a matriz completa não existe.
- Casa poderá ter inventário próprio limitado por peso/volume para excedentes do inventário carregado. Capacidade, itens aceitos e interface estão pendentes.
- Freezer é uma proposta funcional: peixes guardados deixam de contar como vivos; poderiam ser consumidos, usados em quests culinárias ou vendidos a comerciantes específicos, mas não usados para abastecer parque nem vendidos a criadores. Ainda requer confirmação e regras detalhadas.
- Cozinha/fogão poderiam habilitar preparo com utensílios, ingredientes, receitas e habilidade pertinente. Nada disso está especificado como sistema pronto.
- Móveis podem oferecer conforto, utilidade ou decoração. Definir quais objetos têm efeitos e como comunicar isso sem exigir inspeção visual.
- Eventos e atividades em casa foram propostos, com inspiração em Popmundo; tipos, requisitos e ligação a cômodos seguem em aberto.
- O guarda-roupa como móvel de armazenamento foi adiado para depois da versão inicial; roupas continuam equipáveis pelo inventário sem esse móvel.

### 2.5 Inventário geral, carga e peso

**Status: ideia em análise; não implementar sem decisões de regra.**

Proposta de Anderson:

- manter categorias como filtros de uma lista de inventário;
- limitar inicialmente a quantidade de tipos distintos de item (proposta registrada: 12);
- empilhar itens iguais;
- somar o peso individual das unidades para um limite total transportado.

Antes de especificar, decidir:

- se o limite de 12 tipos continua desejado;
- peso máximo inicial, unidades e curva de progressão;
- itens empilháveis versus instâncias individuais (peixes têm dados e pesos próprios);
- efeito de Força sobre o peso;
- relação com cestos e porões dos barcos, que hoje têm seus próprios limites de peixes;
- o que acontece ao exceder capacidade, vender, soltar, guardar em casa ou comprar itens;
- migração de saves e compatibilidade com coleções atuais.

### 2.6 Atributos, Stamina, Conforto e Saciedade

**Status: conceitos registrados; aplicações, números e escopo pendentes.**

- **Força:** proposta de atributo persistente, valor inicial associado à criação e aumento por atividades significativas. Efeitos cogitados: capacidade de carga e eficiência ao puxar peixe. Escala, teto, método de escolha e ganhos não foram definidos. Não premiar repetição sem custo.
- **Presença:** proposta de atributo dinâmico sobre como a cidade percebe o personagem; roupas, fachada e eventos foram citados como fatores possíveis. Efeitos concretos e atualização do valor pendentes.
- **Inteligência:** proposta ligada a aprender habilidades/receitas e tempo de leitura/aprendizagem com outra pessoa. Efeitos, escala e frequência de uso pendentes.
- **Stamina:** recurso imediato de esforço, possivelmente gasto em pesca/atividades e recuperado por descanso, comida ou bebida. Valores, custo por ação, recuperação e estado em zero pendentes.
- **Conforto:** condição cotidiana, diferente de stamina; pode reduzir custos de stamina com limite. Fontes possíveis: casa, móveis, comodidades, comida/bebida e eventos. Fórmula e escala pendentes.
- **Saciedade:** proposta para limitar o uso diário de alimentos/bebidas que recuperam stamina, sem virar fome punitiva. Escala, renovação e efeitos pendentes.
- Antes de transformar o conjunto em especificação, decidir se entram todos ou se o primeiro recorte deve tratar apenas um atributo e uma atividade. Evitar sistemas interdependentes antes de testar o loop básico.

### 2.7 Vila, regiões, interface e calendário

**Status: proposta aprovada para planejamento; mapa final e recorte pendentes.**

- Dividir Vila Barra Serena em áreas geográficas (ex.: ruas, praça, praia, margem do rio, estaleiro), com conexões, NPCs, eventos, estabelecimentos e saídas próprios.
- Criar mapa mental acessível; a navegação não pode depender apenas de uma representação visual.
- Organizar menus por dois headings semânticos estáveis: contexto/local e ações disponíveis; personagem/informações pessoais.
- Definir lista de regiões, ordem de descoberta, conexões e condições de acesso antes de implementação ampla.
- Calendário e rotina de NPCs são referências de design para futuro; definir só quando houver atividades e eventos concretos a sustentar.
- Estabelecimentos citados para futuro incluem loja de móveis, restaurante, academia, escola, pub, prefeitura, mercado pequeno e correios. Função, prioridade e necessidade narrativa de cada um precisam de escolha; não criar todos por constarem numa lista antiga.

### 2.8 NPCs, eventos e diálogos

**Status: prioridade de acessibilidade definida; especificação pendente. Outras expansões devem ser escolhidas individualmente.**

- Desenvolver Vitor como NPC recorrente do estaleiro; o próximo evento/conteúdo ainda está por decidir.
- Acrescentar diálogos contextuais a Zeca sem antecipar informações que o jogador ainda não descobriu.
- Definir aparências de Zeca, Marta e Dani se/ quando arte de NPCs for priorizada. Vitor já possui preset visual; aparência do jogador não deve determinar gênero narrativo.
- **Direção de design definida em 2026-11-18 — criador interno de NPCs:** reutilizar literalmente a mesma interface do criador da personagem do jogador como ferramenta autônoma, desconectada do jogo geral e destinada exclusivamente à autoria de NPCs. Ela segue as diretrizes de aparência de Anderson e facilita definir sua representação física e gerar descrições a partir dos dados configurados. Para NPCs, oferece mais opções de características e roupas. O protagonista é jovem, de idade universitária, e suas opções limitadas de roupa representam o guarda-roupa que possui em casa. Nunca inferir nem inventar características visuais não definidas. Ao concluir um NPC, a ferramenta pode gerar um arquivo com suas definições visuais para ser incluído no jogo. O formato desse arquivo e o processo de inclusão ainda precisam ser definidos. A ferramenta não se conecta à partida, à progressão ou à persistência geral; detalhes técnicos de como empacotar/lançar essa interface autônoma ainda podem ser especificados. Relaciona-se com `VISUAL-DESIGN-STANDARD.md`, `docs/CHARACTER-CREATOR-CATEGORIES.md` e `dev-instructions/dialogue-character-description.md`.
- Criar eventos para descoberta de zonas ocultas e progressão da casa/terreno.
- Quests fixed e seasonal foram descritas como categorias gerais; apenas “O lambari de Dani” está confirmada como quest fixa no código atual. Calendário, repetição e conteúdo seasonal dependem de projeto futuro.
- Afinidade numérica, romance e grandes árvores de diálogo são de alto risco e fora do escopo imediato conforme notas existentes. A possibilidade de flags simples e escolhas pontuais não é autorização para criar sistema amplo. Caso se retome, prototipar um NPC e poucas consequências.
- Manter segredo narrativo de Marta e Dani: parentesco só se revela após a conclusão da quest. Não alterar essa ordem sem decisão explícita.
- **Prioridade de acessibilidade definida em 2026-11-18 — descrição opcional de personagens nos diálogos:** a especificação está em [`dev-instructions/dialogue-character-description.md`](dialogue-character-description.md). A ação deve permanecer disponível durante o diálogo e poder ser acionada quantas vezes o jogador quiser, mesmo sem mudança de aparência; cada solicitação usa os dados atuais e, se a aparência não estiver definida, informa isso sem inventar nem inferir características. A especificação identifica decisões ainda pendentes que bloqueiam implementação; resolver e aprovar o escopo antes de codificar.

### 2.9 Pesca, mapas, espécies, equipamentos e balanceamento

**Status: sistema base implementado; expansão e balanceamento pendentes.**

- Definir quais peixes são exclusivos de quais zonas, preservando a distinção entre ecologia da História e pools deliberadamente amplos da Pesca Livre.
- Balancear preços, moedas, recompensas, capacidade, tempo de progressão, limiares e resistência de Bosses com critérios documentados.
- Completar descobertas e progressão de zonas ocultas por evento/equipamento/conversa, sem antecipar informações narrativas.
- Conectar compras de barco a necessidades e eventos do mundo, sem quebrar os requisitos atuais de acesso.
- Bosses da História podem aparecer em quests/eventos específicos; não copiar uma estrutura de outra obra e não converter os encontros em aparições periódicas automáticas.
- Verificar fórmulas e distribuição dos exemplares usando faixas biológicas plausíveis; não confundir raridade ecológica da espécie com raridade individual.
- Qualquer mudança no combate deve preservar IDEA-031 e equivalência de gameplay entre sensores e teclado, salvo decisão explícita em contrário.

### 2.10 Viagens exploráveis e minigames

**Status: ideia em análise / alto risco.**

- Viagens foram propostas em dois tipos: barco e terra, com seleção de veículo, exploração do caminho via sensores quando apropriado e passagem de tempo ao chegar.
- Já houve tentativa de navegação manual entre zonas sem resultado satisfatório. Não reinstaurar essa abordagem sem protótipo isolado.
- Prototipar uma única viagem pequena, medindo orientação, limites, retorno, leitura acessível e alternativa por teclado/menu. Não bloquear conteúdo se o controle de movimento falhar ou não for desejado.
- Minigames cogitados: cozinhar, dançar e preparar peixe para estocar. Escolher no máximo um para protótipo inicial, definir valor para o loop e oferecer controle não visual adequado. Não criar um minigame para toda atividade por padrão.

### 2.11 Distribuição e empacotamento

**Status: roadmap futuro, separado da produção de funcionalidades.**

- Google Play Store e itch.io são canais prioritários considerados; Tauri é possibilidade para desktop.
- Steam, GOG e apt-game ainda são opções para pesquisa, não compromisso.
- Avaliar separadamente requisitos técnicos, custos, processo de publicação e acessibilidade das plataformas antes de assumir qualquer rota.
- Não tratar decisão de distribuição como autorização para acessar contas, enviar releases ou publicar. O usuário mantém controle dessas ações.

### 2.12 Estudos históricos de arte visual e descrições cromáticas

**Status: propostas registradas em documentos locais antigos; reconfirmar antes de criar especificação ou implementar.**

- O antigo `VISUAL-ASSET-PLAN.md` propunha um inventário de SVGs para equipamentos, barcos, estabelecimentos e mapas, com identificadores e `viewBox` sugeridos, símbolos reutilizáveis e renderizadores por contexto. A proposta também listava modelos de itens e zonas. Esses detalhes não são uma especificação vigente: o `VISUAL-DESIGN-STANDARD.md` versionado no repositório é a referência visual atual, e os IDs, dimensões e inventários antigos devem ser comparados com o código/arte existente antes de qualquer reaproveitamento.

O GDD local antigo também reúne estado de jogo, propostas, dados de catálogo, backlog e histórico que hoje estão distribuídos entre o código, o devlog, o brainstorming e documentos versionados. Suas descrições de funcionalidades existentes, tabelas e status de releases não devem ser copiadas como estado atual; consultar as fontes atuais e manter apenas ideias ainda úteis e devidamente classificadas.

## 3. Pendências de validação do que já existe

Esses itens não são features novas e devem ser acompanhados em separado do brainstorming de implementação:

- validação manual dos fluxos publicados da loja de roupas e quest de Dani com teclado e TalkBack;
- confirmação da navegação/anúncios de inventário e decoração com leitor de tela;
- validação manual da IDEA-031 com teclado, sensores físicos e TalkBack/NVDA;
- revisão das instruções conforme modalidade de controle em dispositivo híbrido, se essa combinação fizer parte do próximo teste;
- confirmação externa de legibilidade visual de arte/indicadores quando necessária. Não pedir a Anderson para inspecionar algo visualmente.

QA automatizado registrado no devlog continua sendo evidência do comportamento verificado por esses testes, mas não substitui os itens acima.

## 4. Ideias históricas para reconfirmar antes de especificar

As notas locais antigas podem conter intenções ainda válidas, mudanças posteriores ou propostas que nunca foram confirmadas. Reconfirmar diretamente antes de abrir especificação:

- objetivos IDEA-001 a IDEA-023 do registro do GDD (presença de NPCs, descobertas, Vitor, casa/parque, regiões, interface, minigames, viagens, atributos, aquicultura, save, acessibilidade e canais de publicação);
- qualquer aparência, fala, preço ou progressão descrita apenas no snapshot local;
- relações exatas entre financiamento, stamina, conforto, comida, casa, eventos e parque;
- prioridade do backlog P0/P1/P2 local. A prioridade registrada em documento antigo não é automaticamente a ordem de trabalho atual.

IDEA-024 a IDEA-035 e outros itens de 2026-09/10 incluem sistemas que já foram implementados e publicados; não os reabrir como novas propostas. Consultar o devlog para detalhes e exceções.

## 5. Fila de extração para futuras especificações

Esta fila fica vazia até Anderson selecionar um item. Ao selecionar, criar um documento separado apenas para o escopo autorizado e preencher:

- objetivo e problema que resolve;
- o que entra e o que fica explicitamente fora;
- decisões confirmadas e decisões que ainda precisam de resposta;
- fluxos de jogador e estados/regras;
- dados, persistência, migração e compatibilidade;
- controles, acessibilidade e textos PT/EN/HU quando aplicável;
- dependências com sistemas atuais;
- cenários de QA automatizado e validação manual;
- critérios de aceitação e definição de pronto;
- restrições de publicação/release e confirmação necessária.

Não preencher esta fila por inferência. Anderson decide qual brainstorming vira especificação de implementação.
