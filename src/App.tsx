import { useState, useEffect } from "react";
import { ThemeProvider } from "@/lib/theme";
import { Header } from "@/components/header";
import { PlayerSelector } from "@/components/player-selector";
import { TrainingList } from "@/components/training-list";
import { AdminPanel } from "@/components/admin-panel";
import { hasPlayerIdentity, isPlayerAdmin } from "@/lib/storage";
import InstallIncentiveButton from "@/components/install-incentive-button";

function App() {
  const [hasIdentity, setHasIdentity] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà une identité
    const userHasIdentity = hasPlayerIdentity();
    setHasIdentity(userHasIdentity);
    
    if (userHasIdentity) {
      setIsAdmin(isPlayerAdmin());
    }
    
    setIsLoading(false);
  }, []);

  const handlePlayerSelected = () => {
    setHasIdentity(true);
    setIsAdmin(isPlayerAdmin());
  };

  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="py-6 px-4 max-w-xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-[80vh]">
              <p>Chargement...</p>
            </div>
          ) : !hasIdentity ? (
            <div className="max-w-md mx-auto mt-20 p-6 bg-card rounded-lg shadow-md">
              <h1 className="text-2xl font-bold mb-6 text-center">
                Bienvenue au club de handball de Maisons-Laffitte
              </h1>
              <p className="mb-6 text-center text-muted-foreground">
                Pour continuer, veuillez sélectionner votre nom dans la liste des joueurs.
              </p>
              <PlayerSelector onPlayerSelected={handlePlayerSelected} />
            </div>
          ) : (
            <div className="container">
              {isAdmin && <AdminPanel />}
              <h2 className="text-xl font-semibold mb-4">Entraînements</h2>
              <TrainingList />
            </div>
          )}
        </main>
        <InstallIncentiveButton />
      </div>
    </ThemeProvider>
  );
}

export default App;