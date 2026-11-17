# Projoteca Visualizador — PWA v0.1.4

Aplicativo separado da **Projoteca (catálogo documental ZIP)**.

## Implementado

- Catálogo com painel, projetos, pendências e arquivos (a partir da importação local do ZIP documental).
- Importação de ZIP Projoteca (store/deflate), com validação de CRC, IDs e hierarquia.
- Pesquisa, filtros por fase, ideia, atividade confirmada, principais e pausados.
- Árvore pai/filhos dos projetos; fichas, repositórios, decisões e pendências.
- Cadastro de ideias, anotações, classificação de fase/atividade/prioridade, aprovação ou reprovação de pendências e de propostas da governança.
- Rascunho local persistido no IndexedDB; exportação de novo ZIP Projoteca com versão incrementada, checklist e hashes atualizados. Original preservado.
- Ambiente Programação **informativo e desativado**. Fontes futuras alternativas: ZIP de código **OU** GitHub **OU** MacBook. O código da própria Projoteca está protegido (não existe editor real de código).
- PWA instalável e cache offline em HTTPS, visual mobile-first.

## Privacidade

O repositório hospeda **apenas a aplicação**, sem os projetos, notas, catálogo nem credenciais. Todo ZIP importado e alterado permanece no navegador do usuário. **Não existe backend.** Ao limpar os dados do navegador, os rascunhos locais podem sumir: exporte sempre o ZIP após alterar.

## Implantar usando Termius, sem plugins do ChatGPT

1. Baixe o arquivo `ProjotecaVisualizador_v0.1.0.zip` no iPhone.
2. Use a aba SFTP/Arquivos do Termius para enviar o ZIP à pasta `/home/vinicius/Downloads/` no MacBook.
3. Na aba SSH já autorizada, cole:

```bash
bash -lc 'z="$HOME/Downloads/ProjotecaVisualizador_v0.1.0.zip"; test -f "$z" && unzip -p "$z" scripts/publicar-termius.sh > /tmp/projoteca-publicar-termius.sh && bash /tmp/projoteca-publicar-termius.sh "$z"'
```

O script verifica autenticação `gh`, executa testes Node, cria um repositório público **novo** em `viniciusnevesdev/projoteca-visualizador`, envia os arquivos e tenta ativar GitHub Pages. Não faz `push --force`, não apaga repositórios e bloqueia sobrescrita da pasta local. **Ele não consegue executar antes do usuário transferir o ZIP.**

## Desenvolvimento local

```bash
python3 -m http.server 8769 --bind 0.0.0.0
node --test tests/*.test.mjs
```

A interface pode ser inspecionada em `http://localhost:8769/` no navegador do próprio MacBook. No iPhone, o PWA completo depende de HTTPS confiável (GitHub Pages fornece HTTPS quando publicado).

## Limites atuais

- A área Programação não edita código, não conecta GitHub/MacBook e não executa testes de outros projetos.
- Edição da Projoteca fica limitada a dados do catálogo. Não reescreve documentos históricos nem alterações de código externos.
- ZIP importado até 32 MiB de conteúdo descompactado; até 2.000 entradas e no máximo 8 MiB por arquivo, sem criptografia e ZIP64.
- Compatibilidade da importação depende do suporte a `DecompressionStream('deflate-raw')` do navegador. Testes reais no Safari/iPhone ainda não realizados.
- A rodada visual v0.1.1 está somente nos arquivos locais, sem commit, push ou deploy.

## Código

Sem bibliotecas externas ou dependências de produção. HTML/CSS/JavaScript, IndexedDB e service worker. Testes executáveis com Node.

## Alinhamento visual v0.1.1

SVGs locais, tokens de raios e espaçamentos, navegação inferior com rótulos, tipografia legível e temas claro/escuro. Painel com quatro estatísticas derivadas, hierarquia navegável e pendências separadas por estado. Programação continua sendo um protótipo desativado com três fontes alternativas.

Veja [VALIDACAO-v0.1.1.md](./VALIDACAO-v0.1.1.md) para verificações, limites e reprodução do teste opcional de navegador.

## Ajuste de controles v0.1.2

