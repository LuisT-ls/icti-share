-- Adicionar coluna search_vector para busca full-text
ALTER TABLE "materials" ADD COLUMN IF NOT EXISTS "search_vector" tsvector;

-- Criar função para atualizar search_vector
CREATE OR REPLACE FUNCTION materials_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('portuguese', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.course, '')), 'C') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.discipline, '')), 'C') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.semester, '')), 'C') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.type, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar search_vector automaticamente
DROP TRIGGER IF EXISTS materials_search_vector_trigger ON "materials";
CREATE TRIGGER materials_search_vector_trigger
  BEFORE INSERT OR UPDATE ON "materials"
  FOR EACH ROW
  EXECUTE FUNCTION materials_search_vector_update();

-- Criar índice GIN para busca rápida
CREATE INDEX IF NOT EXISTS "materials_search_vector_idx" ON "materials" USING GIN ("search_vector");

-- Popular search_vector para registros existentes
UPDATE "materials" SET
  search_vector =
    setweight(to_tsvector('portuguese', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(course, '')), 'C') ||
    setweight(to_tsvector('portuguese', COALESCE(discipline, '')), 'C') ||
    setweight(to_tsvector('portuguese', COALESCE(semester, '')), 'C') ||
    setweight(to_tsvector('portuguese', COALESCE(type, '')), 'C')
WHERE search_vector IS NULL;

