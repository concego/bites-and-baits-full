# Bites & Baits — Catálogo de Equipamentos (Base Realista)
> Documento de design. Atributos baseados em características reais de pesca.
> A coluna "Efeito no jogo" é como cada atributo se traduz em mecânica.
> Nem tudo precisa entrar no jogo — marcar com ✅ o que for implementar.

---

## 1. VARA (Rod)

### Atributos reais de uma vara
| Atributo       | O que é                                          | Efeito no jogo |
|----------------|--------------------------------------------------|----------------|
| **Comprimento**| 1.5m (curta/lure) a 5.4m (surfcasting)          | Amplitude do arco SVG; alcance de lançamento |
| **Ação**       | Onde a vara dobra: Extra-rápida / Rápida / Moderada / Lenta | Velocidade de resposta ao pull; latência do feedback háptico |
| **Potência**   | Peso que suporta: UL / L / M / MH / H / XH      | Multiplicador do `pull` do jogador |
| **Material**   | Fibra de vidro → Carbono → Carbono composto      | Peso (fadiga do jogador futuro?) + Potência disponível |
| **Anéis**      | Quantidade e material (cerâmica, aço, SiC)       | Reduz ou não o desgaste da linha (atrito) |
| **Empuñadura** | EVA, cortiça, comprimento                        | Cosmético / futura mecânica de conforto |

### Tiers propostos para o jogo
| Tier | Nome           | Material       | Ação     | Potência | pullMult | snapReduct | Preço (moedas) |
|------|----------------|---------------|----------|----------|----------|------------|----------------|
| 1    | Vara de Bambu  | Bambu         | Lenta    | UL       | ×1.0     | 0%         | grátis (início)|
| 2    | Fibra de Vidro | Fibra de vidro| Moderada | M        | ×1.4     | 10%        | 80             |
| 3    | Carbono Leve   | Carbono       | Rápida   | MH       | ×1.8     | 20%        | 250            |
| 4    | Carbono Pro    | Carbono comp. | Extra-rápida | H   | ×2.4     | 30%        | 600            |
| 5    | Vara de Mar    | Carbono XH    | Extra-rápida | XH  | ×3.0     | 40%        | 1500           |

> `pullMult` multiplica o `PULL_AMOUNT` por lance.
> `snapReduct` reduz a chance de snap aumentando o teto efetivo de tensão.

---

## 2. LINHA (Line)

### Atributos reais de uma linha
| Atributo           | O que é                                             | Efeito no jogo |
|--------------------|-----------------------------------------------------|----------------|
| **Tipo**           | Monofilamento / Fluorocarbono / Trançada (PE)       | Base da diferença entre tiers |
| **Resistência (lb/kg)** | Peso máximo antes de romper                   | Teto de tensão antes do snap |
| **Diâmetro (mm)**  | Espessura — afeta visibilidade e sensibilidade      | Visibilidade para o peixe (futura: penalidade de mordida) |
| **Elasticidade**   | Mono tem alta, fluorocarbo média, trançada quase zero | Amortecimento de puxada brusca; reduz snap em puxões rápidos |
| **Invisibilidade** | Fluoro é quase invisível na água                    | Futura: aumenta taxa de mordida de peixes desconfiados |
| **Sensibilidade**  | Trançada transmite vibração melhor                  | Futura: feedback mais preciso do tipo de movimento do peixe |
| **Memória**        | Mono enrola, trançada não                           | Cosmético / futura mecânica de emaranhamento |

### Tiers propostos para o jogo
| Tier | Nome              | Tipo          | Resistência | Elasticidade | snapLimit | biteMod | Preço |
|------|-------------------|--------------|-------------|--------------|-----------|---------|-------|
| 1    | Nylon básico 10lb | Monofilamento| 10 lb       | Alta         | 100 (base)| ×1.0   | grátis|
| 2    | Nylon reforçado 20lb | Monofilamento| 20 lb    | Alta         | +15%      | ×1.0   | 60    |
| 3    | Fluorocarbono 30lb| Fluorocarbono| 30 lb       | Média        | +25%      | ×1.1   | 180   |
| 4    | Trançada 4x 50lb  | PE / Trançada| 50 lb       | Baixíssima   | +40%      | ×1.0   | 400   |
| 5    | Trançada 8x 80lb  | PE / Trançada| 80 lb       | Baixíssima   | +60%      | ×1.0   | 900   |

