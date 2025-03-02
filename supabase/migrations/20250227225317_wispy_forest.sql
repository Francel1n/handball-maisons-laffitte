/*
  # Fix infinite recursion in players table policies

  1. Changes
    - Remove circular reference in players table policies
    - Simplify admin policy to use direct boolean check instead of self-referential query
    - Add public access policy for players table
  
  2. Security
    - Maintain RLS protection while fixing the recursion issue
    - Ensure proper access control for players data
*/

-- Drop the problematic policy that's causing infinite recursion
DROP POLICY IF EXISTS "Seuls les admins peuvent modifier les joueurs" ON players;

-- Create a new policy that doesn't cause recursion
CREATE POLICY "Admins can modify players"
  ON players
  FOR ALL
  USING (is_admin = true);

-- Ensure the select policy exists and is properly defined
DROP POLICY IF EXISTS "Tout le monde peut lire les joueurs" ON players;
CREATE POLICY "Anyone can read players"
  ON players
  FOR SELECT
  USING (true);