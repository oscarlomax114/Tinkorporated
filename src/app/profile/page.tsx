import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfileDashboard from './ProfileDashboard';

export const metadata = {
  title: 'Patient Profile — TINKORPORATED',
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/profile');
  }

  // Fetch profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch orders
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  // Fetch lab access application
  const { data: labAccess } = await supabase
    .from('lab_access_applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return (
    <ProfileDashboard
      user={user}
      profile={profile}
      orders={orders ?? []}
      labAccess={labAccess}
    />
  );
}
