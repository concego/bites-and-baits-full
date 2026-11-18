# Arquitetura de conteúdo, dados e persistência — Bites & Baits

**Status:** direção arquitetural aprovada para orientar planejamento; não é autorização para uma refatoração ampla nem para publicar. Decisões marcadas como pendentes precisam ser discutidas antes de implementação que dependa delas.
**Última atualização:** 2026-11-18.

## Objetivo do projeto

Reduzir o tamanho e o acoplamento dos arquivos para que ajustes e correções localizados não atinjam acidentalmente sistemas não relacionados. A separação deve diminuir o tempo gasto investigando e corrigindo regressões e deixar mais capacidade para desenvolver o jogo. O objetivo é modularidade coesa, com responsabilidades e contratos explícitos — não maximizar a quantidade de arquivos.

## Plataformas e ambiente de teste

- GitHub Pages é usado por conveniência para desenvolvimento e testes; **não define a plataforma de lançamento** e o jogo não será lançado como jogo web.
- A direção de distribuição informada por Anderson é: aplicativo Windows empacotado com Tauri e Android empacotado com Capacitor para gerar AAB destinado à Play Store.
- Conteúdo fixo do jogo deve poder ser empacotado localmente com cada aplicativo; a arquitetura de conteúdo não deve exigir servidor remoto.
- **Sequência de desenvolvimento definida por Anderson:** continuar desenvolvendo e testando no GitHub Pages durante a produção do jogo. Windows/Tauri, Android/Capacitor e compilação/empacotamento nativo são tarefas finais, a realizar quando o jogo estiver pronto; não exigir agora que cada etapa de conteúdo implemente ou valide builds nativas.
- O estado de cada partida será inicialmente salvo localmente no respectivo dispositivo.
- Um servidor para sincronização ou outros serviços online é uma possibilidade futura, sem garantia. Não criar dependências de conta, servidor ou sincronização com base nessa possibilidade.

## Conteúdo fixo versus estado mutável

Manter uma fronteira explícita entre:

1. **Conteúdo fixo, versionado com o jogo:** NPCs, definições de quests, itens, lojas, peixes, equipamentos, barcos, mapas, zonas e catálogos futuros.
2. **Lógica:** regras de quests, pesca, inventário, compra/venda, apresentação e navegação; mantê-las em módulos por responsabilidade, não embutidas em catálogos monolíticos.
3. **Save mutável do jogador:** progresso de quests, inventário, dinheiro, escolhas e demais estados da partida. O save é separado do conteúdo fixo e permanece local em cada dispositivo na primeira versão.

Não usar um banco de dados local como destino automático para os catálogos fixos. Formato e tecnologia de persistência dos saves são uma decisão separada; servidor futuro permanece fora do escopo garantido.

## Direção para dados de conteúdo

- Organizar os dados em conjuntos coesos por domínio, evitando arquivos enormes que misturem dados e lógica de vários sistemas.
- Cada registro deve ter um ID estável sempre que outros dados precisarem referenciá-lo.
- Catálogos de roupas, itens/equipamentos, barcos, peixes, mapas e zonas ficam separados da lógica que os consome.
- Dados de cada loja definem os itens/serviços associados usando IDs de catálogo; regras comuns de compra e venda ficam fora dos registros de catálogo.
- Definições de quests ficam separadas dos registros visuais dos NPCs. Quests podem referenciar por IDs um ou mais NPCs, itens, peixes, mapas e zonas. Progresso e estado de conclusão ficam no save do jogador, não no arquivo fixo da quest ou do NPC.
- Manter fronteiras por responsabilidade e coesão. Não criar um arquivo por cada valor ou dividir artificialmente estruturas pequenas só para aumentar a contagem de arquivos.

## Criador autônomo de NPCs e exportação

- A ferramenta de autoria de NPCs reutiliza literalmente a mesma interface do criador de personagem do jogador, mas é executada de forma autônoma, desconectada do jogo geral e exclusivamente para criar NPCs.
- O protagonista é uma pessoa jovem em idade universitária. As opções de roupa do jogador representam o que ele possui em casa, em seu guarda-roupa, portanto são limitadas. A ferramenta de NPC oferece mais opções para características e roupas, sem expor automaticamente todas elas ao criador do protagonista.
- Aparência, idade e roupas de NPCs devem refletir dados efetivamente definidos. Não inferir nem inventar características que não foram definidas.
- Ao concluir um NPC, a ferramenta pode gerar um arquivo com suas definições visuais para inclusão posterior no jogo.
- **Direção definida:** usar JSON como formato-fonte dos dados de conteúdo. A ferramenta autônoma de criação de NPCs exporta um arquivo JSON por NPC, contendo as definições do personagem e sua aparência.
- **Direção definida:** cada quest tem definição própria em JSON, separada do arquivo do NPC e referenciada por IDs estáveis. O save guarda apenas o progresso mutável da quest.
- Catálogos de itens, roupas/equipamentos, barcos, peixes, mapas e zonas são organizados em arquivos JSON coesos por domínio, e não num único arquivo monolítico nem necessariamente um arquivo por item. Os registros de cada loja referenciam os IDs dos catálogos que ela utiliza; as regras da loja permanecem na lógica própria do sistema de loja.
- Os arquivos JSON são fontes modulares versionadas no repositório. A direção de integração aprovada é um manifest principal que aponta para índices por domínio; cada índice lista os arquivos JSON daquele domínio. Assim, adicionar um NPC ou quest afeta o índice pertinente, sem engrossar um manifest global único.
- O jogo terá um carregador central de conteúdo que lê o manifest e os índices, valida/reúne os dados e os expõe por APIs de domínio estáveis. As telas e sistemas não devem buscar caminhos de JSON nem ler arquivos por conta própria.
- Os JSONs modulares permanecem a fonte de autoria. Se, e quando, o número de arquivos ou o desempenho/empacotamento justificar, a preparação da build pode gerar um pacote consolidado validado; isso é uma otimização posterior, não substitui a organização modular de origem nem é requisito inicial.
- O arquivo exportado pelo criador de NPCs contém definições de personagem/aparência. Não presumir que ele também gere ou embuta assets SVG/arte prontos.

