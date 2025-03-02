/*
  # Création des tables pour l'application Handball Maisons-Laffitte

  1. Nouvelles Tables
    - `players` : Stocke les informations des joueurs
      - `id` (uuid, clé primaire)
      - `name` (text, non null)
      - `email` (text, nullable)
      - `phone` (text, nullable)
      - `is_admin` (boolean, défaut false)
      - `created_at` (timestamptz, défaut now())
    
    - `trainings` : Stocke les informations des entraînements
      - `id` (uuid, clé primaire)
      - `title` (text, non null)
      - `date` (timestamptz, non null)
      - `location` (text, non null)
      - `description` (text, nullable)
      - `is_recurring` (boolean, défaut false)
      - `recurrence_pattern` (text, nullable)
      - `created_at` (timestamptz, défaut now())
      - `created_by` (uuid, référence players.id, nullable)
    
    - `attendance` : Stocke les présences aux entraînements
      - `id` (uuid, clé primaire)
      - `player_id` (uuid, référence players.id)
      - `training_id` (uuid, référence trainings.id)
      - `status` (enum, 'present', 'absent', 'maybe')
      - `created_at` (timestamptz, défaut now())
      - `updated_at` (timestamptz, défaut now())

  2. Sécurité
    - Activation de RLS sur toutes les tables
    - Politiques pour permettre aux utilisateurs authentifiés de lire toutes les données
    - Politiques pour permettre aux administrateurs de modifier toutes les données
    - Politiques pour permettre aux joueurs de modifier leurs propres présences
*/

-- Création du type enum pour le statut de présence
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'maybe');

-- Table des joueurs
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Table des entraînements
CREATE TABLE IF NOT EXISTS trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date timestamptz NOT NULL,
  location text NOT NULL,
  description text,
  is_recurring boolean DEFAULT false,
  recurrence_pattern text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES players(id)
);

-- Table des présences
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) NOT NULL,
  training_id uuid REFERENCES trainings(id) NOT NULL,
  status attendance_status NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(player_id, training_id)
);

-- Activation de RLS sur toutes les tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table players
CREATE POLICY "Tout le monde peut lire les joueurs"
  ON players
  FOR SELECT
  USING (true);

CREATE POLICY "Seuls les admins peuvent modifier les joueurs"
  ON players
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM players p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Politiques pour la table trainings
CREATE POLICY "Tout le monde peut lire les entraînements"
  ON trainings
  FOR SELECT
  USING (true);

CREATE POLICY "Seuls les admins peuvent modifier les entraînements"
  ON trainings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM players p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Politiques pour la table attendance
CREATE POLICY "Tout le monde peut lire les présences"
  ON attendance
  FOR SELECT
  USING (true);

CREATE POLICY "Les joueurs peuvent modifier leurs propres présences"
  ON attendance
  FOR ALL
  USING (player_id = auth.uid());

CREATE POLICY "Les admins peuvent modifier toutes les présences"
  ON attendance
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM players p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Insertion de données de test
INSERT INTO players (name, is_admin) VALUES
  ('Admin Test', true),
  ('Joueur 1', false),
  ('Joueur 2', false),
  ('Joueur 3', false),
  ('Joueur 4', false);

-- Insertion d'entraînements de test
INSERT INTO trainings (title, date, location, description) VALUES
  ('Entraînement Seniors', (now() + interval '2 days')::timestamptz, 'Gymnase Colbert', 'Préparation match du weekend'),
  ('Entraînement Juniors', (now() + interval '3 days')::timestamptz, 'Gymnase Colbert', null),
  ('Entraînement Seniors', (now() + interval '9 days')::timestamptz, 'Gymnase Colbert', null),
  ('Entraînement passé', (now() - interval '5 days')::timestamptz, 'Gymnase Colbert', 'Entraînement déjà passé');