# 🎣 Bites & Baits

> Jogo web de pesca com História e Pesca Livre, controles por movimento ou teclado e acessibilidade integrada desde a arquitetura.

**Jogar agora:** <https://concego.github.io/bites-and-baits-full/>

## Sobre o projeto

Bites & Baits é um jogo de pesca desenvolvido por **Anderson Carvalho / Eu Concego Jogar**. A mesma experiência pode ser jogada no celular, usando sensores de movimento, ou no computador, usando teclado físico — inclusive por conexão OTG.

O projeto busca colocar pessoas que enxergam e pessoas cegas na mesma atividade, sem criar uma versão separada do jogo. As informações importantes permanecem disponíveis na interface e são anunciadas pelo leitor de tela, sem TTS próprio para duplicar a leitura.

## Modos de jogo

### História

- Progressão pela Vila Barra Serena, com mapas, zonas de pesca, moedas e inventário.
- Equipamentos, iscas e barcos influenciam a pescaria.
- Capturas são registradas no inventário.
- A vila reúne casa, viagens, estaleiro, lojas e NPCs.
- O histórico de última captura da História é mantido separadamente.

### Pesca Livre

- Pescaria rápida voltada para pontuação.
- Não depende do inventário nem consome iscas da História.
- A pontuação da captura aparece no resumo de resultados.
- A progressão por níveis inclui encontros com Bosses de medidas dentro dos limites biologicamente plausíveis do catálogo.
- Mantém seu próprio histórico de última captura, separado da História.

## Roupas e inventário

- A loja de roupas da Vila Barra Serena oferece **38 variantes de cor em 16 modelos**; os nomes descrevem a peça, e a cor é informada separadamente.
- As cores disponíveis na loja giram a cada dia do calendário do jogo.
- Roupas compradas e peças iniciais escolhidas na criação ficam no inventário; a equipagem é feita por lá, separando roupas do dia a dia e de pesca.
- O móvel guarda-roupa, planejado para ampliar o armazenamento em casa, não está disponível nesta versão inicial.

## Controles

### Celular

Com sensores disponíveis:

- **Inclinar para frente** → lançar a linha; durante a briga, aliviar a tensão.
- **Inclinar para trás** → puxar o peixe; enquanto espera, recolher a linha.
- **Manter o aparelho neutro** → estabilizar a tensão enquanto o peixe luta.
- **Sacudir** → fisgar quando o peixe morde.

### PC, celular sem sensores ou teclado OTG

| Tecla | Ação |
| --- | --- |
| ↑ Seta para cima | Lançar; durante a briga, aliviar a tensão |
| ↓ Seta para baixo | Puxar o peixe; enquanto espera, recolher a linha |
| Espaço | Sacudir / fisgar quando o peixe morde |
| F | Ler novamente o resumo completo da última captura |

Os listeners de teclado são registrados uma única vez e não substituem nem alteram a gameplay por sensores.

## Briga com o peixe

A captura combina progresso, tensão da linha e fadiga do peixe:

- Puxar aumenta o progresso da captura, mas também eleva a tensão.
- Manter o controle neutro estabiliza a tensão e cansa o peixe enquanto ele luta.
- Aliviar a linha reduz a tensão, mas o peixe pode se afastar e diminuir o progresso.
- Um peixe cansado se afasta menos durante o alívio; a linha arrebenta se a tensão chega ao limite.

## Última captura

Depois de uma captura, o resumo fica disponível diretamente na tela de pesca para consulta. Dependendo do modo, ele apresenta:

- nome do peixe;
- tamanho;
- peso e valor, na História;
- mapa e zona;
- pontuação, na Pesca Livre.

Ao pressionar **F**, o jogo coloca o foco em uma leitura acessível com todos os dados do resumo — não apenas no título. O leitor de tela faz a leitura; o jogo não adiciona voz sintética própria.

Os históricos são persistidos localmente e separados por modo. Um histórico antigo, criado antes da separação, é migrado apenas para a História.

## Acessibilidade

- Interface compatível com leitores de tela.
- Eventos importantes anunciados por regiões `aria-live`.
- Resumo da captura disponível visualmente e em texto acessível.
- Teclado físico como alternativa aos sensores.
- Nenhuma alteração na física principal da pescaria ao usar teclado.
- A interface evita duplicar com áudio próprio o que o leitor de tela já pode ler.

## Recursos do dispositivo

Quando disponíveis, o jogo pode explorar APIs web nativas para movimento e feedback do dispositivo. A experiência principal continua utilizável sem sensores, pelo teclado.

- `DeviceOrientationEvent` — orientação do aparelho.
- `DeviceMotionEvent` — movimento e sacudida.
- `ARIA Live Regions` — integração com leitores de tela.
- `SVG inline` — representação visual dos peixes.

## Tecnologias

- HTML5, CSS3 e JavaScript sem frameworks.
- `DeviceOrientationEvent` e `DeviceMotionEvent`.
- Web Storage para dados locais da partida e da última captura.
- Regiões ARIA para comunicação com tecnologia assistiva.
- GitHub Pages para publicação.

## Contexto

Desenvolvido como parte dos experimentos da **Eu Concego Jogar** em inclusão digital e design de jogos. A acessibilidade não é uma camada posterior: ela participa da arquitetura e da interação desde o começo.

## Licença

Licença MIT — sinta-se livre para estudar, adaptar e evoluir.
