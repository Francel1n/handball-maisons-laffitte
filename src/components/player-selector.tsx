import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { fetchPlayers } from "@/lib/supabase";
import { savePlayerIdentity } from "@/lib/storage";

type Player = {
  id: string;
  name: string;
  is_admin: boolean;
};

interface PlayerSelectorProps {
  onPlayerSelected: () => void;
}

export function PlayerSelector({ onPlayerSelected }: PlayerSelectorProps) {
  const [open, setOpen] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadPlayers = async () => {
      setLoading(true);
      try {
        const playersData = await fetchPlayers();
        const playersList = Array.isArray(playersData) ? playersData : [];
        setPlayers(playersList);
        setFilteredPlayers(playersList);
      } catch (error) {
        console.error("Failed to load players:", error);
        setPlayers([]);
        setFilteredPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPlayers(players);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredPlayers(
        players.filter((player) => 
          player.name.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, players]);

  const handleSelect = (player: Player) => {
    setSelectedPlayer(player);
    savePlayerIdentity(player.id, player.name, player.is_admin);
    setOpen(false);
    onPlayerSelected();
  };

  // Render a simplified version when loading or no players
  if (loading) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <Button
          variant="outline"
          className="w-full justify-between"
          disabled={true}
        >
          Chargement des joueurs...
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <Button
          variant="outline"
          className="w-full justify-between"
          disabled={true}
        >
          Aucun joueur disponible
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedPlayer ? selectedPlayer.name : "Sélectionnez votre nom"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <div className="p-2">
            <div className="flex items-center border rounded-md px-3 py-2 mb-2">
              <Search className="h-4 w-4 mr-2 opacity-50" />
              <Input 
                placeholder="Rechercher un joueur..." 
                className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="max-h-72 overflow-y-auto">
              {filteredPlayers.length === 0 ? (
                <div className="py-6 text-center text-sm">
                  Aucun joueur trouvé.
                </div>
              ) : (
                <div className="py-1">
                  {filteredPlayers.map((player) => (
                    <div
                      key={player.id}
                      className={cn(
                        "flex items-center px-2 py-2 rounded-md cursor-pointer",
                        selectedPlayer?.id === player.id
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted"
                      )}
                      onClick={() => handleSelect(player)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedPlayer?.id === player.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {player.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}