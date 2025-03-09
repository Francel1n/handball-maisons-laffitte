import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

// Obtenir l'équivalent de __dirname dans les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction pour créer le répertoire s'il n'existe pas
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

// Dimensions des écrans d'accueil pour iOS
const iosScreens = [
  { width: 2048, height: 2732, name: 'apple-splash-2048-2732.jpg' }, // iPad Pro 12.9"
  { width: 1668, height: 2388, name: 'apple-splash-1668-2388.jpg' }, // iPad Pro 11"
  { width: 1536, height: 2048, name: 'apple-splash-1536-2048.jpg' }, // iPad Mini, Air
  { width: 1125, height: 2436, name: 'apple-splash-1125-2436.jpg' }, // iPhone X, XS
  { width: 1242, height: 2688, name: 'apple-splash-1242-2688.jpg' }, // iPhone XS Max
  { width: 828, height: 1792, name: 'apple-splash-828-1792.jpg' },   // iPhone XR
  { width: 1242, height: 2208, name: 'apple-splash-1242-2208.jpg' }, // iPhone 8 Plus
  { width: 750, height: 1334, name: 'apple-splash-750-1334.jpg' },   // iPhone 8
  { width: 640, height: 1136, name: 'apple-splash-640-1136.jpg' },   // iPhone SE
];

// Générer les images d'écran de démarrage iOS
async function generateIosSplashScreens() {
  console.log('Génération des écrans de démarrage iOS...');
  
  const publicDir = path.join(__dirname, '../public');
  const iconsDir = path.join(publicDir, 'icons');
  
  ensureDirectoryExists(iconsDir);
  
  // Utiliser l'icône de base pour générer les écrans de démarrage
  const sourceIcon = path.join(iconsDir, 'icon-512x512.png');
  
  // Si l'icône source n'existe pas, utiliser android-chrome-512x512.png
  const sourceIconPath = fs.existsSync(sourceIcon) 
    ? sourceIcon 
    : path.join(iconsDir, 'android-chrome-512x512.png');
  
  if (!fs.existsSync(sourceIconPath)) {
    console.error(`Erreur : Fichier source ${sourceIconPath} introuvable.`);
    return;
  }
  
  // Couleur de fond des écrans de démarrage
  const backgroundColor = '#101631';
  
  // Générer chaque écran de démarrage
  for (const screen of iosScreens) {
    try {
      // Créer une image avec la couleur de fond
      const baseImage = sharp({
        create: {
          width: screen.width,
          height: screen.height,
          channels: 4,
          background: backgroundColor
        }
      });
      
      // Lire l'icône source
      const icon = await sharp(sourceIconPath)
        .resize({ width: Math.floor(screen.width * 0.4), fit: 'contain' })
        .toBuffer();
      
      // Calculer la position pour centrer l'icône
      const iconWidth = Math.floor(screen.width * 0.4);
      const iconHeight = Math.floor(screen.width * 0.4); // Assume aspect ratio 1:1
      const left = Math.floor((screen.width - iconWidth) / 2);
      const top = Math.floor((screen.height - iconHeight) / 2);
      
      // Superposer l'icône sur le fond
      await baseImage
        .composite([{ input: icon, left, top }])
        .jpeg({ quality: 90 })
        .toFile(path.join(iconsDir, screen.name));
      
      console.log(`Écran de démarrage généré : ${screen.name}`);
    } catch (error) {
      console.error(`Erreur lors de la génération de ${screen.name}:`, error);
    }
  }
  
  console.log('Génération des écrans de démarrage terminée !');
}

// Exécuter la génération
generateIosSplashScreens(); 