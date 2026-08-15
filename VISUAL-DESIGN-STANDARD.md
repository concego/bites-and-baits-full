# Bites & Baits — Padrão visual do produto

**Status:** padrão oficial para a arte atual e para todos os elementos futuros.
**Escopo:** personagens, peixes, equipamentos, iscas, barcos, mapas, cenários, HUD, lojas e telas de resultado.

## 1. Princípio central

Bites & Baits não deve parecer um conjunto de caixas com emojis trocados por ícones. Cada elemento visual precisa ter **identidade, volume, silhueta, acabamento e contexto** suficientes para ser reconhecido como parte de um produto completo.

A arte é complementar. Nome, descrição, estado, preço e resultado continuam existindo em texto acessível e não podem depender da imagem.

## 2. Linguagem visual

- **Estilo:** ilustração vetorial modular, limpa, colorida e amigável, com acabamento de jogo independente premium.
- **Silhueta primeiro:** o objeto deve ser reconhecível antes dos detalhes internos.
- **Volume:** usar cor-base, sombra e luz; evitar formas completamente chapadas.
- **Contorno:** contornos escuros e consistentes, ajustados ao tamanho do elemento.
- **Detalhes funcionais:** costuras, bolsos, ferragens, nós, escamas, reflexos, texturas e encaixes quando ajudarem a explicar o objeto.
- **Paleta:** cores naturais da ilha e da pesca, com contraste suficiente entre objeto, fundo e estado.
- **Luz:** iluminação coerente, vindo de cima e levemente da esquerda; sombra abaixo ou atrás do objeto.
- **Personalidade:** sempre que possível, cada item deve ter uma característica visual própria, não apenas uma troca de cor.
- **Contexto:** o mesmo objeto pode ter variações de apresentação para HUD, cartão de loja, inventário e cenário.

## 3. Arquitetura técnica obrigatória

Cada arte deve seguir a separação abaixo:

1. **Dados:** nome, categoria, preço, atributos e identificador.
2. **Visual:** SVG local, modular e versionado.
3. **Interface:** HTML/CSS controla tamanho, posição e estados.
4. **Acessibilidade:** o conteúdo textual informa o que a arte representa.

Regras:

- SVG local, sem CDN, sem fonte externa e sem dependência de runtime remoto.
- Preferir sprites com `<symbol>` e `<use>` para elementos reutilizáveis.
- Manter `viewBox` estável e proporções preservadas.
- Separar camadas nomeáveis: base, sombra, luz, detalhes, estado e acessórios.
- Não misturar cálculo de atributos, preço ou regras dentro do SVG.
- Não usar a imagem para transmitir uma informação que não exista em texto.
- Não criar bips, fala sintetizada ou áudio próprio para anunciar uma mudança visual.

## 4. Níveis de acabamento

### Nível A — Ícone/HUD

Para elementos pequenos: silhueta clara, contorno, cor-base, sombra simples e um detalhe distintivo. Deve continuar legível entre 24 e 56 px.

### Nível B — Cartão/lista

Para loja, inventário e seleção: camadas de volume, pelo menos dois detalhes funcionais, sombra projetada e variante de estado (disponível, bloqueado, equipado ou selecionado).

### Nível C — Cena/personagem

Para avatar, barcos e elementos de cenário: silhueta completa, partes sobrepostas, luz e sombra, detalhes de construção, variações de contexto e escala sem perda de identidade.

O avatar de personagem é a referência de Nível C.

## 5. Estados visuais

Todo elemento interativo ou sujeito a mudança deve ter estados visuais consistentes:

- normal;
- selecionado;
- equipado/ativo;
- bloqueado;
- indisponível;
- danificado ou em risco, quando aplicável;
- resultado positivo;
- resultado negativo.

O estado visual nunca é a única comunicação: ele deve ser acompanhado por texto, estado ARIA ou ambos.

## 6. Padrão por grupo

### Personagens e NPCs

Personagens jogáveis e NPCs devem ser gerados pelo mesmo sistema modular de criação de personagem: dados separados da aparência, camadas reutilizáveis e avatar SVG local. Isso mantém a linguagem visual consistente e permite que novos personagens usem o mesmo pipeline sem criar uma arquitetura paralela.