> `snapLimit` aumenta o ponto em que a tensão rompe a linha (ex: tensão > 100+15% = 115 equivalente).
> `biteMod` multiplica a taxa base de mordida (fluorocarbono é menos visível).

---

## 3. ANZOL (Hook)

### Atributos reais
| Atributo       | O que é                                          | Efeito no jogo |
|----------------|--------------------------------------------------|----------------|
| **Número**     | Escala inversa (n°12 pequeno → n°10/0 gigante)  | Compatibilidade com espécies; peixes grandes ignoram anzol pequeno |
| **Tipo**       | Simples / Duplo / Triplo (treble) / Circular    | Chance de fisgada (hookRate) |
| **Material**   | Aço carbono / Aço inox / Aço templado           | Durabilidade (futura mecânica de desgaste) |
| **Afiação**    | Padrão / Laser / Chemically sharpened           | Aumenta hookRate |
| **Revestimento**| Níquel / Ouro / Teflon / Bronze                | Cosmético / durabilidade |

### Tiers propostos para o jogo
| Tier | Nome             | Tipo     | Número     | hookRateMod | fishSizeMod | Preço |
|------|------------------|----------|------------|-------------|-------------|-------|
| 1    | Anzol simples n°8| Simples  | Pequeno    | ×1.0        | Pequenos    | grátis|
| 2    | Anzol reforçado n°4 | Simples | Médio   | ×1.1        | Médios      | 30    |
| 3    | Anzol duplo 2/0  | Duplo    | Médio-grande | ×1.2     | Médios-grandes | 80 |
| 4    | Anzol circular 5/0| Circular| Grande     | ×1.35       | Grandes     | 150   |
| 5    | Anzol de mar 10/0| Simples reforçado | XL | ×1.5    | Todos       | 350   |

> `fishSizeMod`: anzol pequeno tem 0% de hookRate com peixe XL (pirarucu, marlim).
> Anzol circular tem penalidade de escape menor (design auto-hook).

---

## 4. BOIA / FLUTUADOR (Float)

### Atributos reais
| Atributo         | O que é                                         | Efeito no jogo |
|------------------|-------------------------------------------------|----------------|
| **Tipo**         | Redonda / Alongada / Waggler / Sem boia (fundo) | Estilo de pesca e profundidade |
| **Capacidade**   | Peso máximo suportado sem afundar               | Limita o peso do chumbo |
| **Visibilidade** | Cor, tamanho, topo colorido                     | Clareza do indicador de mordida na UI |
| **Sensibilidade**| Menor = detecta toque mais sutil                | Amplia `biteWindow` (mais tempo para fisgar) |
| **Profundidade** | Ajustável pelo comprimento do empate            | Define se pesca raso ou fundo — diferentes espécies |

### Tiers propostos para o jogo
| Tier | Nome              | Tipo       | biteWindowMod | depthAccess     | Preço |
|------|-------------------|-----------|---------------|-----------------|-------|
| 1    | Boia redonda básica | Redonda  | ×1.0          | Raso            | grátis|
| 2    | Boia alongada     | Alongada  | ×1.2          | Raso/médio      | 40    |
| 3    | Waggler           | Waggler   | ×1.4          | Médio           | 120   |
| 4    | Boia de fundo     | Sem boia  | ×0.8 (difícil)| Fundo (bagres, surubins) | 200 |
| 5    | Boia eletrônica   | LED/sensores | ×1.8       | Todos           | 500   |

> `biteWindowMod` multiplica o `biteWindow` da espécie — mais tempo para reagir ao toque.
> "Boia de fundo" desativa o flutuador e acessa espécies de fundo (pintado, jaú, cação).

---

## 5. MOLINETE / CARRETILHA (Reel)

