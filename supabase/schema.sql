create or replace function is_ut_email(email text)
returns boolean
language sql
immutable
as $$
  select lower(trim(email)) like '%@utexas.edu';
$$;

create table if not exists profiles (
  id uuid primary key,
  email text unique not null,
  full_name text not null,
  avatar_url text,
  neighborhood text not null check (
    neighborhood in ('West Campus', 'North Campus', 'Guadalupe', 'Riverside', 'Downtown Austin')
  ),
  bio text not null,
  verified_ut boolean not null default false,
  trust_score integer not null default 70 check (trust_score between 0 and 100),
  rating numeric(2,1) not null default 0 check (rating between 0 and 5),
  review_count integer not null default 0 check (review_count >= 0),
  completed_jobs integer not null default 0 check (completed_jobs >= 0),
  created_at timestamptz not null default now(),
  check (verified_ut = false or is_ut_email(email))
);

create table if not exists service_listings (
  id uuid primary key,
  provider_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null check (
    category in ('Haircuts', 'Braiding', 'Tutoring', 'Photography', 'Resume Review', 'Moving Help')
  ),
  price integer not null check (price > 0),
  neighborhood text not null check (
    neighborhood in ('West Campus', 'North Campus', 'Guadalupe', 'Riverside', 'Downtown Austin')
  ),
  availability text[] not null default '{}' check (
    availability <@ array['Tonight', 'Tomorrow', 'This Week', 'Weekends', 'Flexible']
  ),
  tags text[] not null default '{}',
  response_time text not null default 'Usually replies in 15 min',
  vibe text not null default 'Casual' check (vibe in ('Casual', 'Polished', 'Premium')),
  recent_momentum text,
  schedule text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id uuid primary key,
  listing_id uuid not null references service_listings(id) on delete cascade,
  author_name text not null,
  rating numeric(2,1) not null check (rating between 0 and 5),
  quote text not null,
  created_at timestamptz not null default now()
);

create table if not exists threads (
  id uuid primary key,
  listing_id uuid not null references service_listings(id) on delete cascade,
  buyer_id uuid not null references profiles(id) on delete cascade,
  seller_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id, seller_id),
  check (buyer_id <> seller_id)
);

create table if not exists messages (
  id uuid primary key,
  thread_id uuid not null references threads(id) on delete cascade,
  sender_role text not null check (sender_role in ('buyer', 'seller')),
  body text not null check (length(trim(body)) > 0),
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

create index if not exists idx_service_listings_category on service_listings(category);
create index if not exists idx_service_listings_neighborhood on service_listings(neighborhood);
create index if not exists idx_service_listings_price on service_listings(price);
create index if not exists idx_saved_recommendations_user_id on saved_recommendations(user_id);
create index if not exists idx_messages_thread_id on messages(thread_id);
