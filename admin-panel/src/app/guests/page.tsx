import GuestManagement from '@/components/guests/GuestManagement'
import { createServiceRoleClient } from '@/lib/supabase/service'

async function getGuests() {
  const supabase = createServiceRoleClient()
  
  try {
    // Get current camp_id
    let campId: string;
    
    const { data: camps, error: campsError } = await supabase
      .from('camps')
      .select('id')
      .limit(1)
      .single();

    if (campsError || !camps) {
      // Create default camp if none exists
      const { data: newCamp, error: createError } = await supabase
        .from('camps')
        .insert([{
          name: 'Default Camp',
          timezone: 'UTC',
          is_active: true
        }])
        .select('id')
        .single();

      if (createError || !newCamp) {
        console.error('Failed to create default camp:', createError);
        return { guests: [], assessmentQuestions: [] };
      }
      campId = newCamp.id;
    } else {
      campId = camps.id;
    }

    // Get guests for the camp with bed assignments
    const { data, error } = await supabase
      .from('guests')
      .select(`
        *,
        bed_assignments (
          id,
          bed_id,
          status,
          assigned_at,
          beds (
            id,
            bed_id,
            identifier,
            bed_type,
            capacity,
            current_occupancy,
            rooms (
              id,
              name,
              room_number
            )
          )
        )
      `)
      .eq('camp_id', campId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching guests:', error);
      return { guests: [], assessmentQuestions: [] };
    }

    // Get assessment questions
    const { data: questions, error: questionsError } = await supabase
      .from('assessment_questions')
      .select('*')
      .eq('camp_id', campId)
      .order('created_at', { ascending: false });

    if (questionsError) {
      console.error('Error fetching assessment questions:', questionsError);
    }

    // Transform the data to match frontend expectations
    const transformedData = (data || []).map(guest => {
      // Find the current active bed assignment
      const activeBedAssignment = guest.bed_assignments?.find(assignment => 
        assignment.status === 'active'
      );
      
      // Transform bed assignment to room assignment format expected by frontend
      const room_assignment = activeBedAssignment ? {
        room_number: activeBedAssignment.beds?.rooms?.room_number || activeBedAssignment.beds?.rooms?.name || 'Unknown',
        bed_name: activeBedAssignment.beds?.identifier || 'Unknown'
      } : undefined;

      return {
        ...guest,
        room_assignment,
        // Remove the bed_assignments array as it's not needed in frontend
        bed_assignments: undefined
      };
    });

    return { 
      guests: transformedData, 
      assessmentQuestions: questions || [] 
    };
  } catch (e: any) {
    console.error('Error in getGuests:', e);
    return { guests: [], assessmentQuestions: [] };
  }
}

export default async function GuestsMainPage() {
  const data = await getGuests()
  return <GuestManagement initialGuests={data.guests} initialAssessmentQuestions={data.assessmentQuestions} />
}