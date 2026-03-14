import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envText = fs.readFileSync('.env.local', 'utf8');
const env = {};
for (const line of envText.split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const idx = t.indexOf('=');
  if (idx === -1) continue;
  env[t.slice(0, idx)] = t.slice(idx + 1);
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRole) throw new Error('Missing Supabase envs');

const supabase = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const users = [
  { full_name: 'Demo Admin', email: 'demo.admin@nextgentms.com', password: 'Admin@12345', role: 'admin' },
  { full_name: 'Demo Dispatcher', email: 'demo.dispatcher@nextgentms.com', password: 'Dispatch@12345', role: 'dispatcher' },
  { full_name: 'Demo Customer', email: 'demo.customer@nextgentms.com', password: 'Customer@12345', role: 'customer' },
];

const list = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (list.error) throw new Error(list.error.message);

for (const user of users) {
  const existing = list.data.users.find((u) => u.email?.toLowerCase() === user.email.toLowerCase());

  if (existing) {
    const updated = await supabase.auth.admin.updateUserById(existing.id, {
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.full_name, role: user.role },
    });
    if (updated.error) throw new Error(updated.error.message);

    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ full_name: user.full_name, email: user.email, role: user.role })
      .eq('id', existing.id);
    if (profileErr) throw new Error(profileErr.message);

    console.log(`updated:${user.email}`);
    continue;
  }

  const created = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { full_name: user.full_name, role: user.role },
  });

  if (created.error || !created.data.user) throw new Error(created.error?.message ?? `Failed to create ${user.email}`);

  const { error: profileErr } = await supabase
    .from('profiles')
    .update({ full_name: user.full_name, email: user.email, role: user.role })
    .eq('id', created.data.user.id);
  if (profileErr) throw new Error(profileErr.message);

  console.log(`created:${user.email}`);
}
