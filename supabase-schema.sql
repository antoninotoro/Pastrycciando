-- Pastrycciando Database Schema
-- Esegui questo script nel SQL Editor di Supabase

-- Crea la tabella recipes
CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT,
  ingredienti JSONB NOT NULL,
  procedimento TEXT,
  consigli TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Crea indici per migliorare le performance
CREATE INDEX IF NOT EXISTS recipes_nome_idx ON recipes USING GIN (to_tsvector('italian', nome));
CREATE INDEX IF NOT EXISTS recipes_categoria_idx ON recipes (categoria);
CREATE INDEX IF NOT EXISTS recipes_created_at_idx ON recipes (created_at DESC);

-- Abilita Row Level Security (RLS)
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Policy per permettere a tutti di leggere le ricette
CREATE POLICY "Allow public read access"
  ON recipes
  FOR SELECT
  TO public
  USING (true);

-- Policy per permettere a tutti di inserire ricette
CREATE POLICY "Allow public insert access"
  ON recipes
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy per permettere a tutti di aggiornare ricette
CREATE POLICY "Allow public update access"
  ON recipes
  FOR UPDATE
  TO public
  USING (true);

-- Policy per permettere a tutti di cancellare ricette
CREATE POLICY "Allow public delete access"
  ON recipes
  FOR DELETE
  TO public
  USING (true);

-- Funzione per aggiornare automaticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger per aggiornare updated_at
DROP TRIGGER IF EXISTS update_recipes_updated_at ON recipes;
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserisci dati di esempio (opzionale)
INSERT INTO recipes (nome, categoria, ingredienti, procedimento, consigli) VALUES
(
  'Biscotti al Burro Classici',
  'Biscotti',
  '[
    {"nome": "Farina 00", "quantita": 300, "unita": "g", "percentuale": 100},
    {"nome": "Burro", "quantita": 150, "unita": "g", "percentuale": 50},
    {"nome": "Zucchero", "quantita": 100, "unita": "g", "percentuale": 33},
    {"nome": "Uova", "quantita": 1, "unita": "pezzi", "percentuale": 17},
    {"nome": "Vaniglia", "quantita": 1, "unita": "cucchiaino", "percentuale": 1}
  ]'::jsonb,
  'Mescola il burro ammorbidito con lo zucchero fino a ottenere una crema. Aggiungi l''uovo e la vaniglia. Incorpora la farina gradualmente. Forma i biscotti e cuoci a 180°C per 12-15 minuti.',
  'Il burro deve essere morbido ma non fuso. Non lavorare troppo l''impasto per mantenere i biscotti friabili.'
),
(
  'Pasta Frolla Base',
  'Impasti Base',
  '[
    {"nome": "Farina 00", "quantita": 500, "unita": "g", "percentuale": 100},
    {"nome": "Burro", "quantita": 250, "unita": "g", "percentuale": 50},
    {"nome": "Zucchero", "quantita": 150, "unita": "g", "percentuale": 30},
    {"nome": "Tuorli", "quantita": 3, "unita": "pezzi", "percentuale": 30},
    {"nome": "Scorza di limone", "quantita": 1, "unita": "pezzi", "percentuale": 2}
  ]'::jsonb,
  'Mescola velocemente farina, burro freddo a pezzi e zucchero fino a ottenere una sabbia. Aggiungi i tuorli e la scorza di limone. Forma una palla, avvolgi in pellicola e riposa in frigo per 30 minuti prima di usare.',
  'La frolla non deve essere lavorata troppo. Il burro deve essere freddo. Il riposo in frigo è essenziale per una buona riuscita.'
);

-- Verifica l'inserimento
SELECT * FROM recipes;
