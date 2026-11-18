# Arquitetura de conteúdo, dados e persistência — Bites & Baits

**Status:** direção arquitetural aprovada para orientar planejamento; não é autorização para uma refatoração ampla nem para publicar. Decisões marcadas como pendentes precisam ser discutidas antes de implementação que dependa delas.
**Última atualização:** 2026-11-18.

## Objetivo do projeto

Reduzir o tamanho e o acoplamento dos arquivos para que ajustes e correções localizados não atinjam acidentalmente sistemas não relacionados. A separação deve diminuir o tempo gasto investigando e corrigindo regressões e deixar mais capacidade para desenvolver o jogo. O objetivo é modularidade coesa, com responsabilidades e contratos explícitos — não maximizar a quantidade de arquivos.

## Plataformas e ambiente de teste

- GitHub Pages é usado por conveniência para desenvolvimento e testes; **não define a plataforma de lançamento** e o jogo não será lançado como jogo web.
- A direção de distribuição informada por Anderson é: aplicativo Windows empacotado com Tauri e Android empacotado com Capacitor para gerar AAB destinado à Play Store.
- Conteúdo fixo do jogo deve poder ser empacotado localmente com cada aplicativo; a arquitetura de conteúdo não deve exigir servidor remoto.
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
- **Direção preferencial, ainda sujeita a especificação do formato:** um arquivo de dados por NPC, com identificador estável; quests em arquivos/registros separados, ligados ao NPC por ID. JSON é a hipótese de formato inicial, não decisão final.
- O arquivo exportado não deve ser presumido como contendo assets SVG/arte prontos; por ora, a expectativa confirmada é exportar definições visuais.

## Integração e preparação de dados

- A integração deve funcionar em builds locais de Windows e Android; não assumir que o browser do Pages é o runtime final.
- A arquitetura atual confirmada é HTML/CSS/JavaScript com scripts clássicos carregados em ordem fixa pelo `index.html`, sem `import`/`export` nativos. Considerar essa realidade ao planejar a migração, mas não a tratar como limite permanente das versões empacotadas.
- Manter como opção preferencial arquivos-fonte pequenos/modulares que possam ser validados antes da build e, se necessário, reunidos num pacote de execução. O jogo deve consumir dados por uma interface de domínio estável, sem cada tela conhecer o caminho físico dos arquivos.
- **Pendente:** escolher se a build carrega JSON modular em runtime, importa módulos JavaScript de dados, ou valida/gera um pacote consolidado a partir de JSONs. A escolha precisa considerar Pages como ambiente de teste, Tauri, Capacitor, testes automatizados e facilidade de atualizar conteúdo.
- **Pendente:** definir schema/versionamento dos dados, regras de validação, índice/manifests, comportamento para referência inválida e o processo de geração/integração do arquivo exportado pelo criador.
- **Pendente:** decidir fronteiras concretas e sequência de modernização dos módulos atuais. Não fazer uma migração ampla de `game.js` ou do carregamento de scripts apenas porque os dados passarão a ser modulares.

## Salvaguardas para evolução

- Antes de alterar um subsistema existente, examine sua implementação e dependências atuais; não tome snapshots locais como fonte de estado canônico.
- Faça mudanças focadas, por etapas pequenas, preservando APIs e contratos existentes quando possível. Evite combinar reorganização de arquitetura com mudança de gameplay sem aprovação explícita.
- Um ajuste em uma loja não deve exigir editar a lógica de fishing, inventário ou quests quando uma fronteira de dados/regra clara puder evitar essa dependência.
- Validar referências cruzadas entre quests, NPCs, lojas, itens e locais de maneira automatizada quando a futura organização estiver definida.
- Testar o componente alterado e suas integrações relevantes; QA automatizado, validação manual, Pages, releases e validação final são etapas distintas.
- Manter os arquivos internos de orientação fora de pacotes distribuídos, conforme as regras existentes em `AGENTS.md` e `.gitattributes`.
- Esta direção não autoriza publicação no Pages, atualização de releases ou alteração do repositório da demo.

## Próximas decisões antes de uma especificação executável

1. Escolher o primeiro recorte pequeno que demonstrará o fluxo — por exemplo, um NPC e uma quest — sem migrar todos os catálogos.
2. Definir se o criador deve exportar somente a ficha visual do NPC ou também dados textuais/descrições, e confirmar o contrato entre criador e jogo.
3. Escolher JSON por NPC/quest e o manifesto/índice, ou revisar essa hipótese.
4. Decidir carregamento e empacotamento compatíveis com Pages de teste, Windows/Tauri e Android/Capacitor.
5. Definir se o recorte exige novos módulos, validação de dados, migração de saves ou todos esses elementos; não inferir.
6. Só depois produzir especificação de implementação completa para o recorte aprovado, com escopo, dados, estados, dependências, acessibilidade, localização, compatibilidade, testes e critérios de aceitação.
