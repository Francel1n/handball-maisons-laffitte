import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { createTraining, createRecurringTrainings } from "@/lib/supabase";
import { getPlayerId } from "@/lib/storage";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Le titre doit contenir au moins 2 caractères.",
  }),
  date: z.date({
    required_error: "Veuillez sélectionner une date.",
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Format d'heure invalide. Utilisez HH:MM.",
  }),
  location: z.string().min(2, {
    message: "Le lieu doit contenir au moins 2 caractères.",
  }),
  description: z.string().optional(),
  isRecurring: z.boolean().default(false),
  endDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateTrainingForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      time: "20:30",
      location: "Gymnase Colbert",
      description: "",
      isRecurring: false,
    },
  });

  const isRecurring = form.watch("isRecurring");
  const selectedDate = form.watch("date");

  async function onSubmit(values: FormValues) {
    const playerId = getPlayerId();
    if (!playerId) {
      toast.error("Vous devez être connecté pour créer un entraînement.");
      return;
    }

    setLoading(true);
    try {
      if (values.isRecurring && values.endDate) {
        // Créer des entraînements récurrents
        const baseTraining = {
          title: values.title,
          location: values.location,
          description: values.description,
        };

        const pattern = {
          dayOfWeek: values.date.getDay(),
          time: values.time,
          startDate: values.date.toISOString(),
          endDate: values.endDate.toISOString(),
        };

        const success = await createRecurringTrainings(baseTraining, pattern);
        if (success) {
          toast.success("Entraînements récurrents créés avec succès !");
          form.reset();
          onSuccess();
        } else {
          toast.error("Erreur lors de la création des entraînements récurrents.");
        }
      } else {
        // Créer un seul entraînement
        const trainingDate = new Date(values.date);
        const [hours, minutes] = values.time.split(":").map(Number);
        trainingDate.setHours(hours, minutes, 0, 0);

        const success = await createTraining({
          title: values.title,
          date: trainingDate.toISOString(),
          location: values.location,
          description: values.description,
          is_recurring: false,
        });

        if (success) {
          toast.success("Entraînement créé avec succès !");
          form.reset();
          onSuccess();
        } else {
          toast.error("Erreur lors de la création de l'entraînement.");
        }
      }
    } catch (error) {
      console.error("Error creating training:", error);
      toast.error("Une erreur est survenue lors de la création de l'entraînement.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl>
                <Input placeholder="Entraînement seniors" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: fr })
                        ) : (
                          <span>Choisir une date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heure</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="20:30" className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lieu</FormLabel>
              <FormControl>
                <Input placeholder="Gymnase Colbert" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optionnelle)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Informations complémentaires..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isRecurring"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Récurrent</FormLabel>
                <FormDescription>
                  Créer une série d'entraînements hebdomadaires
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {isRecurring && selectedDate && (
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de fin</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: fr })
                        ) : (
                          <span>Choisir une date de fin</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < selectedDate}
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Les entraînements seront créés chaque {format(selectedDate, "EEEE", { locale: fr })} jusqu'à cette date.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Création en cours..." : "Créer l'entraînement"}
        </Button>
      </form>
    </Form>
  );
}