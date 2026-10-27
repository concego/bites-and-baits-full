# Bites & Baits — GDD + Devlog de Desenvolvimento

**Documento vivo de design, conteúdo, decisões e histórico de desenvolvimento**  
**Versão de referência:** v2.5.0  
**Status:** release oficial validada; próximo ciclo de desenvolvimento em organização.  
**Data de criação:** 2026-08-24  
**Repositório:** `concego/bites-and-baits-full`  
**Pages:** https://concego.github.io/bites-and-baits-full/

> Este documento é ao mesmo tempo o GDD e o devlog do projeto. Ele registra como o jogo funciona, o que já foi feito, por que as decisões foram tomadas e quais etapas ainda faltam. Tudo que estiver marcado como **Atual** descreve o jogo existente. Tudo que estiver marcado como **Planejado**, **Ideia** ou **Pendente** ainda precisa de decisão, implementação ou validação.

## Como este documento será usado

Anderson desenvolve por estalos, associações e conexões. As ideias não precisam chegar em ordem lógica e não devem ser reorganizadas antes de serem apresentadas.

Regra de trabalho:

1. Receber a ideia livremente, sem pedir que ela seja organizada antes.
2. Preservar o núcleo da ideia e registrar uma versão bruta na seção de ideias.
3. Analisar em quais áreas ela se encaixa: narrativa, personagem, economia, financiamento, parque, pesca, mundo, acessibilidade, interface ou tecnologia.
4. Relacionar a ideia às seções afetadas do GDD.
5. Identificar dependências, conflitos e decisões que ainda faltam.
6. Só depois transformar a ideia em tarefa, especificação ou implementação.

Quando uma ideia se conectar a mais de uma parte do jogo, ela deve receber referências cruzadas em vez de ser duplicada sem controle. Se houver ambiguidade que altere o resultado, fazer uma pergunta objetiva; nunca preencher lacunas importantes por conta própria.

O GDD mantém duas camadas:

- **Registro de ideias:** captura e classificação do raciocínio antes da decisão.
- **Devlog:** registro do que foi decidido, implementado, testado e validado.

---

## 1. Visão do jogo

**Bites & Baits** é um jogo web de pesca com dois modos: **História** e **Pesca Livre**. A pescaria usa inclinação e movimento do celular quando os sensores estão disponíveis, ou teclado físico como alternativa completa.

A experiência deve colocar pessoas que enxergam e pessoas cegas na mesma atividade. Não existe uma versão separada “para cegos”. A acessibilidade participa da arquitetura, da interface, dos textos e do fluxo de jogo desde o início.

### 1.1 Fantasia do jogador

O jogador chega à Vila Barra Serena para recomeçar a vida, viver da pesca, conquistar uma casa financiada, adquirir equipamentos e embarcações, descobrir novos pontos de pesca e construir seu sonho: o parque **Iscas&mordidas**.

A progressão inteira é organizada por dois objetivos principais e claramente distintos:

1. **Pagar o financiamento da casa:** objetivo estruturado por prazo, cobranças recorrentes e planejamento financeiro.
2. **Construir o parque Bites & Baits / Iscas&mordidas:** objetivo de longo prazo em formato sandbox, sem prazo, sem ordem obrigatória e com liberdade de planejamento.

### 1.2 Pilares de design

1. **Pesca com sensação de ação:** lançar, esperar, fisgar, controlar a tensão e recolher.
2. **Progressão compreensível:** equipamentos, iscas, moedas, cestos, barcos, mapas e zonas têm função clara.
3. **Narrativa contextual:** NPCs reagem ao que o jogador fez, sem antecipar informações que o personagem ainda não descobriu.
4. **Inclusão conjunta:** texto, foco, ARIA e leitor de tela fazem parte da mesma experiência visual e não visual.
5. **Mundo social persistente:** pessoas podem ser procuradas mesmo quando não há evento principal ativo.
6. **Interface sem áudio redundante:** o jogo não cria TTS próprio para substituir o TalkBack/NVDA; mensagens importantes ficam disponíveis na interface e em regiões `aria-live`.

### 1.3 O que o jogo não é

- Não é um jogo de ação rápida baseado em reflexos visuais.
- Não é uma ferramenta de estudo musical.
- Não é um projeto separado para um público específico; a meta é participação conjunta.
- A Pesca Livre não é a progressão narrativa da História.

### 1.4 Inspirações de design

As referências abaixo são nortes de sensação e estrutura, não uma lista de elementos a copiar. O objetivo é entender o que cada obra oferece e transformar essas referências em uma identidade própria para Bites & Baits.

#### Action Bas — núcleo da pesca

A referência principal para a pescaria é o **Action Bas**, conforme citado pelo produtor. O interesse está nas mecânicas básicas de pesca e na possibilidade de observar como elas podem ser melhoradas ao longo do desenvolvimento.

Aplicação em Bites & Baits:

- manter a pescaria como atividade central e reconhecível;
- valorizar o momento a momento de lançar, esperar, fisgar e recolher;
- melhorar gradualmente resposta, clareza, equilíbrio e acessibilidade;
- não deixar a narrativa, o gerenciamento ou o sandbox apagarem a sensação de estar pescando.

#### Harvest Moon: Back to Nature — vila e calendário

A referência para a organização da vila é **Harvest Moon: Back to Nature**:

- funções claras para os NPCs;
- vila com rotina e organização;
- eventos distribuídos ao longo do calendário;
- sensação de que as pessoas têm um papel no mundo;
- progressão ligada à passagem do tempo.

Aplicação em Bites & Baits:

- cada NPC deve ter uma função compreensível;
- locais devem ter propósito e rotina;
- eventos podem depender de data, estação, progresso ou ações do jogador;
- o calendário deve enriquecer a vida da vila sem criar uma sequência impossível de acompanhar.

#### Stardew Valley — refinamento e integração

**Stardew Valley** é uma referência de refinamento da fórmula de Harvest Moon:

- sistemas que se conectam;
- progressão mais ampla;
- liberdade para decidir prioridades;
- atividades com valor próprio;
- melhor integração entre relações, economia, exploração, produção e objetivos de longo prazo.

Aplicação em Bites & Baits:

- conectar pesca, financiamento, casa, barcos, vila e parque;
- permitir diferentes ritmos de jogador;
- oferecer profundidade sem transformar cada sistema em uma obrigação;
- usar qualidade de vida e clareza de interface como parte do refinamento.

#### Síntese da identidade própria

As três referências apontam para uma combinação específica:

| Camada | Referência principal | Tradução para Bites & Baits |
|---|---|---|
| Atividade central | Action Bas | Pesca com ação, progressão e acessibilidade. |
| Vida da comunidade | Harvest Moon: Back to Nature | Vila organizada, NPCs com função e calendário de eventos. |
| Integração e liberdade | Stardew Valley | Sistemas conectados e sandbox do parque. |
| Identidade própria | Bites & Baits | Financiamento da casa, planejamento econômico, pesca e construção livre do parque. |

Essa combinação reforça a visão de **simulação + RPG + social + gerenciamento**, mas o escopo deve ser controlado por camadas. Primeiro o núcleo da pesca e os dois objetivos principais; depois calendário, rotinas, eventos e relações na medida em que puderem ser produzidos e validados com qualidade.

### 1.5 Organização espacial da Vila — proposta aprovada para planejamento

A Vila Barra Serena deve ser dividida em seções geográficas bem definidas, em vez de aparecer apenas como uma lista única de estabelecimentos.

Exemplos de seções:

- ruas;
- praça;
- praia;
- margem do rio;
- área do estaleiro;
- outras áreas que forem definidas para a vila.

Cada seção poderá possuir seus próprios:

- eventos;
- NPCs;
- estabelecimentos;
- casas;
- saídas e conexões;
- horários ou condições de acesso;
- informações ambientais;
- objetivos e descobertas.

A divisão espacial deve ajudar o jogador a construir um mapa mental da vila. Ela também deve facilitar a implementação, porque cada área passa a ser uma unidade de conteúdo com presença, eventos e regras próprias.

Essa proposta ainda não define a lista final de áreas. A nomenclatura, a ordem de descoberta e as conexões serão detalhadas antes da implementação.

### 1.6 Hierarquia principal da interface — proposta aprovada para planejamento

A interface principal deve ser organizada por dois headings grandes e estáveis, facilitando a navegação por leitor de tela e a localização das informações.

#### Heading 1 — Local atual e ações disponíveis

Este bloco informa:

- onde o personagem está;
- qual seção da vila ou mapa está aberta;
- o que existe naquele local;
- quais ações podem ser realizadas ali;
- quais NPCs, estabelecimentos, eventos ou saídas estão disponíveis.

A ordem deve priorizar o contexto local e as ações possíveis naquele momento.

#### Heading 2 — Personagem e informações pessoais

Este bloco concentra:

- nome e identidade do personagem;
- moedas;
- situação do financiamento;
- objetivos atuais;
- resumo de status;
- acesso ao inventário;
- missões ou tarefas;
- equipamentos;
- outras informações persistentes do jogador.

A composição exata dos botões ainda será definida, mas o princípio é separar claramente **o que existe no local** de **o que pertence ao personagem**.

#### Regras de acessibilidade da hierarquia

- Os dois headings devem ser verdadeiros headings HTML, não apenas textos visualmente grandes.
- A ordem do DOM deve acompanhar a ordem lógica da leitura.
- O foco deve começar no heading ou no primeiro controle do contexto que acabou de abrir.
- Os botões de personagem devem permanecer previsíveis entre locais.
- A seção local pode mudar conforme ruas, praça, praia ou outro espaço, sem deslocar a seção pessoal para uma posição inesperada.
- Em telas pequenas, a aparência pode mudar, mas a hierarquia semântica deve permanecer.

A proposta deve ser aplicada primeiro ao hub e aos menus da vila. Depois, poderá orientar o HUD da pescaria, da casa, do estaleiro e do parque sem misturar contexto de local com informações do personagem.

### 1.7 Minigames — possibilidade futura

A Adri propôs sistemas de minigames para atividades específicas, como:

- cozinhar;
- dançar;
- preparar peixe para estocar;
- outras atividades da vida da vila e do parque.

A ideia deve ser analisada como uma forma de tornar as atividades secundárias interativas, em vez de transformar tudo em menus passivos. Cada minigame precisa ter uma função clara no conjunto: produzir, melhorar, preparar, socializar ou expressar o estilo do jogador.

Riscos a controlar:

- criar muitos sistemas independentes e aumentar demais o escopo;
- quebrar a unidade da experiência de pesca;
- exigir reflexos visuais que prejudiquem a acessibilidade;
- duplicar ações que poderiam ser resolvidas por uma interface simples;
- aumentar o custo de controles, localização e testes.

Diretriz inicial: não criar um minigame para toda atividade. Primeiro escolher uma atividade, definir seu valor para os dois objetivos principais e testar uma versão curta com teclado e sensores quando fizer sentido.

### 1.8 Viagens exploráveis — possibilidade futura

A Adri propôs aproveitar o giroscópio e o acelerômetro para transformar as viagens em atividades exploráveis. O menu de viagem seria dividido em:

- viagem de barco;
- viagem por terra.

Fluxo proposto:

1. escolher o tipo de viagem;
2. escolher um destino;
3. selecionar automaticamente um veículo disponível para aquele tipo;
4. explorar o caminho com controles de movimento quando aplicável;
5. chegar ao destino;
6. descontar o tempo da viagem no calendário.

Controles propostos:

- inclinação lateral para virar;
- inclinação norte/sul para controlar a velocidade, quando o veículo permitir.

O sistema pode transformar deslocamento em uma atividade com identidade própria, aproximando o jogo ainda mais de uma simulação. Porém, viagem não pode virar uma barreira para acessar conteúdo. Deve existir uma alternativa acessível e previsível por teclado/interface, além de uma forma de não repetir trechos longos sem necessidade.

### 1.9 Lição do protótipo anterior de navegação

Já houve uma tentativa de criar navegação manual entre zonas nos mapas que exigem barco, sem resultado satisfatório. Essa experiência deve ser registrada como restrição de desenvolvimento:

- não assumir que a navegação manual atual está resolvida;
- prototipar o deslocamento isoladamente antes de integrá-lo aos mapas;
- testar orientação, velocidade, limites, colisões, retorno e leitura acessível;
- separar exploração de viagem da lógica de pesca;
- manter fallback por menu caso o controle de movimento não funcione ou não seja desejado;
- não bloquear a progressão enquanto o protótipo não estiver validado.

A viagem explorável é uma proposta forte, mas deve nascer de um protótipo pequeno, não de uma alteração direta em todos os mapas existentes.

### 1.10 Stamina — mecânica proposta

**Stamina** será o recurso de esforço físico do personagem.

Princípios definidos:

- atividades que exigem esforço consomem stamina;
- a pesca deverá consumir stamina, assim como futuras atividades físicas e minigames;
- comida e bebida podem recuperar stamina;
- diferentes ações podem ter custos diferentes;
- a stamina deve ser uma camada de planejamento, não uma punição que impeça o jogador de jogar;
- o jogador precisa entender quanto uma atividade custa e quanto um alimento ou bebida recupera.

A stamina representa o desgaste imediato. Ela responde à pergunta: **“quanto esforço ainda consigo fazer agora?”**

Possíveis fontes de consumo:

- pescaria;
- navegação ou condução, quando a viagem explorável for implementada;
- dança e outros minigames físicos;
- atividades de manutenção ou trabalho no parque;
- outras ações que forem definidas como esforço.

Possíveis fontes de recuperação:

- refeições;
- lanches;
- bebidas;
- descanso em casa;
- eventos ou atividades específicas.

Ainda precisam ser definidos:

- valor máximo inicial;
- custo de cada etapa da pesca;
- se a stamina é consumida ao começar, durante ou ao terminar uma atividade;
- velocidade de recuperação;
- efeito de dormir e passar o dia;
- comportamento quando chega a zero;
- duração e tamanho dos efeitos de comidas e bebidas;
- possibilidade de preparar, comprar ou estocar alimentos.

### 1.11 Conforto — mecânica proposta

**Conforto** representa as condições de conforto cotidiano do personagem, não uma pontuação abstrata de satisfação. Responde à pergunta **“quão confortável está minha vida?”**

Relação definida entre as estatísticas:

- quanto maior o conforto, menor o custo de stamina das atividades, dentro de um limite;
- conforto não recupera stamina diretamente;
- stamina é um recurso imediato; conforto é uma condição de médio/longo prazo.

Fontes previstas de aumento de conforto:

- melhorias na casa;
- móveis e comodidades;
- decoração e itens confortáveis;
- pequenas quantidades ao consumir certos alimentos ou bebidas;
- no futuro, atividades sociais, convivência com NPCs, eventos positivos e conquistas pessoais.

Um item pode oferecer conforto sem ser a melhor opção para recuperar stamina. Por exemplo, uma bebida agradável pode recuperar pouca stamina e ainda assim melhorar um pouco o conforto.

### 1.12 Saciedade — mecânica proposta

**Saciedade** representa quanto o jogador ainda pode utilizar comida e bebida ao longo do dia para recuperar stamina. Funciona como um limite diário de uso desses consumíveis, evitando que a recuperação e o pequeno ganho de conforto sejam obtidos sem limite apenas repetindo o consumo.

Cada alimento ou bebida deverá ter efeitos próprios: recuperação de stamina, uso da capacidade diária de saciedade e, em alguns casos, um pequeno aumento de conforto. Saciedade não deve virar uma mecânica de fome punitiva.

Ainda precisam ser definidos a escala, quanto cada item consome, o que acontece quando a capacidade diária se esgota e quando ela se renova.

### 1.13 Relação entre Força, Presença, Inteligência, stamina, conforto, saciedade e os dois objetivos

Esses elementos têm funções distintas e conectam a vida cotidiana aos dois objetivos principais:

- Força é um atributo do personagem, definido inicialmente na criação e melhorado por atividades; seus efeitos previstos são capacidade de carga e eficiência ao puxar o peixe;
- Presença representa como o personagem é percebido pela cidade em geral; pode aumentar ou diminuir conforme suas ações e fatores como roupas mais bem trabalhadas, fachada da casa e participação em eventos sociais; seus efeitos concretos nas relações e oportunidades ainda precisam ser definidos;
- Inteligência influencia a capacidade de aprender novas habilidades e receitas de itens, quando aplicável, e afeta o tempo necessário para ler ou aprender com outra pessoa; os efeitos concretos e a escala ainda precisam ser definidos;
- stamina mede o esforço imediato disponível e é consumida por atividades;
- conforto representa a qualidade do cotidiano e reduz, com limite, o custo de stamina;
- saciedade limita o uso diário de comida e bebida para recuperar stamina, podendo também gerar pequenos ganhos de conforto;
- pagar o financiamento exige decidir como usar tempo, energia e dinheiro;
- melhorias da casa podem aumentar conforto, mas competem com parcelas, equipamentos e barcos;
- o parque pode oferecer atividades e espaços que melhoram o conforto;
- atividades sociais futuras podem ter valor além de recompensa material;
- comida e bebida podem ser custo de rotina, investimento ou recompensa.

