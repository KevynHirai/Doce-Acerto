# Doce Acerto 🍬

Um jogo educacional desenvolvido para estimular o reconhecimento de padrões, a memória de curto prazo e a velocidade de reação das crianças, enquanto introduz conceitos básicos de algoritmos e sequências.

## 🎯 Objetivo Pedagógico & Alinhamento BNCC

Este projeto foi desenhado sob as diretrizes de ensino e está alinhado diretamente com as competências da Base Nacional Comum Curricular (BNCC):
- **Computação - Reconhecimento de Padrões e Algoritmos:** O jogo obriga o aluno a identificar um padrão lógico sequencial de cores (A-B, A-B-C, A-B-C-D) e agir mediante a ausência de um item, exercitando os pilares do pensamento computacional.

## ⚙️ Mecânica Principal e Regras Internas

1. O jogo exibe conjuntos de "Bolinhas" deslizando num trilho animado (curva Bezier generativa para se adaptar a qualquer ecrã).
2. Uma das bolinhas desta sequência é apresentada "em branco" e pausa no ecrã.  
3. O jogador deve escolher nos botões interativos qual a cor que falta para completar a lógica da sequência exibida.
4. O cálculo de desempenho no final gera **exclusivamente uma Nota Pedagógica de 0 a 100**, que valoriza o acerto na primeira tentativa, minimiza penalizações por enganos rápidos se o acerto subsequente for célere e premeia sequências exatas.

## 🚀 Como Rodar Localmente

**Atenção:** O jogo carrega arquivos `.json` e tenta registrar um Service Worker, o que é bloqueado pelo navegador por motivo de segurança caso o arquivo seja aberto diretamente com dois cliques (protocolo `file://`).

Para jogar ou testar o jogo localmente, sirva o diretório através de um servidor HTTP:
- **VSCode:** Instale a extensão "Live Server" e clique em "Go Live".
- **Python:** Abra o terminal na pasta do jogo e digite `python -m http.server` (depois abra `http://localhost:8000`).
- **NodeJS:** Utilize `npx serve .`

## 💻 Detalhes Técnicos e Dependências

- **Tecnologias Utilizadas:** Vanilla JavaScript (ES6+), HTML5 e CSS3 nativo.
- **Dependências Externas:** O projeto **não possui dependências externas** nem faz uso de bibliotecas de terceiros (Zero Deps), o que garante execução rápida, caching simples em PWA via Service Workers (`sw.js`) e facilidade de audição do código.
- **Acessibilidade:**
   - Possui Modo de Alto Contraste UI acessível no Painel do Professor.
   - Navegação por teclado utilizando atributos `tabindex` e indicações nativas de focar `:focus`.
   - Modos para daltónicos via `SHAPE_BY_COLOR` na pintura do `canvas`, introduzindo formas (triângulos, quadrados, estrelas e círculos abertos) em cima das cores para identificação agnóstica de hue.

## 🔗 Integração Externa & Parametrização

Para plataformas LMS ou ambientes educacionais complexos, o jogo suporta injeção de parâmetros via função assíncrona/direta no objeto `window`:

```javascript
// Exemplo de como usar a função de parametrização externa (quando implementada no host)
if (window.setGameConfig) {
  window.setGameConfig({
      difficulty: 'Médio', // Fácil, Médio, Difícil
      accessibility_mode: true
  });
}
```

(Para consultar os gráficos de desempenho imediatos na própria página, clicar ou reter 3 segundos o botão ⚙️ no ecrã principal para aceder à *Área do Professor*).

## Atualizações pedagógicas e de acessibilidade

- A dificuldade é centralizada em `DIFFICULTY_CONFIG` com os níveis `easy`, `normal` e `hard`, mantendo compatibilidade com configurações antigas.
- A nota pedagógica usa escala 0-100 com peso para acertos de primeira tentativa, acertos totais, eficiência de tentativas e tempo médio.
- A próxima fase só é desbloqueada quando a criança atinge a nota mínima da dificuldade atual.
- O Modo Descoberta permite exploração livre sem nota, aprovação ou reprovação.
- A narração por voz é opcional e usa `speechSynthesis`, podendo ser ativada no Painel do Professor.
- O Modo Calmo reduz partículas, brilho, movimento e volume, e respeita `prefers-reduced-motion`.
- Os símbolos das cores podem ser ativados independentemente do modo daltônico.
- O painel do professor mostra dicas usadas, perfil pedagógico, medalhas temporárias e permite baixar `session-report.json`.