Seletores de ambientes e fontes, botoes de acao, icones, filtros, navegacao e campos de selecao agora usam arredondamento maximo (capsula) via variavel CSS --radius-control: 9999px. Campo de texto multilinha preserva raio de card para leitura e edicao. Dimensoes e comportamento nao foram modificados. Cache do service worker renovado.

## Ajuste de densidade visual v0.1.3

- Barra inferior: caixa de 72px para 44px (sem considerar o inset inferior do iOS), redução aproximada de 39%; área tocável dos botões preservada com 44px de altura. Ícones 23→19px, legendas 12→11px, espaçamentos internos reduzidos.
- Cabeçalho compacto: padding vertical reduzido; logo 44→36px, título 21→18px, subtítulo 12→11px, ícone de importação 22→18px. Área tocável do botão de importar mantida em 44px.
- Seletor Catálogo/Programação: altura dos botões 44→38px e padding externo 4→3px, sem reduzir a fonte de 14px; mesmo padrão na seleção de fontes da área Programação.
- Margens inferiores adaptadas e cache do service worker renovado. Validar aparência no Safari/iPhone, inclusive safe areas.

## Publicacao v0.1.4 - cores semanticas MMU

- Tokens semanticos oficiais do MMU (danger, success, warning, info e action-add) adicionados; botoes de criar/adicionar usam action-add.
- Icones proprios da v0.1.3 preservados; 16 SVGs MMU candidatos **nao publicados** porque o MMU registra licenca_verificada: false para simbolos relacionados a SF Symbols. Candidato completo arquivado separadamente no MacBook.
- Nenhuma mudanca na logica de importacao/exportacao nem no catalogo privado. Migracao integral de icones ainda pendente.


## v0.1.5 — Ajustes e cores centralizadas
- Tema Automatico/Claro/Escuro na tela Ajustes (botao de cabecalho), salvo no navegador, nunca no ZIP privado. Tema automatico segue iPhone.
- tokens.css e a unica origem dos codigos de cores; light-dark() adapta light/dark sem duplicar paletas.
- Tres camadas: semantica MMU (status/acessoes), importancia Projoteca (principal/alta/normal) e tipos (projeto/ideia/decisao/pendencia/regra/arquivo).
- Importancia independe de andamento: aprovado, mas nao implementado, sinaliza atencao — nao conclusao.
- Icones originais mantidos; SVGs MMU com licenca pendente nao incluidos. Importacao/exportacao do catalogo nao alteradas.

### Testes de interface

Teste opcional de navegador cobre Ajustes, temas forçados/automático e navegação em 320/390/768px. Testes automáticos verificam tokens CSS. Tonalidades específicas são padrões iniciais, sujeitos a avaliação visual do usuário.


## v0.1.6 — Reforco da paleta no tema claro
- Feedback do usuário: cores da v0.1.5 agradam no modo escuro, mas ficam apagadas no tema claro.
- Acentos claros de status, prioridade e tipo passam a ser mais luminosos e saturados; textos ganham tokens *-ink separados para manter contraste.
- Prioridades passam a ter fundos violetas/lilas; estatisticas, cards de decisao e legenda ganham tonalidades claras suaves.
- Cores do tema escuro mantidas nos mesmos valores de v0.1.5. Todas as cores continuam em tokens.css; styles.css não tem hexadecimais.
- Decisao nao concluida continua amarela, nao verde; verde reservado a conclusao efetiva.


## v0.1.7 — realce cromático perceptível no tema claro
- Relato do usuário: v0.1.6 ainda parecia escura/apagada no iPhone; verificação de GitHub Pages servindo v0.1.6 confirmada.
- Acentos de luz e saturação agora são aplicados a superfícies e etiquetas visíveis, não apenas texto. Principal recebe tarja roxa sólida; alta recebe lilás preenchido. Cartões de projeto/ideia, estatísticas, marca e navegação têm fundos diferenciados.
- Modo escuro preserva a paleta de v0.1.6 via segundo valor light-dark. Cada cor fica centralizada em tokens.css; CSS de componentes não contém hexadecimais.
- SVGs MMU com licença não comprovada continuam de fora. Implementação de ajustes e ZIP privados preservados.
- Cache: estilos com URL versionada e navegação network-first (offline usa HTML cacheado). Link com index.html?versao=017 permite forçar HTML atualizado, mas persistência do cache Safari continua sujeita ao sistema.


