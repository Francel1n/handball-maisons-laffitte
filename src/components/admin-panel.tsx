import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateTrainingForm } from "@/components/create-training-form";

export function AdminPanel() {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    // Recharger la liste des entraînements
    window.location.reload();
  };

  return (
    <div className="mb-6">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Nouvel entraînement
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Créer un nouvel entraînement</DialogTitle>
            <DialogDescription>
              Remplissez le formulaire pour créer un nouvel entraînement.
            </DialogDescription>
          </DialogHeader>
          <CreateTrainingForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}