O escopo visual dos NPCs é mais amplo que o da personagem jogável, especialmente na faixa etária. O sistema deve prever variações que cubram crianças, adolescentes, adultos e pessoas idosas, além de diferentes corpos, rostos, cabelos, pelos faciais, roupas, calçados e acessórios. A idade deve ser um dado narrativo/visual controlado, não uma inferência automática a partir de uma única característica.

Cada NPC pode ter identidade, idade, aparência, roupa de contexto e estado narrativo próprios. Aparência e idade não alteram atributos ou gameplay por padrão; quando uma regra narrativa precisar de um dado, ela deve ser declarada separadamente nos dados do personagem. Nome, função, estado e falas continuam disponíveis em texto acessível, independentemente do avatar.

### Peixes

Silhueta da espécie, nadadeiras, escamas ou textura de pele, olho, boca, padrão de cor, reflexo e escala relativa. O nome e o tamanho continuam no texto.

### Equipamentos e iscas

Identificar material, formato, ponto de encaixe, desgaste e função. Ferramentas semelhantes precisam ter diferenças visuais reais, não somente nomes ou cores.

### Barcos

Mostrar casco, proa, popa, banco, motor ou remo, ferragens e relação com a água. Cada embarcação deve ser reconhecível em miniatura e em cartão.

### Mapas e cenários

Diferenciar água, margem, vegetação, relevo, construções e pontos de interesse. O cenário deve ter profundidade em camadas, sem comprometer contraste nem desempenho.

### HUD e telas

Usar ícones como reforço visual, nunca como substitutos de rótulos. Separar claramente recurso, estado, ação, feedback e resultado.

## 7. Checklist antes de integrar qualquer elemento

- [ ] A silhueta é reconhecível sem os detalhes internos?
- [ ] Há volume suficiente: base, sombra e luz?
- [ ] Existe pelo menos um detalhe próprio do objeto?
- [ ] O elemento tem variante adequada para cada contexto de uso?
- [ ] Os estados normal, ativo e bloqueado estão definidos quando necessários?
- [ ] A escala pequena continua legível?
- [ ] O SVG é local, modular e sem dependência externa?
- [ ] O texto acessível explica nome, função e estado?
- [ ] A criação/ação pode ser concluída sem enxergar a imagem?
- [ ] O elemento não altera regras, atributos ou economia por causa da aparência?
- [ ] Foi testado no cenário real, não apenas isoladamente?
- [ ] Foi comparado com a linguagem visual do avatar?

## 8. Ordem de evolução visual

1. Avatar — referência de acabamento estabelecida.
2. Barcos, equipamentos e peixes — primeiro grande lote de reconhecimento do produto. Os peixes são colecionáveis, recompensa visual e identidade central da experiência; não ficam para uma etapa posterior.
3. Iscas, vara, linha, boia e captura — completar o ciclo visual da pesca.
4. Cenários, mapas e pontos de interesse — criar profundidade e leitura de lugar.
5. HUD, loja, inventário e resultados — aplicar estados e hierarquia.
6. Elementos futuros — só entram depois de passar por este padrão.

## 9. Auditoria inicial dos peixes

O catálogo de gameplay possui 14 identificadores de peixes, mas a biblioteca SVG atual tem 8 símbolos dedicados. Portanto, seis espécies precisam receber arte própria antes de considerarmos o conjunto visual completo:

- Cará;
- Curimbatá;
- Peixe-Dourado Ornamental;
- Piau;
- Traíra;
- Tucunaré.

Nenhuma espécie deve ficar sem silhueta própria ou depender apenas de uma troca de nome/cor. A auditoria visual deve cobrir catálogo, animação na água, tela de captura, inventário e venda.

## 10. Critério de pronto

Um elemento só é considerado visualmente concluído quando funciona em três camadas ao mesmo tempo:

- **produto:** tem identidade e acabamento próprios;
- **jogo:** comunica função e estado no contexto correto;
- **inclusão:** permanece totalmente compreensível sem depender da imagem.
