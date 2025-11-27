#!/usr/bin/env node

/**
 * Script para copiar o worker do pdf.js para a pasta public
 * Executado durante o build para garantir que o worker está disponível
 */

const fs = require("fs");
const path = require("path");

const source = path.join(
  __dirname,
  "..",
  "node_modules",
  "pdfjs-dist",
  "build",
  "pdf.worker.min.mjs"
);
const dest = path.join(__dirname, "..", "public", "pdf.worker.min.mjs");

try {
  // Criar diretório public se não existir
  const publicDir = path.dirname(dest);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Copiar arquivo
  fs.copyFileSync(source, dest);
  console.log(
    "✅ PDF worker copiado com sucesso para public/pdf.worker.min.mjs"
  );
} catch (error) {
  console.error("❌ Erro ao copiar PDF worker:", error);
  process.exit(1);
}
