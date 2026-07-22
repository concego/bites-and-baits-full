# 🎣 Bites & Baits

> Demonstração de mecânica — uso de recursos nativos do dispositivo para criar imersão em jogos web acessíveis.

**Jogar agora:** https://concego.github.io/bites-and-baits/

---

## Sobre o projeto

Bites & Baits é um jogo de pesca desenvolvido como prova de conceito para explorar **recursos físicos do dispositivo** — acelerômetro, giroscópio, vibração e áudio — diretamente no navegador, sem instalar nada.

A proposta central não é o jogo em si, mas a demonstração de que é possível criar experiências imersivas e acessíveis usando apenas APIs web padrão. O jogo funciona tanto no celular (com sensores de movimento) quanto no PC (com teclado), e foi projetado desde o início para ser compatível com leitores de tela.

---

## Recursos do dispositivo explorados

### 📐 Acelerômetro e Giroscópio
A mecânica de pesca é controlada pela inclinação física do celular:

- **Inclinar para frente** → lança a linha
- **Inclinar para trás** → puxa o peixe
- **Sacudir** → fisga quando o peixe morde

Implementado via `DeviceOrientationEvent` e `DeviceMotionEvent`. Em iOS, a permissão é solicitada explicitamente via `DeviceOrientationEvent.requestPermission()`.

### 📳 Vibração (Haptic Feedback)
Eventos do jogo geram padrões de vibração distintos via `navigator.vibrate()`:

| Evento | Padrão |
|---|---|
| Peixe mordeu | Curto-curto |
| Fisgou | Médio-curto-médio |
| Linha arrebentou | Longo-médio-longo |
| Tensão crítica | Pulso contínuo |

Cada padrão foi calibrado para ser reconhecível sem precisar olhar para a tela.

### 🔊 Web Audio API
O áudio do jogo é gerado proceduralmente — sem arquivos externos:

- **Som ambiente** → ruído de água sintetizado com `BiquadFilterNode`
- **Carretel** → oscilador de frequência variável (agudo ao puxar, grave ao resistir)
- **Mordida** → envelope de ataque rápido com decaimento
- **Quebra da linha** → ruído filtrado com queda brusca de frequência

Toda a síntese acontece em tempo real no `AudioContext`, permitindo variação dinâmica conforme o estado do jogo.

### Acessibilidade como camada nativa

O jogo não usa TTS próprio — o **TalkBack** (Android) e o **VoiceOver** (iOS) são os narradores oficiais. Todos os eventos de gameplay são anunciados via `aria-live="assertive"`.

Para garantir que mensagens urgentes interrompam o que o leitor de tela estiver lendo, foi implementado o padrão **Double RAF** (duplo `requestAnimationFrame`):

```js
function announce(msg) {
 ui.announcer.textContent = '';
 requestAnimationFrame(() => {
  requestAnimationFrame(() => {
   ui.announcer.textContent = msg;
  });
 });
}
```

Isso força o leitor de tela a descartar a fila atual e ler a nova mensagem imediatamente — essencial para eventos em tempo real como "Peixe! Sacuda!" e "Perigo! Solte!".

Durante o gameplay ativo, o restante da interface recebe `aria-hidden="true"` para evitar que o TalkBack foque em elementos visuais irrelevantes, enquanto o `announcer` permanece sempre visível para o leitor.

---

## Mecânica do jogo

O jogador passa por uma sequência de estados:

```
IDLE → WAITING → BITING → REELING → CAUGHT
                 ↘ SNAPPED
```

- **IDLE** — aguardando lançar a linha
- **WAITING** — linha na água, peixe se aproximando
- **BITING** — peixe mordeu, janela de tempo para fisgar com shake
- **REELING** — puxando o peixe; tensão sobe com a resistência dele
- **CAUGHT** — captura bem-sucedida
- **SNAPPED** — tensão chegou a 100%, linha arrebentou

### Espécies e comportamento

Cada peixe tem parâmetros independentes que afetam diretamente a dificuldade:

| Espécie | Raridade | Resistência | Janela p/ fisgar | Cansa em |
|---|---|---|---|---|
| Lambari | 40% | Mínima | 4,5 s | 3 s |
| Tilápia | 35% | Baixa | 3,5 s | 4,5 s |
| Truta | 14% | Média | 3,0 s | 6 s |
| Dourado | 8% | Alta | 2,5 s | 9 s |
| Pirarucu | 3% | Máxima | 2,0 s | 14 s |

O **Pirarucu** funciona como boss — demanda mais puxadas, resiste mais e quase não cansa.

### Fallback para teclado

Quando não há acelerômetro disponível (desktop), o jogo detecta automaticamente e ativa os controles por teclado:

| Tecla | Ação |
|---|---|
| ↑ Seta cima | Lançar / puxar |
| ↓ Seta baixo | Soltar linha |
| Espaço | Shake / fisgar |

---

## Tecnologias

- **HTML5 / CSS3 / JavaScript** — sem frameworks, sem dependências externas
- **DeviceOrientationEvent** — leitura do giroscópio
- **DeviceMotionEvent** — detecção de shake via aceleração linear
- **Web Audio API** — síntese de áudio procedural
- **Vibration API** — haptic feedback
- **ARIA Live Regions** — integração nativa com leitores de tela
- **SVG inline** — sprites dos peixes desenhados em código

---

## Contexto

Desenvolvido por **Anderson Carvalho** ([Eu Concego Jogar](https://concego.github.io)) como parte de uma série de experimentos em inclusão digital e design de jogos acessíveis.

A filosofia do projeto é que acessibilidade não é uma camada separada — ela está na arquitetura desde o início. O mesmo jogo que usa o acelerômetro para imersão física usa `aria-live` para imersão sonora via leitor de tela. Quem enxerga e quem não enxerga jogam a mesma coisa, da mesma forma.

---

*Licença MIT — sinta-se livre para estudar, adaptar e evoluir.*