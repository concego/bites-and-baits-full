# Fatia 1 — Pipeline JSON inicial com o NPC Vitor

## Escopo

Migrar somente o preset visual de Vitor já usado na abertura, sem alterar seus valores nem a apresentação do avatar. Implementar o caminho manifest → índice de NPCs → JSON por NPC, carregamento central e validação necessária para Pages. Não migrar quests, outros NPCs, lojas, catálogos, save, regras ou acessibilidade de outros fluxos. Não publicar, mover tags/releases nem alterar a demo sem autorização própria.

## Contrato mínimo adotado nesta fatia

- Manifest: `content/manifest.json`, `{ schemaVersion: 1, domains: { npcs: "npcs/index.json" } }`.
- Índice: `content/npcs/index.json`, `{ schemaVersion: 1, domain: "npcs", records: [{ id, path }] }`.
- Registro: `content/npcs/<id>.json`, com `id`, `name`, `genderProfile` e `appearance`; o objeto `appearance` mantém os 14 campos consumidos atualmente pelo avatar.
- O caminho do registro no índice é relativo ao índice. IDs seguem o formato ASCII estável `[a-z][a-z0-9_-]*`; caminhos JSON são relativos, sem `..`.
- O carregador central expõe `ContentData.load()`, `ContentData.getNpc(id)` e `ContentData.validation` para validação determinística de manifest, índice e registro. O cache só é publicado após todos os documentos serem carregados e validados. Consumidores não conhecem caminhos nem fazem `fetch` diretamente.
- O bootstrap espera `ContentData.load()` antes de inicializar `Game`. Erro obrigatório mostra diagnóstico acessível e localizada, e oferece recarregar; não inicia com dados parciais.

Este é um contrato mínimo para a fatia de demonstração, não define versão final nem schemas de outros domínios. `fetch` usa URLs relativas ao documento para funcionar no Pages e não depende de servidor de conteúdo externo.

## Aceitação/QA

`qa_content_data_pipeline.py` verifica parse, manifest, índice, unicidade de IDs, existência/referência dos JSONs, campos requeridos, igualdade exata dos valores do preset legado e ordem do bootstrap. Os validadores do carregador rejeitam HTTP/JSON inválido, paths inválidos, versão/domínio incorreto, registros ausentes, IDs duplicados ou divergentes e aparência incompleta. Casos automatizados negativos do validador runtime serão ampliados quando um runner de navegador/Promise compatível estiver disponível; não inferir sucesso de runtime a partir somente de análise estática.
