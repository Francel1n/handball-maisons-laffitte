// Gestion du stockage local pour l'identité de l'utilisateur

const PLAYER_ID_KEY = 'handball-player-id';
const PLAYER_NAME_KEY = 'handball-player-name';
const PLAYER_ADMIN_KEY = 'handball-player-is-admin';

export function savePlayerIdentity(id: string, name: string, isAdmin: boolean) {
  localStorage.setItem(PLAYER_ID_KEY, id);
  localStorage.setItem(PLAYER_NAME_KEY, name);
  localStorage.setItem(PLAYER_ADMIN_KEY, isAdmin.toString());
}

export function getPlayerId(): string | null {
  return localStorage.getItem(PLAYER_ID_KEY);
}

export function getPlayerName(): string | null {
  return localStorage.getItem(PLAYER_NAME_KEY);
}

export function isPlayerAdmin(): boolean {
  return localStorage.getItem(PLAYER_ADMIN_KEY) === 'true';
}

export function clearPlayerIdentity() {
  localStorage.removeItem(PLAYER_ID_KEY);
  localStorage.removeItem(PLAYER_NAME_KEY);
  localStorage.removeItem(PLAYER_ADMIN_KEY);
}

export function hasPlayerIdentity(): boolean {
  return !!getPlayerId();
}