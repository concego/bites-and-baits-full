# Orientações para agentes de IA — Bites & Baits

## Escopo e autoridade

- Este é o repositório de desenvolvimento da versão completa de Bites & Baits.
- Trabalhe somente neste repositório e nas tarefas pedidas por Anderson.
- Existe um repositório separado que hospeda uma demo. Não o altere, não copie arquivos para ele, não o sincronize nem publique nele. Qualquer ação nesse repositório depende de autorização explícita de Anderson.
- Não publique versões, releases ou alterações em ambientes hospedados sem autorização explícita. Desenvolver ou testar uma mudança não significa que ela está aprovada para publicação.
- Antes de editar, consulte o estado atual dos arquivos e preserve mudanças existentes. Não descarte, reverta ou sobrescreva trabalho sem autorização.
- As decisões de Anderson prevalecem sobre sugestões da IA, comentários antigos e suposições feitas a partir do código.

## Documentos de orientação e releases

- `AGENTS.md` e documentos criados para orientar o desenvolvimento são internos ao repositório: não devem fazer parte de releases ou outros pacotes de distribuição.
- Guarde novos documentos dessa finalidade em `dev-instructions/`. Arquivos de instruções específicos de subdiretórios podem usar o nome `AGENTS.md` onde forem necessários. Ambos estão excluídos dos arquivos gerados por `git archive` por `.gitattributes`.
- Em pacotes montados por outros processos, exclua esses documentos explicitamente e confira o conteúdo antes de publicar. Não presuma que `.gitattributes` controla ferramentas que não usam `git archive`.
- Não remova créditos ou licenças necessários à distribuição sob pretexto de excluir orientações internas.

## Antes de trabalhar

1. Leia o README e os documentos pertinentes à tarefa. No mínimo, considere `LORE-FOUNDATION.md`, `VISUAL-DESIGN-STANDARD.md` e `AUDIO-SOURCES.md` quando forem relevantes.
2. Examine a implementação existente antes de propor ou alterar arquitetura. Não presuma que os documentos descrevem perfeitamente o estado atual do código: compare as duas fontes e relate divergências.
3. Se uma decisão importante estiver indefinida ou houver conflito entre requisitos, pergunte diretamente a Anderson antes de escolher uma solução que altere o design.
4. Faça mudanças focadas na solicitação. Evite refatorações amplas, dependências novas e alterações de conteúdo não relacionadas.

## Identidade e objetivos do jogo

- Bites & Baits é um jogo de pesca e gerenciamento, com os modos História e Pesca Livre.
- A acessibilidade faz parte da arquitetura e da experiência principal: pessoas cegas e videntes devem poder participar da mesma atividade, sem uma versão separada do jogo.
- Celulares com sensores e computadores com teclado devem oferecer experiências completas. Sensores são um diferencial, não uma exigência para acessar o conteúdo principal.
- Na História, preserve a progressão pela Vila Barra Serena, a pesca, os equipamentos, os personagens, os relacionamentos e a construção gradual do parque temático de pesca Iscas&mordidas.
- O primeiro jogo deve ter um arco completo: a personagem constrói e inaugura o parque; depois, uma simulação apresenta o resultado do empreendimento e encerra a campanha de gerenciamento. Não transforme o jogo em uma experiência sem fim ou em um “beta eterno”.
- A construção do parque deve manter a pesca como tema central. Tanques/viveiros e Pesque e Pague são a base mínima planejada; um parque aquático é expansão opcional.
- Não torne obrigatórios a compra de alevinos, a reprodução de peixes ou a contratação de especialista em saúde aquícola. São escolhas opcionais de longo prazo.
- Só o mínimo necessário de casa e terreno para começar o parque é obrigatório. Melhorias, móveis, comodidades, armazenamento, garagem, doca, conforto e decoração devem continuar sendo escolhas estratégicas.
- Sempre que for possível, o jogador deverá poder salvar antes da simulação de inauguração, ver o resultado e carregar o save anterior para ajustar o parque e tentar de novo.
- O guarda-roupa extra fica para depois da versão inicial. Não antecipe esse sistema sem solicitação.

## Pesca e modos de jogo

- Mantenha História e Pesca Livre separados onde o design prevê separação, incluindo inventários, históricos de capturas e dados persistidos.
- Na Pesca Livre, não consuma iscas nem dependa do inventário da História.
- Preserve os controles existentes e a física compartilhada. O uso do teclado não deve alterar nem simplificar a mecânica principal de pesca por sensores.
- Na briga com o peixe, preserve esta lógica:
  - Puxar aumenta o progresso da captura e também eleva a tensão.
  - Neutro estabiliza a tensão enquanto o peixe luta e se cansa.
  - Aliviar reduz a tensão, mas o peixe pode se afastar e diminuir o progresso.
  - Um peixe cansado se afasta menos durante o alívio; a linha arrebenta se a tensão alcançar o limite.