### Atributos reais
| Atributo         | O que é                                         | Efeito no jogo |
|------------------|-------------------------------------------------|----------------|
| **Tipo**         | Molinete (spinning) / Carretilha (baitcasting)  | Base dos tiers |
| **Drag (freio)** | Kg de resistência máxima do freio               | Controla snap: drag alto = linha parte menos |
| **Rolamentos**   | Quantidade de esferas — suavidade do giro       | Eficiência de pull: mais rolamentos = menos esforço |
| **Relação de transmissão** | 5.1:1 / 6.2:1 / 7.4:1             | Velocidade de recolha = pullMult por clique |
| **Capacidade de linha** | Metros que comporta                        | Limita a profundidade de pesca |

### Tiers propostos para o jogo
| Tier | Nome               | Tipo        | dragMod | pullSpeed | Preço |
|------|--------------------|------------|---------|-----------|-------|
| 1    | Molinete básico    | Spinning   | ×1.0    | ×1.0      | grátis|
| 2    | Molinete 3 rolamentos | Spinning | ×1.2  | ×1.1      | 100   |
| 3    | Molinete 7 rolamentos | Spinning | ×1.4  | ×1.2      | 280   |
| 4    | Carretilha média   | Baitcasting| ×1.6   | ×1.35     | 550   |
| 5    | Carretilha de mar  | Baitcasting| ×2.0   | ×1.5      | 1200  |

---

## 6. ISCA (Bait)
> Já existe no jogo. Tabela expandida com atributos realistas.

| Isca           | Tipo     | Peixes-alvo principais        | biteBonus | Habitats | Custo |
|----------------|----------|-------------------------------|-----------|----------|-------|
| Minhoca        | Natural  | Lambari, tilápia, traíra, corvina | +20%   | Doce     | 5     |
| Grilo          | Natural  | Lambari, acará, aruanã        | +15%      | Doce     | 4     |
| Mosca          | Artificial | Truta, lambari              | +25% (truta) | Doce (corredeira) | 10 |
| Camarão        | Natural  | Robalo, corvina, bagre, camurim | +20%   | Salobra  | 8     |
| Isca Viva      | Natural  | Dourado, pintado, tucunaré, robalo, atum | +30% | Todos | 15 |
| Colher (Spoon) | Artificial | Dourado, truta, barracuda  | +20%      | Todos    | 20    |
| Jig            | Artificial | Atum, bijupirá, tucunaré, garoupa | +25% | Mar/salobra | 25 |
| Plug Superfície| Artificial | Aruanã, bicuda, dourado    | +20%      | Doce     | 18    |
| Plug Meia Água | Artificial | Robalo, cachorra, anchova  | +20%      | Salobra  | 18    |
| Isca Grande    | Natural  | Pirarucu, jaú, piraíba, marlim | +40%  | Todos    | 35    |

---

## Interação entre Equipamentos — Matriz de Modificadores

```
Pull efetivo = PULL_AMOUNT × vara.pullMult × molinete.pullSpeed
Snap em tensão > 100 × linha.snapLimit × vara.snapReduct
Bite window = fish.biteWindow × boia.biteWindowMod
Hookrate = fish.hookRate × anzol.hookRateMod
Bite chance = fish.baseBiteChance × isca.biteBonus × linha.biteMod
```

### Exemplo — Pirarucu com gear básico vs. avançado:
| Parâmetro    | Gear básico              | Gear avançado              |
|--------------|--------------------------|----------------------------|
| Pull efetivo | 0.8 × 1.0 × 1.0 = **0.8**| 0.8 × 3.0 × 1.5 = **3.6** |
| Snap em      | tensão > 100             | tensão > 160               |
| Bite window  | 2000ms                   | 2000 × 1.8 = **3600ms**    |
| Hook rate    | 60%                      | 60% × 1.5 = **90%**        |

> Com gear avançado, o combate contra o Pirarucu passa de "quase impossível" para "muito difícil mas justo".

---

## Itens Especiais (Futuros)

| Item             | Efeito                                              |
|------------------|-----------------------------------------------------|
| Repelente de Mosca | Reduz distração/penalidade em igarapé           |
| Luva de Pesca    | Reduz fadiga do jogador (futura mecânica)           |
| Sonar Portátil   | Revela peixes disponíveis no mapa antes de pescar   |
| Colete Salva-vidas | Permite acesso a mapas de água profunda (alto mar)|
| Barco a Remo     | Debloqueia pesca em alto mar e lago profundo        |
| Lancha           | Acesso a marlim, agulhão, atuns de alto mar         |
