#!/usr/bin/env node
// Converte o JSON de pesquisa de veículos (marca > modelos > versões) em SQL
// idempotente para popular marcas_veiculo/modelos_veiculo/versoes_veiculo.
//
// Uso:
//   bun scripts/seed-vehicles/generate-sql.mjs data/vehicles-batch1.json > /tmp/seed1.sql
//
// Formato de entrada esperado (um array, um ou mais arquivos/lotes):
// [
//   {
//     "marca": "Volkswagen",
//     "modelos": [
//       {
//         "modelo": "Gol",
//         "versoes": [
//           {
//             "nome": "Gol G5",
//             "ano_inicio": 2008,
//             "ano_fim": 2012,
//             "motorizacao": null,
//             "combustivel": "flex",
//             "plataforma": "VW-PQ24-G5"
//           }
//         ]
//       }
//     ]
//   }
// ]
//
// O SQL gerado é seguro para rodar mais de uma vez (ON CONFLICT DO NOTHING em
// marca/modelo, NOT EXISTS em versão) e assume um único tenant (primeira linha
// de `tenants`), consistente com o restante do schema single-tenant hoje.

import { readFileSync } from "node:fs";

function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sqlString(value) {
  if (value === null || value === undefined || value === "") return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlInt(value) {
  if (value === null || value === undefined) return "null";
  return String(Number.parseInt(value, 10));
}

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Uso: node generate-sql.mjs <arquivo.json>");
  process.exit(1);
}

const marcas = JSON.parse(readFileSync(inputPath, "utf-8"));

const lines = [];
lines.push("-- Gerado automaticamente por scripts/seed-vehicles/generate-sql.mjs");
lines.push(`-- Origem: ${inputPath}`);
lines.push("");

for (const marcaEntry of marcas) {
  const marcaNome = marcaEntry.marca;
  const marcaSlug = slugify(marcaNome);

  lines.push(`-- ===== Marca: ${marcaNome} =====`);
  lines.push(
    `insert into marcas_veiculo (tenant_id, nome, slug)\n` +
      `select id, ${sqlString(marcaNome)}, ${sqlString(marcaSlug)} from tenants limit 1\n` +
      `on conflict (tenant_id, slug) do nothing;`,
  );
  lines.push("");

  for (const modeloEntry of marcaEntry.modelos ?? []) {
    const modeloNome = modeloEntry.modelo;
    const modeloSlug = slugify(modeloNome);

    lines.push(`-- Modelo: ${marcaNome} ${modeloNome}`);
    lines.push(
      `insert into modelos_veiculo (marca_id, nome, slug)\n` +
        `select m.id, ${sqlString(modeloNome)}, ${sqlString(modeloSlug)}\n` +
        `from marcas_veiculo m where m.slug = ${sqlString(marcaSlug)}\n` +
        `on conflict (marca_id, slug) do nothing;`,
    );
    lines.push("");

    for (const versao of modeloEntry.versoes ?? []) {
      lines.push(
        `insert into versoes_veiculo (modelo_id, nome, ano_inicio, ano_fim, motorizacao, combustivel, familia)\n` +
          `select mo.id, ${sqlString(versao.nome)}, ${sqlInt(versao.ano_inicio)}, ${sqlInt(versao.ano_fim)}, ${sqlString(versao.motorizacao)}, ${sqlString(versao.combustivel)}, ${sqlString(versao.plataforma)}\n` +
          `from modelos_veiculo mo join marcas_veiculo ma on mo.marca_id = ma.id\n` +
          `where ma.slug = ${sqlString(marcaSlug)} and mo.slug = ${sqlString(modeloSlug)}\n` +
          `and not exists (\n` +
          `  select 1 from versoes_veiculo v\n` +
          `  where v.modelo_id = mo.id and v.nome = ${sqlString(versao.nome)} and v.ano_inicio = ${sqlInt(versao.ano_inicio)}\n` +
          `);`,
      );
    }
    lines.push("");
  }
}

console.log(lines.join("\n"));