O sistema deve criar escolhas, não uma única sequência obrigatória. O jogador pode priorizar equipamento, alimentação, conforto da casa ou construção do parque conforme seu estilo.

### 1.14 Riscos e regras de balanceamento

- não permitir que stamina transforme cada ação simples em uma cobrança cansativa;
- não exigir que o jogador repita atividades apenas para recuperar o recurso necessário para jogar;
- evitar que conforto alto crie uma vantagem tão grande que todas as outras escolhas percam valor;
- definir um limite para o desconto de custo de stamina e manter um custo mínimo para atividades;
- evitar que a saciedade funcione como punição de fome ou bloqueie a progressão;
- impedir que consumíveis sejam usados repetidamente para obter stamina e conforto sem escolha ou custo;
- evitar que móveis e alimentos prazerosos sejam inúteis quando recuperam pouca stamina;
- explicar sempre o efeito de cada escolha;
- validar a leitura das barras e mudanças com TalkBack;
- impedir que o calendário e o financiamento sejam simultaneamente punitivos demais.

Diretriz inicial: começar com números simples e poucos itens. Antes de criar um catálogo grande de comidas, móveis ou efeitos, testar uma atividade, dois alimentos/bebidas com diferentes efeitos de stamina/saciedade/conforto e pelo menos dois níveis de conforto.

### 1.15 Final da História e produto completo

O arco principal acompanha um jovem universitário frustrado que decide tentar a vida na pesca para perseguir o sonho de abrir um parque temático de pesca.

A História termina quando ele consegue construir e inaugurar o parque. Esse encerramento é parte essencial do produto, não uma possibilidade distante.

A simulação de funcionamento depois da declaração de inauguração funciona como avaliação final e epílogo do gerenciamento. Ela informa ao jogador o resultado do parque — lucro, prejuízo, falência ou sucesso — e fecha a campanha do primeiro título.

#### Antiobjetivo: beta eterno

O projeto não deve permanecer indefinidamente em uma sequência de sistemas “para adicionar depois” sem uma versão completa entregável. O primeiro título precisa ter:

- começo reconhecível;
- progressão com objetivos claros;
- desenvolvimento do personagem;
- construção do parque;
- momento de inauguração;
- avaliação final;
- encerramento narrativo e de gerenciamento;
- versão comercializável e apresentável como produto completo.

Novas ideias podem ser registradas sem impedir a conclusão do arco principal. Afinidade avançada, minigames adicionais, viagens exploráveis, operação profunda do parque e outras expansões devem ser avaliadas contra o escopo de uma versão completa.

### 1.16 Diferencial e paridade sem sensores

O uso de acelerômetro e giroscópio é um diferencial importante de Bites & Baits, especialmente na simulação da pesca e em possíveis minigames e viagens. Porém, ele não pode ser o único motivo para jogar:

- algumas pessoas não possuem sensores adequados;
- algumas pessoas não querem usar movimento;
- algumas pessoas não gostam desse tipo de controle;
- jogadores no computador dependem do teclado;
- jogadores cegos podem preferir teclado ou tecnologia assistiva.

A experiência por teclado, tanto no celular quanto no computador, precisa ser um caminho completo e atraente. Ela não pode parecer uma adaptação pobre da versão com sensores.

O valor para quem usa teclado deve vir da combinação de:

- simulação de pesca profunda;
- progressão econômica;
- financiamento e planejamento;
- casa e conforto;
- NPCs, eventos e calendário;
- diálogos e identificação com a vila;
- construção e avaliação final do parque;
- possibilidades futuras de afinidade e minigames.

O acelerômetro pode diferenciar o modo de interagir, mas a identidade do universo, a progressão e as escolhas precisam sustentar o jogo inteiro. O jogador sem sensores deve ter motivos suficientes para se importar com o personagem, os moradores e o destino do parque.

Se houver mecânicas exclusivas de movimento, elas devem ter uma tradução equivalente por teclado/interface. A diferença pode estar na sensação, não no acesso ao conteúdo principal.

Se houver uma continuação, ela será outro produto. O possível spin-off de gerenciamento do parque não pode ser usado como justificativa para deixar o primeiro título sem final.

---

## 2. Plataformas e acessibilidade

### 2.1 Plataformas

- Navegador web em celular.
- Navegador web em computador.
- Teclado físico em computador, celular ou conexão OTG.
- GitHub Pages como publicação atual.

### 2.2 Controles

#### Celular com sensores

- Inclinar para frente: lançar a linha ou puxar durante a pescaria.
- Inclinar para trás: aliviar a tensão ou retirar a linha conforme o estado.
- Sacudir: fisgar quando o peixe morde.

#### Teclado

| Tecla | Ação |
|---|---|
| Seta para cima | Lançar ou puxar |
| Seta para baixo | Aliviar a tensão |
| Espaço | Sacudir/fisgar |
| F | Ler novamente os dados da última captura |

O teclado é uma alternativa completa, não um modo simplificado. A lógica principal da pescaria deve continuar equivalente entre sensores e teclado.

#### Mensagens conforme o controle ativo — proposta

As instruções hoje podem usar mensagens genéricas de inclinação mesmo quando a pessoa joga no computador com teclado. Para evitar orientar alguém a manter um celular em posição neutra quando essa pessoa nem está usando celular, a interface deverá apresentar instruções correspondentes ao método de controle ativo.

A preferência de design é detectar a **modalidade de controle em uso**, não depender exclusivamente de identificar se o dispositivo é celular ou computador:

- eventos reais de inclinação/shake indicam controle por sensores;
- uso das setas/Espaço indica controle por teclado;
- em dispositivos híbridos, como celular com teclado físico, vale a modalidade que a pessoa efetivamente está usando;
- se a modalidade ainda não puder ser determinada, usar instrução neutra ou oferecer uma escolha acessível, sem afirmar que o jogador está segurando um celular.

Revisar dicas, estados de pescaria e instruções para que o conteúdo explique a ação equivalente em teclado ou sensores. A detecção deve ser progressiva e não bloquear a pescaria enquanto aguarda dados de sensor.

Status: proposta registrada após feedback externo; ainda precisa de especificação e validação antes de implementação.

### 2.3 Regras de acessibilidade

- Todas as informações relevantes devem existir em texto HTML ou ARIA.
- SVGs meramente decorativos usam `aria-hidden`.
- Eventos importantes usam regiões `aria-live`.
- Foco deve ser levado para títulos, diálogos, botões e resumos quando uma tela muda.
- Não adicionar bips, vozes sintéticas ou sons que dupliquem o que o leitor de tela lê.
- TalkBack continua sendo requisito obrigatório de validação.
- Qualquer novo diálogo precisa ser testado com personagem feminino, masculino e neutro.
- Nunca esconder informação de gameplay somente em elementos visuais.

### 2.4 Distribuição e empacotamento — roadmap futuro

Canais prioritários considerados:

1. **Google Play Store:** objetivo principal para uma versão mobile, condicionado à viabilidade e à acessibilidade do processo de publicação.
2. **itch.io:** canal prioritário para distribuição do jogo, condicionado à resolução acessível da etapa de cadastro financeiro/fiscal.
3. **Executável com Tauri:** possibilidade de empacotar a versão web como aplicativo para computador.

Canais em avaliação, sem compromisso atual:

- Steam — avaliar custos, acessibilidade do processo e viabilidade comercial;
- GOG — pesquisar funcionamento e requisitos antes de considerar;
- apt-game — verificar se o canal ainda existe e se oferece acesso adequado.

A publicação em cada canal deve ser tratada como etapa própria. A prioridade é ter um produto completo, acessível e estável antes de multiplicar os formatos.

A necessidade de ajuda externa para etapas financeiras ou fiscais não invalida o objetivo de publicar. O processo deve ser dividido entre desenvolvimento do jogo, empacotamento, publicação e configuração financeira, tratando cada parte separadamente.

---

## 3. Estrutura de modos

### 3.1 Modo História — Atual

É o modo principal de progressão. Possui:

- criação de personagem;
- introdução narrativa;
- Vila Barra Serena e seus menus;
- mapas e zonas;
- pescaria com iscas;
- inventário de peixes e equipamentos;
- moedas;
- loja;
- barcos;
- casa/terreno;
- NPCs e diálogos contextuais;
- persistência local do progresso.

A História mantém um histórico próprio de última captura.

#### Bosses da História — encontros de missão

No modo História, um peixe Boss aparece como um encontro especial disparado por um evento ou quest, seja na missão principal, seja em uma missão secundária. Não faz parte de uma sequência periódica automática como na Pesca Livre: a narrativa e a missão justificam onde e por que aquele exemplar excepcional pode ser pescado.

Como referência estrutural, considerar os encontros e quests de pesca do minigame de *Final Fantasy XV*, sem copiar suas mecânicas específicas. Cada evento deverá definir espécie, local, pré-requisitos, contexto narrativo, objetivo e consequência/recompensa. A geração do exemplar é compartilhada com a regra canônica de Boss: medidas no extremo biologicamente plausível da espécie e perfil de combate com a maior resistência prevista para aquele tipo. Os parâmetros de dificuldade do evento não podem transformar o peixe em um exemplar biologicamente impossível.

A integração de Bosses às quests da História ainda depende da implementação do sistema de missões e eventos.

### 3.2 Pesca Livre — Progressão por pontuação

Modo independente de desafio e progressão, separado da História:

- não consome as iscas da História;
- não concede nem depende de moedas da História;
- mantém histórico e melhor pontuação separados da História;
- cada peixe capturado concede pontos conforme espécie, peso, comprimento e raridade do exemplar;
- a pontuação acumulada dentro da sessão libera novas fases/níveis;
- cada fase amplia o conjunto de espécies disponíveis, sem depender rigidamente do bioma ou mapa de origem;
- ao atingir cada limiar de avanço, um Boss é apresentado como encontro frequente e previsível da progressão, não como uma captura aleatória;
- cada Boss representa o exemplar de maior porte e peso biologicamente plausíveis daquela espécie, com raridade de exemplar troféu e o perfil de maior resistência à captura previsto para o tipo;
- o Boss é criado pela regra canônica compartilhada entre modos; a Pesca Livre pode aplicar a dificuldade progressiva do nível, sem sortear um exemplar comum para o encontro;
- o Boss precisa ser capturado para validar o avanço;
- se o Boss escapar, o nível atual recomeça e todos os pontos obtidos naquele nível são perdidos;
- o progresso dos níveis anteriores permanece concluído, mas o jogador precisa refazer o nível atual desde o início;
- se o Boss for capturado, o nível é concluído e a progressão continua conforme a regra específica da fase;
- o modo pode continuar sendo usado para praticar, mas agora também funciona como desafio escalonado.

A geografia da História não deve bloquear a variedade da Pesca Livre. Um peixe pode aparecer nesse modo por pertencer ao nível de desafio, mesmo que seu bioma natural não corresponda ao mapa inicial. A regra é intencional: a Pesca Livre representa uma sequência de desafios de pesca, não uma simulação geográfica rigorosa.

#### Estrutura conceitual de uma sessão

1. iniciar no nível inicial com um conjunto pequeno de espécies;
2. pescar e acumular pontos individuais;
3. atingir o limiar do próximo nível;
4. anunciar o avanço e iniciar o encontro com o Boss;
5. vencer, perder ou concluir o encontro conforme a regra da fase;
6. liberar espécies e desafios adicionais;
7. continuar até o jogador sair ou a sessão terminar.

O protótipo local inicial usa quatro níveis, com limiares provisórios:

| Nível | Pontos do nível | Boss | Direção do pool |
|---:|---:|---|---|
| 1 | 100 | Traíra | Lambari, tilápia, cará e piau |
| 2 | 180 | Dourado | Adiciona curimbatá, traíra e truta |
| 3 | 300 | Jaú | Adiciona tucunaré, pintado e peixe dourado ornamental |
| 4 | 500 | Pirarucu | Concentra peixes grandes e especiais |

Esses números e pools são provisórios e precisam ser balanceados após testes. A pontuação necessária, as espécies de cada nível, a quantidade de Bosses e a condição de vitória precisam ser balanceadas separadamente. O primeiro protótipo usa poucos níveis e Bosses claros, para validar a sensação de progressão antes de expandir o catálogo.

#### Falha no Boss

A pontuação da Pesca Livre deve ser separada em progresso acumulado anterior e progresso do nível atual. Enquanto o jogador pesca dentro de um nível, os pontos ficam associados àquele nível. Ao atingir o limiar, o Boss começa imediatamente ou após um aviso acessível.

- Boss capturado: valida o nível e libera a próxima etapa;
- Boss perdido: descarta os pontos obtidos desde o início do nível e reinicia o nível;
- níveis anteriores concluídos: continuam concluídos;
- espécies e dificuldades já liberadas por níveis anteriores: não são removidas;
- melhor pontuação da sessão: só deve ser atualizada conforme a regra final de placar, sem esconder do jogador que houve perda de progresso no nível.

A interface deve anunciar claramente a pontuação do nível, o limiar, o início do Boss, a perda em caso de fuga e o reinício. O jogador nunca deve descobrir a penalidade apenas depois de voltar a pescar.

---

## 4. Nortes de progressão

A História não terá um único tipo de progresso. Ela combina uma meta de responsabilidade com uma meta de criação livre. Esses dois objetivos devem aparecer de forma clara na interface e na narrativa, mas não devem competir pela mesma sensação.

### 4.1 Objetivo principal 1 — pagar o financiamento da casa

O financiamento da casa é o eixo de **prazo, responsabilidade e planejamento**.

Regras de design definidas:

- haverá uma cobrança recorrente;
- a dívida recorrente do jogador está ligada ao terreno/casa negociados por Zeca com a construtora; a mesma empresa prestará serviços de reforma e expansão, cobrados separadamente da dívida;
- a cobrança terá prazo de pagamento;
- o jogador precisará se preparar financeiramente para cada vencimento;
- pescar, vender, comprar equipamentos e adquirir barcos terá de ser planejado em relação às parcelas;
- o jogador deverá conseguir evoluir sem deixar de cumprir as obrigações;
- a interface deverá mostrar claramente valor, próximo vencimento, frequência e situação do financiamento;
- a narrativa deve tratar o pagamento como parte da nova vida do personagem, não como uma punição arbitrária.

O financiamento cria pressão controlada e dá sentido às decisões de curto e médio prazo. O jogo não deve exigir que o jogador pare completamente de evoluir para pagar a casa: o desafio é encontrar um equilíbrio sustentável entre renda, investimento e cobrança.

Ainda precisam ser definidos:

- valor total financiado;
- valor e frequência das parcelas;
- prazo total;
- período de carência inicial;
- possibilidade de antecipar parcelas;
- consequências de atraso;
- existência ou não de tolerância antes de qualquer consequência grave;
- como o progresso é apresentado ao jogador;
- como a casa muda visual e funcionalmente ao longo do financiamento;
- os valores e as condições de pagamento dos serviços da construtora, que são cobrados separadamente da dívida recorrente.

**Decisão de design:** não implementar despejo, perda definitiva da casa ou punição irreversível sem uma decisão específica. O sistema deve primeiro ser planejado para gerar tensão e escolhas, não frustração sem retorno.

### 4.2 Objetivo principal 2 — construir o parque Bites & Baits / Iscas&mordidas

A construção do parque é o eixo de **liberdade, expressão e sandbox**.

Regras de design definidas:

- não haverá prazo de conclusão;
- não haverá uma ordem obrigatória de construção;
- o jogador poderá escolher o que construir e em que momento;
- o parque será uma meta de longo prazo, sem pressionar o pagamento das parcelas;
- diferentes estilos de planejamento devem ser válidos;
- a construção deve oferecer objetivos opcionais, não uma lista linear obrigatória;
- o nome exibido seguirá o idioma: **Bites & Baits** em inglês e **Iscas&mordidas** em português.

O parque deve funcionar como espaço para o jogador continuar jogando depois de dominar a obrigação da casa. Ele representa o sonho pessoal do personagem e deve recompensar exploração, pesca, economia, relações com NPCs e decisões de investimento.

A construção terá apenas um requisito obrigatório mínimo ligado à casa/terreno. Depois de atingir esse mínimo, o jogador escolhe quando e como investir no parque. Melhorias adicionais da casa podem facilitar a vida, aumentar o conforto ou ampliar possibilidades, mas não devem ser exigidas para completar a construção do parque.

Ainda precisam ser definidos:

- módulos e atrações possíveis;
- materiais, moedas ou requisitos de cada construção;
- sistema de terreno e posicionamento;
- estética e personalização;
- benefícios funcionais de cada atração;
- relação entre visitantes, peixes, atrações e economia;
- se haverá reputação, avaliação ou apenas realização pessoal;
- como o progresso será salvo e apresentado;
- quais construções serão puramente decorativas e quais alterarão o jogo.