## v0.1.8 — Estatísticas neutras e cartões de projetos levemente coloridos

- Decisão: remover fundos saturados dos quatro cartões de estatísticas, mantendo fundo suavemente colorido nos cartões de projetos para diferenciar visualmente os grupos.
- Estatísticas: fundo neutro stat-card-bg (branco no claro, surface no escuro); borda lateral de 4px + números com cor identificadora.
- Separação: Projetos = azul (type-project); Principais = violeta (priority-principal); Só ideias = turquesa (type-idea); A verificar = amarelo de atenção (status-warning).
- Cartões: projeto azul-acinzentado suave (type-project-card-bg), ideia verde-água suave (type-idea-card-bg), borda de 3px. No escuro continuam com fundo anterior. Principal mantém etiqueta roxa preenchida.
- Cores apenas em tokens.css; catálogo privado, funções e ZIP não alterados.
- Mesmo no escuro, a classificação Ideia usa turquesa em vez de repetir o violeta da prioridade Principal.


## v0.1.9 — Editor de Tokens e Copiar alterações

- Ajustes > Editar cores dos tokens. 5 grupos: Estrutura, Importância, Tipos, Estados, MMU/Ações. Valores originais lidos do próprio tokens.css; sem duplicar paleta HEX no JavaScript.
- Edição: seletor nativo de cor, HEX (6/8 dígitos), HSL (matiz/saturação/luminosidade), prévia instantânea. Prévia claro/escuro altera temporariamente a aparência somente enquanto o editor está aberto.
- Grava alterações localmente em localStorage, chave projoteca.token-overrides.v1, sem afetar o ZIP privado; importação/exportação de JSON, desfazer/refazer (até 40), restaurar token/categoria/tudo.
- Botão ao final Copiar alterações: nomes CSS, tema claro/escuro e JSON estruturado; colar no chat para implementar depois no código oficial. As alterações locais são independentes de commits/publicações.
- Cores canônicas MMU são valores padrão do repositório; o editor permite sobreposições locais sem modificar os arquivos do modelo.
- Service worker atualizado para suportar funcionamento offline, com CSS e script principal versionados contra cache antigo.
- Correção retroativa: stat-accent-width usava light-dark(4px,0px), inválido para comprimento; agora valores separados com media query e tema forçado.

## v0.1.10 — Compactação física dos tokens de cores

- Alteração solicitada: simplificar o código-fonte, não apenas a lista visual do editor.
- tokens.css: 74 declarações reduzidas a 31 cores-base independentes. Removidas 43 variantes redundantes de fundo, contraste e etiquetas.
- styles.css: cores derivadas com color-mix() a partir de uma cor-base por papel; estatísticas e cartões compartilham regras em vez de repetir estilos. Dimensões das bordas permanecem em styles.css (não fazem parte dos tokens cromáticos).
- Tokens de prioridade no arquivo: apenas priority-principal e priority-alta. Cores semânticas canônicas MMU permanecem intactas.
- O editor exibe os 31 tokens reais. Backup das personalizações anteriores preservado em localStorage (projoteca.token-overrides.backup-v019), com cópia dos tokens descontinuados no campo legacy do JSON e no relatório Copiar. Apenas equivalentes seguros migram automaticamente; outros ajustes podem exigir nova escolha.
- Corrigida a sobreposição do bloco Copiar alterações (não fica mais fixo).
- Testes estáticos e navegador Firefox; não inclui alteração do ZIP privado nem da matriz documental.


## v0.1.11 — Compactação de 31 para 20 cores-base reais
- A estrutura cromática do código fonte passou a ter exatamente 20 declarações editáveis em tokens.css: Estrutura 7, MMU 5, Importância 2, Tipos 6. Não se trata apenas de filtro na interface.
- Superfícies secundárias e destacadas são variações automáticas de surface + line; barra inferior compartilha surface; texto sobre cor principal deriva de surface/bg; um shadow atende sombras pequenas e de avisos, que diferem pelo tamanho/desfoque.
- Overlay de diálogos deriva de ink/bg. Textos semânticos derivam das cinco cores oficiais MMU, com contraste diferente para claro/escuro; verificar visual/contraste após alterar drasticamente as cores-base.
- Editor visual lista somente os 20 tokens de tokens.css. Personalizações anteriores continuam em legacy e no backup local. A sombra subtil/toast migra para shadow quando não já definida; as demais variações sem correspondência segura ficam preservadas, não se inventa uma equivalência.
- Caches/JS/CSS versionados; testes automáticos e browser smoke. Nenhuma alteração em Conteúdo.zip, Matriz.zip ou catálogos.


