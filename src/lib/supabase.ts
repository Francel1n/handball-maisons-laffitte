import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Création d'un client Supabase singleton
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Fonctions utilitaires pour interagir avec Supabase
export async function fetchPlayers() {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching players:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Exception fetching players:', error);
    return [];
  }
}

export async function fetchTrainings(pastDays = 7, futureDays = 30) {
  try {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - pastDays);
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + futureDays);
    
    const { data, error } = await supabase
      .from('trainings')
      .select('*')
      .gte('date', pastDate.toISOString())
      .lte('date', futureDate.toISOString())
      .order('date');
    
    if (error) {
      console.error('Error fetching trainings:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Exception fetching trainings:', error);
    return [];
  }
}

export async function deleteTraining(trainingId: string) {
  try {
    // First delete all attendance records for this training
    const { error: attendanceError } = await supabase
      .from('attendance')
      .delete()
      .eq('training_id', trainingId);
    
    if (attendanceError) {
      console.error('Error deleting attendance records:', attendanceError);
      return false;
    }
    
    // Then delete the training
    const { error } = await supabase
      .from('trainings')
      .delete()
      .eq('id', trainingId);
    
    if (error) {
      console.error('Error deleting training:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception deleting training:', error);
    return false;
  }
}

export async function fetchAttendance(playerId: string, trainingId: string) {
  try {
    // Use maybeSingle instead of single to avoid PGRST116 errors
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('player_id', playerId)
      .eq('training_id', trainingId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching attendance:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception fetching attendance:', error);
    return null;
  }
}

export async function fetchAllAttendanceForTraining(trainingId: string) {
  try {
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendance')
      .select(`
        *,
        player:player_id (
          id,
          name
        )
      `)
      .eq('training_id', trainingId);
    
    if (attendanceError) {
      console.error('Error fetching attendance:', attendanceError);
      return [];
    }
    
    // Get all players to identify those who haven't responded
    const { data: allPlayers, error: playersError } = await supabase
      .from('players')
      .select('id, name');
    
    if (playersError) {
      console.error('Error fetching players:', playersError);
      return attendanceData || [];
    }
    
    // Create a map of player IDs who have responded
    const respondedPlayerIds = new Set(
      attendanceData?.map(attendance => attendance.player_id) || []
    );
    
    // Add players who haven't responded with a null status
    const nonRespondingPlayers = allPlayers
      ?.filter(player => !respondedPlayerIds.has(player.id))
      .map(player => ({
        id: `nr-${player.id}`, // Add a prefix to avoid ID conflicts
        player_id: player.id,
        training_id: trainingId,
        status: null as any, // This will be handled in the UI as "Non renseigné"
        created_at: '',
        updated_at: '',
        player: {
          id: player.id,
          name: player.name
        }
      })) || [];
    
    // Combine responded and non-responded players
    return [...(attendanceData || []), ...nonRespondingPlayers];
  } catch (error) {
    console.error('Exception fetching all attendance:', error);
    return [];
  }
}

export async function updateAttendance(playerId: string, trainingId: string, status: 'present' | 'absent' | 'maybe') {
  try {
    const attendance = await fetchAttendance(playerId, trainingId);
    
    if (attendance) {
      const { error } = await supabase
        .from('attendance')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', attendance.id);
      
      if (error) {
        console.error('Error updating attendance:', error);
        return false;
      }
    } else {
      const { error } = await supabase
        .from('attendance')
        .insert({
          player_id: playerId,
          training_id: trainingId,
          status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error creating attendance:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Exception updating attendance:', error);
    return false;
  }
}

export async function createTraining(data: {
  title: string;
  date: string;
  location: string;
  description?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
}) {
  try {
    const { error } = await supabase
      .from('trainings')
      .insert(data);
    
    if (error) {
      console.error('Error creating training:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception creating training:', error);
    return false;
  }
}

export async function createRecurringTrainings(
  baseTraining: {
    title: string;
    location: string;
    description?: string;
  },
  pattern: {
    dayOfWeek: number; // 0-6, where 0 is Sunday
    time: string; // HH:MM format
    startDate: string; // ISO date
    endDate: string; // ISO date
  }
) {
  try {
    const start = new Date(pattern.startDate);
    const end = new Date(pattern.endDate);
    const trainings = [];
    
    // Adjust start date to the next occurrence of the specified day of the week
    while (start.getDay() !== pattern.dayOfWeek) {
      start.setDate(start.getDate() + 1);
    }
    
    // Create a training for each occurrence of the day of the week between start and end
    const current = new Date(start);
    while (current <= end) {
      const [hours, minutes] = pattern.time.split(':').map(Number);
      current.setHours(hours, minutes, 0, 0);
      
      trainings.push({
        ...baseTraining,
        date: current.toISOString(),
        is_recurring: true,
        recurrence_pattern: `WEEKLY:${pattern.dayOfWeek}`
      });
      
      // Move to the next week
      current.setDate(current.getDate() + 7);
    }
    
    if (trainings.length > 0) {
      const { error } = await supabase
        .from('trainings')
        .insert(trainings);
      
      if (error) {
        console.error('Error creating recurring trainings:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Exception creating recurring trainings:', error);
    return false;
  }
}

export async function isAdmin(playerId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('is_admin')
      .eq('id', playerId)
      .single();
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return data?.is_admin || false;
  } catch (error) {
    console.error('Exception checking admin status:', error);
    return false;
  }
}