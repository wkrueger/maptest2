## Este exemplo:

  - Instalar o projeto `npm i`;
  - Rodar o servidor `node index.js`
  - Acessar `http://localhost:3000/static/map.html` no navegador.

## Plano inicial:

 - Carregar o mapa dentro do Puppeteer usando a lib Leaflet.
 - A forma mais simples de carregar os mapas no Leaflet é pelo formato GeoJSON. Outras formas exigem
   servidores/protocolos geográficos mais complexos.
 - As bases do IBGE forneces os mapas em GPKG, SHP (Shapefile) ou PostGIS.
 - Converteremos de GPKG para GeoJSON. O GPKG é um banco de dados SQLite, onde a geometria é uma
   coluna binária;
 - Enquanto poderíamos salvar o GeoJSON localmente, eu presumo que seja mais performático ler do
   próprio GPKG e converter na hora, pelo servidor.
 - A base do IBGE possui geometrias de alta resolução, e é necessário primeiro reduzir a resolução
   das geometrias pra que o GEOJson tenha um tamanho aceitável.

No momento tem um GeoPackage de exemplo só com o estado de SC no projeto.

## Baixando a fonte do mapa:

- Portal de Mapas do IBGE (https://portaldemapas.ibge.gov.br/portal.php#homepage)
- Cartas e Mapas > Bases Cartográficas Contínuas > BC 250 2023. > Download GPKG

Download de ~1GB. Possui muito mais coisas que só mapa de cidades, e o mapa de cidade tem que ser extraído.

O GPKG é um banco de dados SQLite e pode ser aberto no QGIS ou no DBeaver (no DBeaver não se pode ver geometrias).

# Processamento das Geometrias:

 - Instalar QGIS;

 - Se estiver usando Windows, evite instalar o QGIS de Windows. Ao invés disso instale no WSL e use
via WSL gráfico. A aplicação aparece no menu Iniciar.

Carregando e editando o mapa:

Dentro do QGIS:
  - Na lateral esquerda, sobre GeoPackage, botão direito > "New Connection..." > selecione arquivo GPKG;
  - Busque pelas tabelas "lml_municipio" e "lml_unidade_federacao_a"; CLicar 2x pra adicionar essas camadas
    ao mapa;
  - Abrir a aba lateral direita de processamento. Menu Processing > Toolbox.
  - Buscar por "Generalize";
  - Selecionar a camada desejada, algoritmo Reumann, Tolerância 0.005 (testei por tetativa e erro);
  - Salvar um novo GeoPackage clicando em Camadas > `<camada>` > Make Permanent;
  - GeoPackage > Escoher nome e nome da tabela > OK; Selecionare um arquivo existente faz adicionar uma
    nova camada/tabela a este;

Adicionando estados:

Relembrando que o GPKG é um banco SQLite, cada geometria possui além dela própria, outras colunas com
metadados.

A tabela de geometrias de municípios inclui o seu código IBGE. Esta coluna pode ser usada
pra fins de filtro por estado (os dois primeiros dígitos do código IBGE correspondem ao estado)
Se necessário A tabela pode ser melhorada pra facilitar a consulta, adicionando uma coluna de estado.
Seria também interessante adicionar um índice à coluna que for usada pra filtrar.

Para manipular isso, eu optaria por escrever um pequeno script node.

# No backend

 - Criar uma rota que leia o GeoPackage e converta pra GSOJson;
 - Colocar o GeoPackage gerado em uma pasta resources;
 - Adicionar um argumento no gerador de PDF para que os scripts não sejam desativados; Os scripts
   dos demais PDFs devem continuar desativados;
 - PS: Uma alternativa mais complexa é verificar se o puppeteer tem suporte a incluir scripts apenas
   de domínios selecionados. Mas ativar scripts só pro relatório do mapa já é OK;
 - No caso de external PDF, eu vou ter que publicar esta alteração no servidor externo;
 - Criar relatório que carregue o mapa via Leaflet; 