insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, confirmation_token, recovery_token,
  email_change_token_new, email_change, email_change_token_current, reauthentication_token, phone_change, phone_change_token,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@squadlink.gg', crypt('demo12345', gen_salt('bf')), timezone('utc', now()), '', '', '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"nick":"ControlRoom"}', timezone('utc', now()), timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lyra@squadlink.gg', crypt('demo12345', gen_salt('bf')), timezone('utc', now()), '', '', '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"nick":"LyraShot"}', timezone('utc', now()), timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'marco@squadlink.gg', crypt('demo12345', gen_salt('bf')), timezone('utc', now()), '', '', '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"nick":"MarcoRush"}', timezone('utc', now()), timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ines@squadlink.gg', crypt('demo12345', gen_salt('bf')), timezone('utc', now()), '', '', '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"nick":"InesAnchor"}', timezone('utc', now()), timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hugo@squadlink.gg', crypt('demo12345', gen_salt('bf')), timezone('utc', now()), '', '', '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"nick":"HugoOrbit"}', timezone('utc', now()), timezone('utc', now())),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nuevo@squadlink.gg', crypt('demo12345', gen_salt('bf')), timezone('utc', now()), '', '', '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"nick":"AsterLink"}', timezone('utc', now()), timezone('utc', now()))
on conflict (id) do update
set
  encrypted_password = excluded.encrypted_password,
  email = excluded.email,
  email_confirmed_at = excluded.email_confirmed_at,
  confirmation_token = excluded.confirmation_token,
  recovery_token = excluded.recovery_token,
  email_change_token_new = excluded.email_change_token_new,
  email_change = excluded.email_change,
  email_change_token_current = excluded.email_change_token_current,
  reauthentication_token = excluded.reauthentication_token,
  phone_change = excluded.phone_change,
  phone_change_token = excluded.phone_change_token,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = excluded.updated_at;

insert into auth.identities (
  id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
values
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '{"sub":"00000000-0000-0000-0000-000000000001","email":"admin@squadlink.gg","nick":"ControlRoom","email_verified":true,"phone_verified":false}', 'email', timezone('utc', now()), timezone('utc', now()), timezone('utc', now())),
  ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '{"sub":"00000000-0000-0000-0000-000000000002","email":"lyra@squadlink.gg","nick":"LyraShot","email_verified":true,"phone_verified":false}', 'email', timezone('utc', now()), timezone('utc', now()), timezone('utc', now())),
  ('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '{"sub":"00000000-0000-0000-0000-000000000003","email":"marco@squadlink.gg","nick":"MarcoRush","email_verified":true,"phone_verified":false}', 'email', timezone('utc', now()), timezone('utc', now()), timezone('utc', now())),
  ('40000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', '{"sub":"00000000-0000-0000-0000-000000000004","email":"ines@squadlink.gg","nick":"InesAnchor","email_verified":true,"phone_verified":false}', 'email', timezone('utc', now()), timezone('utc', now()), timezone('utc', now())),
  ('40000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', '{"sub":"00000000-0000-0000-0000-000000000005","email":"hugo@squadlink.gg","nick":"HugoOrbit","email_verified":true,"phone_verified":false}', 'email', timezone('utc', now()), timezone('utc', now()), timezone('utc', now())),
  ('40000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', '{"sub":"00000000-0000-0000-0000-000000000006","email":"nuevo@squadlink.gg","nick":"AsterLink","email_verified":true,"phone_verified":false}', 'email', timezone('utc', now()), timezone('utc', now()), timezone('utc', now()))
on conflict (provider_id, provider) do update
set
  identity_data = excluded.identity_data,
  last_sign_in_at = excluded.last_sign_in_at,
  updated_at = excluded.updated_at;

insert into public.platforms (id, code, name) values
  ('10000000-0000-0000-0000-000000000001', 'pc', 'PC'),
  ('10000000-0000-0000-0000-000000000002', 'playstation', 'PlayStation'),
  ('10000000-0000-0000-0000-000000000003', 'xbox', 'Xbox'),
  ('10000000-0000-0000-0000-000000000004', 'switch', 'Nintendo Switch'),
  ('10000000-0000-0000-0000-000000000005', 'mobile', 'Mobile')
on conflict (id) do nothing;

insert into public.games (id, name, slug, genre) values
  ('20000000-0000-0000-0000-000000000001', 'Valorant', 'valorant', 'Tactical Shooter'),
  ('20000000-0000-0000-0000-000000000002', 'EA Sports FC 25 Clubs', 'ea-sports-fc-25-clubs', 'Sports'),
  ('20000000-0000-0000-0000-000000000003', 'Destiny 2', 'destiny-2', 'Shared World Shooter'),
  ('20000000-0000-0000-0000-000000000004', 'Helldivers 2', 'helldivers-2', 'Co-op Shooter')
on conflict (id) do nothing;

insert into public.profiles (id, user_id, role, nick, full_name, bio, timezone, main_platform_id, reliability_score) values
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'admin', 'ControlRoom', 'Nora Salvatierra', 'Administración y moderación de SquadLink.', 'Europe/Madrid', '10000000-0000-0000-0000-000000000001', 95),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'leader', 'LyraShot', 'Lyra Benavent', 'IGL paciente para Valorant. Busco constancia y buen ambiente competitivo.', 'Europe/Madrid', '10000000-0000-0000-0000-000000000001', 92),
  ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'player', 'MarcoRush', 'Marco Ortega', 'Jugador flexible de shooters tácticos. Puntual y bastante constante.', 'Europe/Madrid', '10000000-0000-0000-0000-000000000001', 84),
  ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'leader', 'InesAnchor', 'Inés Muñoz', 'Capitana de club en FC y organizadora de eventos semanales.', 'Europe/Madrid', '10000000-0000-0000-0000-000000000002', 88),
  ('30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'player', 'HugoOrbit', 'Hugo Cervera', 'Veterano de Destiny 2 enfocado en raids y dungeons.', 'Europe/Madrid', '10000000-0000-0000-0000-000000000001', 90),
  ('30000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', 'player', 'AsterLink', 'Aster Vega', 'Perfil demo creado para probar el flujo de registro.', 'Europe/Madrid', '10000000-0000-0000-0000-000000000001', 76)
on conflict (user_id) do update
set
  id = excluded.id,
  role = excluded.role,
  nick = excluded.nick,
  full_name = excluded.full_name,
  bio = excluded.bio,
  timezone = excluded.timezone,
  main_platform_id = excluded.main_platform_id,
  reliability_score = excluded.reliability_score;

insert into public.profile_languages (profile_id, language_code) values
  ('30000000-0000-0000-0000-000000000001', 'es'),
  ('30000000-0000-0000-0000-000000000001', 'en'),
  ('30000000-0000-0000-0000-000000000002', 'es'),
  ('30000000-0000-0000-0000-000000000002', 'en'),
  ('30000000-0000-0000-0000-000000000003', 'es'),
  ('30000000-0000-0000-0000-000000000004', 'es'),
  ('30000000-0000-0000-0000-000000000004', 'ca'),
  ('30000000-0000-0000-0000-000000000005', 'es'),
  ('30000000-0000-0000-0000-000000000005', 'en'),
  ('30000000-0000-0000-0000-000000000006', 'es'),
  ('30000000-0000-0000-0000-000000000006', 'en')
on conflict do nothing;

insert into public.profile_games (profile_id, game_id, is_favorite, gameplay_roles) values
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', true, '{"controller","initiator"}'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', true, '{"initiator","duelist"}'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004', true, '{"support","anti-tank"}'),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', true, '{"cm","any"}'),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', true, '{"raids","support"}'),
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', true, '{"sentinel"}')
on conflict do nothing;

