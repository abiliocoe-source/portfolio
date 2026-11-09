# Abilio Coelho · portfolio

Site pessoal, feito sem frescura: HTML, CSS e JavaScript puros, sem build.
Tem uns movimentos bonitinhos (GSAP + ScrollTrigger e Lenis pro scroll suave), modo escuro e tudo em português, com a opção de ver em inglês.

🔗 **No ar:** https://abiliocoe-source.github.io

## O que tem aí

- Abertura com contador e título subindo linha por linha
- Scroll suave, parallax e textos que acendem enquanto você rola
- Projetos em cards que se empilham, com prints de verdade e link pra demo e pro código
- Cursor que vira "Ver" em cima dos projetos
- Modo escuro, PT/EN e versão pra celular
- Respeita quem tem "reduzir movimento" ligado no sistema

## Rodar local

Não precisa instalar nada:

```bash
python3 -m http.server 8000
```

Depois abra http://localhost:8000.

## Estrutura

```
index.html          a página toda
assets/styles.css   visual e tema
assets/main.js      animações
assets/i18n.js      textos em PT e EN
assets/img/         prints dos projetos e a imagem de preview
assets/vendor/      GSAP e Lenis (já incluídos, nada de CDN)
```

Pra mudar um texto, edite `assets/i18n.js` (e o HTML, se for o texto em português padrão).

## Deploy

Está no GitHub Pages, a partir da branch `main`, pasta raiz. Qualquer mudança que você fizer e der push já vai pro ar depois de uns minutinhos.

## Feito por

Abilio Coelho · estudante de Ciência da Computação no Mackenzie e dev de IA e LLMs.
[LinkedIn](https://www.linkedin.com/in/abiliocoe) · [GitHub](https://github.com/abiliocoe-source)
