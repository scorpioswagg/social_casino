-- Promote playable games to live status.
-- Virtual coins only. No real-money wagering.

update games set status = 'live'
where slug in (
  'midnight-reels',
  'crown-jacks',
  'ember-slots',
  'velvet-wheel',
  'house-21'
);

-- Register two additional slot themes that the engine supports
insert into games (id, slug, name, description, category, status, is_hot, is_new, is_featured, min_bet, max_bet, sort_order)
values
  ('g_cosmic_fortune', 'cosmic-fortune', 'Cosmic Fortune', 'Stars align under the house lights.', 'slots', 'live', false, true, false, 15, 7500, 11),
  ('g_pharaohs_gold', 'pharaohs-gold', 'Pharaoh''s Gold', 'Ancient reels, modern fortune.', 'slots', 'live', true, true, false, 10, 5000, 12)
on conflict (id) do update set status = 'live', is_new = true;