insert into public.user_availability (profile_id, week_day, starts_at, ends_at) values
  ('30000000-0000-0000-0000-000000000002', 2, '21:00', '23:30'),
  ('30000000-0000-0000-0000-000000000002', 3, '21:00', '23:30'),
  ('30000000-0000-0000-0000-000000000002', 7, '19:30', '23:00'),
  ('30000000-0000-0000-0000-000000000003', 2, '21:00', '23:00'),
  ('30000000-0000-0000-0000-000000000003', 4, '21:00', '23:00'),
  ('30000000-0000-0000-0000-000000000003', 7, '20:00', '23:30'),
  ('30000000-0000-0000-0000-000000000004', 1, '22:00', '23:30'),
  ('30000000-0000-0000-0000-000000000004', 3, '22:00', '23:30'),
  ('30000000-0000-0000-0000-000000000004', 5, '22:00', '23:59'),
  ('30000000-0000-0000-0000-000000000005', 5, '22:00', '23:59'),
  ('30000000-0000-0000-0000-000000000005', 6, '18:00', '23:59')
on conflict do nothing;

insert into public.clans (id, name, slug, tagline, description, game_id, leader_profile_id, visibility, playstyle, schedule_summary, member_capacity) values
  ('40000000-0000-0000-0000-000000000001', 'Nightwatch Protocol', 'nightwatch-protocol', 'Valorant organizado, sin drama y con objetivos claros.', 'Clan centrado en ranked y scrims de Valorant. Buscamos consistencia semanal, revisión de partidas y buen tono competitivo.', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'public', 'competitive', 'Martes, miércoles y domingo de 21:00 a 23:30', 20),
  ('40000000-0000-0000-0000-000000000002', 'Tiki Taka Club', 'tiki-taka-club', 'Club de Pro Clubs serio, coordinado y estable.', 'Plantilla semicompetitiva de EA Sports FC Clubs con entrenamientos ligeros y calendario de partidos.', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000004', 'public', 'ranked', 'Lunes, miércoles y viernes de 22:00 a 00:00', 24),
  ('40000000-0000-0000-0000-000000000003', 'Orbit Vanguard', 'orbit-vanguard', 'Raids sin prisas, preparación y buen ambiente.', 'Clan PvE de Destiny 2 orientado a raids, dungeons y progresión compartida con espacios para novatos.', '20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000005', 'public', 'mixed', 'Viernes y sábado por la noche', 30)
on conflict (id) do nothing;

insert into public.clan_platforms (clan_id, platform_id) values
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001')
on conflict do nothing;

insert into public.clan_languages (clan_id, language_code) values
  ('40000000-0000-0000-0000-000000000001', 'es'),
  ('40000000-0000-0000-0000-000000000001', 'en'),
  ('40000000-0000-0000-0000-000000000002', 'es'),
  ('40000000-0000-0000-0000-000000000002', 'ca'),
  ('40000000-0000-0000-0000-000000000003', 'es'),
  ('40000000-0000-0000-0000-000000000003', 'en')
on conflict do nothing;

insert into public.clan_roles (clan_id, code, label) values
  ('40000000-0000-0000-0000-000000000001', 'sentinel', 'Sentinel'),
  ('40000000-0000-0000-0000-000000000001', 'controller', 'Controller'),
  ('40000000-0000-0000-0000-000000000002', 'cb', 'Defensa central'),
  ('40000000-0000-0000-0000-000000000002', 'gk', 'Portero'),
  ('40000000-0000-0000-0000-000000000003', 'support', 'Support'),
  ('40000000-0000-0000-0000-000000000003', 'raids', 'Raids')
on conflict do nothing;

insert into public.clan_members (clan_id, profile_id, role_code) values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'leader'),
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', 'member'),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000004', 'leader'),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000005', 'leader')
on conflict do nothing;

