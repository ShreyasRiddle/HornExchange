create table if not exists profiles (
  id uuid primary key,
  email text unique not null,
  full_name text not null,
  avatar_url text,
  neighborhood text not null,
  bio text not null,
  verified_ut boolean not null default false,
  trust_score integer not null default 70,
  rating numeric(2,1) not null default 0,
  review_count integer not null default 0,
  completed_jobs integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists service_listings (
  id uuid primary key,
  provider_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  price integer not null,
  neighborhood text not null,
  availability text[] not null default '{}',
  tags text[] not null default '{}',
  response_time text not null default 'Usually replies in 15 min',
  vibe text not null default 'Casual',
  recent_momentum text,
  schedule text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id uuid primary key,
  listing_id uuid not null references service_listings(id) on delete cascade,
  author_name text not null,
  rating numeric(2,1) not null,
  quote text not null,
  created_at timestamptz not null default now()
);

create table if not exists threads (
  id uuid primary key,
  listing_id uuid not null references service_listings(id) on delete cascade,
  buyer_id uuid not null references profiles(id) on delete cascade,
  seller_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key,
  thread_id uuid not null references threads(id) on delete cascade,
  sender_role text not null check (sender_role in ('buyer', 'seller')),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists saved_recommendations (
  id uuid primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  listing_id uuid not null references service_listings(id) on delete cascade,
  search_context text,
  saved_at timestamptz not null default now(),
  unique (user_id, listing_id)
);