#### Parque temático de pesca — requisito essencial

O parque será temático sobre pesca. Portanto, o mínimo obrigatório deve oferecer experiências, atrações ou serviços diretamente relacionados à pesca.

Um parque aquático pode existir como expansão, mas não é o núcleo obrigatório. Ele deve ser tratado como uma possibilidade de entretenimento aquático, não como a definição do parque.

Candidatos a elementos essenciais ou prioritários:

- espaço de demonstração ou prática de pesca;
- exposição de peixes;
- área de equipamentos, iscas ou preparação;
- tanque ou viveiro relacionado à pesca;
- espaço educativo sobre peixes e ambientes aquáticos;
- estrutura de recepção e circulação do parque.

A lista final do mínimo ainda será definida. A regra é que o jogador não precise construir um parque aquático para considerar o sonho realizado: o parque precisa ser reconhecivelmente sobre pesca.

#### Tanques, peixes capturados e alevinos — questão de design

Na vida real, comprar alevinos é uma prática comum na piscicultura porque oferece peixes de origem conhecida, tamanho previsível e maior controle de produção. Isso não significa que todo sistema de criação precise obrigatoriamente começar com alevinos comprados.

Peixes adultos capturados na natureza podem, em algumas espécies e condições, servir como reprodutores. Porém, colocá-los em um tanque não garante reprodução automática. É necessário considerar maturidade, sexo, quantidade de indivíduos, qualidade da água, temperatura, alimentação, abrigo, comportamento reprodutivo e, dependendo da espécie, técnicas de reprodução controlada. Também existem preocupações reais de saúde, adaptação e introdução de animais selvagens em cativeiro.

Para Bites & Baits, a recomendação inicial é:

- não tornar a compra de alevinos obrigatória para liberar o parque;
- permitir que peixes capturados possam, quando apropriado, ser destinados a um tanque ou viveiro;
- tratar a reprodução como uma possibilidade condicionada, não como consequência automática de qualquer captura;
- oferecer alevinos comprados como caminho confiável e opcional;
- fazer da criação de peixes uma expansão ou sistema avançado, não um bloqueio do mínimo do parque;
- usar abstração suficiente para manter o jogo acessível e divertido, sem transformar piscicultura em um simulador técnico separado.

Dessa forma, o jogador pode seguir pelo caminho da pesca e da descoberta, enquanto quem quiser administrar criação e reprodução encontra uma camada adicional de gerenciamento.

#### Parque mínimo e funcionamento do endgame

A hipótese atual é que o mínimo do parque inclua:

- tanques ou viveiros;
- uma atividade de **Pesque e Pague**;
- estruturas básicas que ofereçam experiências diretamente relacionadas à pesca.

Esses elementos formam o núcleo temático do parque. Atrações de parque aquático e outras expansões não são necessárias para a primeira abertura.

#### 4.2.1 Inauguração e encerramento do gerenciamento

O modelo de endgame foi definido: a inauguração será uma decisão do jogador e o encerramento da História e da campanha de gerenciamento do parque no primeiro título.

Fluxo definido:

1. o jogador constrói o parque do jeito que quiser;
2. pode instalar quantas atrações e estruturas desejar, respeitando os recursos disponíveis;
3. quando considerar que o parque está pronto, escolhe declarar a inauguração;
4. o jogo confirma que essa decisão inicia a avaliação final;
5. um sistema interno simula o funcionamento do parque por um período;
6. o resultado informa se o parque gerou lucro, teve prejuízo, entrou em falência ou foi bem-sucedido;
7. a campanha de gerenciamento do parque termina com esse resultado.

A inauguração não deve acontecer automaticamente ao atingir o mínimo. O mínimo permite construir e operar a estrutura básica; a declaração é um ato consciente do jogador. Antes dela, o jogador pode continuar planejando, construindo e ajustando o parque sem prazo obrigatório.

O teste interno deve avaliar a estrutura que o jogador realmente montou, e não uma configuração ideal pré-definida. A simulação poderá considerar, quando esses sistemas forem implementados:

- atrações construídas;
- tanques, viveiros e quantidade de peixes;
- atividade de Pesque e Pague;
- custos de operação;
- alimentação e saúde dos peixes;
- funcionários e serviços contratados;
- capacidade de atendimento;
- conforto e qualidade das instalações;
- procura dos visitantes;
- manutenção;
- dívidas e dinheiro disponível;
- coerência entre investimento e receita.

O resultado precisa explicar o motivo do desempenho, e não apenas mostrar uma classificação. Um parque pode falhar por custos altos, falta de atrações, manutenção insuficiente, pouca capacidade ou decisões incompatíveis com a receita esperada.

Depois do resultado final, a experiência pode mostrar um resumo da trajetória e encerrar a campanha. O jogador não deve perder a sensação de que construiu algo: mesmo um resultado negativo deve ser apresentado como consequência do planejamento e como aprendizado.

#### Resultados possíveis

Os nomes e limites exatos ainda serão definidos, mas o sistema deve distinguir pelo menos:

- **Prejuízo:** o parque funcionou, mas gastou mais do que arrecadou;
- **Lucro:** o parque arrecadou mais do que gastou;
- **Falência:** o parque não conseguiu sustentar suas obrigações;
- **Sucesso:** o parque atingiu o nível de funcionamento e sustentabilidade definido para a conclusão positiva.

“Lucro” e “sucesso” não precisam ser sinônimos: um parque pode terminar o período com lucro, mas ainda não cumprir todos os critérios de uma inauguração bem-sucedida.

#### Continuação não canônica

Depois do título principal, poderá existir uma continuação não canônica — possivelmente um spin-off — dedicada exclusivamente ao gerenciamento do parque Bites & Baits / Iscas&mordidas.

Essa continuação poderia aprofundar:

- operação diária;
- visitantes;
- funcionários;
- manutenção;
- saúde e reprodução de peixes;
- atrações aquáticas;
- expansão do terreno;
- economia do parque;
- campanhas e desafios de gerenciamento.

Essa possibilidade não faz parte do escopo do primeiro título. O jogo principal deve terminar sua campanha de gerenciamento após a simulação da inauguração, enquanto o eventual spin-off poderá explorar a operação contínua com mais profundidade.

#### Save voluntário e tentativa da inauguração

No futuro, quando o jogo tiver um sistema de save controlado pelo jogador, a tentativa de inauguração deverá respeitar a liberdade de experimentar.

Fluxo desejado:

1. o jogador salva quando considerar que o parque está pronto;
2. inicia a simulação da inauguração;
3. recebe o resultado do funcionamento;
4. se não estiver satisfeito, carrega o save anterior;
5. muda sua estratégia, estrutura ou administração;
6. salva novamente quando quiser;
7. tenta a inauguração outra vez.

Uma falha não deve destruir permanentemente o parque nem obrigar o jogador a aceitar um resultado que considerou insatisfatório. O save anterior deve preservar o estado de desenvolvimento para permitir ajustes.

A simulação deve funcionar como uma avaliação protegida, sem sobrescrever o save de preparação antes de o jogador poder conhecer o resultado. Depois do relatório, o jogo pode oferecer opções claras de encerrar com aquele resultado ou voltar ao desenvolvimento.

Para que a tentativa seja justa, ainda será necessário decidir se a simulação usa:

- resultado determinístico baseado no estado do parque;
- aleatoriedade controlada por uma semente salva;
- eventos variáveis, mas explicados no relatório;
- uma combinação de planejamento e variação.

A recomendação é evitar um resultado puramente aleatório. A configuração do parque e as decisões do jogador devem ser a causa principal do desempenho.

O sistema atual ainda usa armazenamento do navegador como persistência. Slots manuais, cópias de segurança e saves escolhidos pelo jogador ficam para uma etapa futura.

Ainda precisam ser decididos:

- se um tanque vivo fará parte do mínimo obrigatório;
- se a primeira população poderá vir de peixes capturados;
- quais espécies poderão reproduzir em condições simples;
- se a reprodução exigirá casal, grupo ou apenas uma população mínima abstrata;
- se alevinos comprados terão vantagens de previsibilidade;
- como quarentena, saúde e qualidade da água serão representadas;
- se peixes de exposição serão diferentes dos peixes destinados à criação;
- quais consequências serão realistas e quais serão simplificadas por design.

#### Veterinário e saúde dos peixes — investimento opcional

Um parque com peixes em tanques ou viveiros poderá contratar um veterinário especializado em animais aquáticos, ou um profissional de saúde aquícola. Peixes também precisam de acompanhamento de saúde, especialmente em ambientes com muitos animais, água controlada, alimentação e circulação de visitantes.

A contratação não será requisito para construir ou abrir o parque. Ela será uma decisão de gerenciamento com investimento inicial alto, mas potencial de economia no longo prazo.

Possível funcionamento:

- sem profissional: menor custo inicial, mas maior risco de doenças, perdas de peixes e gastos emergenciais;
- profissional contratado por visita: custo recorrente ou periódico, com prevenção e tratamento básico;
- profissional fixo ou estrutura própria: investimento inicial elevado, mas resposta mais rápida e economia em manutenção ao longo do tempo;
- acompanhamento especializado pode melhorar saúde, bem-estar dos peixes, reprodução e confiabilidade das exposições.

A ideia deve representar prevenção e planejamento, não uma sequência de problemas aleatórios impossível de controlar. O jogador precisa conseguir comparar o custo da contratação com o risco e a economia esperada.

A saúde dos peixes também pode se conectar a:

- quarentena de animais novos;
- qualidade da água;
- alimentação;
- lotação dos tanques;
- reprodução;
- limpeza e manutenção;
- experiência e reputação do parque.

Ainda precisam ser definidos:

- se o profissional será chamado de veterinário, especialista em peixes ou técnico aquícola;
- custo inicial e custo de manutenção;
- frequência das visitas;
- quais problemas podem acontecer;
- quanto o jogador consegue resolver sozinho;
- como evitar microgerenciamento excessivo;
- se a contratação também atende animais terrestres, caso o parque venha a receber outros animais;
- quais benefícios de longo prazo justificam o investimento.

### 4.3 Relação entre os dois objetivos

| Dimensão | Financiamento da casa | Parque |
|---|---|---|
| Natureza | Obrigação estruturada | Projeto livre |
| Prazo | Sim, com cobranças recorrentes | Não |
| Ordem | Etapas e vencimentos | Sem ordem obrigatória |
| Sensação | Planejamento e responsabilidade | Liberdade e criatividade |
| Horizonte | Curto e médio prazo | Longo prazo |
| Falha | Deve gerar consequências planejadas e reversíveis | Não deve haver fracasso por tempo |
| Papel na História | Sustenta a nova vida | Realiza o sonho do personagem |

O loop econômico deve permitir que o jogador alterne entre:

1. gerar renda;
2. reservar o valor da próxima cobrança;
3. investir no equipamento ou na embarcação certa;
4. explorar novas áreas;
5. cumprir objetivos opcionais;
6. ampliar o parque no ritmo escolhido.

A casa garante estrutura e estabilidade. O parque garante liberdade e continuidade.

---

## 5. Fluxo atual do jogador

1. Escolher **História** ou **Pesca Livre**.
2. Na primeira História, criar e confirmar a personagem.
3. Escolher perfil gramatical: feminino, masculino ou neutro.
4. Escolher ou randomizar aparência e roupas.
5. Assistir à introdução:
   - quarto;
   - carta para tio Zeca;
   - envelope;
   - envio da carta;
   - resposta de Zeca;
   - preparação da viagem;
   - viagem de lancha pelo Rio Doce;
   - encontro com Vitor;
   - desembarque;
   - chegada à Vila Barra Serena.
6. Entrar na loja **Artigos de pesca do Zeca**.
7. Receber uma única vez o equipamento inicial e 30 minhocas.
8. Pescar na Margem do Lago para começar a obter moedas.
9. Usar Vila, Casa, Estaleiro, Loja, Inventário e Viagem para progredir.
10. Comprar equipamentos e barcos conforme a economia permitir.
11. Descobrir o bloqueio narrativo do Rio Doce e falar com Zeca pelo menu **Pessoas presentes**.

---

## 6. Personagem do jogador

### 6.1 Identidade — Atual

O jogador define:

- nome;
- perfil gramatical feminino, masculino ou neutro;
- conjunto de chegada;
- roupa de pesca;
- tom de pele;
- forma do corpo;
- altura;
- formato do rosto;
- olhos e detalhes faciais;
- cor dos olhos;
- cabelo;
- cor do cabelo;
- cobertura de cabeça;
- pelos faciais;
- calçados;
- acessórios.

A apresentação visual não altera as regras da pescaria.

### 6.2 Concordância — Regra obrigatória

Falas e descrições que se referem ao jogador devem respeitar `genderProfile`:

- feminino: “sentada”, “pronta”, “obrigada”;
- masculino: “sentado”, “pronto”, “obrigado”;
- neutro: preferir formas sem marcação, como “à mesa”, “a postos” e “agradeço”.

Toda nova fala deve ser revisada nos três perfis.

---

## 7. Introdução narrativa atual

A introdução é linear e avança pelo botão **Continuar**. Ela apresenta o motivo da viagem e os personagens principais.

### 7.1 Enredo

A personagem decide recomeçar a vida na Vila Barra Serena. Escreve para o tio Zeca, contando que quer viver da pesca, comprar uma casa e construir o parque Iscas&mordidas. Zeca responde que negociou com uma construtora um terreno com uma casinha inicial e será fiador. O personagem terá uma dívida recorrente ligada à casa/terreno; essa mesma construtora prestará os serviços de reforma e expansão da moradia.

Na chegada, Vitor conduz a lancha pelo Rio Doce, informa que é filho do dono do estaleiro e deixa a personagem na margem da vila.

### 7.2 Personagens apresentados

- **Jogador:** pessoa que recomeça a vida na vila.
- **Tio Zeca:** tio do jogador e dono da loja. Os demais moradores o chamam de Zeca.
- **Vitor:** filho do dono do estaleiro; conduz a lancha na introdução e pode ser procurado como NPC.

### 7.3 Conteúdo aprovado da primeira conversa com Zeca

A primeira entrada na loja dispara uma recepção linear. Ao terminar, Zeca entrega uma única vez:

- Vara Simples (`rod_basic`);
- Linha Monofilamento (`line_mono`);
- Anzol Simples (`hook_basic`);
- Boia Simples (`float_basic`);
- Cesto Básico (`basket_basic`);
- 30 minhocas.

O conjunto é equipado automaticamente. O saldo inicial normal é **0 moedas**.

A lógica do mundo é que o personagem gastou seus recursos na viagem, mas recebeu equipamento suficiente para iniciar a pescaria sem precisar comprar imediatamente.

---

## 8. Loop principal de pesca

### 8.1 Estados atuais

- `IDLE`: aguardando o lançamento.
- `CASTING`: lançamento da linha; verifica carga, equipamento, vara exigida e isca.
- `WAITING`: isca na água, peixe se aproximando.
- `BITING`: peixe mordeu; janela para fisgar.
- `REELING`: peixe fisgado; controle de tensão e recolhimento.
- `CAUGHT`: peixe capturado e adicionado ao inventário ou pontuação.
- `SNAPPED`: linha arrebentou.
- `ESCAPED`: peixe escapou durante o recolhimento.

### 8.2 Fluxo de uma pescaria

1. Jogador lança.
2. O jogo consome uma unidade da isca equipada no modo História.
3. Um peixe é sorteado conforme mapa/zona e perfil de raridade.
4. O peixe se aproxima.
5. O jogador recebe o aviso de mordida.
6. O jogador fisga.
7. Durante o recolhimento, controla tensão, puxada e alívio.
8. O peixe é capturado, escapa ou arrebenta a linha.
9. A captura é registrada e a tela volta ao estado apropriado.

### 8.3 Carga

- Na margem, a carga usa o cesto equipado.
- Em mapas com barco, a carga usa o porão do barco ativo.
- Se não houver espaço, o lançamento é impedido e o jogador recebe orientação para vender, soltar ou melhorar a capacidade.

### 8.4 Última captura

O resumo acessível pode apresentar:

- peixe;
- tamanho;
- peso;
- valor, na História;
- local;
- zona;
- pontuação, na Pesca Livre.

A tecla F relê os dados completos.

---

## 9. Economia, inventário e equipamentos

### 9.1 Economia atual

- Saldo inicial normal: 0 moedas.
- Peixes capturados na História podem ser vendidos.
- Equipamentos, iscas e barcos são comprados com moedas.
- O parâmetro `testcoins` existe apenas para QA e não deve ser usado na release oficial.

### 9.2 Iscas atuais

- Minhoca (`worm`);
- Grilo (`cricket`);
- Mosca (`fly`);
- Colher (`spoon`);
- Isca viva (`live_bait`);
- Camarão (`shrimp`);
- Jig (`jig`).

### 9.3 Equipamentos atuais

#### Varas

