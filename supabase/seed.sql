-- minimal sample rows for demo initialization; replace ids as needed.
insert into profiles (id, email, full_name, neighborhood, bio, verified_ut, trust_score, rating, review_count, completed_jobs)
values
  ('00000000-0000-0000-0000-000000000001', 'alex@utexas.edu', 'Alex R.', 'West Campus', 'Finance junior cutting fades since freshman year.', true, 93, 4.9, 41, 118),
  ('00000000-0000-0000-0000-000000000002', 'maya@utexas.edu', 'Maya T.', 'North Campus', 'Studio art senior focused on event braiding.', true, 95, 5.0, 29, 72)
on conflict (id) do nothing;

insert into service_listings (id, provider_id, title, description, category, price, neighborhood, availability, tags, response_time, vibe, recent_momentum, schedule)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'West Campus Fade Lab', 'Affordable fades and trims for UT students.', 'Haircuts', 22, 'West Campus', '{"Tonight","This Week","Weekends"}', '{"fades","lineup","game day"}', 'Usually replies in 8 min', 'Polished', 'Booked 7 students this week', '{"Tonight 7:00 PM","Tonight 8:15 PM"}'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Formal-Ready Braids', 'Protective styles and event-ready braids.', 'Braiding', 35, 'North Campus', '{"Tomorrow","This Week","Weekends"}', '{"braids","formal"}', 'Usually replies in 14 min', 'Premium', 'Most saved stylist before spring formals', '{"Tomorrow 5:30 PM","Thursday 4:00 PM"}')
on conflict (id) do nothing;
