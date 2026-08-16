# Bites & Baits — Categorias do criador de personagem

## Princípio

A criação acontece antes da troca de correspondência. O jogador confirma todos os dados necessários para a personagem antes de ler a primeira carta.

A aparência é modular em SVG e não altera atributos, economia, física ou regras de pesca. Gênero e forma textual são dados narrativos independentes da aparência.

## Ordem proposta

### 1. Identidade narrativa

Dados obrigatórios antes da abertura:

- **Nome:** digitado pelo jogador;
- **Gênero e forma textual:** usado para pronomes, adjetivos, particípios e concordâncias da narrativa;
- **Confirmação de identidade:** resumo que o jogador pode revisar antes de continuar.

O nome da pessoa jogadora não será automaticamente traduzido. Nomes fixos do elenco serão localizados, como tio Zeca em português e Uncle Zac em inglês.

### 2. Pele

- Tom de pele;
- Marcas, sardas ou outras características opcionais, se houver modelos suficientes.

### 3. Forma do corpo

- Variação de formato corporal;
- Silhueta visual independente da identidade narrativa;
- Nenhum atributo físico ou vantagem associado à escolha.

### 4. Altura

- Cinco proporções visuais graduais;
- Altura separada da forma do corpo;
- Nenhum efeito na velocidade, alcance, força ou qualquer regra.

Não haverá atributos físicos ou vantagens associados às escolhas visuais.

### 5. Cor dos olhos

- Cor escolhida separadamente do formato dos olhos;
- Seis opções iniciais, incluindo preto;
- A cor deve continuar legível na prévia visual sem ser necessária para completar a criação.

### 6. Rosto


- Formato do rosto;
- Formato dos olhos;
- Sobrancelhas;
- Nariz e boca, caso o nível de detalhe seja compatível com as telas pequenas;
- Óculos, quando tratados como acessório.

### 7. Cabelo

- Tipo de cabelo;
- Comprimento e penteado;
- Opção sem cabelo;
- Variações que não dependam do gênero escolhido.

### 8. Cor do cabelo

- Cor escolhida separadamente do estilo do cabelo;
- Cinco opções iniciais;
- A cor deve poder ser trocada sem trocar o penteado.

### 9. Cobertura de cabeça

- Nenhuma cobertura;
- Boné;
- Chapéu;
- Gorro ou proteção equivalente;
- Lenço ou cobertura culturalmente apropriada;
- Tiara;
- Arquinho.

A cobertura deve ser uma camada independente do cabelo, permitindo alterar uma sem apagar a outra quando a combinação fizer sentido.

### 6. Pelos faciais

- Sem pelos faciais;
- Bigode;
- Barba;
- Barba e bigode;
- Variações de comprimento e cor, se forem necessárias.

Essas opções não devem ser vinculadas automaticamente ao gênero escolhido.

### 6. Roupa de chegada

A roupa usada na chegada à cidade deve ser separada da roupa de pesca.

- Parte de cima;
- Parte de baixo ou peça única;
- Descrição acessível do conjunto e do que ele contém;
- Cor ou combinação de cores;
- Camada externa, quando aplicável.

### 7. Roupa de pesca

A roupa de pesca pode ser um conjunto visual próprio, sem alterar o equipamento funcional.

- Parte de cima;
- Parte de baixo;
- Colete, capa ou proteção;
- Descrição acessível do conjunto e do que ele contém;
- Paleta de cores;
- Variação simples para indicar que a personagem está pronta para pescar.

### 8. Calçados

- Tipo de calçado;
- Cor;
- Variações apropriadas para cidade, terreno e pesca.

### 10. Acessórios

- Nenhum acessório;
- Óculos;
- Relógio ou pulseira;
- Colar ou outro acessório discreto;
- Pingente ou acessório temático de pesca, quando fizer sentido.

A mochila fica reservada para uma futura mecânica própria e não será usada como acessório cosmético nesta primeira versão. Equipamentos de pesca comprados na Loja também não serão confundidos com acessórios cosméticos.

### 10. Revisão e confirmação

A tela final deve apresentar:

- Nome;
- Gênero/forma textual;
- Descrição textual resumida da aparência;
- Prévia visual do avatar;
- Botão para voltar e editar;
- Botão para confirmar e iniciar a correspondência.

## Estrutura modular do SVG

A personagem deve ser composta por camadas independentes, com identificadores estáveis:

- `avatar-body`;
- `avatar-skin`;
- `avatar-face`;
- `avatar-eyes`;
- `avatar-hair`;
- `avatar-headwear`;
- `avatar-facial-hair`;
- `avatar-arrival-clothes`;
- `avatar-fishing-clothes`;
- `avatar-shoes`;
- `avatar-accessories`.

A troca de uma camada não deve exigir redesenhar as demais. O avatar deve continuar funcionando como fallback textual se a imagem não for exibida.

## Acessibilidade do criador

- Cada categoria será um grupo navegável por teclado e TalkBack;
- Cada opção terá nome e descrição textual;
- A seleção atual será anunciada com `aria-selected` ou `aria-pressed`;
- A prévia terá descrição textual atualizada em `aria-live`;
- O leitor de tela não receberá áudio adicional;
- A criação será concluível sem depender da prévia visual;
- A confirmação anunciará que a personagem foi criada e que a correspondência começará.

## Primeira implementação

A primeira versão do criador terá cinco opções na maioria das categorias, seis opções para cor dos olhos e estilo de cabelo, e sete opções para cobertura de cabeça. Essa quantidade é inicial e poderá ser ajustada depois com base no feedback.

Categorias que permanecem com cinco opções iniciais:

- pele;
- forma do corpo;
- altura;
- rosto;
- olhos e detalhes faciais;
- cor dos olhos;
- cabelo;
- cor do cabelo;
- cobertura de cabeça;
- pelos faciais;
- roupa de chegada;
- roupa de pesca;
- calçados;
- acessórios.

Para manter o escopo controlado, cada opção de roupa será inicialmente um conjunto visual coerente, e não uma combinação de cinco partes superiores com cinco partes inferiores. A expansão para combinações independentes pode acontecer depois.

A identidade narrativa continua separada dessa contagem:

- o nome é digitado livremente;
- gênero/forma textual será definido pelo jogador nas opções narrativas que forem aprovadas para cada idioma;
- confirmação persistente;
- descrição textual do avatar.

A quantidade de cinco não é uma limitação permanente. O sistema deve permitir acrescentar ou substituir opções sem alterar a estrutura das cartas, da acessibilidade ou da persistência.
