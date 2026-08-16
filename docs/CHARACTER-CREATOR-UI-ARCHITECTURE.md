# Bites & Baits — Arquitetura da criação de personagem

## Objetivo

Criar e confirmar a personagem antes da troca de correspondência. O sistema deve funcionar para quem vê a prévia, para quem usa leitor de tela e para quem alterna entre os dois modos.

## Fluxo de telas

### 1. Entrada

Título: `Crie sua personagem`.

Texto curto: explique que o jogador definirá a pessoa que receberá e enviará as cartas da abertura.

Ações:

- iniciar criação;
- voltar ao menu, quando aplicável.

### 2. Identidade narrativa

Campos:

- nome livre;
- gênero/forma textual;
- confirmação da identidade narrativa.

A confirmação não inicia a história imediatamente; ela leva para a aparência.

### 3. Aparência

Categorias navegáveis, uma por vez:

1. pele;
2. forma do corpo;
3. altura;
4. rosto;
5. olhos e detalhes faciais;
6. cor dos olhos;
7. cabelo;
8. cor do cabelo;
9. cobertura de cabeça;
10. pelos faciais;
11. roupa de chegada;
12. roupa de pesca;
13. calçados;
14. acessórios.

Cada categoria terá uma lista curta de opções iniciais: cinco na maioria, seis para cor dos olhos e estilo de cabelo, e sete para cobertura de cabeça. O jogador pode avançar, voltar e alterar qualquer decisão.

### 4. Revisão

Apresentar:

- nome;
- gênero/forma textual;
- resumo textual da aparência;
- roupa de chegada;
- roupa de pesca;
- descrição cromática extra, somente se a opção do Croma estiver ligada;
- prévia visual do avatar.

Ações:

- editar identidade;
- editar aparência;
- gerar combinação aleatória coerente com o perfil selecionado;
- confirmar personagem.

### 5. Confirmação

Anunciar que a personagem foi criada. Persistir o estado e iniciar a correspondência da abertura.

## Comportamento do Croma

A configuração geral ficará em Opções. Quando ligada, a revisão e as descrições das cores incluem o campo extra de associação conceitual. Quando desligada, o texto normal permanece inalterado.

A descrição cromática não será anunciada como áudio separado e não aparecerá se a configuração estiver desligada.

## Estado persistido

Chave inicial sugerida: `bb_character`.

```js
{
  name: '',
  genderProfile: '',
  skin: 'skin-03',
  body: 'body-02',
  height: 'height-03',
  face: 'face-01',
  eyes: 'eyes-05',
  eyeColor: 'eye-color-01',
  hair: 'hair-02',
  hairColor: 'hair-color-02',
  headwear: 'headwear-01',
  facialHair: 'facial-hair-01',
  arrivalClothes: 'arrival-clothes-04',
  fishingClothes: 'fishing-clothes-02',
  shoes: 'shoes-03',
  accessory: 'accessory-01',
  confirmed: false
}
```

O estado do personagem não deve ser misturado com `bb_equip`, `bb_owned_equip` ou atributos de pesca.

## Arquitetura visual SVG

O avatar será montado por camadas, em ordem:

1. corpo;
2. pele;
3. rosto;
4. olhos e detalhes;
5. cabelo;
6. pelos faciais;
7. roupa de chegada ou pesca;
8. calçados;
9. cobertura de cabeça;
10. acessórios.

Cada escolha aponta para um símbolo estável. A renderização visual não deve modificar o estado narrativo nem os atributos do jogo.

## Acessibilidade

- Cada categoria será um grupo com nome claro;
- Cada opção terá rótulo e descrição textual;
- A opção selecionada usará `aria-pressed` ou `aria-selected`;
- O resumo da aparência será atualizado em uma região `aria-live` sem excesso de repetição;
- O nome terá validação textual;
- A confirmação anunciará o próximo passo: leitura da carta;
- Nenhum som próprio será adicionado para substituir a leitura do TalkBack;
- A criação será concluível sem depender da imagem.

## Ordem de implementação

1. Persistência e estado da personagem;
2. Tela única de criação com identidade e aparência;
3. Navegação acessível entre categorias;
4. Estado e seleção das 5 opções;
5. Resumo textual;
6. Avatar SVG modular;
7. Integração opcional do Croma;
8. Correspondência com nome e forma textual;
9. Transição para chegada à cidade;
10. Testes com TalkBack e revisão visual.


## Criação em uma única tela

Nome, gênero/forma textual, avatar, categorias visuais, descrição dos conjuntos, resumo e confirmação ficam na mesma tela. O botão de combinação aleatória escolhe um perfil quando necessário e seleciona apenas opções válidas para esse perfil; o nome digitado não é alterado.