| Tier | Item |
|---:|---|
| 1 | Vara Simples |
| 2 | Vara Média |
| 3 | Vara de Carbono |
| 4 | Vara Profissional |
| 5 | Vara Mestra |

A Vara Média ou superior é obrigatória para o Rio Doce.

#### Linhas

- Monofilamento — tier 1;
- Fluorocarbono — tier 2;
- Trançada — tier 3;
- Dyneema — tier 4.

#### Anzóis

- Anzol Simples — tier 1;
- Anzol Offset/Circular — tier 2;
- Anzol Triplo — tier 3.

#### Boias

- Boia Simples — tier 1;
- Boia Sensível — tier 2;
- Boia Profissional — tier 3.

#### Cestos

- Cesto Básico — capacidade 8;
- Cesto Reforçado — capacidade 12;
- Cesto Grande — capacidade 16.

Os modificadores de equipamento afetam puxada, chance de arrebentar, janela de mordida e taxa de fisgada.

---

## 10. Mapas e zonas atuais

### 10.1 Margem do Lago

- ID: `lago_margem`;
- acesso sem barco;
- ponto inicial da História e da Pesca Livre;
- uma zona: Margem;
- local recomendado para começar;
- pesca bem-sucedida aqui registra o progresso que pode iniciar a conversa contextual de Zeca.

### 10.2 Lago Central

- ID: `lago_central`;
- exige barco;
- zonas atuais:
  - Águas Rasas;
  - Meio do Lago;
  - Fundo do Lago, oculto inicialmente;
  - Baía Isolada, oculta inicialmente.

### 10.3 Margem do Rio Doce

- ID: `margem_rio_doce`;
- não exige barco;
- uma zona: Margem;
- exige Vara Média ou superior;
- a narrativa sobre a correnteza só ocorre quando o jogador chega ao local e tenta pescar.

### 10.4 Rio Doce

- ID: `rio_doce`;
- exige Barco de Alumínio ou Lancha;
- exige Vara Média ou superior;
- zonas atuais:
  - Correnteza Baixa;
  - Remanso do Rio;
  - Poço Profundo, oculto inicialmente;
  - Encontro das Águas, oculto inicialmente.

### 10.5 Regra do evento do Rio Doce

Com vara inferior à Vara Média:

1. o jogador pode chegar ao local quando possui a embarcação exigida;
2. a mensagem não aparece no menu de viagem;
3. ao tentar lançar a linha, o personagem comenta a força da correnteza;
4. a pescaria é bloqueada antes do consumo da isca;
5. a tentativa registra `bb_river_attempted`;
6. ao procurar Zeca em **Pessoas presentes**, a conversa contextual explica a necessidade da Vara Média.

Mensagem atual em português:

> “Uau, as águas aqui parecem bem rápidas. Não sei se a vara que o tio Zeca me deu seria a mais adequada para pescar aqui. Acho melhor falar com ele.”

A exigência é verificada tanto no fluxo normal quanto defensivamente no estado `CASTING`.

---

## 11. Vila, locais e menus

### 11.1 Hub da Vila Barra Serena

Menu atual:

- Casa / Terreno;
- Artigos de pesca do Zeca;
- Loja de roupas da Marta;
- Estaleiro;
- Viagem;
- Inventário;
- Pessoas presentes.

#### Estabelecimentos identificados para planejamento

A lista é inicial e poderá crescer conforme a vila for detalhada:

- **Loja de móveis:** prevista para adquirir mobília e itens funcionais ligados ao sistema da casa.
- **Restaurante:** estabelecimento a adicionar em um ciclo próximo; detalhes ainda não definidos.
- **Academia:** local para o personagem se exercitar.
- **Escola:** reforça a credibilidade da cidade e pode permitir que o jogador aprenda conteúdos do jogo.
- **Pub:** ponto de encontro e referência para vida noturna.
- **Prefeitura:** incluída na lista; função ainda a definir.
- **Mercado pequeno:** incluído na lista; função e escopo ainda a definir.
- **Correios:** incluídos na lista; função ainda a definir.

### 11.2 Casa / Terreno

A tela apresenta o estado da casa, próxima melhoria e relação com armazenamento de barcos. O progresso da casa é persistido por nível.

Níveis previstos no conteúdo atual:

- Barraco;
- Casa Simples;
- Casa com Garagem;
- Casa com Doca Privada.

A definição final de custos, capacidades, taxas e integração com a narrativa ainda precisa ser consolidada e validada no próximo ciclo.

### 11.3 Melhorias da casa — referências e direção de design

O planejamento das melhorias da casa terá como referências **The Sims**, **Stardew Valley** e **Popmundo** — registrado a partir da forma como a referência foi citada.

A casa deve ser mais do que um nível numérico. Ela será uma combinação de:

- estrutura;
- conforto;
- utilidade;
- armazenamento;
- identidade do personagem;
- relação com o financiamento;
- base para atividades futuras.

#### The Sims — móveis, cômodos e conforto

A referência de The Sims contribui principalmente para:

- móveis com função e não apenas aparência;
- cômodos que podem representar necessidades diferentes;
- conforto como parte importante da vida cotidiana;
- possibilidade de personalização;
- escolhas de decoração que expressem o estilo do jogador.

#### Stardew Valley — melhorias estruturais com função

A referência de Stardew Valley contribui para:

- melhorias graduais da casa;
- novas funções desbloqueadas por etapas;
- cozinha e preparação de recursos;
- armazenamento e organização;
- casa como parte da rotina e da progressão, não somente como cenário.

#### Popmundo — gestão cotidiana e patrimônio

A referência de Popmundo contribui para pensar a casa como patrimônio e responsabilidade cotidiana:

- relação entre moradia, custos e planejamento;
- decisões sobre mobília e comodidades;
- sensação de administrar uma vida, não apenas comprar upgrades;
- importância de manter a casa útil e confortável ao longo do tempo.

#### Direção própria para Bites & Baits

A casa deverá conectar diretamente os dois nortes do jogo:

- o financiamento cria as obrigações e o planejamento;
- as melhorias estruturais tornam a casa mais funcional;
- móveis e comodidades aumentam o conforto;
- a cozinha e o armazenamento podem apoiar comida, bebida e preparo de peixe;
- garagem e doca apoiam a progressão de embarcações;
- a casa pode servir como base para planejar o parque.

Categorias iniciais de melhoria:

1. **Estrutural:** tamanho, cômodos e expansão da construção.
2. **Funcional:** cozinha, armazenamento, oficina, preparo e descanso.
3. **Conforto:** cama, sofá, iluminação, comodidades e itens prazerosos.
4. **Náutica:** garagem, doca e armazenamento de barcos.
5. **Identidade:** decoração e escolhas estéticas.

A estrutura principal pode seguir etapas de financiamento, enquanto móveis, comodidades e decoração devem ter maior liberdade de escolha. Isso evita que toda a casa seja apenas uma sequência linear.

#### Proposta em análise — tipos de casa, melhorias e inventário próprio (2026-10-03)

Anderson propõe que cada nível ou estilo de casa ofereça possibilidades próprias de cômodos, reformas, melhorias e adicionais, em vez de todas as casas aceitarem as mesmas opções. A casa teria um inventário próprio, inspirado no sistema de Popmundo, com capacidade limitada por volume e peso, para guardar itens excedentes do inventário carregado pelo jogador. Um freezer é um exemplo de melhoria funcional: permitiria guardar peixes em vez de vendê-los imediatamente. Peixes guardados no freezer deixam de contar como vivos: podem ser consumidos, usados em quests relacionadas a comida ou vendidos a comerciantes específicos. Criadores não os comprariam, e eles não poderiam ser usados para abastecer o parque. Reformas e adicionais seriam compatíveis com a estrutura da moradia: por exemplo, uma cabana não comportaria uma doca particular, mas poderia receber um quintal. A lista de tipos, os limites de capacidade e o funcionamento detalhado dos espaços de armazenamento ainda precisam ser definidos. Esta é uma proposta para planejamento, não uma especificação final nem autorização de implementação.

Os cômodos poderão conter itens que aumentem o conforto ou sirvam como ferramentas para atividades e propósitos específicos. Por exemplo, o fogão da cozinha poderá permitir cozinhar, desde que o personagem tenha os utensílios, ingredientes e receitas necessários, além da habilidade pertinente. As regras de uso, os requisitos e o funcionamento dessa habilidade ainda precisam ser detalhados.

As casas também permitirão realizar eventos e atividades inspirados nos sistemas de Popmundo. A proposta não se limita a atividades esportivas e festas; os demais tipos de evento/atividade, seus requisitos e suas relações com cômodos ou melhorias ainda serão definidos.

**Regra de obrigatoriedade definida:** somente o mínimo necessário para viabilizar a construção do parque será obrigatório. Todo o restante — melhorias estruturais adicionais, móveis, comodidades, conforto, armazenamento, garagem, doca e decoração — será escolha e estratégia do jogador.

Isso significa que a casa não terá uma árvore de upgrades obrigatória para ser considerada “completa”. O jogador poderá escolher entre investir em conforto, eficiência, capacidade, barcos, alimentação, saciedade ou acelerar o acesso ao parque, desde que cumpra o mínimo definido para iniciar a construção.

Ainda precisam ser definidos: 

- qual é o mínimo obrigatório da casa/terreno para iniciar a construção do parque;
- quais melhorias opcionais oferecem cada vantagem estratégica;
- se móveis ocupam espaço real ou apenas aparecem em listas/categorias;
- quais objetos aumentam conforto e em que intensidade;
- quais objetos afetam stamina, descanso, comida ou bebida;
- quais cômodos permitem cada ferramenta ou atividade e quais requisitos cada interação exige, como utensílios, ingredientes, receitas e habilidade para cozinhar;
- como a cozinha e o preparo de peixe entram no loop;
- como garagem e doca se relacionam com os níveis atuais;
- se o jogador pode reformar antes de quitar a casa;
- como atrasos do financiamento afetam melhorias;
- quais tipos/estilos de casa existem e quais cômodos cada um permite;
- quais reformas e adicionais são compatíveis com cada estrutura;
- como calcular a capacidade do inventário da casa por volume e peso;
- quais itens, além dos peixes guardados em freezer, podem ficar no inventário da casa e como ele se relaciona ao inventário pessoal, à decoração e ao armazenamento de barcos;
- como a casa é apresentada de forma acessível sem depender de exploração visual.

### 11.5 Artigos de pesca do Zeca

A loja possui compra e venda de:

- iscas;
- cestos;
- varas;
- linhas;
- anzóis;
- boias.

O menu **Pessoas presentes** é permanente e não depende de eventos.

#### Loja de roupas — dependência da quest de Dani

Marta trabalha na loja de roupas e é mãe de Dani; esse parentesco é informação secreta para o jogador. **Nome definido: Marta.** A loja, o menu de pessoas e as falas comuns de Marta não podem revelar a relação. Dani só contará que Marta é sua mãe depois que o jogador concluir a quest dele.

O catálogo possui 38 variantes de cor agrupadas em 16 modelos visuais; nomes descrevem a peça e a cor aparece separadamente. Uma variante de cada modelo é oferecida por dia do calendário do jogo, sem mudar ao reabrir a loja. As roupas compradas — assim como as peças iniciais escolhidas na criação — entram no inventário do jogador e podem ser equipadas normalmente, sem exigir um móvel. O guarda-roupa é um móvel opcional, adquirido e colocado na casa para ampliar o armazenamento de roupas; ele não é requisito para vestir ou trocar peças. Ainda precisam ser definidos a capacidade inicial, o espaço adicional concedido pelo móvel e o fluxo de aquisição/colocação.

A loja é aberta diretamente pelo menu principal da vila e Marta aparece como NPC em **Pessoas presentes**, identificada apenas como atendente. A aparência dela não foi definida. A conversa disponível é uma saudação genérica e neutra. Os preços das roupas, entre 8 e 22 moedas, continuam provisórios e sujeitos a balanceamento.

A loja precisa estar implementada e acessível antes de a quest de Dani ficar disponível. A disposição física dos locais poderá ser reorganizada depois, sem alterar a loja nem a dependência da quest. A implementação local da quest mantém Dani oculto até que o jogador receba o equipamento inicial de Zeca e o módulo da loja de roupas esteja carregado. A revelação do parentesco entre Marta e Dani ocorre somente no diálogo de retorno após a captura.

### 11.6 Estaleiro

Permite comprar e equipar embarcações.

Embarcações atuais:

- Canoa — portátil, carga 8;
- Barco de Alumínio — portátil, carga 20, acessa o Rio Doce;
- Lancha — garagem, carga 30;
- Veleiro — garagem, carga 50;
- Iate — doca, carga 100.

Taxas e armazenamento dependem da casa e da categoria da embarcação. A economia e as regras de garagem/doca ainda precisam de revisão consolidada.

### 11.7 Viagem

A tela exibe o mapa atual, destinos, barcos necessários e zonas disponíveis. Mensagens narrativas de descoberta devem acontecer no local e durante a tentativa de ação, não durante a simples consulta ao mapa.

### 11.8 Inventário

Abas atuais:

- Peixes;
- Iscas;
- Equipamentos.

O jogador pode visualizar, vender, proteger, equipar e desequipar itens conforme a categoria.

---

## 12. Sistema social — Pessoas presentes

### 12.1 Regra geral

**Pessoas presentes** é uma mecânica persistente do mundo. O botão não deve desaparecer porque não há evento principal ativo.

Locais sem necessidade de barco possuem o botão nos menus aplicáveis. Mapas que exigem barco não recebem esse botão de acordo com a decisão atual.

### 12.2 NPCs atuais

- Vila Barra Serena: Vitor e Daniel “Dani”;
- Loja de roupas: Marta, atendente;
- Artigos de pesca do Zeca: tio Zeca;
- Estaleiro: Vitor;
- Casa e Margem do Rio Doce: nenhum NPC configurado no momento;
- Margem do Lago: nenhum NPC fixo; a quest de Dani pode disparar ali um evento de pesca Boss.

**Status das aparências:** Vitor é o único NPC atual com preset visual definido em `npc-data.js`. As aparências de Zeca, Marta e Daniel “Dani” ainda precisam ser definidas.

### 12.3 Conversa sem evento

Quando não há evento relevante, a conversa é curta, amigável e não antecipa progressão. Exemplos aprovados:

- Zeca: “Como vai a nova vida por aqui?”
- Zeca: “Nada de novo por agora, mas me procura de tempos em tempos para eu te atualizar das coisas.”
- Vitor pergunta se o personagem está se adaptando bem à vida nova.

### 12.4 Eventos contextuais atuais

- Depois de uma tentativa frustrada no Rio Doce, Zeca reconhece que o jogador tentou pescar com a vara inicial.
- Zeca explica que a correnteza é mais forte e que é necessária uma Vara Média ou superior.
- Depois que a conversa termina, o estado contextual é marcado e as conversas futuras retornam ao modo amigável padrão.

### 12.5 Primeira quest — O lambari de Dani

A primeira quest do jogo apresenta Daniel, chamado de Dani, um garoto de aproximadamente 10 anos que fica disponível na tela principal da Vila Barra Serena. A primeira implementação está no código local, ainda não publicado. Ao conversar com ele, o jogador aceita uma tarefa que inaugura o sistema de quests e dispara um encontro de Boss no modo História.

**Disponibilidade:** a quest só aparece depois que o jogador recebeu o equipamento inicial de Zeca **e** a loja de roupas já está implementada. A loja não deve revelar que Marta é mãe de Dani; esse parentesco só é revelado no diálogo de conclusão da quest.

**Fluxo previsto:**

1. o jogador conversa com Dani na tela principal da vila;
2. aceita ajudá-lo;
3. Dani pede que o jogador procure, pela manhã, um lambari excepcional que ele observa na margem do lago;
4. o encontro de Boss é ativado na Margem do Lago;
5. o Boss é um lambari gerado pela regra canônica: maior comprimento e peso biologicamente plausíveis do catálogo, qualidade troféu e maior resistência prevista para a espécie;
6. a captura conclui o objetivo;
7. Dani recompensa o jogador com o desenho do lambari como decoração da casa e algumas moedas; somente nesse diálogo pós-conclusão revela que Marta é sua mãe e trabalha na loja de roupas;
8. depois da conclusão, o diálogo retorna a um estado apropriado para o pós-quest, sem repetir a aceitação.

**Recompensa definida:** desenho único do lambari excepcional, registrado como propriedade persistente da quest para futura integração à casa, e algumas moedas. O valor provisório local é **10 moedas**, exclusivamente para permitir testar o fluxo; ainda depende de balanceamento e não é o valor final aprovado. A integração do desenho como decoração/objeto colocável será feita quando o sistema da casa for atualizado. Somente a fala de retorno após a captura revela que Marta é mãe de Dani e trabalha na loja de roupas.

A grafia correta usada por Dani é “piau”, espécie presente no catálogo. O diálogo deve usar “piau”.

**Diálogo-base da aceitação:**

