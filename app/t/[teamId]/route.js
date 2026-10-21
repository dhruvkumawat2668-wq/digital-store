import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request, { params }) {
  const { teamId } = params;
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const userAgent = request.headers.get('user-agent') || '';

  const { data: user } = await supabase
    .from('users')
    .select('team_id')
    .eq('team_id', teamId)
    .single();

  if (user) {
    const oneMinAgo = new Date(Date.now() - 60000).toISOString();
    const { data: recentClicks } = await supabase
      .from('clicks')
      .select('id')
      .eq('user_id', teamId)
      .eq('ip_address', ip)
      .gt('timestamp', oneMinAgo);

    if (!recentClicks || recentClicks.length === 0) {
      await supabase.from('clicks').insert([
        { user_id: teamId, ip_address: ip, device_info: userAgent }
      ]);
    }
  }

  return NextResponse.redirect('https://digital-store-neon-theta.vercel.app');
}