## Integração e preparação de dados

- Durante o desenvolvimento, a integração de conteúdo deve funcionar primeiro no Pages, que é o ambiente disponível e conveniente para testar. Não bloquear o trabalho atual à espera de Tauri, Capacitor ou builds nativas.
- A arquitetura deve evitar dependência de servidor e conservar a possibilidade de empacotar os mesmos dados com Tauri/Windows e Capacitor/Android na fase final. Verificação específica em cada pacote nativo pertence a essa fase, depois de o jogo estar pronto.
- A arquitetura atual confirmada é HTML/CSS/JavaScript com scripts clássicos carregados em ordem fixa pelo `index.html`, sem `import`/`export` nativos. Considerar essa realidade ao planejar a migração, mas não a tratar como limite permanente das versões empacotadas.
- Manter arquivos-fonte pequenos/modulares, validados antes da build; permitir pacote consolidado apenas quando necessário. O jogo consome dados pelo carregador e por interfaces de domínio estáveis, sem cada tela conhecer caminhos físicos.
- **Pendente para a próxima fatia de desenvolvimento:** definir o contrato técnico do manifest principal, índices de domínio e carregador central, incluindo formatos, validação, tratamento de erro e funcionamento no Pages. A direção funcional (manifest → índices por domínio → registros JSON → carregador central) está aprovada; a fatia inicial deve manter o Pages como alvo de execução/teste.
- A compatibilidade final com Tauri e Capacitor precisa ser preservada na arquitetura, mas não exige configurar, compilar ou validar apps nativos agora. Fazer essa integração e seus testes específicos quando o jogo estiver pronto para a etapa final de distribuição.
- **Pendente:** definir schema/versionamento dos JSONs, regras de validação, formato/versão do manifest e índices, comportamento para referências inválidas e o fluxo que integra a exportação do criador ao repositório. Esses contratos devem viabilizar o desenvolvimento e o teste atuais no Pages; não dependem de antecipar a compilação nativa.
- **Pendente:** decidir fronteiras concretas e sequência de modernização dos módulos atuais. Não fazer uma migração ampla de `game.js` ou do carregamento de scripts apenas porque os dados passarão a ser modulares.

## Salvaguardas para evolução

- Antes de alterar um subsistema existente, examine sua implementação e dependências atuais; não tome snapshots locais como fonte de estado canônico.
- Faça mudanças focadas, por etapas pequenas, preservando APIs e contratos existentes quando possível. Evite combinar reorganização de arquitetura com mudança de gameplay sem aprovação explícita.
- Um ajuste em uma loja não deve exigir editar a lógica de fishing, inventário ou quests quando uma fronteira de dados/regra clara puder evitar essa dependência.
- Validar referências cruzadas entre quests, NPCs, lojas, itens e locais de maneira automatizada quando a futura organização estiver definida.
- Testar o componente alterado e suas integrações relevantes; QA automatizado, validação manual, Pages, releases e validação final são etapas distintas.
- Manter os arquivos internos de orientação fora de pacotes distribuídos, conforme as regras existentes em `AGENTS.md` e `.gitattributes`.
- Esta direção não autoriza publicação no Pages, atualização de releases ou alteração do repositório da demo.

## Ordem de execução aprovada

O roteiro detalhado de fatias, seus escopos, dependências e critérios de aceitação está em [`content-data-roadmap.md`](content-data-roadmap.md). A próxima fatia é construir no Pages uma vertical slice do manifest → índice de NPCs → JSON do Vitor → carregador central → validação, sem migrar lojas, quests ou outros catálogos. Antes de executar, ler o roteiro e tratar seus limites e critérios como parte da especificação.

## Próximas decisões antes de uma especificação executável

1. Escolher o primeiro recorte pequeno que demonstrará o fluxo — por exemplo, um NPC e uma quest — sem migrar todos os catálogos.
2. Definir se o criador deve exportar somente a ficha visual do NPC ou também dados textuais/descrições, e confirmar o contrato entre criador e jogo.
3. Especificar os schemas dos JSONs de NPC, quest e catálogos por domínio, incluindo IDs e referências estáveis.
4. Definir e implementar carregamento inicial que funcione no Pages, sem servidor, mantendo os dados em JSON modular. Deixar a configuração, compilação e validação de Tauri/Windows e Capacitor/Android para a etapa final, quando o jogo estiver pronto.
5. Especificar e implementar o manifest principal, os índices de domínio, o carregador central e a validação por uma fatia pequena. A alteração de `index.html` e de outros pontos de entrada está prevista como necessária para conectar o carregamento; não preservar a estrutura atual à custa de impedir a arquitetura aprovada.
6. Definir se o recorte exige novos módulos, validação de dados, migração de saves ou todos esses elementos; não inferir.
7. Só depois produzir especificação de implementação completa para o recorte aprovado, com escopo, dados, estados, dependências, acessibilidade, localização, compatibilidade, testes e critérios de aceitação.