## v0.1.12 — Cores escolhidas pelo usuário
- Claro: priority-alta #FF86E9; priority-principal #9429FF; type-idea #9AB7B7.
- Escuro: priority-alta #F780FF; priority-principal #C675FF. Tipo ideia escuro permaneceu #7CE1D8.
- Três valores no campo legacy do relatório (priority-normal #C2CFE0; status-danger #FF6947; status-pending #FFC157) são históricos de tokens removidos: não aplicados à paleta oficial, não reintroduzidos como tokens-base.
- Vinte tokens reais mantidos em tokens.css. Matriz e ZIP Conteúdo inalterados.

## v0.1.13 — Escala tipográfica compartilhada com Vini UI

- Nova folha typography.css com sete tokens em português: navegação 11px; legenda 12px; corpo 14px; campo digitável 16px; seção 18px; título 24px; estatística 30px.
- styles.css agora utiliza as sete variáveis em vez de fontes de 10/13/15/17/23px ou medidas tipográficas duplicadas. Texto principal 14px e inputs/textarea/select 16px, incluindo HEX do editor, para evitar zoom automático no Safari iPhone.
- Botões superiores de ambiente mantidos com altura mínima 38px; botões de navegação inferior mantidos com altura mínima 44px.
- As 20 cores-base de tokens.css e as cinco personalizações aprovadas permanecem intocadas.
- A escala foi copiada do Vini UI; alterações futuras precisam de incorporação explícita e testes. Matriz e conteúdo privados inalterados.


## v0.1.14 — Cartões compactos e sistema de espaçamento

- spacing.css tem escala de 11 valores e aliases por função: cartão, distância entre cartões, etiquetas e botões. Todos os padding/gap/margin do styles.css referenciam os tokens.
- Cartões: padding 12px; gap entre conteúdos 6px; entre cartões 8px; descrição resumida em no máximo 2 linhas com texto completo em Detalhes. Alvo de toque do Abrir preservado em 44px.
- Cor de fundo azul: intensidade reduzida de 9% para 5% da cor-base do projeto; tema escuro segue neutro.
- Ajustes agora usam a etiqueta REAL de Principal e Alta, classes iguais às da biblioteca, em vez de uma imitação em roxo translúcido.
- Ícone dos Ajustes substituído por engrenagem dentada, não sol.
- 20 cores e 7 tamanhos de fonte mantidos; dados, ZIP, Matriz e preferências locais não foram alterados.


## v0.1.15 — Cartao inteiro clicavel

- Um botao nativo transparente ocupa a area completa do cartao da biblioteca: titulo, descricao, situacao e espacos vazios abrem os detalhes. Nome acessivel e foco por teclado.
- Removido botao Abrir e convertida a antiga button.linkrow em h2, sem a altura minima artificial de 44px. Titulo e situacao se aproximam das bordas com padding uniforme de --espaco-dentro-cartao.
- Botoes de projetos filhos permanecem independentes, acima da area clicavel principal.
- Preservados demais tokens, funcionalidades, descricao completa em Detalhes e catalogo original.


## v0.1.16 — Altura visual e área de toque separadas

- Tokens em spacing.css: altura visível de filtros 36px; ações usuais, Aprovar e Reprovar 38px; ambientes superiores 38px; área mínima de toque 44px.
- CSS dos filtros com padding vertical zero, das ações com padding vertical 4px, evitando que textos curtos criem botões maiores que a altura-alvo.
- Área clicável dos botões compactos expandida verticalmente até pelo menos 44px por pseudo-elemento transparente (sem esticar o preenchimento visual). Sem expansão horizontal que sobreponha controles vizinhos.
- Navegação inferior e botões só de ícone permanecem 44px. Campos de digitação mantêm seu tamanho próprio e fonte mínima 16px.
- Demais elementos de função especializada (linhas de editor, ferramentas de várias linhas) preservam dimensões próprias. Nenhuma cor ou arquivo de conteúdo modificado.
