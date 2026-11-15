#!/usr/bin/env bash
# Rode no MacBook Linux depois de transferir o ZIP do PWA para ~/Downloads.
# Nao utiliza plugins; cria somente o repositorio PWA e configura GitHub Pages.
set -Eeuo pipefail
OWNER="viniciusnevesdev"
REPO="projoteca-visualizador"
ZIP="${1:-$HOME/Downloads/ProjotecaVisualizador_v0.1.0.zip}"
TARGET="${HOME}/Projetos/ProjotecaVisualizador"

for cmd in git gh unzip python3 node; do
  command -v "$cmd" >/dev/null || { echo "ERRO: falta instalar $cmd"; exit 2; }
done
[[ -f "$ZIP" ]] || { echo "ERRO: ZIP nao encontrado em $ZIP"; exit 2; }
gh auth status --hostname github.com >/dev/null || { echo 'ERRO: gh CLI nao autenticado. Faca gh auth login.'; exit 3; }
if gh repo view "$OWNER/$REPO" >/dev/null 2>&1; then
  echo "SEGURANCA: o repo $OWNER/$REPO ja existe. Nao farei push ou sobrescrita automatica."
  exit 4
fi
if [[ -e "$TARGET" ]] && [[ -n "$(ls -A "$TARGET" 2>/dev/null)" ]]; then
  echo "SEGURANCA: pasta $TARGET nao esta vazia. Nada foi sobrescrito."
  exit 4
fi
mkdir -p "$TARGET"
unzip -q "$ZIP" -d "$TARGET"
cd "$TARGET"
node --check app.js
node --check catalog.js
node --check zip.js
node --test tests/*.test.mjs
git init -b main
git add .
git commit -m "feat: Projoteca Visualizador PWA v0.1.0"
gh repo create "$OWNER/$REPO" --public --source=. --remote=origin --push --description "Projoteca Visualizador - catalogo local de projetos e ZIP versionado"
echo 'GitHub publicado:'
gh repo view "$OWNER/$REPO" --json url --jq '.url'
if gh api "repos/$OWNER/$REPO/pages" -X POST -f "source[branch]=main" -f "source[path]=/" >/dev/null 2>&1; then
  echo 'GitHub Pages: configuracao solicitada com sucesso.'
else
  echo 'GitHub Pages: nao foi possivel configurar automaticamente. Confira Configuracoes > Pages.'
fi
echo 'Endereco previsto apos publicacao do GitHub Pages:'
echo "https://$OWNER.github.io/$REPO/"
echo 'ATENCAO: importar o ZIP documental Projoteca na interface; ele NAO foi publicado no GitHub.'
