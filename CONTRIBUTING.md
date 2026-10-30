# Contribuindo

Obrigado pelo interesse em contribuir com o **Enterprise Architecture Studio**.

## Ambiente

- Node.js 18+ e npm.
- `npm install` para instalar as dependências.
- `npm run dev` para desenvolvimento local (http://localhost:5173).

## Antes de abrir um Pull Request

Garanta que as checagens passam localmente:

```bash
npm run lint    # type-check (tsc --noEmit)
npm run build   # build de produção
```

Ambas também rodam automaticamente no CI (GitHub Actions) a cada push e PR.

## Fluxo de branches

- `main` é a branch estável. Não faça push direto.
- Crie uma branch descritiva a partir de `main`:
  - `feat/<descricao>` para novas funcionalidades
  - `fix/<descricao>` para correções
  - `docs/<descricao>` para documentação
- Abra um Pull Request para `main` com uma descrição do que mudou e como testar.

## Padrão de commits

Preferimos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona exportação para Draw.io
fix: corrige cálculo de borda das conexões
docs: atualiza README com guia do case
chore: atualiza dependências
```

## Estrutura do código

- `src/data/` — catálogos de elementos (C4, ArchiMate) e templates (TOGAF). Adicione novos elementos aqui.
- `src/components/` — componentes React da UI e do canvas.
- `src/hooks/useDiagram.ts` — estado central do diagrama (nós, arestas, histórico).
- `src/types.ts` — contrato de tipos; mudanças aqui afetam persistência/import. Mantenha retrocompatível.

## Diretrizes

- TypeScript em modo estrito; evite `any`.
- Prefira componentes pequenos e funções puras nos utilitários.
- Ao alterar o formato de `Diagram`/`EaNode`/`EaEdge`, considere a compatibilidade com arquivos `.eas.json` já existentes.