- **Dani:** “Oi, você gosta de pescar, né?”
- **Jogador:** “Gosto sim, você também pesca?”
- **Dani:** “Ah, não, eu não. Eu gosto de desenhar.”
- **Jogador:** “Ah, legal. Me chamo **, e você?”
- **Dani:** “Daniel, bom, todo mundo me chama de Dani. Será que pode fazer uma coisa pra mim?”
- **Jogador:** “Legal te conhecer Dani. Uma coisa, bom, acho que sim.”
- **Dani:** “Legal! Bom, é que eu gosto de ir até a margem do lago. Eu levo algum resto de comida para jogar na água para ver os peixes comendo, é engraçado tentar desenhar quando eles sobem pra pegar a comida. Mas uma vez eu vi um lambari tão grande que eu achei que era um piau, eu contei pros meus amigos mas ninguém acreditou. Eu costumo levar comida lá de manhã cedo, acho que se você puder tentar pegar ele pra mim à essa hora deve ter mais chances.”
- **Jogador:** “Tá certo Dani, eu vou ver se acho esse carinha pra você.”
- **Dani:** “Wow, sério? Eu vou pensar em algo pra te dar em troca.”

A implementação deve manter o conteúdo como quest de História, separada da progressão de Bosses da Pesca Livre. O horário da manhã precisa ser representado por uma regra de disponibilidade do evento, não apenas por texto decorativo.

### 12.6 Regra para novos NPCs

Todo NPC deve ter:

1. presença definida por local;
2. conversa padrão sem evento;
3. lista de eventos relevantes;
4. prioridade clara entre eventos;
5. estado persistente para impedir repetição indevida;
6. retorno ao diálogo padrão depois do evento;
7. tradução PT/EN/HU;
8. validação TalkBack e de perfil gramatical.

---

## 13. Afinidade e variações de diálogo — possibilidade futura

### 13.1 Situação atual

O primeiro título não terá, por enquanto, um sistema completo de afinidade nem uma grande árvore de diálogos variáveis. A decisão atual é evitar que essa camada faça o escopo explodir antes de o núcleo do jogo estar consolidado.

### 13.2 Por que considerar mesmo assim

Variações de diálogo, memória dos encontros e afinidade poderiam ser o elemento que diferencia Bites & Baits de um jogo de pesca convencional. Elas reforçariam a combinação de:

- **simulação:** relações e rotina da vila;
- **RPG:** progressão do personagem e consequências;
- **social:** NPCs com memória e vínculo;
- **gerenciamento:** decisões sobre tempo, dinheiro, casa e parque.

Essa combinação pode tornar o jogo único à sua maneira, mas a ambição precisa ser equilibrada com a capacidade real de produzir, localizar, testar e manter o conteúdo.

### 13.3 Riscos conhecidos

- explosão no número de estados e combinações de diálogo;
- necessidade de muitas falas para cada NPC e situação;
- dificuldade de garantir coerência narrativa;
- custo de tradução para PT-BR, inglês e húngaro;
- aumento da matriz de testes com TalkBack, perfis gramaticais e caminhos diferentes;
- flags difíceis de auditar e corrigir;
- risco de o jogador não perceber o efeito da afinidade;
- risco de o sistema consumir tempo que deveria ir para pesca, financiamento e parque.

### 13.4 Estratégia recomendada

Não implementar o sistema completo agora. Manter, porém, pontos de extensão:

- NPCs já possuem conversa padrão e eventos contextuais;
- flags narrativas devem ser separadas por evento;
- diálogos devem ser modulares, não espalhados pela lógica da pesca;
- cada NPC deve poder receber memória ou estado futuro sem reescrever o sistema inteiro;
- a afinidade, se aprovada, deve começar com um único NPC e poucas faixas de relação;
- primeiro testar uma pequena fatia vertical antes de criar uma simulação social ampla.

**Hipótese de protótipo futuro:** escolher Zeca ou Vitor, criar três estados simples de relação e testar se as mudanças de conversa realmente aumentam a sensação de vínculo. O protótipo só deve avançar se entregar valor perceptível sem comprometer o restante do jogo.

---

## 14. Fauna atual

Espécies presentes no catálogo ou nos pools atuais:

- Lambari;
- Tilápia;
- Truta;
- Dourado;
- Cará;
- Traíra;
- Piau;
- Curimbatá;
- Tucunaré;
- Peixe dourado ornamental;
- Pirarucu;
- Traíra grande;
- Pintado;
- Jaú.

A espécie, peso, raridade e função variam conforme mapa e zona. Os pools usam categorias como comum, incomum, rara e lendária/boss.

### 14.1 Dois parâmetros físicos planejados

A pesquisa será traduzida para dois parâmetros de dados:

- `weightRangeKg`: variação de peso em quilogramas;
- `lengthRangeCm`: variação de comprimento em centímetros.

O catálogo atual já possui `weightRange`, mas o campo `size` ainda é uma categoria fixa. A proposta é substituir a dependência de tamanho fixo por um comprimento sorteado dentro de `lengthRangeCm`, mantendo uma categoria textual calculada a partir do resultado.

A raridade ecológica continuará sendo contextual por mapa e zona. Tamanho e peso podem gerar qualidades como pequeno, comum, grande e troféu, mas não devem substituir automaticamente as categorias `common`, `uncommon`, `rare` e `legendary/boss` dos pools.

Um Boss não usa a rolagem comum de medidas: recebe o extremo superior de comprimento e peso definido para sua espécie no catálogo e qualidade individual de troféu. Assim, é sempre o maior e mais pesado exemplar que o catálogo considera biologicamente plausível; a dificuldade de captura é definida pelo perfil máximo de resistência da espécie, sem inventar limites biológicos novos.

### 14.2 Pesquisa inicial por espécie

As espécies comuns têm nomes populares ambíguos. Para a primeira referência, foram usados representantes científicos plausíveis. As faixas abaixo devem ser tratadas como **faixas biológicas de referência**, baseadas nos limites publicados para a espécie ou para a referência científica escolhida. Elas não devem ser substituídas por uma faixa artificial de jogo. A distribuição das capturas é que será controlada para favorecer exemplares comuns sem apagar os extremos biológicos.

| Espécie no jogo | Referência usada | Comprimento inicial | Peso inicial | Observação |
|---|---|---:|---:|---|
| Lambari | *Astyanax lacustris* | 3–13 cm | 0,005–0,12 kg | Peixe pequeno; FishBase registra máximo de 13,2 cm. |
| Tilápia | *Oreochromis niloticus* | 12–60 cm | 0,1–4,3 kg | FishBase registra máximo de 60 cm e 4,3 kg. |
| Truta | *Oncorhynchus mykiss* | 15–123 cm | 0,05–25,9 kg | Máximo biológico amplo; a faixa comum de pesca deve ser muito mais concentrada. |
| Dourado | *Salminus brasiliensis* | 20–100 cm | 0,2–31,4 kg | FishBase registra máximo de 100 cm e peso publicado de 31,4 kg. |
| Cará | *Geophagus brasiliensis* | 5–28 cm | 0,02–0,7 kg | FishBase registra máximo de 28 cm; peso do jogo deve usar faixa conservadora. |
| Traíra | *Hoplias malabaricus* | 10–65 cm | 0,05–3,8 kg | FishBase registra máximo de 65 cm e 3,8 kg. |
| Piau | *Leporinus friderici* | 10–40 cm | 0,05–1,5 kg | FishBase registra máximo de 40 cm e 1,5 kg. |
| Curimbatá | *Prochilodus lineatus* | 15–80 cm | 0,1–7,2 kg | FishBase registra máximo de 80 cm e peso publicado de 7,2 kg. |
| Tucunaré | *Cichla piquiti* | 10–48 cm | 0,05–1,8 kg | FishBase registra máximo de 48 cm e 1,8 kg. |
| Peixe dourado ornamental | *Carassius auratus* | 5–48 cm | 0,02–1,6 kg | FishBase registra comprimento comum de 10 cm, máximo de 48 cm e peso publicado de 1,6 kg; o jogo deve privilegiar a faixa ornamental. |
| Pirarucu | *Arapaima gigas* | 100–450 cm | 5–200 kg | FishBase registra comprimento máximo de 450 cm, comprimento comum de 200 cm e peso publicado de 200 kg. Deve ser extremamente raro. |
| Traíra grande | variante de troféu de *Hoplias* | 45–100 cm | 1,5–10 kg | Categoria de troféu do jogo; precisa de decisão sobre espécie exata antes da implementação final. |
| Pintado | *Pseudoplatystoma corruscans* | 30–182 cm | 1–100 kg | FishBase registra máximo de 182 cm e peso publicado de 100 kg; capturas comuns devem ficar muito abaixo do máximo. |
| Jaú | *Zungaro jahu* / grupo *Zungaro* | 30–140 cm | 1–50 kg | FishBase registra máximo de 140 cm; fontes de pesca relatam exemplares de grande porte. Deve permanecer raro e contextual ao Rio Doce. |

### 14.3 Regra de distribuição

Os limites biológicos máximos não devem ser usados como distribuição uniforme. A rolagem deve favorecer tamanhos comuns e reservar a parte superior da faixa para exemplares grandes ou troféus.

Proposta inicial:

- faixa baixa: capturas pequenas e comuns;
- faixa central: tamanho esperado da espécie;
- faixa alta: captura grande, com valor maior;
- extremo da faixa: troféu, condicionado a raridade, mapa, zona ou evento.

O valor pode continuar partindo do peso, com um bônus posterior por comprimento relativo, qualidade ou categoria de troféu. A raridade do pool deve continuar independente para evitar que todo peixe grande seja automaticamente lendário.

### 14.4 Raridade do exemplar

A raridade da espécie e a raridade do exemplar são conceitos diferentes:

- **raridade da espécie:** definida pelo mapa, zona, pool e função narrativa;
- **raridade do exemplar:** calculada a partir do peso e do comprimento daquele peixe específico.

Um lambari pode ser uma espécie comum e, ainda assim, um exemplar excepcionalmente grande ser raro. Da mesma forma, um pirarucu pode ser uma espécie lendária, mas um indivíduo pequeno da faixa biológica pode não ser um troféu.

Cada captura deve guardar, no mínimo:

- peso individual em quilogramas;
- comprimento individual em centímetros;
- raridade da espécie/contexto;
- raridade do exemplar;
- valor final calculado.

A geração deve usar a faixa biológica completa, mas com uma distribuição concentrada nos tamanhos e pesos comuns. Peso e comprimento precisam ser correlacionados: não devemos sortear duas variáveis independentes que produzam um peixe biologicamente incoerente.

Proposta de geração:

1. sortear um percentil biológico individual com distribuição favorecendo o centro da faixa;
2. derivar o comprimento a partir do percentil;
3. derivar o peso relacionado ao mesmo indivíduo, respeitando a faixa da espécie;
4. calcular o percentil relativo de comprimento e de peso;
5. combinar os dois percentis para definir a raridade do exemplar.

A regra inicial recomendada é exigir desempenho alto nas duas dimensões para classificar um peixe como troféu:

- **comum:** exemplar dentro da maior parte da faixa esperada;
- **incomum:** comprimento ou peso acima do padrão comum;
- **raro:** comprimento e peso significativamente altos para a espécie;
- **troféu:** comprimento e peso próximos do extremo biológico, ou um extremo excepcional compensado por um resultado muito alto na outra dimensão.

O score pode começar pela menor das duas posições relativas, para impedir que um peixe apenas muito comprido ou apenas muito pesado seja tratado automaticamente como troféu. Depois, o balanceamento poderá ajustar pesos diferentes para cada espécie sem alterar os dados biológicos.

O valor deve usar o peso real como base e aplicar um multiplicador moderado de raridade do exemplar. O comprimento pode participar do bônus de troféu, mas não deve duplicar excessivamente o efeito do peso.

### 14.5 Efeito por modo de jogo

As medidas e a raridade do exemplar terão efeitos diferentes conforme o modo:

#### Modo História

- o peixe capturado entra no inventário;
- o peso real é a base principal do valor em moedas;
- o comprimento e a raridade do exemplar podem aplicar bônus moderados;
- exemplares grandes e troféus devem gerar mais moedas sem transformar cada captura em enriquecimento rápido;
- a raridade da espécie continua influenciando o valor, separada da raridade individual.

Modelo conceitual:

`moedas = valorBaseDaEspecie × peso × multiplicadorDaEspecie × multiplicadorDoExemplar`

O resultado precisa continuar compatível com a economia do financiamento, da casa, dos equipamentos e do parque.

#### Pesca Livre

- o peixe não entra no inventário da História;
- não são concedidas moedas;
- o score deixa de ser apenas `+1` por captura;
- peso, comprimento, raridade da espécie e raridade do exemplar influenciam a pontuação;
- capturas pequenas e comuns ainda pontuam, mas exemplares grandes e troféus devem valer muito mais;
- o score deve recompensar habilidade e qualidade da captura, não somente a quantidade de peixes.

Modelo conceitual:

`pontuaçãoDaCaptura = baseDaEspecie + pontosDePeso + pontosDeComprimento + bônusDeRaridade`

O modo livre deve preservar uma pontuação compreensível para leitores de tela, exibindo o valor recebido naquela captura e o total acumulado.

### 14.6 Fontes da pesquisa