insert into public.clan_join_requests (clan_id, profile_id, message, status) values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000006', 'Juego sentinel y puedo cubrir dos noches por semana.', 'pending'),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', 'Puedo apoyar como DC o MC defensivo según necesidad.', 'pending')
on conflict do nothing;

insert into public.events (id, clan_id, game_id, title, description, starts_at, capacity, visibility, created_by_profile_id) values
  ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Scrim interna + VOD review', 'Sesión doble con partidas internas y repaso corto de rotaciones.', '2026-04-21T19:00:00Z', 10, 'members_only', '30000000-0000-0000-0000-000000000002'),
  ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Jornada de Clubs - Liga nocturna', 'Bloque de 4 partidos con convocatorias cerradas una hora antes.', '2026-04-19T20:30:00Z', 11, 'public', '30000000-0000-0000-0000-000000000004'),
  ('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'Raid teaching run', 'Run guiada para miembros nuevos con explicación de mecánicas.', '2026-04-25T19:30:00Z', 6, 'public', '30000000-0000-0000-0000-000000000005')
on conflict (id) do nothing;

insert into public.event_attendees (event_id, profile_id, status) values
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'going'),
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', 'going'),
  ('50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000004', 'going'),
  ('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000005', 'going')
on conflict do nothing;

insert into public.lfg_posts (id, profile_id, game_id, title, description, desired_roles, expires_at, status) values
  ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004', 'Squad nocturna para Helldive difficulty', 'Busco 2-3 jugadores tranquilos para runs coordinadas en PC.', '{"anti-tank","support"}', '2026-04-18T23:00:00Z', 'active'),
  ('60000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', 'Raid learning group domingo', 'Grupo para raid con paciencia y voz. Ideal para volver al juego.', '{"raids","support"}', '2026-04-20T20:00:00Z', 'active')
on conflict (id) do nothing;

insert into public.lfg_platforms (lfg_post_id, platform_id) values
  ('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002'),
  ('60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003')
on conflict do nothing;

insert into public.lfg_languages (lfg_post_id, language_code) values
  ('60000000-0000-0000-0000-000000000001', 'es'),
  ('60000000-0000-0000-0000-000000000002', 'es'),
  ('60000000-0000-0000-0000-000000000002', 'en')
on conflict do nothing;

insert into public.reviews (author_profile_id, target_profile_id, kind, score, comment) values
  ('30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', 'player', 5, 'Muy puntual y se adapta bien a cambios de composición.'),
  ('30000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000002', 'player', 4, 'Comunicación clara y buena gestión de grupo.')
on conflict do nothing;

insert into public.reports (reporter_profile_id, target_type, target_id, reason, details, status) values
  ('30000000-0000-0000-0000-000000000001', 'lfg_post', '60000000-0000-0000-0000-000000000001', 'Lenguaje inapropiado', 'El anuncio original fue editado y quedó resuelto, pendiente de cerrar incidencia.', 'reviewing'),
  ('30000000-0000-0000-0000-000000000004', 'profile', '30000000-0000-0000-0000-000000000006', 'Spam de solicitudes', 'Se detectaron varias solicitudes idénticas en menos de una hora.', 'open')
on conflict do nothing;

insert into public.notifications (profile_id, title, body, is_read) values
  ('30000000-0000-0000-0000-000000000002', 'Nueva solicitud', 'AsterLink ha solicitado entrar en Nightwatch Protocol.', false),
  ('30000000-0000-0000-0000-000000000003', 'Evento confirmado', 'Tu plaza para la scrim interna ha sido registrada.', true)
on conflict do nothing;
