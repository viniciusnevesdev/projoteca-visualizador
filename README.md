# Projoteca Visualizador — PWA v0.1.2

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
