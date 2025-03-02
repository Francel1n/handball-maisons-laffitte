// TODO: Retravailler ce bouton et mettre les vrais logos

import { useState, useEffect } from 'react';

function InstallIncentiveButton() {
    console.log("InstallIncentiveButton");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(true);
  console.log(showInstallButton);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Empêche Chrome d'afficher automatiquement la bannière d'installation
      e.preventDefault();
      // Stocke l'événement pour l'utiliser plus tard
      setDeferredPrompt(e);
      // Affiche le bouton d'installation
      setShowInstallButton(true);
    });
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    
    // Affiche la bannière d'installation
    deferredPrompt.prompt();
    
    // Attend que l'utilisateur réponde
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Utilisateur a accepté l\'installation');
      } else {
        console.log('Utilisateur a refusé l\'installation');
      }
      // Réinitialise l'événement
      setDeferredPrompt(null);
      setShowInstallButton(false);
    });
  };
console.log(showInstallButton);
  return showInstallButton ? (
    <button 
      onClick={handleInstallClick}
      className="fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-lg shadow-lg"
    >
      Installer l'application
    </button>
  ) : null;
}

export default InstallIncentiveButton;