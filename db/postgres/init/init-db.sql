CREATE EXTENSION IF NOT EXISTS postgis;

CREATE SCHEMA IF NOT EXISTS mato_grosso;

CREATE TABLE mato_grosso.municipios (
   id SERIAL PRIMARY KEY,
   nome VARCHAR(100),
   codigo_ibge INTEGER,
   prefeito VARCHAR(100),
   area_territorial FLOAT,
   populacao INTEGER,
   densidade_demografica FLOAT,
   populacao_estimada INTEGER,
   receitas_brutas FLOAT,
   despesas_brutas FLOAT,
   pib_per_capita FLOAT,
   geom geometry(MultiPolygon, 4326)
);

-- Índice espacial
CREATE INDEX municipios_geom_idx ON mato_grosso.municipios USING GIST (geom);