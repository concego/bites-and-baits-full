# Especificação de correção — atualizar compra após venda na loja

## Origem e escopo

A solicitação de Anderson em 2026-11-18 é investigar feedback do tester sobre saldo e estado da loja que não atualizam imediatamente depois da venda, impedindo uma compra imediata. A inspeção do branch `main` encontrou que `ShopSellView` atualiza o saldo visível e reconstrói a lista de venda, mas não reconstrói os cartões de compra. Assim, preços/habilitação de botões de compra e indicação de equipamento possuído podem continuar representando o estado anterior à venda.

Correção localizada, sem alterar regras de economia, preços, elegibilidade para venda, layout, textos, acessibilidade ou persistência. Não publicar Pages, atualizar tags/releases nem alterar a demo.

## Comportamento requerido

Após qualquer venda concluída (peixe individual/em lote, isca, equipamento):

- atualizar o saldo visível imediatamente;
- atualizar a lista de itens vendáveis;
- atualizar os cartões de compra com o novo saldo e equipamento possuído, de modo que um item agora acessível possa ser comprado sem fechar/reabrir a loja.
- vendas que falham não devem atualizar estado nem saldo.

## Implementação

`ShopSellView.render` recebe um callback explícito de atualização dos dados da lista de compra. Após sucesso de qualquer tipo de venda, chama-o uma vez depois da atualização do saldo e da lista de venda. `game.js` fornece `_renderShopBuy`. Preservar os callbacks e demais regras atuais.

## Testes/aceitação

- QA de regressão focado confirma que todos os três caminhos de venda chamam o callback de atualização da compra após sucesso, atualizam saldo e refletem o novo estado sem reiniciar/reabrir tela; caminhos de venda rejeitada não o chamam.
- Executar `qa_clothing_shop.py`, `qa_dani_quest.py`, `qa_dani_quest_inventory.py`, `qa_home_decorations.py` e conferir sintaxe JS com o motor disponível.
- Inspecionar que não há alteração em HTML/CSS, dados de balanceamento, releases, Pages ou demo.
- Teste manual real com teclado/TalkBack fica registrado separadamente; não alegar que foi feito se o ambiente não o permitir.
