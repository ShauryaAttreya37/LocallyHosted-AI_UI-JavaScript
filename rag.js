import fs from "fs";
import path from "path";

export function chunkText(text, size = 500) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

export function saveChunks(project, chunks) {
  const file = `knowledge/${project}/embeddings.json`;
  const existing = fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file))
    : [];

  fs.writeFileSync(
    file,
    JSON.stringify(existing.concat(chunks), null, 2)
  );
}
