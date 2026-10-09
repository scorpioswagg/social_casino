-- Nocturne social casino foundation. Casino Coins have no cash value.
-- Per-user columns are TEXT (Better Auth ids). No real-money fields.

create table if not exists roles (
  id text primary key,
  description text not null,
  created_at timestamptz not null default now()
);

insert into roles (id, description) values
  ('player', 'Standard player'),
  ('moderator', 'Community moderation'),
  ('support', 'Player support'),
  ('content_manager', 'Rewards and events'),
  ('game_manager', 'Game catalog'),
  ('admin', 'Operations admin'),
  ('super_admin', 'Full access')
on conflict (id) do nothing;

create table if not exists user_roles (
  user_id text not null references "user"(id) on delete cascade,
  role_id text not null references roles(id) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by text,
  primary key (user_id, role_id)
);
create index if not exists user_roles_role_idx on user_roles (role_id);

create table if not exists vip_levels (
  id text primary key,
  name text not null,
  min_xp bigint not null,
  daily_bonus_multiplier numeric not null default 1,
  sort_order int not null
);

insert into vip_levels (id, name, min_xp, daily_bonus_multiplier, sort_order) values
  ('bronze', 'Bronze', 0, 1, 1),
  ('silver', 'Silver', 1000, 1.1, 2),
  ('gold', 'Gold', 5000, 1.25, 3),
  ('platinum', 'Platinum', 20000, 1.5, 4),
  ('diamond', 'Diamond', 80000, 2, 5)
on conflict (id) do nothing;

