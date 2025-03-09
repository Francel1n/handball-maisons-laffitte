import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MapPin, Calendar, Clock, Trash2, Users } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchAttendance, updateAttendance } from "@/lib/supabase";
import { getPlayerId, isPlayerAdmin } from "@/lib/storage";
import { AttendanceModal } from "@/components/attendance-modal";
import { DeleteTrainingDialog } from "@/components/delete-training-dialog";
import confetti from 'canvas-confetti';

interface TrainingCardProps {
  id: string;
  title: string;
  date: string;
  location: string;
  description?: string;
  onDelete?: () => void;
}

type AttendanceStatus = "present" | "absent";

export function TrainingCard({ id, title, date, location, description, onDelete }: TrainingCardProps) {
  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isAdmin = isPlayerAdmin();

  const trainingDate = new Date(date);
  const formattedDate = format(trainingDate, "EEEE d MMMM yyyy", { locale: fr });
  const formattedTime = format(trainingDate, "HH'h'mm", { locale: fr });
  const isPast = trainingDate < new Date();

  useEffect(() => {
    const loadAttendance = async () => {
      const playerId = getPlayerId();
      if (!playerId) return;

      try {
        const attendance = await fetchAttendance(playerId, id);
        if (attendance) {
          setStatus(attendance.status);
        }
      } catch (error) {
        console.error("Failed to load attendance:", error);
      } finally {
        setInitialLoad(false);
      }
    };

    loadAttendance();
  }, [id]);

  const handleStatusChange = async (newStatus: AttendanceStatus) => {
    const playerId = getPlayerId();
    if (!playerId) return;

    setLoading(true);
    try {
      await updateAttendance(playerId, id, newStatus);
      setStatus(newStatus);
      
      if (newStatus === "present") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (error) {
      console.error("Failed to update attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = () => {
    setShowDeleteDialog(false);
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <>
      <Card className={`w-full ${isPast ? "opacity-70" : ""}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold">{title}</CardTitle>
            <div className="flex gap-2">
              {isPast && <Badge variant="outline">Passé</Badge>}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowAttendanceModal(true)}
                title="Voir les présences"
              >
                <Users className="h-4 w-4" />
              </Button>
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive hover:text-destructive"
                  title="Supprimer l'entraînement"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <Calendar className="h-4 w-4 mr-1" />
            <span className="capitalize">{formattedDate}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>{formattedTime}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{location}</span>
          </div>
        </CardHeader>
        
        {description && (
          <CardContent>
            <p className="text-sm">{description}</p>
          </CardContent>
        )}
        
        <CardFooter className="flex justify-between pt-4">
          <Button
            variant={status === "present" ? "default" : "outline"}
            className={status === "present" ? "bg-green-600 hover:bg-green-700" : ""}
            onClick={() => handleStatusChange("present")}
            disabled={loading || isPast}
          >
            Présent
          </Button>
          <Button
            variant={status === "absent" ? "default" : "outline"}
            className={status === "absent" ? "bg-red-600 hover:bg-red-700" : ""}
            onClick={() => handleStatusChange("absent")}
            disabled={loading || isPast}
          >
            Absent
          </Button>
        </CardFooter>
      </Card>

      <AttendanceModal 
        trainingId={id}
        trainingTitle={title}
        trainingDate={formattedDate}
        open={showAttendanceModal}
        onOpenChange={setShowAttendanceModal}
      />
      
      {isAdmin && (
        <DeleteTrainingDialog
          trainingId={id}
          trainingTitle={title}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
}