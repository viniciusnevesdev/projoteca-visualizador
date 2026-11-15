# Alinhamento visual v0.1.1 — revisão local

Data: 2026-11-15. Referência: descrição visual aprovada fornecida na tarefa; não foram fornecidas imagens dos protótipos para comparação pixel a pixel.

## Alterações

- Cabeçalho compacto Projoteca / Visualizador, seletor de ambientes e quatro abas inferiores com SVGs locais consistentes. Estados selecionados acessíveis.
- Tokens CSS de cores, espaçamentos, raios e largura; tipografia legível, controles com área de toque mínima de 44 px, campos com fonte de 16 px, temas claro/escuro, safe areas e modal com rolagem própria.
- Catálogo vazio explicativo, sem projetos simulados na aplicação. Estatísticas Projetos / Principais / Só ideias / A verificar derivadas do catálogo importado.
- Filhos dos projetos principais navegáveis; busca, filtros sem inferir abandono por ausência de repositório, detalhe, notas e hierarquia preservados.
- Pendências agrupadas em aguardando decisão, sem opinião, aprovado não implementado, ações e regras. Aprovação de governança permanece visível como `aprovado_nao_implementado`; ações comuns não mostram botões de aprovação no detalhe. Decisões alteram apenas o catálogo.
- Pastas e arquivos com SVG, caminho, retorno e prévia de texto escapada.
- Programação informativa: Em construção / Nenhum projeto carregado, destaque de UMA fonte alternativa, ZIP / GitHub / MacBook e seis ferramentas desativadas; aviso Projoteca protegida.
- Versão da aplicação 0.1.1 e cache do service worker atualizado com `icons.js`. Configuração do GitHub Pages preservada.

`zip.js` e `catalog.js` não foram alterados. Nenhuma dependência foi instalada. Nenhum ZIP pessoal, catálogo, matriz ou segredo foi incluído no repositório. Os dados fictícios do teste são gerados somente no perfil isolado do navegador.

## Verificações

- Antes das edições: árvore limpa, branch `main`, origin `https://github.com/viniciusnevesdev/projoteca-visualizador.git`.
- `npm run check`: sintaxe e suíte Node aprovadas; três testes executados e um teste com catálogo real pulado por fixture ausente.
- `git diff --check`: aprovado.
- Firefox headless existente, via WebDriver BiDi: estado vazio, SVGs, troca de ambientes/fontes, seis botões desativados, erro de ZIP inválido, importação sintética, contagens derivadas, três filhos, filtros, busca com foco preservado, detalhe pai/filho, modal, anotação, categorias de pendências, aprovação sem execução, navegação de arquivos e HTML inerte.
- Exportação sintética 0.0.1 → 0.0.2, reimportada e conferida com a anotação e a decisão registrada.
- Painel, Projetos, Pendências, Arquivos e Programação sem overflow horizontal em 320, 390 e 768 px, ativando as regras reais de CSS claro/escuro; seleção das abas conferida.
- Mesma suíte aprovada sob `/projoteca-visualizador/` em servidor local que mapeia esse prefixo para a raiz do repositório. Isso verifica os caminhos relativos sem publicar.
- Captura de tela mobile inspecionada com dados explicitamente fictícios, fora do repositório.

## Limites

Safari/iPhone real, teclado virtual, safe areas físicas, instalação PWA e atualização offline em HTTPS continuam pendentes. Não houve validação do ZIP documental pessoal nem conferência dos nomes Copiloto, seus três filhos e Cronômetro; esses nomes devem vir exclusivamente do ZIP importado. O teste sintético confirma a exibição e navegação de uma hierarquia equivalente, sem embutir dados pessoais. Os temas foram exercitados pelas regras CSS; mudança automática do tema do sistema e auditoria formal de contraste/acessibilidade não foram realizadas.

O plugin de navegador e a gravação direta por Desktop Commander exigiram aprovação indisponível. Foram usados a ferramenta de edição do workspace e o Firefox já instalado, iniciado pelo Desktop Commander, sem instalar ferramentas.

## Reproduzir a suíte opcional de navegador

Node com `WebSocket` global e Firefox com WebDriver BiDi são necessários. Em terminais separados, na raiz do repositório:

```bash
python3 -m http.server 8771 --bind 127.0.0.1
```

```bash
mkdir -p /tmp/projoteca-v011-browser
firefox --headless --no-remote --profile /tmp/projoteca-v011-browser --remote-debugging-port 8772 about:blank
```

```bash
node tests/browser-smoke.mjs
```

O teste cria um contexto de navegador isolado a cada execução. `PROJOTECA_TEST_URL` e `PROJOTECA_BIDI_URL` permitem trocar os endereços; `PROJOTECA_SCREENSHOT` é opcional e deve apontar para fora do repositório. O servidor precisa servir os arquivos deste projeto no endereço informado.

## Entrega

Arquivos mantidos modificados localmente para revisão. Nenhum `git add`, commit, push, deploy, configuração de Pages, token ou force push foi executado.

HEAD de base: `def027a5c8b341956c83bbe435011d33a8592a49` — não contém estas alterações locais.

Endereço Pages informado pela combinação do origin com o nome do repositório: https://viniciusnevesdev.github.io/projoteca-visualizador/ . A publicação online não foi consultada nem atualizada nesta rodada.
