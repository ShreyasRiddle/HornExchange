-- Relational demo seed aligned to lib/seed-data.ts card content.

insert into profiles (id, email, full_name, neighborhood, bio, verified_ut, trust_score, rating, review_count, completed_jobs)
values
  ('00000000-0000-0000-0000-000000000001', 'alex@utexas.edu', 'Alex R.', 'West Campus', 'Finance junior who has been cutting student fades and tapers since freshman year.', true, 93, 4.9, 41, 118),
  ('00000000-0000-0000-0000-000000000002', 'maya@utexas.edu', 'Maya T.', 'North Campus', 'Studio art senior known around campus for event braids and natural hair styling.', true, 95, 5.0, 29, 72),
  ('00000000-0000-0000-0000-000000000003', 'rishi@utexas.edu', 'Rishi P.', 'Guadalupe', 'ECE senior with a reputation for getting people unstuck before exams.', true, 90, 4.8, 57, 140),
  ('00000000-0000-0000-0000-000000000004', 'lucia@utexas.edu', 'Lucia M.', 'Downtown Austin', 'Advertising major with a warm editorial style and repeat org clients.', true, 88, 4.9, 25, 61),
  ('00000000-0000-0000-0000-000000000005', 'zoe@utexas.edu', 'Zoe C.', 'West Campus', 'McCombs senior helping students tighten resumes before recruiting.', true, 91, 4.9, 38, 110),
  ('00000000-0000-0000-0000-000000000006', 'trent@utexas.edu', 'Trent W.', 'West Campus', 'Kinesiology junior with a truck and a flexible weekend schedule.', true, 87, 4.7, 21, 54),
  ('00000000-0000-0000-0000-000000000101', 'jordan.buyer@utexas.edu', 'Jordan B.', 'Riverside', 'UT buyer profile for shortlist and messaging flow demos.', true, 82, 4.5, 9, 14)
on conflict (id) do update set
  email = excluded.email,
  full_name = excluded.full_name,
  neighborhood = excluded.neighborhood,
  bio = excluded.bio,
  verified_ut = excluded.verified_ut,
  trust_score = excluded.trust_score,
  rating = excluded.rating,
  review_count = excluded.review_count,
  completed_jobs = excluded.completed_jobs;

insert into service_listings (id, provider_id, title, description, category, price, neighborhood, availability, tags, response_time, vibe, recent_momentum, schedule)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'West Campus Fade Lab', 'Affordable fades, trims, and lineups for UT students. Best for clean evening cuts before org events or game-day weekends.', 'Haircuts', 22, 'West Campus', '{"Tonight","This Week","Weekends"}', '{"fades","lineup","game day","evenings"}', 'Usually replies in 8 min', 'Polished', 'Booked 7 students this week', '{"Tonight 7:00 PM","Tonight 8:15 PM","Tomorrow 6:30 PM"}'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Formal-Ready Braids', 'Protective styles, braid touch-ups, and event-ready looks with a calm, low-stress appointment flow.', 'Braiding', 35, 'North Campus', '{"Tomorrow","This Week","Weekends"}', '{"braids","formal","protective styles","events"}', 'Usually replies in 14 min', 'Premium', 'Most saved stylist before spring formals', '{"Tomorrow 5:30 PM","Thursday 4:00 PM","Saturday 1:00 PM"}'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Calc and Physics Rescue Sessions', 'Fast-paced tutoring for calc, physics, and intro engineering classes. Good for last-minute concept rescue or exam prep.', 'Tutoring', 28, 'Guadalupe', '{"Tonight","Tomorrow","This Week"}', '{"calc","physics","exam prep","PCL"}', 'Usually replies in 5 min', 'Casual', 'Heavy exam-week demand', '{"Tonight 9:00 PM","Tomorrow 1:00 PM","Friday 3:00 PM"}'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'Org Headshots and Grad Photos', 'Portraits, org headshots, graduation shots, and creator photos with soft editing and quick turnaround.', 'Photography', 45, 'Downtown Austin', '{"This Week","Weekends","Flexible"}', '{"headshots","grad","portraits","org photos"}', 'Usually replies in 20 min', 'Premium', 'Popular with org exec boards', '{"Friday 5:00 PM","Saturday 10:00 AM","Sunday 2:30 PM"}'),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'Resume Rescue for Intern Season', 'Sharp edits, bullet rewrites, and quick feedback for internship and org applications.', 'Resume Review', 18, 'West Campus', '{"Tonight","Tomorrow","Flexible"}', '{"resume","internships","McCombs","quick turnaround"}', 'Usually replies in 3 min', 'Polished', 'Popular during recruiting deadlines', '{"Tonight 8:30 PM","Tomorrow 11:00 AM","Tomorrow 7:00 PM"}'),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', 'West Campus Move-Out Muscle', 'Move-out lifting help, furniture pickup, and apartment-to-storage runs around West Campus and North Campus.', 'Moving Help', 30, 'West Campus', '{"This Week","Weekends","Flexible"}', '{"moving","truck","storage","move-out"}', 'Usually replies in 11 min', 'Casual', 'Most booked during lease turnover', '{"Thursday 6:00 PM","Saturday 9:00 AM","Sunday 12:00 PM"}')
on conflict (id) do update set
  provider_id = excluded.provider_id,
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  price = excluded.price,
  neighborhood = excluded.neighborhood,
  availability = excluded.availability,
  tags = excluded.tags,
  response_time = excluded.response_time,
  vibe = excluded.vibe,
  recent_momentum = excluded.recent_momentum,
  schedule = excluded.schedule,
  is_active = true;

