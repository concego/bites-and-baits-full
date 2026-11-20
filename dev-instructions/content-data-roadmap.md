# Roteiro de arquitetura de dados e redução de acoplamento

**Status:** ordem de trabalho aprovada como direção em 2026-11-18. Cada fatia precisa de pedido de implementação próprio; concluir uma fatia não autoriza iniciar a próxima, publicar no Pages ou atualizar releases.
**Prioridade geral:** destravar desenvolvimento frequente e reduzir o raio de impacto de correções. Pages continua sendo o ambiente de desenvolvimento/teste durante a produção. Build Windows/Tauri e Android/Capacitor ficam para a etapa final, quando o jogo estiver pronto.
**Direção geral:** JSON versionado por domínio; um arquivo JSON por NPC e por quest; lojas e quests usam IDs estáveis para referenciar registros; manifest principal → índices por domínio → JSONs; um carregador central e validação; separação entre dados, lógica, interface e save. Pacote consolidado é otimização futura, só se necessário.

## Regras para executar este roteiro

- Trabalhar somente na primeira fatia ainda não concluída e explicitamente solicitada por Anderson. Parar ao terminar, relatar implementação, QA, teste manual e publicação separadamente, e aguardar direção antes de continuar.
- Antes de codificar cada fatia, conferir branch, commit, arquivos e testes atuais. Este roteiro não substitui a leitura do código relevante.
- Uma fatia deve alterar o mínimo de sistemas. Não fazer migração geral, refatoração ampla de `game.js`, alteração de gameplay não relacionada ou build nativa como trabalho colateral.
- Manter HTML/Pages como fluxo de execução e teste durante o desenvolvimento. Alterar `index.html` ou o bootstrap é permitido/esperado quando necessário para carregar dados, mas preservar acessibilidade, fluxos atuais e ordem funcional.
- Dados fixos não dependem de servidor nem de banco local. Saves ficam locais por enquanto, separados dos dados JSON.
- Não publicar no Pages, mover tags/releases ou alterar a demo sem autorização específica para aquela etapa.
- Se faltar decisão de produto ou o estado atual contradisser uma premissa, parar na fatia afetada e apresentar a decisão necessária; não escolher silenciosamente.

## Ordem de prioridade

### Fatia 1 — Vertical slice do pipeline JSON no Pages

**Objetivo:** provar a arquitetura acordada com o menor caso útil antes de migrar lojas, quests e catálogos grandes.

**Escopo inicial:** um NPC que já tem preset visual definido, preferencialmente Vitor; um arquivo JSON do NPC; índice JSON de NPCs; manifest principal; carregador central; validação básica; adaptação do ponto de entrada HTML/JS para aguardar os dados antes de inicializar as partes que os usam.

**Requisitos:**

- Preservar o ID estável do NPC e os valores visuais atualmente usados.
- Os JSONs modulares no repositório são a fonte editável; não duplicar o mesmo dado em `npc-data.js` e JSON depois da migração.
- O manifest aponta para índices por domínio; o índice de NPCs aponta para um arquivo por NPC. Não implementar varredura automática de diretórios.
- Um serviço central lê os arquivos, valida IDs/referências e fornece acesso de domínio a consumidores. Nenhuma tela ou diálogo deve fazer `fetch` direto de um arquivo JSON.
- Como o código atual usa scripts clássicos globais e Pages é o ambiente imediato, a fatia deve introduzir a menor mudança de bootstrap que permita carregamento assíncrono confiável. Não converter toda a aplicação para módulos ES nesta fatia.
- Erro de JSON, índice ou referência obrigatória deve ser detectável e reportado de forma diagnóstica; não continuar com dados parciais silenciosamente.
- Manter um meio simples de executar a validação em QA/CI, sem depender de Tauri, Capacitor ou um servidor de produção.

**Aceitação:**

- O jogo inicia no Pages e preserva o fluxo de abertura; o avatar/preset de Vitor é igual ao estado anterior.
- Teste automatizado valida o manifest, índice, registro do NPC, ID e referências; casos negativos cobrem arquivo ausente, JSON inválido e ID duplicado/inexistente.
- Scripts dependentes dos dados só inicializam depois de o carregador concluir. Mensagem de erro não depende apenas da consola se impedir o jogador de iniciar.
- Nenhum outro domínio (quests, lojas, peixes, mapas, barcos ou save) é migrado nesta fatia.
- QA de sintaxe/testes existentes/regressão focalizada passa; não declarar validação manual ou publicação sem realizar e registrar separadamente.

**Saída documental:** atualizar esta especificação e o devlog com os caminhos reais, contrato mínimo escolhido, testes e questões abertas descobertas.

**Estado em 2026-11-20:** implementação e QA automatizado da fatia 1 estão na branch `json-content-slice-1-vitor`; ver `content-data-slice-1-vitor.md` e `DEVLOG.md`. QA de manifest/índice/preset e 11 casos dos validadores reais, incluindo 404 e JSON malformado, passou; as suítes de regressão relevantes também passaram. Verificação manual de inicialização/abertura no Pages e acessibilidade continua pendente; não considerar validada nem publicar/mover releases sem autorização específica.

