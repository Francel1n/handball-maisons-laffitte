import { useState, useEffect } from "react";
import { fetchTrainings, deleteTraining } from "@/lib/supabase";
import { TrainingCard } from "@/components/training-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Training {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string | null;
}

export function TrainingList() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  const loadTrainings = async () => {
    setLoading(true);
    try {
      const trainingsData = await fetchTrainings();
      setTrainings(trainingsData);
    } catch (error) {
      console.error("Failed to load trainings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainings();
  }, []);

  const handleDeleteTraining = async (trainingId: string) => {
    try {
      const success = await deleteTraining(trainingId);
      if (success) {
        toast.success("Entraînement supprimé avec succès");
        // Refresh the list
        loadTrainings();
      } else {
        toast.error("Erreur lors de la suppression de l'entraînement");
      }
    } catch (error) {
      console.error("Failed to delete training:", error);
      toast.error("Erreur lors de la suppression de l'entraînement");
    }
  };

  const now = new Date();
  const upcomingTrainings = trainings.filter(
    (training) => new Date(training.date) >= now
  );
  const pastTrainings = trainings.filter(
    (training) => new Date(training.date) < now
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p>Chargement des entraînements...</p>
      </div>
    );
  }

  if (trainings.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">
          Aucun entraînement n'est programmé pour le moment.
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="upcoming" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="upcoming">À venir</TabsTrigger>
        <TabsTrigger value="past">Passés</TabsTrigger>
      </TabsList>
      
      <TabsContent value="upcoming" className="space-y-4">
        {upcomingTrainings.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Aucun entraînement à venir.
          </p>
        ) : (
          upcomingTrainings.map((training) => (
            <TrainingCard
              key={training.id}
              id={training.id}
              title={training.title}
              date={training.date}
              location={training.location}
              description={training.description || undefined}
              onDelete={() => handleDeleteTraining(training.id)}
            />
          ))
        )}
      </TabsContent>
      
      <TabsContent value="past" className="space-y-4">
        {pastTrainings.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Aucun entraînement passé.
          </p>
        ) : (
          pastTrainings.slice(0, 10).map((training) => (
            <TrainingCard
              key={training.id}
              id={training.id}
              title={training.title}
              date={training.date}
              location={training.location}
              description={training.description || undefined}
              onDelete={() => handleDeleteTraining(training.id)}
            />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
}