create table if not exists profiles (
  user_id text primary key references "user"(id) on delete cascade,
  username text not null,
  avatar_id text not null default 'crown',
  level int not null default 1 check (level >= 1),
  xp bigint not null default 0 check (xp >= 0),
  vip_tier text not null default 'bronze' references vip_levels(id),
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists profiles_username_lower_idx on profiles (lower(username));

create table if not exists player_sessions (
  id text primary key,
  user_id text not null references "user"(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  ip_address text,
  user_agent text,
  ended_at timestamptz
);
create index if not exists player_sessions_user_idx on player_sessions (user_id, created_at desc);

create table if not exists balances (
  user_id text primary key references "user"(id) on delete cascade,
  casino_coins bigint not null default 0 check (casino_coins >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists currency_transactions (
  id text primary key,
  user_id text not null references "user"(id) on delete restrict,
  amount bigint not null,
  balance_after bigint not null,
  type text not null,
  source text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists currency_tx_user_idx on currency_transactions (user_id, created_at desc);
create index if not exists currency_tx_type_idx on currency_transactions (type);

create table if not exists games (
  id text primary key,
  slug text not null unique,
  name text not null,
  description text,
  category text not null,
  status text not null default 'coming_soon',
  is_hot boolean not null default false,
  is_new boolean not null default false,
  is_featured boolean not null default false,
  min_bet bigint not null default 10,
  max_bet bigint not null default 10000,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

insert into games (id, slug, name, description, category, status, is_hot, is_new, is_featured, sort_order) values
  ('g_midnight_reels', 'midnight-reels', 'Midnight Reels', 'Velvet drums under low house lights.', 'slots', 'coming_soon', true, false, true, 1),
  ('g_velvet_wheel', 'velvet-wheel', 'Velvet Wheel', 'A single spin. A quiet room.', 'table', 'coming_soon', true, false, false, 2),
  ('g_house_21', 'house-21', 'House 21', 'Classic blackjack, Nocturne rules.', 'table', 'coming_soon', false, false, false, 3),
  ('g_orchid_draw', 'orchid-draw', 'Orchid Draw', 'Five-card tension, silk table.', 'poker', 'coming_soon', false, true, false, 4),
  ('g_sapphire_keno', 'sapphire-keno', 'Sapphire Keno', 'Pick your numbers. Wait for the draw.', 'keno', 'coming_soon', false, true, false, 5),
  ('g_crown_jacks', 'crown-jacks', 'Crown Jacks', 'High-volatility slots with a royal theme.', 'slots', 'coming_soon', true, false, false, 6),
  ('g_noir_holdem', 'noir-holdem', 'Noir Hold''em', 'Texas hold''em in a private salon.', 'poker', 'coming_soon', false, false, false, 7),
  ('g_gilded_baccarat', 'gilded-baccarat', 'Gilded Baccarat', 'Banker, player, or tie.', 'table', 'coming_soon', false, false, false, 8),
  ('g_ember_slots', 'ember-slots', 'Ember Slots', 'Warm jewel tones, cascading wins.', 'slots', 'coming_soon', true, false, false, 9),
  ('g_aurora_poker', 'aurora-poker', 'Aurora Poker', 'Late-night sit-and-go tables.', 'poker', 'coming_soon', false, true, false, 10)
on conflict (id) do nothing;

create table if not exists game_sessions (
  id text primary key,
  user_id text not null references "user"(id) on delete cascade,
  game_id text not null references games(id),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  wagered bigint not null default 0,
  paid_out bigint not null default 0,
  status text not null default 'open'
);
create index if not exists game_sessions_user_idx on game_sessions (user_id, started_at desc);
create index if not exists game_sessions_game_idx on game_sessions (game_id);

create table if not exists game_favorites (
  user_id text not null references "user"(id) on delete cascade,
  game_id text not null references games(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

create table if not exists rewards (
  id text primary key,
  slug text not null unique,
  name text not null,
  description text,
  reward_type text not null,
  coin_amount bigint not null,
  cooldown_hours int,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into rewards (id, slug, name, description, reward_type, coin_amount, cooldown_hours) values
  ('r_welcome', 'welcome', 'House Welcome', 'Granted once when a player joins.', 'welcome', 25000, null),
  ('r_daily', 'daily', 'Evening Envelope', 'A daily grant of Casino Coins.', 'daily', 5000, 24)
on conflict (id) do nothing;

create table if not exists reward_claims (
  id text primary key,
  user_id text not null references "user"(id) on delete cascade,
  reward_id text not null references rewards(id),
  claimed_on date not null default (timezone('utc', now()))::date,
  claimed_at timestamptz not null default now()
);
create unique index if not exists reward_claims_daily_uniq on reward_claims (user_id, reward_id, claimed_on);

create table if not exists missions (
  id text primary key,
  slug text not null unique,
  name text not null,
  description text,
  goal_type text not null,
  goal_value int not null,
  coin_reward bigint not null default 0,
  xp_reward int not null default 0,
  is_active boolean not null default true
);

insert into missions (id, slug, name, description, goal_type, goal_value, coin_reward, xp_reward) values
  ('m_first_login', 'first-evening', 'First Evening', 'Sign in and open the lobby.', 'login', 1, 1000, 50),
  ('m_browse_three', 'salon-tour', 'Salon Tour', 'Open three different tables.', 'play_count', 3, 2500, 120),
  ('m_claim_daily', 'evening-envelope', 'Evening Envelope', 'Collect the daily grant.', 'daily_claim', 1, 500, 40)
on conflict (id) do nothing;

create table if not exists mission_progress (
  user_id text not null references "user"(id) on delete cascade,
  mission_id text not null references missions(id) on delete cascade,
  progress int not null default 0,
  completed_at timestamptz,
  primary key (user_id, mission_id)
);

create table if not exists achievements (
  id text primary key,
  slug text not null unique,
  name text not null,
  description text,
  xp_reward int not null default 0,
  is_active boolean not null default true
);

insert into achievements (id, slug, name, description, xp_reward) values
  ('a_member', 'house-member', 'House Member', 'Joined Nocturne.', 25),
  ('a_generous', 'first-fortune', 'First Fortune', 'Claimed a daily envelope.', 40)
on conflict (id) do nothing;

create table if not exists user_achievements (
  user_id text not null references "user"(id) on delete cascade,
  achievement_id text not null references achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create table if not exists leaderboard_entries (
  id serial primary key,
  period text not null,
  category text not null,
  user_id text not null references "user"(id) on delete cascade,
  score bigint not null default 0,
  updated_at timestamptz not null default now(),
  unique (period, category, user_id)
);
create index if not exists leaderboard_rank_idx on leaderboard_entries (period, category, score desc);

create table if not exists friends (
  user_id text not null references "user"(id) on delete cascade,
  friend_id text not null references "user"(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);

create table if not exists messages (
  id text primary key,
  sender_id text not null references "user"(id) on delete cascade,
  recipient_id text not null references "user"(id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists messages_inbox_idx on messages (recipient_id, created_at desc);

create table if not exists notifications (
  id text primary key,
  user_id text not null references "user"(id) on delete cascade,
  title text not null,
  body text,
  kind text not null default 'system',
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications (user_id, created_at desc);

create table if not exists support_tickets (
  id text primary key,
  user_id text not null references "user"(id) on delete cascade,
  subject text not null,
  status text not null default 'open',
  priority text not null default 'normal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists support_tickets_user_idx on support_tickets (user_id, created_at desc);
create index if not exists support_tickets_status_idx on support_tickets (status);

create table if not exists support_ticket_messages (
  id text primary key,
  ticket_id text not null references support_tickets(id) on delete cascade,
  author_id text not null references "user"(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists player_stats (
  user_id text primary key references "user"(id) on delete cascade,
  games_opened int not null default 0,
  total_wagered bigint not null default 0,
  total_won bigint not null default 0,
  biggest_win bigint not null default 0,
  last_played_at timestamptz
);

create table if not exists audit_logs (
  id text primary key,
  actor_id text not null,
  action text not null,
  target_type text,
  target_id text,
  ip_address text,
  user_agent text,
  previous_state jsonb,
  new_state jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_actor_idx on audit_logs (actor_id, created_at desc);
create index if not exists audit_logs_action_idx on audit_logs (action, created_at desc);

create table if not exists admin_actions (
  id text primary key,
  audit_log_id text not null references audit_logs(id),
  admin_id text not null,
  action text not null,
  target_type text,
  target_id text,
  created_at timestamptz not null default now()
);
create index if not exists admin_actions_admin_idx on admin_actions (admin_id, created_at desc);