insert into reviews (id, listing_id, author_name, rating, quote)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Jalen', 5.0, 'Quick, clean fade before formal. Super easy pickup in West Campus.'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Marco', 5.0, 'Best campus haircut under 25 bucks.'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Ethan', 4.8, 'Consistent and actually on time.'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Kyla', 5.0, 'Maya literally saved my formal look.'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'Amara', 5.0, 'Warm, detailed, and super professional.'),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'Sydney', 4.9, 'Worth it if you want a polished style that lasts.'),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 'Naomi', 5.0, 'Explains things like an older student, not a professor.'),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003', 'Derek', 4.8, 'Saved me before my midterm.'),
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', 'Aisha', 4.7, 'Really good if you need someone close to campus fast.'),
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000004', 'Bella', 5.0, 'My LinkedIn finally looks like I have my life together.'),
  ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000004', 'Chris', 4.9, 'Great communication and fast edits.'),
  ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000004', 'Aarav', 4.8, 'Worth the extra spend if you want polished photos.'),
  ('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000005', 'Priya', 5.0, 'Got way more interviews after Zoe cleaned up my resume.'),
  ('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000005', 'Luis', 4.8, 'Fastest turnaround I found near campus.'),
  ('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000005', 'Mei', 5.0, 'Actually useful feedback, not vague fluff.'),
  ('20000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000006', 'Nina', 4.8, 'Made move-out so much less awful.'),
  ('20000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000006', 'Sam', 4.7, 'Good value if you just need someone reliable.'),
  ('20000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000006', 'Eli', 4.6, 'Communicative and easy to coordinate with.')
on conflict (id) do update set
  listing_id = excluded.listing_id,
  author_name = excluded.author_name,
  rating = excluded.rating,
  quote = excluded.quote;

insert into threads (id, listing_id, buyer_id, seller_id)
values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000002')
on conflict (id) do update set
  listing_id = excluded.listing_id,
  buyer_id = excluded.buyer_id,
  seller_id = excluded.seller_id;

insert into messages (id, thread_id, sender_role, body)
values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'seller', 'Hey! I have 7:00 and 8:15 open tonight if you want either slot.'),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'buyer', '8:15 works for me. Could you share exact location details?'),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'seller', 'Happy to help. Tell me the style you are aiming for and I can suggest prep.')
on conflict (id) do update set
  thread_id = excluded.thread_id,
  sender_role = excluded.sender_role,
  body = excluded.body;

insert into saved_recommendations (id, user_id, listing_id, search_context)
values
  ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', '10000000-0000-0000-0000-000000000001', 'Need a clean fade under $25 in West Campus tonight.'),
  ('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000101', '10000000-0000-0000-0000-000000000005', 'Resume polish before internship deadlines this week.')
on conflict (id) do update set
  user_id = excluded.user_id,
  listing_id = excluded.listing_id,
  search_context = excluded.search_context;
