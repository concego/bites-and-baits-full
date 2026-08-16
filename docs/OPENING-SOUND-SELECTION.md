# Seleção inicial de sons da abertura

Status: candidatos separados para teste; ainda não integrados às cenas.

## Feedback recebido

- Som 3: aprovado como candidato principal de papel/carta.
- Som 4: aprovado para fechar o envelope.
- Sons 1, 2, 5 e 6: descartados.
- Todos os sons de água 7 a 12: descartados.

## Papel e carta

Arquivos separados em `assets/sounds/opening/`:

- `paper-01.wav` a `paper-06.wav`
- Origem: [202 More Sound Effects](https://opengameart.org/content/202-more-sound-effects)
- Licença declarada na página: CC0
- Uso previsto: escrita, manuseio da carta, dobrar papel e envelope.

A escolha final entre os seis será feita depois de ouvir os arquivos no teste.

## Água e desembarque

- `water-loop-01.ogg` a `water-loop-03.ogg`
- `splash-01.ogg` a `splash-03.ogg`
- Origem: [40 CC0 water / splash / slime SFX](https://opengameart.org/content/40-cc0-water-splash-slime-sfx)
- Licença declarada na página: CC0
- Uso previsto: viagem de barco, aproximação da margem e desembarque.

## Novos candidatos para transporte

- Som 13: `assets/sounds/ambient_river_strong.mp3`, ambiente de rio já existente no jogo; testar como ambientação do Rio Doce.
- Som 14: `motorboat.ogg`, extraído de [Sounds Effects 2](https://archive.org/details/Sound_Effects_2), coleção declarada como CC0 no Internet Archive; testar como motor da lancha.

## Transições

- Som 15: `../zone_transition.mp3`, efeito de transição já existente no jogo.
- Som 16: `time-stop.mp3`, candidato CC0 de passagem/congelamento de tempo. Origem: [Time Slow](https://opengameart.org/content/time-slow).
- Som 17: `reverse-time.ogg`, candidato CC0 temporal e atmosférico. Origem: [Reversing Time / Stuck in Time](https://opengameart.org/content/reversing-time-stuck-in-time).
- Som 18: `teleport.wav`, candidato CC0 de transição, mas precisa ser avaliado para evitar uma sensação mágica. Origem: [Teleport Spell](https://opengameart.org/content/teleport-spell).

Decisão de audição:

- Som 15 foi aprovado como transição geral para todas as situações da abertura.
- Sons 16, 17 e 18 foram descartados por ficarem fora de contexto.

Uso do som 15: transição depois do envio da carta, passagem de tempo, preparação para a viagem e mudança entre barco e desembarque. O volume e o corte devem ser controlados para não ficar cansativo quando usado mais de uma vez.

## Chegada e desembarque

- Sons 19 a 21: aprovados e alternados para simular os passos saindo da lancha, no cais ou deck de madeira.
- Sons 22 e 23: aprovados e alternados para simular a caminhada da margem até a Vila Barra Serena.
- Origem dos sons 19 a 23: [Different steps on wood, stone, leaves, gravel and mud](https://opengameart.org/content/different-steps-on-wood-stone-leaves-gravel-and-mud), licença declarada CC0.

## Candidatos adicionais ainda não copiados

- [Water Waves](https://opengameart.org/content/water-waves): ondas CC0, com arquivos FLAC; avaliar conversão para formato mais compatível.
- [Different steps on wood, stone, leaves, gravel and mud](https://opengameart.org/content/different-steps-on-wood-stone-leaves-gravel-and-mud): passos CC0; avaliar apenas os passos em madeira e terra.
- [35 wooden cracks/hits/destructions](https://opengameart.org/content/35-wooden-crackshitsdestructions): madeira CC0, mas os sons podem ser agressivos demais para o barco; não usar sem audição prévia.

## Implementação sonora

A camada `opening-audio.js` centraliza os sons aprovados:

- `playPaper()` usa o som 3;
- `closeEnvelope()` usa o som 4;
- `playTransition()` usa o som 15;
- `startTravel()` combina o ambiente do Rio Doce com o motor da lancha;
- `playWoodStep()` alterna os sons 19, 20 e 21;
- `playMarginStep()` alterna os sons 22 e 23;
- `stopTravel()` e `stopAll()` encerram os loops ao sair da abertura.

As cenas visuais chamarão essas funções nos momentos correspondentes. O áudio permanece complementar ao texto e ao TalkBack.

## Regra de integração

Nenhum candidato rejeitado entra nas cenas. Os sons aprovados ficam registrados com origem e licença, e toda camada deve ter volume controlado e encerramento explícito.