- Trate a IDEA-031 como prioritária para o núcleo da pescaria. Não a adie em favor de funcionalidades secundárias. Reduza riscos com protótipo e testes focados, sem alterar a mecânica aprovada por conta própria.
- A abertura narrativa depende da criação da personagem. Use o nome e o gênero escolhidos pelo jogador, com as concordâncias necessárias. Mantenha nomes narrativos localizados no catálogo de textos, e não hardcoded nas frases.
- Consulte `LORE-FOUNDATION.md` antes de ampliar ou contradizer a história. Elementos que o documento deixa deliberadamente em aberto não são decisões já aprovadas.

## Acessibilidade e comunicação

- Não trate acessibilidade como acabamento posterior. Considere-a em requisitos, arquitetura, implementação e validação de cada mudança.
- Mantenha informações e ações importantes acessíveis por teclado e compatíveis com leitores de tela. Não dependa apenas de cor, som, animação, posição visual ou sensores para comunicar estado.
- Use semântica, foco, rótulos e anúncios acessíveis adequados. Anuncie mudanças importantes sem criar anúncios excessivos ou repetitivos.
- Não adicione fala sintetizada própria para repetir o que o leitor de tela já consegue ler.
- Não peça a Anderson para inspecionar visualmente algo. Para aspectos visuais, descreva a mudança tecnicamente e forneça meios acessíveis de revisão ou feedback externo quando necessário.
- Após uma captura, a comunicação imediata deve ser curta: nome do peixe, tamanho e classificação (grande ou pequeno), mais pontos na Pesca Livre ou moedas na História. A capacidade continua indicada.
- Deixe os demais detalhes em uma seção acessível e consultável sobre a última captura; o título dessa seção pode substituir “Boa Pescaria”. Não interrompa o ritmo com um anúncio longo.
- Ao validar, diferencie compatibilidade técnica presumida de validação real com leitor de tela e dispositivos.

## Código, assets e implementação

- Siga a arquitetura, os padrões e as tecnologias já adotados no repositório. Não introduza framework, biblioteca ou serviço externo sem necessidade justificada e autorização quando houver impacto relevante.
- Fatore o código e os conteúdos do jogo em arquivos e pastas separados por responsabilidade, criando quantos módulos forem necessários para manter cada parte compreensível e fácil de localizar, testar e corrigir. Evite arquivos monumentais que concentrem sistemas sem relação ou muitas responsabilidades.
- Antes de acrescentar lógica a um arquivo já grande, avalie se ela deve ficar num módulo próprio ou num módulo existente de responsabilidade específica. Prefira delimitar a mudança ao subsistema afetado para reduzir o risco de quebrar comportamentos que já funcionam.
- Mantenha coesão: não divida em arquivos minúsculos ou camadas artificiais sem benefício claro. Respeite o carregamento, as dependências e os padrões do projeto; se a separação exigir mudança arquitetural ampla ou risco de regressão, explique o plano e peça decisão antes de prosseguir.
- Separe também conteúdos, dados e documentação de desenvolvimento quando isso facilitar manutenção; não misture especificações e anotações internas com arquivos executados pelo jogo.
- Ao refatorar ou extrair módulos, preserve APIs e contratos existentes sempre que possível e teste as integrações afetadas, não apenas o arquivo recém-criado.
- Reutilize os assets existentes quando forem adequados. Não substitua áudio ou arte aprovada por placeholders, síntese improvisada ou assets de origem/licença incerta.
- Para mudanças de áudio, consulte `AUDIO-SOURCES.md`; preserve créditos e requisitos de licença.
- Atualize documentação quando uma mudança aprovada alterar comportamento, controles ou estado do projeto. Não use a documentação para transformar uma decisão pendente em decisão tomada.

## Testes e prestação de contas

- Antes de testar, identifique quais verificações são possíveis no ambiente disponível e execute as relevantes.
- Relate separadamente:
  1. o que foi alterado;
  2. verificações estáticas ou automatizadas executadas e seus resultados;
  3. testes manuais realmente realizados;
  4. o que ainda não foi possível validar.
- Não diga que uma mudança foi “testada”, “aprovada” ou “validada” se só houve leitura de código, revisão estática ou publicação.
- Não afirme que Anderson aprovou uma mecânica ou teste sem confirmação explícita dele.
- Não atualize releases, README de distribuição ou publicação hospedada sem cumprir as aprovações definidas por Anderson para aquela etapa.
