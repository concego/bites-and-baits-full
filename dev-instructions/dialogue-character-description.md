# Especificação — Descrição opcional de personagens

**Status:** requisitos funcionais definidos em 2026-11-20; definição da composição textual pendente de confirmação antes da implementação.

## Requisitos definidos por Anderson

- A ação para consultar a descrição deve estar no menu **Pessoas presentes** e também durante as conversas iniciadas nesse menu.
- A consulta é livre, voluntária e repetível; nada aparece ou é anunciado automaticamente.
- Por enquanto, haverá descrição implementada para o protagonista e Vitor.
- Ao solicitar a descrição, exibir o texto e um botão para fechá-lo e voltar ao mesmo menu ou ponto do diálogo, sem avançar a conversa.
- Se o personagem ainda não tiver descrição implementada, mostrar exatamente em PT-BR: “A descrição de [nome do personagem] ainda não foi implementada.”
- Não inventar características nem adicionar TTS próprio. Interface e mensagens devem funcionar em PT-BR, inglês e húngaro.

## Proposta de conteúdo a confirmar

Para descrever protagonista e Vitor, usar somente os dados atuais já existentes, com os nomes e valores localizados do catálogo de aparência e da roupa atualmente equipada. A descrição pode listar, nesta ordem: tom de pele; altura e forma do corpo; formato do rosto, olhos e detalhes faciais; cabelo e cobertura da cabeça; pelos faciais; roupa atual; calçados; acessórios. Itens não definidos ou sem valor relevante são omitidos; não inferir nada pela ilustração. No caso de Vitor, usar o preset JSON e o conjunto de chegada atual.

Essa composição seria uma descrição textual estruturada, fiel aos dados, não prosa inventada. Aprovar essa lista e ordem ou indicar o que retirar, acrescentar ou reorganizar antes da implementação.

## Acessibilidade e retorno

A descrição fica em uma tela/painel próprio com título, texto e botão de fechar acessíveis por teclado e leitor de tela. Fechar retorna ao mesmo estado anterior e devolve o foco ao botão que abriu a descrição. O texto atual do diálogo permanece intacto.

## Escopo e publicação

Este recorte cobre o menu e os diálogos iniciados por **Pessoas presentes**; outras cenas narrativas ficam fora. A especificação não autoriza publicar no Pages, avançar `main`, mover tags/releases ou alterar a demo. Essas ações dependem de autorização própria.

## Validação após implementação

Testar consultas repetidas, fallback para NPCs sem descrição, dados atuais de aparência/roupa, retorno ao mesmo ponto da conversa, PT-BR/EN/HU, teclado e leitor de tela. Separar QA automatizado e validação manual.
