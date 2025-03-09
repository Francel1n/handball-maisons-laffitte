import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchAllAttendanceForTraining } from "@/lib/supabase";
import { CheckCircle2, XCircle, CircleDashed } from "lucide-react";

interface AttendanceModalProps {
  trainingId: string;
  trainingTitle: string;
  trainingDate: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AttendanceWithPlayer {
  id: string;
  player_id: string;
  training_id: string;
  status: "present" | "absent" | null;
  player: {
    id: string;
    name: string;
  };
}

export function AttendanceModal({
  trainingId,
  trainingTitle,
  trainingDate,
  open,
  onOpenChange,
}: AttendanceModalProps) {
  const [attendance, setAttendance] = useState<AttendanceWithPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadAttendance();
    }
  }, [open, trainingId]);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const data = await fetchAllAttendanceForTraining(trainingId);
      setAttendance(data);
    } catch (error) {
      console.error("Failed to load attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group attendance by status
  const presentPlayers = attendance.filter(a => a.status === "present");
  const absentPlayers = attendance.filter(a => a.status === "absent");
  const noResponsePlayers = attendance.filter(a => a.status === null);

  // Calculate statistics
  const totalPlayers = attendance.length;
  const presentCount = presentPlayers.length;
  const absentCount = absentPlayers.length;
  const noResponseCount = noResponsePlayers.length;

  const presentPercentage = totalPlayers > 0 ? Math.round((presentCount / totalPlayers) * 100) : 0;
  const absentPercentage = totalPlayers > 0 ? Math.round((absentCount / totalPlayers) * 100) : 0;
  const noResponsePercentage = totalPlayers > 0 ? Math.round((noResponseCount / totalPlayers) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Présences - {trainingTitle}</DialogTitle>
          <DialogDescription>{trainingDate}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <p>Chargement des présences...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Présents</span>
                </div>
                <div className="font-bold">{presentCount}</div>
                <div className="text-xs text-muted-foreground">{presentPercentage}%</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 mb-1">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Absents</span>
                </div>
                <div className="font-bold">{absentCount}</div>
                <div className="text-xs text-muted-foreground">{absentPercentage}%</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 mb-1">
                  <CircleDashed className="h-4 w-4 text-gray-400" />
                  <span>N/A</span>
                </div>
                <div className="font-bold">{noResponseCount}</div>
                <div className="text-xs text-muted-foreground">{noResponsePercentage}%</div>
              </div>
            </div>

            <Tabs defaultValue="present" className="flex-1 flex flex-col">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="present">Présents</TabsTrigger>
                <TabsTrigger value="absent">Absents</TabsTrigger>
                <TabsTrigger value="no-response">N/A</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 mt-4">
                <TabsContent value="present" className="m-0">
                  <PlayerList 
                    players={presentPlayers.map(a => a.player)} 
                    icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
                    emptyMessage="Aucun joueur présent"
                  />
                </TabsContent>
                
                <TabsContent value="absent" className="m-0">
                  <PlayerList 
                    players={absentPlayers.map(a => a.player)} 
                    icon={<XCircle className="h-4 w-4 text-red-600" />}
                    emptyMessage="Aucun joueur absent"
                  />
                </TabsContent>
                
                <TabsContent value="no-response" className="m-0">
                  <PlayerList 
                    players={noResponsePlayers.map(a => a.player)} 
                    icon={<CircleDashed className="h-4 w-4 text-gray-400" />}
                    emptyMessage="Tous les joueurs ont répondu"
                  />
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface PlayerListProps {
  players: { id: string; name: string }[];
  icon: React.ReactNode;
  emptyMessage: string;
}

function PlayerList({ players, icon, emptyMessage }: PlayerListProps) {
  if (players.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {players.map(player => (
        <li key={player.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
          {icon}
          <span>{player.name}</span>
        </li>
      ))}
    </ul>
  );
}