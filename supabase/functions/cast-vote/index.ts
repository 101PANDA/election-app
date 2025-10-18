import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// NEW: The corsHeaders object is now defined directly inside this file.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // This part remains the same. It handles preflight requests from browsers.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { voterRegNumber, candidateIds } = await req.json();
    if (!voterRegNumber || !candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      throw new Error("Missing voter registration number or candidate selections.");
    }
    
    // This part is the same: it uses your secret key securely.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SERVICE_ROLE_KEY')! 
    );

    // The rest of your secure voting logic is exactly the same.
    const { data: voter, error: voterError } = await supabaseAdmin
      .from('voters')
      .select('id, hasVoted, isSpecial')
      .eq('regNumber', voterRegNumber)
      .single();

    if (voterError) throw new Error("Voter not found.");
    if (voter.hasVoted) throw new Error("This voter has already cast their vote.");

    const voteWeight = voter.isSpecial ? 30 : 1;
    
    const votesToInsert = [];
    for (const candidateId of candidateIds) {
      for (let i = 0; i < voteWeight; i++) {
        votesToInsert.push({
          voter_id: voter.id,
          candidate_id: candidateId,
        });
      }
    }

    const { error: insertError } = await supabaseAdmin.from('votes').insert(votesToInsert);
    if (insertError) throw new Error("Failed to record votes.");

    const { error: updateError } = await supabaseAdmin
      .from('voters')
      .update({ hasVoted: true })
      .eq('id', voter.id);
    
    if (updateError) {
      console.error("CRITICAL: Failed to mark voter as voted after vote insertion.");
      throw new Error("Failed to finalize vote.");
    }
    
    return new Response(JSON.stringify({ message: "Vote cast successfully!" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})