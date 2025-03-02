import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteTraining } from "@/lib/supabase";
import { toast } from "sonner";

interface DeleteTrainingDialogProps {
  trainingId: string;
  trainingTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteTrainingDialog({
  trainingId,
  trainingTitle,
  open,
  onOpenChange,
  onConfirm,
}: DeleteTrainingDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteTraining(trainingId);
      if (success) {
        onConfirm();
      } else {
        toast.error("Erreur lors de la suppression de l'entraînement");
      }
    } catch (error) {
      console.error("Failed to delete training:", error);
      toast.error("Erreur lors de la suppression de l'entraînement");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer l'entraînement</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer l'entraînement "{trainingTitle}" ?
            <br />
            <br />
            Cette action est irréversible et supprimera également toutes les présences associées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}