### Fatia 2 — Validador e contrato de dados reaproveitável

**Objetivo:** tornar erros estruturais baratos de detectar antes de migrações de mais conteúdo.

**Escopo:** consolidar validação reutilizável de IDs, arquivos, schema/campos obrigatórios, referências entre registros e mensagens diagnósticas. Adicionar dados negativos mínimos de teste, não dados de jogo fictícios em produção.

**Aceitação:** validador executável em ambiente de desenvolvimento/teste, resultados determinísticos, mensagens que identifiquem caminho/ID/campo, testes para referências válidas e quebradas, sem adicionar validação duplicada dentro das telas.

**Dependência:** fatia 1 concluída e contratos que ela de fato adotou documentados.

### Fatia 3 — Catálogos e configuração de loja, um domínio por vez

**Objetivo:** isolar o tipo de dado cuja edição já causou correções demoradas.

**Ordem sugerida:** escolher primeiro uma loja pequena e seu catálogo diretamente relacionado; em seguida, migrar outros catálogos que a loja consome. Não migrar todas as lojas de uma vez.

**Direção:** produtos/itens têm IDs e atributos de catálogo; cada loja configura referências a esses IDs; preço/estoque específicos de loja ficam no registro de oferta da loja quando diferirem do catálogo. Regras de compra/venda e UI continuam módulos distintos dos dados.

**Aceitação:** editar nome/preço/stock de uma oferta não requer mexer em lógica não relacionada; referências quebradas são detectadas; compra/venda, traduções, persistência, navegação e leitores de tela preservam o comportamento vigente; testes focam regra e dados separadamente.

**Pendente antes da fatia concreta:** selecionar a loja e definir quais campos são propriedade global do item versus propriedade da oferta daquela loja; examinar o bug e a estrutura atuais para evitar criar duplicação.

### Fatia 4 — Catálogos restantes por domínio

Migrar um domínio por vez e parar/revisar após cada um: equipamentos e iscas; barcos; peixes; mapas e zonas; roupas; demais listas futuras. Catálogo não deve conter regra de renderização, UI ou algoritmo de gameplay. Testar consumidores antes de remover a fonte antiga.

### Fatia 5 — Quests em JSON separado do NPC e do save

Migrar uma quest aprovada por vez. Definição fixa da quest fica em JSON próprio e usa IDs para NPC, peixe/item, mapa/zona; estados de execução/recompensa ficam no save local. Não mover a quest de Dani nem alterar seu comportamento sem especificação própria e autorização.

**Aceitação:** referências validadas, progressão e recompensas idempotentes preservadas, saves existentes continuam compatíveis ou migração de save é especificada e testada, diálogos/localização e anúncios acessíveis preservados.

### Fatia 6 — Exportação da ferramenta autônoma de criação de NPCs

Reutilizar literalmente a interface do criador de personagem em modo independente, com opções ampliadas para NPCs, e exportar um JSON por NPC compatível com o contrato definido na fatia 1. A ferramenta não se conecta à partida nem ao save. Não produzir SVG/assets prontos automaticamente sem decisão e especificação próprias.

**Dependências:** fatias 1 e 2; categoria de atributos e descrição precisa estar acordada. Testar round-trip exportar → validar → carregar NPC e impedir inferências/invenções para campos não definidos.

### Fatia 7 — Proteção e evolução dos saves locais

Separar progresso mutável de conteúdo fixo; documentar/versionar o save; definir migrações e testes de compatibilidade conforme os sistemas que forem adicionados. Não adotar banco de dados local sem necessidade demonstrada. Servidor/sincronização não fazem parte do escopo garantido.

### Fatia 8 — Otimização de pacote de dados, se necessária

Só após evidência de lentidão, limite de arquivos ou problema de empacotamento, avaliar gerar pacote consolidado a partir dos JSONs. JSONs modulares continuam como fonte de edição. Benchmark, razão para a mudança e testes de equivalência são pré-requisitos; não implementar otimização antecipadamente.

### Fatia 9 — Empacotamento nativo final

Quando Anderson considerar o jogo pronto, preparar e validar Windows/Tauri e Android/Capacitor/AAB, conferindo acesso aos dados e saves locais em cada plataforma. Essa etapa não bloqueia nem é requisito para fatias de conteúdo e testes no Pages.

## Fora da primeira entrega

- Migração de todos os catálogos, quests ou sistemas de save.
- Reescrita integral de `game.js`, conversão total para módulos ES, framework ou banco de dados.
- Sincronização online, contas ou servidor.
- Builds de Tauri/Windows ou Capacitor/Android enquanto o jogo ainda estiver em desenvolvimento.
- Publicação ou atualização de releases.
