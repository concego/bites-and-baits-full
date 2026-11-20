# Descrição opcional de personagens — especificação

**Status:** composição aprovada e implementação presente no código atual. Em 2026-11-20, Anderson confirmou que já validou manualmente o recurso com teclado e leitor de tela. QA automatizado e validação manual são registrados separadamente; esta confirmação não autoriza publicação ou atualização de releases.

## Comportamento aprovado

- O menu **Pessoas presentes** oferece uma ação para consultar a descrição do protagonista e de cada NPC presente, sem precisar iniciar uma conversa.
- Durante as conversas abertas pelo menu, há ações separadas para descrever o protagonista e o NPC.
- A consulta é livre, voluntária e repetível; nada é exibido ou anunciado automaticamente.
- Por enquanto, o protagonista e Vitor têm descrição implementada. Para quem não tiver descrição, mostrar em PT-BR: “A descrição de [nome do personagem] ainda não foi implementada.”; traduzir para inglês e húngaro.
- Ao solicitar uma descrição, mostrar o texto e um botão para fechar e retornar ao mesmo menu ou ponto do diálogo, sem avançar a conversa.
- A descrição estruturada usa os dados atuais conhecidos, os nomes/valores localizados existentes e a roupa atual. Ordem: tom de pele; altura e forma do corpo; formato do rosto, olhos e detalhes faciais; cabelo e cobertura da cabeça; pelos faciais; roupa; calçados; acessórios. Não inferir características a partir da ilustração. Omitir itens sem dado e opções de ausência.
- Para o protagonista, usar dados atuais de `Character.load()`, catálogo visual e peças equipadas. Para Vitor, usar `content/npcs/vitor.json` e seu conjunto de chegada. Os demais NPCs recebem a mensagem de fallback.

## Acessibilidade e retorno

A descrição aparece em painel com título, texto e botão de fechar, acessíveis por teclado e leitor de tela. Ao abrir, o foco vai ao texto da descrição; ao fechar, retorna ao acionador. As falas atuais não são substituídas, não há TTS próprio, e a descrição não avança o diálogo.

## Escopo e publicação

Este recorte cobre o menu e as conversas iniciadas por **Pessoas presentes**; outras cenas narrativas ficam fora. Implementação e QA não autorizam publicação no Pages, avanço de `main`, alteração de tags/releases ou demo; essas ações requerem autorização própria.

## Validação e acompanhamento

- `qa_people_character_descriptions.py` passou nos checks estruturais registrados para ações do menu e diálogo, dados atuais, fallback, traduções, foco e retorno sem avançar a conversa.
- Anderson confirmou em 2026-11-20 que já realizou os testes manuais do recurso com teclado e leitor de tela. Não registrar esses testes como pendentes.
- **Divergência de implementação identificada em revisão de código:** quando o protagonista tem peças equipadas, elas são acrescentadas ao fim da descrição, depois de calçados e acessórios. A ordem aprovada acima pede roupa antes de calçados e acessórios. Registrar como ajuste focalizado de conformidade com a especificação; não confundir com validação manual pendente.
- Esta validação não significa que o recurso tenha sido publicado numa release nem autoriza publicar ou atualizar releases.