- [FishBase — *Astyanax lacustris*](https://www.fishbase.se/summary/Astyanax-lacustris)
- [FishBase — *Oreochromis niloticus*](https://fishbase.se/summary/SpeciesSummary.php?id=2)
- [FishBase — *Oncorhynchus mykiss*](https://www.fishbase.se/summary/oncorhynchus-mykiss.html)
- [FishBase — *Salminus brasiliensis*](https://fishbase.se/Summary/SpeciesSummary.php?id=56329)
- [FishBase — *Geophagus brasiliensis*](https://www.fishbase.se/summary/Geophagus-brasiliensis)
- [FishBase — *Hoplias malabaricus*](https://www.fishbase.se/FieldGuide/FieldGuideSummary.php?genusname=Hoplias&speciesname=malabaricus&c_code=170)
- [FishBase — *Leporinus friderici*](https://www.fishbase.se/summary/Leporinus-friderici)
- [FishBase — *Prochilodus lineatus*](https://www.fishbase.se/summary/Prochilodus-lineatus.html)
- [FishBase — *Cichla piquiti*](https://www.fishbase.se/summary/Cichla-piquiti)
- [FishBase — *Carassius auratus*](https://www.fishbase.se/summary/Carassius-auratus.html)
- [FishBase — *Arapaima gigas*](https://www.fishbase.se/summary/Arapaima-gigas.html)
- [FishBase — *Pseudoplatystoma corruscans*](https://www.fishbase.se/summary/Pseudoplatystoma-corruscans)
- [FishBase — *Zungaro jahu*](https://fishbase.se/summary/Zungaro-jahu)

A grafia e a espécie exata de nomes populares como lambari, cará, piau, traíra grande e jaú devem ser consolidadas antes de transformar todas as faixas em balanceamento definitivo.

---

## 15. Narrativa e mundo

### 15.1 Local principal

**Vila Barra Serena**, na região da Ilha Barra Serena e do Rio Doce.

### 15.2 Sonho do jogador

Construir o parque **Iscas&mordidas**. Esse objetivo existe na carta inicial e deve orientar a progressão de longo prazo.

### 15.3 Princípio de descoberta

O jogador deve descobrir o mundo por ação e conversa:

- não revelar a necessidade de equipamentos antes de o personagem ter motivo para perceber o problema;
- não disparar falas de ambiente em menus que representam apenas planejamento;
- permitir revisitar NPCs mesmo sem evento;
- usar diálogos para conectar novas mecânicas à narrativa.

---

## 16. Persistência atual

O jogo usa `localStorage`. Chaves relevantes:

- `bb_character`;
- `bb_story_opening_complete`;
- `bb_inventory`;
- `bb_coins`;
- `bb_baits`;
- `bb_baits_v`;
- `bb_equip`;
- `bb_initial_gear_received`;
- `bb_owned_equip`;
- `bb_active_boat`;
- `bb_house_level`;
- `bb_zonemap`;
- `bb_activezone`;
- `bb_map`;
- `bb_best`;
- `bb_time`;
- `bb_last_catch_story`;
- `bb_last_catch_free`;
- `bb_lake_shore_fished`;
- `bb_river_attempted`;
- `bb_zeca_river_advice`.

Flags narrativas devem ser documentadas neste GDD quando forem criadas. Toda flag de QA deve ser removida ou isolada de forma segura antes de uma release oficial.

---

## 17. Localização

Idiomas atuais:

- Português do Brasil;
- Inglês;
- Húngaro.

Toda mecânica nova precisa incluir as três traduções antes de ser considerada concluída. Além da tradução literal, revisar:

- nomes de NPCs;
- tratamento familiar de Zeca;
- concordância do jogador;
- comprimento para TalkBack;
- termos de equipamento;
- nomes de mapas e zonas;
- coerência de tom.

---

## 18. Arquitetura técnica atual

Projeto HTML/CSS/JavaScript sem framework.

Arquivos centrais:

- `index.html`: estrutura de telas e componentes;
- `game.js`: máquina de estados, fluxo da História, navegação e integração dos sistemas;
- `i18n.js`: traduções;
- `inventory.js`: inventário, moedas, iscas, equipamentos, barcos e persistência;
- `shop-data.js`: catálogo de loja e embarcações;
- `map-data.js`: mapas, zonas e pools de peixes;
- `fish-data.js`: catálogo de espécies;
- `npc-data.js`: presets visuais de NPCs;
- `travel-view.js`: tela e ações de viagem;
- `house-view.js`: apresentação da casa;
- `vessel-view.js`: apresentação do estaleiro;
- `shop-buy-view.js` e `shop-sell-view.js`: loja;
- `inventory-*`: abas do inventário;
- `fishing-hud-view.js`: HUD da pescaria;
- `hold-panel-view.js`: carga;
- `zone-view.js`: zonas;
- `result-view.js`: resultado;
- `screen-navigation.js`: troca de telas;
- `accessibility-announcer.js`: regiões de anúncio acessível;
- `a11y.js`: preferências de acessibilidade;
- `sensors.js`: sensores e fallback de teclado;
- `audio.js`, `city-music.js` e `opening-audio.js`: camadas de áudio não verbal e música;
- `character-*`: identidade, aparência e avatar;
- `visuals.js`: marcação visual.

### 18.1 Pontos técnicos para revisão

- Consolidar e verificar os arquivos de dados referenciados por `index.html`, especialmente dados da casa e folhas de estilo auxiliares.
- Evitar edições por substituição textual frágil em arquivos grandes.
- Após qualquer alteração de gameplay, fazer teste de fluxo completo, não apenas teste visual da tela inicial.
- Atualizar cache-buster dos scripts alterados.
- Não mover a release oficial sem validação explícita.

---

## 19. Estado de release

- **v2.6.0:** release oficial, permanece no commit `d3274ace8392bf8bda4f674c5a2672b0223a0fce`.
- **v2.6.0-test:** beta/pré-release atualizada para `0fd9ca4024f4d653710a5cd5e968f93fdd2bf4e3` com autorização de Anderson após QA automatizado. Validação manual da IDEA-031 com TalkBack/NVDA e sensores ainda pendente.
- **v2.6.0-risk:** pré-release de segurança atualizada, juntamente com a beta, para o mesmo commit `0fd9ca4024f4d653710a5cd5e968f93fdd2bf4e3`; inclui o protótipo IDEA-031 e geração de Bosses extremos. O antigo snapshot `4f1256d2b84b6c7bbfcf05c5b8d2868b97d4cbe3` continua ancestral no histórico do Git.
- GitHub Pages é o ambiente público de teste e atualmente aponta para `0fd9ca4024f4d653710a5cd5e968f93fdd2bf4e3`.
- A release oficial só muda após validação completa e autorização explícita.

---

## 20. Backlog de desenvolvimento

### P0 — Próximo ciclo obrigatório

- [ ] Garantir que o teclado e o celular sem sensores tenham uma experiência completa, não apenas um fallback técnico.
- [ ] Definir a divisão espacial da Vila Barra Serena em seções.
- [ ] Mapear a localização e as funções iniciais dos estabelecimentos planejados.
- [ ] Definir a hierarquia de dois headings para o hub e os menus da vila.
- [ ] Consolidar os dados da casa, custos, armazenamento e taxas de barco.
- [ ] Definir o mínimo obrigatório de casa/terreno necessário para iniciar o parque.
- [ ] Definir a primeira matriz de melhorias opcionais estruturais, funcionais e de conforto da casa.
- [ ] Relacionar melhorias opcionais da casa com financiamento, conforto, saciedade e stamina.
- [ ] Definir o mínimo temático do parque: tanques/viveiros e atividade de Pesque e Pague.
- [ ] Definir critérios, duração e relatório da simulação de inauguração.
- [ ] Definir resultados de lucro, prejuízo, falência e sucesso.
- [ ] Planejar o arco completo até a inauguração para garantir um primeiro título finalizável e comercializável.
- [ ] Definir a contratação opcional de veterinário/especialista em saúde aquícola e seu retorno de longo prazo.
- [ ] Revisar o fluxo completo de viagem, mapa ativo e zona ativa.
- [ ] Criar e validar a progressão narrativa depois da explicação de Zeca sobre o Rio Doce.
- [ ] Definir o próximo evento de Vitor no estaleiro.
- [ ] Mapear todas as flags narrativas em uma tabela única.
- [ ] Revalidar TalkBack em: Pessoas presentes, conversa com NPC, bloqueio do Rio Doce, loja e inventário.

### P1 — Expansão de conteúdo

- [ ] Lembrete para um ciclo próximo: adicionar um restaurante. Registrar para não esquecer, sem detalhar nem desviar agora do foco na loja de móveis e no sistema da casa.
- [x] Implementar o protótipo dos parâmetros biológicos de comprimento/peso e integrar as medidas individuais às moedas da História e à pontuação da Pesca Livre.
- [x] Implementar o protótipo de níveis, limiares de pontuação, pools progressivos, Bosses e reinício com perda dos pontos do nível em caso de fuga.
- [x] IDEA-033: gerar Bosses com comprimento e peso máximos biologicamente plausíveis e qualidade troféu; implementação publicada no Pages e nas pré-releases após QA automatizado. A integração dos encontros de História em quests permanece futura.
- [x] IDEA-035: o protótipo inicial da loja foi implementado e publicado no Pages (registro histórico abaixo). A revisão local atual substitui o fluxo de equipar na loja por compra para o inventário do jogador e equipagem pela aba Roupas do inventário; as peças iniciais escolhidas seguem gratuitas e equipadas. O móvel guarda-roupa está adiado, não deve ser exposto/desbloqueado na versão inicial. A cópia local já oculta o parentesco de Marta; a implementação local de IDEA-034 libera Dani somente após o equipamento inicial e com o módulo da loja carregado (status e QA registrados separadamente abaixo). QA automatizado dessa revisão passou; falta validação manual em navegador, teclado/TalkBack e revisão visual. Ainda não publicada.
- [x] IDEA-034: primeira implementação local da quest de Dani, com gate pelo equipamento inicial e pelo módulo da loja, diálogos PT/EN/HU, Boss lambari exclusivo da História na zona margem do mapa lago_margem durante a manhã, medidas biológicas máximas/qualidade troféu e resistência de Boss do nível máximo atual, estado persistente de captura, recompensa idempotente e propriedade persistente do desenho. QA focalizado (108 verificações, incluindo o anúncio conjunto de captura e retorno), loja, integração de dados, Pesca Livre, dinâmica de pesca e sintaxe passaram. Recompensa de 10 moedas é provisória, não aprovada como balanceamento final; o desenho está registrado como propriedade, ainda sem colocação na casa. Não validada manualmente em navegador/teclado/TalkBack e não publicada; nenhuma release foi alterada.
- [ ] Fazer QA manual com navegador, TalkBack, teclado e sensores.
- [ ] Revisar feedback visual externo: layout lado a lado do criador, posição do pescoço e indicador de aproximação/afastamento do peixe.
- [ ] Adaptar as instruções da pescaria à modalidade de controle ativa, sem exibir dicas de inclinação como se todo jogador estivesse usando um celular.
- [ ] IDEA-031: protótipo publicado e incluído na beta/risk após QA automatizado por autorização de Anderson; ainda validar manualmente no Pages com teclado, TalkBack/NVDA e sensores.
- [ ] Balancear faixas, valores, pontuação, limiares e dificuldade dos Bosses.
- [ ] Prototipar stamina, conforto e saciedade com uma atividade, dois alimentos/bebidas e poucos efeitos de conforto.
- [ ] Prototipar um minigame de atividade secundária, começando por apenas uma atividade.
- [ ] Prototipar uma viagem explorável isolada, com fallback por teclado e menu.
- [ ] Definir as aparências de Zeca, Marta e Dani, os NPCs atuais sem preset visual; Vitor já possui um preset em `npc-data.js`.
- [ ] Adicionar mais diálogos contextuais para Zeca.
- [ ] Desenvolver Vitor como NPC recorrente do estaleiro.
- [ ] Definir eventos de descoberta para zonas ocultas.
- [ ] Criar progressão narrativa da casa e do terreno.
- [ ] Conectar compra de barcos a eventos e necessidades do mundo.
- [ ] Balancear preços, recompensas, capacidade e tempo de progressão.
- [ ] Definir quais peixes são específicos de cada zona.
- [ ] Criar objetivos de médio prazo relacionados ao parque Iscas&mordidas.

### P2 — Polimento

- [ ] Projetar o sistema futuro de save voluntário, slots e cópias de segurança antes da inauguração.
- [ ] Avaliar empacotamento com Tauri e preparação para Google Play Store e itch.io.
- [ ] Revisar todas as traduções PT/EN/HU.
- [ ] Revisar concordância em todos os diálogos do jogador.
- [ ] Padronizar foco e retorno de foco em todos os modais.
- [ ] Fazer auditoria de elementos com `aria-hidden`.
- [ ] Revisar mensagens que podem ser sobrescritas por anúncios de estado.
- [ ] Melhorar feedback de bloqueios sem antecipar informação narrativa.
- [ ] Revisar desempenho e limpeza de listeners/timers.
- [ ] Criar cenários de QA reproduzíveis para progressão e flags.

---

## 21. Registro de ideias

Este registro recebe ideias novas antes de virarem tarefas. Uma ideia não deve ser tratada como decisão até receber status **Aprovada**.

### 21.1 Categorias de classificação

Uma mesma ideia pode receber mais de uma categoria:

- **Norte:** objetivos e identidade geral do jogo;
- **Financiamento:** parcelas, prazo, cobrança e planejamento;
- **Parque:** construção, atrações, personalização e sandbox;
- **Narrativa:** história, eventos, objetivos e progressão;
- **NPC:** personagens, presença, diálogos e relacionamentos;
- **Pesca:** controles, estados, peixes e dificuldade;
- **Economia:** moedas, preços, vendas e recompensas;
- **Mundo:** mapas, zonas, exploração e descobertas;
- **Equipamento:** varas, linhas, anzóis, boias, cestos e barcos;
- **Interface:** menus, fluxos, foco e feedback;
- **Acessibilidade:** TalkBack, teclado, ARIA e leitura;
- **Tecnologia:** arquitetura, persistência, desempenho e publicação.

### 21.2 Caixa de entrada

Ideias que ainda não foram classificadas podem ser colocadas aqui sem prejuízo. Depois, elas devem ser movidas para a tabela principal ou relacionadas a uma ideia existente.

- Nenhuma ideia pendente de classificação no momento.


| ID | Data | Ideia | Status | Próxima ação |
|---|---|---|---|---|
| IDEA-001 | 2026-08-24 | Transformar Pessoas presentes em sistema social persistente, com fala padrão e eventos contextuais. | **Aprovada / Atual** | Expandir NPCs e eventos. |
| IDEA-002 | 2026-08-24 | Fazer Zeca orientar sobre equipamentos somente depois de o jogador perceber a limitação no Rio Doce. | **Aprovada / Atual** | Preservar a ordem de descoberta. |
| IDEA-003 | 2026-08-24 | Usar Vitor como personagem recorrente do estaleiro, com novidades sobre barcos e vila. | **Aprovada para planejamento** | Definir primeiro evento pós-intro. |
| IDEA-004 | 2026-08-24 | Usar a casa e o terreno como eixo de progressão de longo prazo. | **Em definição** | Definir níveis, custos, funções e narrativa. |
| IDEA-005 | 2026-08-24 | Criar objetivos ligados ao parque Iscas&mordidas. | **Em definição** | Separar objetivos de curto, médio e longo prazo. |
| IDEA-006 | 2026-08-24 | Criar zonas ocultas reveladas por progresso, diálogo ou equipamento. | **Em definição** | Definir requisitos de cada zona. |
| IDEA-007 | 2026-08-24 | Organizar a História em dois objetivos principais: quitar o financiamento da casa e construir o parque sem prazo ou ordem obrigatória. | **Aprovada / Norte do jogo** | Definir sistema de parcelas e módulos do parque separadamente. |
| IDEA-008 | 2026-08-24 | Criar variações de diálogo e sistema de afinidade para aproximar o jogo de uma mistura de simulação, RPG, social e gerenciamento. | **Em análise / alto risco** | Preservar a possibilidade na arquitetura; avaliar um recorte pequeno antes de assumir o sistema completo. |
| IDEA-009 | 2026-08-24 | Usar Action Bas como referência para a pesca, Harvest Moon: Back to Nature para a vila/NPCs/calendário e Stardew Valley como refinamento e integração dos sistemas. | **Aprovada como referência** | Traduzir as referências em princípios próprios e aplicar por camadas, sem copiar sistemas inteiros. |
| IDEA-010 | 2026-08-24 | Dividir a Vila Barra Serena em seções geográficas, como ruas, praça e praia, com eventos, NPCs, estabelecimentos e casas próprios. | **Aprovada para planejamento** | Definir mapa hierárquico, conexões, ordem de descoberta e conteúdo de cada área. |
| IDEA-011 | 2026-08-24 | Organizar a interface por dois headings grandes: local atual/ações e personagem/informações pessoais. | **Aprovada para planejamento** | Definir a arquitetura de informação e aplicar primeiro ao hub e aos menus da vila. |
| IDEA-012 | 2026-08-24 | Criar minigames para atividades como cozinhar, dançar e preparar peixe para estocar. | **Em análise / escopo futuro** | Escolher uma atividade e testar um protótipo curto, acessível e com função clara. |
| IDEA-013 | 2026-08-24 | Dividir viagens entre barco e terra, selecionar o veículo adequado, explorar o caminho com sensores e descontar o tempo ao chegar. | **Em análise / alto risco** | Prototipar uma viagem isolada; preservar fallback por menu e teclado. |
| IDEA-014 | 2026-08-24 | Criar stamina para representar esforço físico; pesca e outras atividades consomem o recurso, enquanto comida, bebida e descanso podem recuperá-lo. | **Aprovada para planejamento** | Definir custos, recuperação e comportamento sem transformar o sistema em punição. |
| IDEA-015 | 2026-08-24 | Criar Conforto como medida das condições de conforto cotidiano do personagem; conforto alto reduz o custo de stamina e pode vir de casa, móveis, comodidades, itens prazerosos e futuramente relações sociais. Nome revisado de “bem-estar” para “Conforto” em 2026-10-03. | **Aprovada para planejamento** | Definir escala, fontes, limites do bônus e integração com casa, parque e NPCs; considerar a Saciedade como limite diário de uso de consumíveis que recuperam stamina e podem elevar um pouco o conforto. |
| IDEA-016 | 2026-08-24 | Planejar melhorias da casa com referências em The Sims, Stardew Valley e Popmundo, combinando estrutura, móveis, conforto, funções e gestão cotidiana. | **Aprovada para planejamento** | Definir melhorias estruturais, móveis, efeitos de Conforto, relação com financiamento e integração com stamina e Saciedade. |
| IDEA-017 | 2026-08-24 | Fazer o parque ser essencialmente temático sobre pesca, com possíveis tanques/viveiros; avaliar se peixes capturados podem iniciar criação ou se alevinos devem ser comprados. | **Em análise / sistema futuro** | Definir o mínimo temático do parque e separar criação opcional de requisito de abertura. |
| IDEA-018 | 2026-08-24 | Permitir a contratação opcional de veterinário/especialista em saúde aquícola para reduzir perdas e custos de manutenção dos peixes no longo prazo. | **Aprovada para planejamento** | Definir níveis de serviço, custos, riscos de saúde e retorno do investimento sem criar microgerenciamento excessivo. |
| IDEA-019 | 2026-08-24 | Usar tanques/viveiros e uma atividade de Pesque e Pague como base mínima do parque; o jogador declara a inauguração, o jogo simula o funcionamento e apresenta o resultado de lucro, prejuízo, falência ou sucesso. | **Aprovada / final do primeiro título** | Definir critérios, duração da simulação e relatório final sem deixar o arco sem encerramento. |
| IDEA-020 | 2026-08-24 | Considerar uma continuação não canônica, possivelmente um spin-off dedicado exclusivamente ao gerenciamento e à operação do parque. | **Possibilidade pós-jogo** | Não incluir no primeiro título; guardar para planejamento futuro após a validação do jogo principal. |
| IDEA-021 | 2026-08-24 | Criar no futuro um sistema de save voluntário que permita salvar antes da inauguração, testar a simulação, carregar o save e ajustar o parque caso o resultado não seja satisfatório. | **Aprovada para planejamento futuro** | Definir slots, cópias de segurança, comportamento da simulação e proteção do save de preparação. |
| IDEA-022 | 2026-08-24 | Fazer teclado e celular sem sensores terem uma experiência completa e atraente, usando narrativa, relações, gerenciamento, parque e pesca como valor além do acelerômetro. | **Aprovada / norte de acessibilidade e design** | Garantir paridade de conteúdo e criar sistemas que sustentem o jogo para qualquer forma de controle. |
| IDEA-023 | 2026-08-24 | Considerar Google Play Store e itch.io como canais prioritários, Tauri para executável e avaliar Steam, GOG e apt-game conforme custos e acessibilidade. | **Roadmap futuro** | Separar desenvolvimento, empacotamento, publicação e configuração financeira/fiscal. |
| IDEA-024 | 2026-09-11 | Adicionar peso e comprimento biológicos variáveis para que o valor e a raridade do exemplar sejam definidos pelas medidas individuais, sem confundir isso com a raridade da espécie no mapa. No modo História isso afeta moedas; na Pesca Livre, a pontuação. | **Protótipo local implementado** | Validar distribuição, faixas biológicas, percentis, multiplicadores de valor e score antes do balanceamento definitivo. |
| IDEA-025 | 2026-09-11 | Transformar a Pesca Livre em uma progressão por pontuação: novos níveis liberam mais espécies sem depender rigidamente de bioma/mapa, e cada avanço inicia um encontro com um Boss mais difícil. O Boss precisa ser capturado; se escapar, o nível reinicia e os pontos daquele nível são perdidos. | **Protótipo local implementado** | Validar níveis, limiares, pools, aparição/vitória/reinício dos Bosses, persistência da melhor pontuação e feedback acessível. |
| IDEA-026 | 2026-09-30 | No criador de personagem da História, exibir avatar e configurações lado a lado em telas com espaço, evitando rolagem repetida para conferir o resultado; em telas estreitas, manter uma composição responsiva sem perder a prévia. Feedback externo de Paulo Ribeiro. | **Implementado localmente; QA automatizado aprovado** | Validar layout renderizado em desktop e tela estreita, rolagem, prévia dinâmica, ordem do foco e leitura acessível antes de considerar concluído. |
| IDEA-027 | 2026-09-30 | Revisar a ilustração do personagem: o pescoço aparece abaixo da região do esterno, em posição anatômica visualmente estranha. Feedback externo de Paulo Ribeiro. | **Ajustado localmente; revisão visual automatizada favorável** | Renderizei e comparei variações de perfis e corpos: a nova forma liga a cabeça ao torso sem o antigo bloco baixo no peito. Confirmar escala no navegador e validar com retorno visual externo quando disponível. |
| IDEA-028 | 2026-09-30 | Adicionar um marcador visual na borda para indicar quando o peixe está se aproximando ou se afastando. Feedback externo de Paulo Ribeiro. | **Implementado localmente; QA automatizado aprovado** | O marcador diferencia fases e lados e usa região de status sem áudio novo; validar legibilidade, posição e anúncios no navegador/TalkBack. |
| IDEA-029 | 2026-09-30 | Paulo relatou que, jogando no PC, as instruções genéricas pareciam exigir manter um celular em posição neutra, apesar de ele estar usando teclado. Confirmou que a mensagem original terminava ali; não havia detalhe adicional sobre um defeito após a mordida. | **Causa identificada; correção local implementada** | A mensagem não contém relato posterior à mordida; testar as novas dicas específicas de cada controle sem inferir outro bug. |
| IDEA-030 | 2026-09-30 | Distinguir a modalidade de controle em uso (sensores ou teclado) e trocar as mensagens de orientação conforme a entrada detectada, incluindo aparelhos híbridos; não depender só de detecção do tipo de dispositivo. | **Implementado localmente; QA automatizado aprovado** | Validar troca de modalidade em PC, celular e teclado OTG, incluindo mensagens curtas/detalhadas, passividade do sensor e fallback quando indisponível. |
| IDEA-031 | 2026-09-30 | Diferenciar os três comportamentos durante o recolhimento: puxar contra a resistência do peixe aumenta o progresso e a tensão; manter o controle neutro estabiliza a tensão enquanto o peixe se debate e se cansa; soltar linha reduz a tensão, não cansa o peixe e desfaz o progresso de recolhimento, pois ele se afasta. A estratégia esperada é cansar o peixe primeiro e só então soltar linha para recuperar tensão: cansado, ele deve mover-se menos e ganhar pouca distância, limitando a perda de progresso durante o alívio. O produtor não percebeu essa integração no comportamento atual. | **Protótipo no Pages, beta e risk; QA automatizado aprovado; validação manual pendente** | Lógica numérica isolada em `fishing-combat.js`: puxar acrescenta progresso/tensão e ativa resistência; neutro conserva tensão e acumula fadiga; alívio reduz tensão, perde progresso proporcional ao movimento (menos para peixe cansado) e não acumula fadiga. A movimentação de fuga cansada é menor; a tolerância de snap permanece 100. QA focado e regressões passaram. Protótipo destinado à validação manual em teclado e sensores, incluindo leitura via TalkBack/NVDA. Pages é ambiente de teste. Após QA automatizado aprovado, Anderson autorizou atualizar `v2.6.0-test` e `v2.6.0-risk` para `0fd9ca4024f4d653710a5cd5e968f93fdd2bf4e3`; a validação manual com TalkBack/NVDA e sensores ainda está pendente. O snapshot anterior `4f1256d2b84b6c7bbfcf05c5b8d2868b97d4cbe3` continua ancestral no Git; oficial `v2.6.0` permanece em `d3274ace8392bf8bda4f674c5a2672b0223a0fce`. |
| IDEA-032 | 2026-10-01 | Reescrever a informação da captura como relato dirigido ao jogador, em vez de concatenar rótulos técnicos; conservar dados completos sob consulta. O aviso automático deve ser curto: “Última captura”, espécie, porte e raridade; no modo História, valor em moedas e ocupação da carga; na Pesca Livre, pontos ganhos e total. Detalhes completos permanecem disponíveis por F no PC. Feedback de Adri: o modelo narrativo completo é bom, mas falava informação demais entre pescarias. | **Aviso curto publicado no Pages; release de testes atualizada; funcionamento manual do F confirmado pelo produtor** | QA automatizado passou: sintaxe de 42 JavaScript, integração de 14 espécies/4 mapas, 16.813 asserções de Pesca Livre, QA de feedback e QA focalizado em PT/EN/HU, campos opcionais/zero, anúncio conciso e resumo completo. Uma versão anterior deixou de reler o resumo com F após trocar a região acessível; correção publicada no commit `4f1256d2b84b6c7bbfcf05c5b8d2868b97d4cbe3`, mantendo a fala automática curta e restaurando região `aria-live` separada, preenchida ao pedir a releitura. Release `v2.6.0-test` agora aponta para `4f1256d2b84b6c7bbfcf05c5b8d2868b97d4cbe3`; release oficial `v2.6.0` permanece intacta em `d3274ace8392bf8bda4f674c5a2672b0223a0fce`. |
| IDEA-033 | 2026-10-01 | Definir Bosses como os exemplares de maior porte, peso biologicamente plausível e resistência máxima de sua espécie; manter encontros frequentes por marco na Pesca Livre e, na História, dispará-los como eventos de missão principal ou secundária, com referência estrutural ao minigame de pesca de Final Fantasy XV. | **Geração publicada no Pages, beta e risk; QA automatizado aprovado; validação manual pendente** | Validar no Pages a experiência acessível da captura Boss. Preservar a frequência por progressão na Pesca Livre. Integrar os Bosses da História quando o sistema de quests/eventos estiver implementado; cada encontro definirá contexto, local, pré-requisitos, objetivo e consequência/recompensa sem extrapolar os limites biológicos.|
| IDEA-034 | 2026-10-02 | Estrear o sistema de quests com Daniel “Dani”, garoto de aproximadamente 10 anos presente na tela principal da Vila Barra Serena. Depois de receber o equipamento inicial de Zeca e após a loja de roupas estar carregada, o jogador pode aceitar a tarefa de capturar, pela manhã e na zona margem de lago_margem, um lambari excepcional que Dani viu. A quest dispara um Boss exclusivo da História, seguindo a regra do maior exemplar biologicamente plausível e da maior resistência atual de Bosses. A recompensa é o desenho do lambari como propriedade persistente para integração futura à casa e algumas moedas; somente no diálogo de retorno após a captura Dani revela que Marta é sua mãe e trabalha na loja. | **Implementada localmente; 108 verificações focadas e regressões aprovadas; não publicada** | O código implementa presença/diálogos PT/EN/HU, desbloqueio condicionado ao equipamento inicial e à existência do módulo da loja, estados persistentes, gate matinal e de mapa/zona, Boss lambari da História com medidas máximas e qualidade troféu, resistência baseada no nível máximo atual, captura, anúncio da captura e retorno em uma única mensagem acessível para evitar interrupção, recompensa idempotente e propriedade do desenho. QA: `qa_dani_quest.py` (108 verificações, incluindo anúncio combinado de captura e retorno), `qa_clothing_shop.py`, `qa_data_integration.py`, `qa_free_fishing.py` (16.863 asserções nesta execução; a contagem varia com a progressão aleatória), `qa_fishing_dynamics.py` e `qa_syntax.py` (49 arquivos JS) passaram. O pagamento de 10 moedas é provisório, não balanceamento final aprovado; o desenho é propriedade persistente, mas não pode ser colocado na casa até futura integração do sistema de casa. Faltam validações manuais em navegador, teclado e TalkBack. A implementação permanece local e não publicada; Pages não foi alterado. Repositório principal ainda não recebeu estas alterações; oficial `v2.6.0` e beta `v2.6.0-test` permanecem em `80860d0d08f508e4cece03915e01bc8a94cb169b`; risk `v2.6.0-risk` permanece em `78aaa744c531c77c93acb8356a3d0adc3aff862c` (estado anterior a esta implementação). Nenhuma release/tag foi alterada. |
| IDEA-035 | 2026-10-02 | Criar a loja de roupas onde trabalha a mãe de Dani e adicioná-la como NPC no estabelecimento; implementar a loja antes que a quest de Dani possa ser aceita. O catálogo inicial vende separadamente os componentes descritos nos cinco conjuntos de chegada e cinco conjuntos de pesca do criador de personagem; novas peças podem ser adicionadas conforme a progressão. Nome aprovado para a mãe: Marta. No primeiro protótipo, a loja é acessada pelo menu principal da vila; a disposição física dos locais será organizada depois. | **Protótipo publicado como versão anterior; refatoração do inventário/equipagem implementada localmente e ainda não publicada; guarda-roupa mobiliário adiado** | Catálogo aprovado de 38 variantes em 16 modelos, nomes de peças separados das cores, rotação diária e preços ainda provisórios. Compras entram no inventário do jogador; equipagem ocorre pela aba de roupas do inventário em contextos independentes de dia a dia e pesca. Peças iniciais selecionadas permanecem gratuitas, no inventário e equipadas. Migração cobre a propriedade/equipagem do save `bb_wardrobe_v1`. Guarda-roupa de armazenamento, sua aquisição/colocação e eventual capacidade ficam para um sistema futuro, fora da versão inicial. A tela, Pessoas presentes e falas genéricas não revelam o parentesco secreto; a quest local só fica disponível após o equipamento inicial e com o módulo da loja carregado. QA local da loja: `qa_clothing_shop.py` passou com 38 variantes/16 modelos, rotação em ambos os contextos, starters, compra sem cobrança duplicada, equipagem independente, persistência, migração legada e traduções PT/EN/HU; `qa_syntax.py` passou em 49 arquivos JS; `qa_data_integration.py` passou (14 espécies/4 mapas). Falta validação manual em navegador/teclado/TalkBack e inspeção visual. Esta revisão local não foi publicada; status de Pages e releases é registrado na linha IDEA-034. |

| 2026-10-02 | Protótipo da Loja de roupas da Marta | Implementada uma opção direta no hub da vila, catálogo com 20 peças PT/EN/HU derivadas dos dez conjuntos iniciais, preços provisórios de 8–22 moedas claramente identificados, compras/equipamento por contexto e guarda-roupa persistente. As roupas do conjunto de chegada e de pesca selecionados são concedidas sem custo. Marta aparece em Pessoas presentes; conversa genérica neutra. QA focalizado e suites existentes aprovados. Protótipo publicado no Pages no commit `06252296cf8d0779ce950aabdd6a6460166e99d9`; build confirmado e arquivos ao vivo verificados. Naquele momento, a quest de Dani ainda estava indisponível e sem implementação; Releases beta, risk e oficial não foram alteradas. |

### 21.3 Modelo para novas ideias

```text
IDEA-XXX
Data:
Título:
Descrição:
Por que a ideia melhora o jogo:
Sistemas afetados:
Riscos:
Dependências:
Status: Ideia | Em análise | Aprovada | Rejeitada | Implementada
Próxima ação:
```

### 21.4 Estados de uma ideia

- **Ideia:** registrada, sem compromisso de implementação.
- **Em análise:** sendo discutida ou prototipada.
- **Aprovada:** faz parte do planejamento.
- **Implementada:** entrou no jogo e precisa de validação.
- **Validada:** testada e aceita pelo produtor.
- **Rejeitada:** mantida no histórico para não ser reavaliada sem motivo.

---

## 22. Registro de decisões

- A release oficial atual é `v2.5.0`.
- A História tem dois objetivos principais: pagar o financiamento da casa e construir o parque Bites & Baits / Iscas&mordidas.
- As referências de design são Action Bas para a pesca, Harvest Moon: Back to Nature para a vila/NPCs/calendário e Stardew Valley para refinamento e integração.
- Minigames e viagens exploráveis são possibilidades futuras; devem ser prototipados isoladamente antes de entrar no jogo principal.
- Viagens com sensores sempre precisarão de alternativa acessível por teclado/interface e não podem bloquear a progressão sem validação.
- Stamina é o recurso imediato de esforço; Conforto é a condição cotidiana que reduz custos de stamina; Saciedade limita o uso diário de comida e bebida para recuperar stamina.
- As melhorias da casa combinarão estrutura, móveis, conforto, utilidade e gestão cotidiana, inspiradas em The Sims, Stardew Valley e Popmundo.
- Somente o mínimo de casa/terreno necessário para iniciar o parque será obrigatório; o restante será escolha estratégica do jogador.
- O parque deve ser reconhecivelmente sobre pesca; parque aquático será expansão possível, não requisito essencial.
- A compra de alevinos e a reprodução de peixes ainda estão em análise; a recomendação é não torná-las requisito para abrir o parque.
- A contratação de veterinário/especialista em saúde aquícola será opcional, com alto investimento inicial e possível economia de manutenção no longo prazo.
- O mínimo planejado do parque inclui tanques/viveiros e uma atividade de Pesque e Pague.
- O jogador declarará a inauguração quando considerar o parque pronto; o jogo simulará seu funcionamento, apresentará um relatório de resultado e encerrará a campanha do primeiro título.
- A História do jovem universitário frustrado termina quando ele consegue abrir o parque.
- O primeiro título deve ser concluído como produto completo e comercializável, evitando o beta eterno.
- A simulação da inauguração não deve destruir o desenvolvimento; no futuro, um save voluntário antes da tentativa permitirá testar, carregar e ajustar o parque.
- Uma continuação não canônica, possivelmente um spin-off de gerenciamento do parque, poderá explorar a operação contínua em outro título.
- O financiamento terá cobranças recorrentes e prazo, exigindo planejamento entre pagar, investir e evoluir.
- A construção do parque será um sandbox sem prazo e sem ordem obrigatória.
- O primeiro equipamento vem de Zeca e é entregue uma única vez.
- A entrega inicial contém 30 minhocas.
- O saldo inicial normal é 0 moedas.
- O Rio Doce exige Vara Média ou superior tanto na margem quanto no mapa navegável.
- O barco de alumínio não substitui a exigência da Vara Média.
- A fala da correnteza ocorre somente durante a tentativa de pescar no local.
- Pessoas presentes é permanente e não depende de eventos.
- Zeca não antecipa a informação da Vara Média em conversas comuns.
- Vitor pergunta se o jogador está se adaptando bem quando não há evento específico.
- O jogador deve usar concordância compatível com seu perfil gramatical.
- TalkBack e leitores de tela são parte obrigatória da experiência.
- O jogo não adiciona TTS próprio para duplicar o leitor de tela.
- A experiência por teclado e sem sensores deve ser completa e atraente, não um fallback pobre da experiência por movimento.
- Google Play Store e itch.io são os canais de publicação prioritários considerados; Tauri é uma possibilidade de empacotamento para desktop.
- O Mapa do Som não faz parte deste projeto nem deve ser associado a discussões sobre Bites & Baits.

---

## 23. Registro de desenvolvimento

Este GDD concentra a direção de design, as regras acordadas e o planejamento futuro. O histórico de implementação, QA, validação, publicação e releases fica separado no documento `DEVLOG.md`, mantido no repositório para consulta, mas excluído das releases e do pacote executável do jogo. Ao atualizar o devlog, distinguir sempre trabalho local, QA automatizado, publicação no Pages, inclusão em release e validação manual.

## 24. Critério de pronto para novas features

Uma feature só está pronta quando:

1. a regra de design está registrada neste GDD;
2. o fluxo principal está implementado;
3. os caminhos alternativos estão protegidos;
4. o estado persistente foi definido;
5. as traduções PT/EN/HU existem;
6. o foco e a leitura TalkBack foram revisados;
7. perfis feminino, masculino e neutro foram testados;
8. a feature foi testada visualmente;
9. não há mensagem narrativa aparecendo antes da descoberta correta;
10. o build foi confirmado;
11. Anderson validou a experiência quando houver impacto de acessibilidade ou gameplay;
12. somente depois disso a alteração pode entrar em uma release.

### Revisão da loja de roupas — variantes de modelo e cor (2026-10-02)

A loja deixa de exibir referências aos conjuntos do criador de personagem nas descrições voltadas ao jogador. Cada produto agora usa o nome do modelo/caimento (por exemplo, **Camiseta básica lisa**) e informa a cor separadamente. O mesmo modelo pode ter várias variantes de cor, permitindo rotatividade sem criar nomes baseados apenas em cor. O estoque da loja exibe uma variante por modelo a cada dia do calendário do jogo; itens já adquiridos continuam visíveis para que o jogador não perca acesso às próprias roupas. Os preços seguem provisórios. Alteração feita localmente; Pages e releases não foram alterados nesta etapa.

### Publicação da revisão de modelo/cor da loja (2026-10-02)

Anderson autorizou publicar a revisão no Pages. O catálogo agora contém 38 variantes de cor agrupadas em 16 modelos visuais; nomes descrevem o corte/tipo da peça e a cor é apresentada separadamente. As descrições ao jogador não mencionam conjuntos do criador. Uma variante de cada modelo aparece por dia in-game, de forma determinística; variantes já adquiridas continuam acessíveis no catálogo para vestir. Os mapeamentos internos que concedem gratuitamente as peças escolhidas na criação foram mantidos, preservando os saves e a roupa inicial. `qa_clothing_shop.py`, `qa_syntax.py` (47 arquivos JS) e `qa_data_integration.py` (14 espécies/4 mapas) passaram. Publicado em `b4e058753ae4fe1ccf02f159286fa43aeb7b2a69`; build `pages build and deployment` 37011055081 concluiu com sucesso e os arquivos atualizados foram confirmados ao vivo no Pages. Preços continuam provisórios. Nenhuma release alterada; validação manual TalkBack/teclado permanece pendente.

### Correção de revelação narrativa e fluxo de roupas (2026-10-02)

Decisão de Anderson: o parentesco de Marta e Dani é segredo para o jogador até a conclusão da quest de Dani. Não mostrar a relação na loja, em Pessoas presentes nem nas conversas genéricas de Marta; Dani revela no diálogo pós-conclusão. A cópia local da tela e do registro de NPC já foi corrigida, ainda sem publicação.

Decisão de Anderson: roupas compradas pertencem ao inventário do jogador e podem ser equipadas normalmente, sem guarda-roupa. O guarda-roupa é um móvel opcional adquirido e colocado na casa para ampliar o armazenamento de roupas. Estado atual: a refatoração de inventário/equipagem está implementada localmente, incluindo migração do estado antigo, peças iniciais gratuitas, persistência, compra e equipagem separada para dia a dia/pesca. O móvel e seu armazenamento, aquisição e colocação permanecem adiados; não devem ser expostos nem desbloqueados na versão inicial. O parentesco de Marta permanece oculto na loja, na lista de pessoas e nas falas genéricas. QA automatizado passou em 2026-10-02; verificação manual com navegador, teclado e TalkBack continua pendente. Esta revisão não foi publicada e nenhuma release foi alterada.

### Alinhamento das três releases (2026-10-02)

Após Anderson revisar a atualização do inventário de roupas e confirmar a validação visual do personagem, autorizou alinhar a release oficial, beta e risk ao commit `46bb434c01d63bac8afd2e559e5ba2beaf0d68f5`. Tags verificadas: `v2.6.0`, `v2.6.0-test` e `v2.6.0-risk` apontam para esse commit. Nenhum asset separado estava anexado às três releases; não alterei os textos das notas. As próximas mudanças continuam no Pages até nova autorização de release.

### Detalhamento de peças e cores no criador de personagem (2026-10-02)

Anderson observou que, após a loja passar a identificar cada peça pelo modelo e apresentar a cor separadamente, o criador de personagem deve oferecer o mesmo nível de informação. Alteração local: as opções dos cinco conjuntos de chegada e cinco conjuntos de pesca agora descrevem cada peça pelo nome do modelo e sua cor; o conjunto selecionado e o catálogo completo mostram as peças individualmente. Os nomes e as cores vêm do mesmo catálogo usado pela loja, em português, inglês e húngaro, preservando os conjuntos e as roupas iniciais já definidos. QA local: sintaxe de 48 arquivos JavaScript, QA da loja, integração de dados e 30 combinações de descrições nos três idiomas passaram. A alteração ainda não foi publicada no Pages nem em releases; falta revisão manual do criador com navegador, teclado e leitor de tela.

### Publicação do detalhamento de roupas no criador (2026-10-02)

Às 14:18, Anderson autorizou publicar a atualização do criador no GitHub Pages e atualizar somente a release de riscos. Publicação no commit `80860d0d08f508e4cece03915e01bc8a94cb169b`; o workflow do Pages concluiu com sucesso e a página e o arquivo do criador foram confirmados ao vivo. A tag `v2.6.0-risk` foi movida para o mesmo commit. As tags da beta `v2.6.0-test` e da oficial `v2.6.0` permanecem em `46bb434c01d63bac8afd2e559e5ba2beaf0d68f5`. A implementação e as verificações automáticas foram concluídas; revisão manual do criador com navegador, teclado e leitor de tela continua pendente.

### Alinhamento das três releases após validação do criador (2026-10-02, 14:30)

Anderson confirmou que a atualização das roupas no criador está funcionando e autorizou alinhar as três releases. `v2.6.0` e `v2.6.0-test` foram movidas para `80860d0d08f508e4cece03915e01bc8a94cb169b`; `v2.6.0-risk` já estava nesse commit. As três tags foram verificadas e apontam para a mesma revisão.

### Seleção dos conjuntos com descrições sob demanda (2026-10-02, 14:44)

Anderson sugeriu retirar os conjuntos das caixas de combinação e oferecer um botão de descrição abaixo de cada opção. Implementação local: os cinco conjuntos de chegada e os cinco de pesca agora são opções de rádio com nomes curtos; cada conjunto tem um botão que abre ou recolhe a lista de peças, modelos e cores. A lista está fechada inicialmente, evitando ocupar espaço antes de ser solicitada. O catálogo está integrado diretamente a essas opções, sem a lista geral duplicada. O sorteio aleatório, a prévia da personagem, o resumo e a validação de escolhas foram adaptados. Os rótulos de exibição e ocultação existem em PT/EN/HU. QA local: sintaxe de 48 arquivos JavaScript; testes de roupas e integração de dados passaram; teste focado confirmou dez opções, dez botões, expansão das peças/cor e atualização do resumo ao trocar seleção. Ainda não publicado no Pages nem nas releases; aguarda revisão do produtor.

### Publicação das opções de roupa com descrições sob demanda (2026-10-02, 15:11)

Anderson autorizou publicar a nova seleção no Pages. Commit `78aaa744c531c77c93acb8356a3d0adc3aff862c`; o deploy concluiu com sucesso. Na página publicada, o leitor de tela reconhece os dois grupos de opções, cada peça como uma opção de rádio e os botões “Ver descrição”; abrir um deles revela a lista de modelos e cores. A seleção individual e o sorteio aleatório foram verificados no navegador. As releases oficial, beta e risk não foram alteradas e continuam no commit `80860d0d08f508e4cece03915e01bc8a94cb169b`. Revisão manual com TalkBack/teclado permanece aberta para Anderson.

### Atualização da release de risco (2026-10-02, 15:27)

A pedido de Anderson, movi somente a tag `v2.6.0-risk` para o commit `78aaa744c531c77c93acb8356a3d0adc3aff862c`, que contém a nova seleção de conjuntos publicada no Pages. Verificado após a mudança: oficial `v2.6.0` e beta `v2.6.0-test` continuam no commit anterior `80860d0d08f508e4cece03915e01bc8a94cb169b`.

### Verificação do saldo da recompensa de Dani (2026-10-02, 18:12)

A recompensa usa o mesmo saldo persistente `bb_coins`: `Inventory.addCoins(10)` soma ao valor atual; teste direto com saldo 37 retornou e persistiu 47. O problema identificado era de apresentação: ao fechar a conversa da quest, o HUD da vila não era atualizado imediatamente, embora o saldo fosse gravado. Corrigi localmente para atualizar o HUD após a recompensa e anunciar tanto as moedas recebidas quanto o total, com traduções PT/EN/HU. `qa_dani_quest.py` passou com 111 verificações; `qa_syntax.py` passou para 49 arquivos JS e `qa_clothing_shop.py` passou. A correção ainda não foi publicada; aguardando autorização para atualizar o Pages.

### Categoria Decoração e inventário da recompensa (2026-10-02, 18:17)

A recompensa do lambari não estava em uma categoria de inventário: a primeira implementação salvava apenas `drawingOwned` no estado da quest. Criada a categoria persistente **Decoração** (`bb_home_decorations`) e o item único `dani_lambari_drawing`, com nome/descrição e aba acessível no inventário. Ao concluir a quest, o item é adicionado junto das moedas. Saves já concluídos com `drawingOwned: true` migram automaticamente para a nova coleção, sem duplicar a recompensa. `Inventory.getDecorations()` / `hasDecoration()` deixam uma API para o futuro sistema da casa; a colocação física continua adiada. QA de decoração, migração, 125 verificações da quest, sintaxe de 51 JS, loja, integração de dados, Pesca Livre e dinâmica da pesca passaram. A correção de atualização do HUD e do anúncio do saldo também está incluída localmente. Ainda não publicado no Pages nem nas releases.

### Categorias de quests e pós-conclusão de Dani (decisões confirmadas em 2026-10-02, 18:44)

As categorias de quests são **fixed** e **seasonal**. Uma quest fixed pode ser concluída uma única vez; quests seasonal poderão reaparecer periodicamente, conforme calendário ainda a especificar. “O lambari de Dani” é fixed: só aceita no estado `not_started`, seu Boss aparece enquanto a quest está ativa e a recompensa é idempotente. A aparição ambiental posterior do lambari não reinicia a quest nem paga sua recompensa novamente.

Depois da conclusão, um Boss lambari terá **5% de chance por dia do jogo** de aparecer pela manhã na Margem do Lago (`lago_margem` / `margem`). O sorteio diário é persistido e uma aparição positiva é consumida antes de gerar o peixe, evitando novos sorteios ou mais de um encontro no mesmo dia. Esse Boss ambiental não leva vínculo com a quest e pode ser vendido por **10 moedas**. A captura de missão, por outro lado, fica vinculada e protegida contra venda, descarte, venda por espécie ou venda em lote; ao falar com Dani, o peixe é removido do inventário. Migrações cobrem saves antigos nos estados `caught` e `completed`, sem apagar um Boss ambiental posterior.

Na primeira entrada na loja de roupas da Marta após a quest, abre-se o diálogo especial de agradecimento por ajudar seu filho, e ela oferece uma camiseta básica lisa de cortesia. A peça verde-sálvia `top_marta_courtesy` não entra na rotação comercial e é entregue uma única vez ao concluir o diálogo. Se a conversa for interrompida antes da entrega, permanece disponível na próxima entrada. A recompensa da quest continua sendo o desenho como decoração e **10 moedas provisórias**, somadas ao saldo persistente já existente; o HUD é atualizado e a fala informa o saldo total. O valor de 10 moedas da recompensa narrativa continua provisório e distinto do preço de venda de 10 moedas do Boss ambiental.

### Implementação final local, QA e publicação autorizada (2026-10-02)

As clarificações acima estão implementadas com traduções PT/EN/HU e cache-busting dos scripts alterados. As regressões passaram: `qa_dani_quest.py` (155 verificações), `qa_dani_quest_inventory.py` (21 verificações com o módulo Inventory real), `qa_home_decorations.py`, `qa_clothing_shop.py`, `qa_data_integration.py`, `qa_free_fishing.py` (16.864 asserções nesta execução), `qa_fishing_dynamics.py` e `qa_syntax.py` (51 arquivos JavaScript). A atualização autorizada foi publicada no branch `main` pelo commit `c276447c05fcb75252fb70708b71c3532344e3d3` (“Complete Dani quest rewards and post-quest content”); o build de Pages `1256007559` concluiu em estado `built`. Verificação pública ao vivo confirmou a página e os scripts versionados, incluindo `dani-quest.js`, `inventory-decoration-view.js` e `clothing-catalog.js`: https://concego.github.io/bites-and-baits-full/. Nenhuma release ou tag foi alterada. Continua pendente validação manual em navegador, teclado e TalkBack.

### Alinhamento das três releases após atualização do Pages (2026-10-02, 19:44)

A pedido de Anderson, as tags `v2.6.0`, `v2.6.0-test` e `v2.6.0-risk` foram movidas para `c276447c05fcb75252fb70708b71c3532344e3d3`, o commit publicado no Pages com as mudanças de quests, retorno do Boss lambari, proteção/remoção do peixe, presente da Marta, categoria Decoração e correção do HUD de moedas. As três referências foram consultadas após a mudança e confirmadas no mesmo commit. Não alterei os textos das releases nem anexos.

### Proposta de inventário unificado por pilhas e peso (2026-10-03, 10:53)

Anderson propôs usar as categorias como filtros da lista do inventário, limitar inicialmente o inventário a 12 itens distintos e empilhar unidades iguais; o peso total deve somar o peso individual de cada unidade. Uma pilha poderá conter, por exemplo, 100 cadeiras se o personagem puder carregar o peso combinado. No código atual, as abas já filtram categorias visualmente, mas os dados ficam em coleções separadas: peixes individuais com peso conhecido, iscas empilhadas por tipo, equipamentos/roupas/decoração em outras coleções. A capacidade da pesca continua baseada em quantidade de peixes (cesto 8/12/16; barcos variam até 250), e não existe limite geral de peso do personagem. Antes de implementar, definir o peso máximo inicial e se a capacidade de cesto/barco permanece como limite separado da mochila global.

### Proposta de atributos de personagem com efeito no gameplay (2026-10-03, 10:57)

Anderson quer definir atributos que afetem diretamente o gameplay, citando Força para capacidade de carga e eficiência ao puxar o peixe para a margem. Ideia em análise, sem implementação ou escala numérica aprovada. Ao especificar, preservar as mecânicas de tensão/fadiga/alívio da IDEA-031, a relevância dos equipamentos e a equivalência entre teclado e sensores. Sugestão de escopo mínimo: começar por Força e só acrescentar outro atributo quando existir uma função de gameplay clara para ele.

### Progressão proposta para Força (2026-10-03, 11:00)

Anderson confirmou a intenção de combinar um valor inicial definido na criação do personagem com aumentos obtidos por atividades durante o jogo. O valor total deverá refletir uma base inicial mais o treinamento acumulado; escala, limite máximo, método de escolha na criação e atividades que concedem progresso ainda não foram definidos. Ao especificar atividades, premiar esforço significativo do jogo (não repetição de botão/ação sem custo) e manter os efeitos de Força pequenos e balanceáveis.

### Atributos, Stamina, Conforto, Saciedade, Presença e Inteligência (2026-10-03, 11:03–11:42)

Anderson pediu retomar a definição do conjunto de atributos e suas aplicações junto das propostas anteriores de Stamina e Conforto. Manter os conceitos separados: Força é um atributo persistente, definido inicialmente na criação e melhorado por atividades; Presença é um atributo dinâmico, que pode aumentar ou diminuir conforme as ações e a apresentação do personagem, incluindo roupas bem trabalhadas, fachada da casa e participação em eventos sociais, e representa como a cidade o percebe; Inteligência influencia a capacidade de aprender novas habilidades e receitas de itens quando aplicável, além do tempo necessário para ler ou aprender com outra pessoa; Stamina é o recurso imediato gasto em esforço e recuperado por descanso, comida ou bebida; Conforto representa as condições confortáveis da vida cotidiana e pode reduzir, com limite, o gasto de Stamina; Saciedade representa o quanto o jogador pode usar comida e bebida diariamente para recuperar Stamina, com pequenos aumentos de Conforto. Saciedade não deve virar uma mecânica punitiva de fome. Efeitos concretos de Presença e Inteligência, demais aplicações dos atributos, progressão, fórmulas e limites ainda serão definidos. Nesta etapa, Anderson pediu apenas registrar no GDD; nenhuma implementação de código foi autorizada.
