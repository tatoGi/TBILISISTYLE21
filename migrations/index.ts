import * as migration_20260603_073137_init from './20260603_073137_init';
import * as migration_20260603_074116_add_payment_fields from './20260603_074116_add_payment_fields';
import * as migration_20260604_120000_seed_tshirts from './20260604_120000_seed_tshirts';
import * as migration_20260604_190000_add_pages_route_path from './20260604_190000_add_pages_route_path';
import * as migration_20260608_071250_add_partners from './20260608_071250_add_partners';
import * as migration_20260608_072911_add_partner_description from './20260608_072911_add_partner_description';
import * as migration_20260608_075536_add_post_featured from './20260608_075536_add_post_featured';
import * as migration_20260608_160000_posts_locale_columns from './20260608_160000_posts_locale_columns';
import * as migration_20260608_170000_pages_media_menu_locale_columns from './20260608_170000_pages_media_menu_locale_columns';
import * as migration_20260608_180000_block_locale_columns from './20260608_180000_block_locale_columns';
import * as migration_20260608_190000_site_festival_hero_columns from './20260608_190000_site_festival_hero_columns';

export const migrations = [
  {
    up: migration_20260603_073137_init.up,
    down: migration_20260603_073137_init.down,
    name: '20260603_073137_init',
  },
  {
    up: migration_20260603_074116_add_payment_fields.up,
    down: migration_20260603_074116_add_payment_fields.down,
    name: '20260603_074116_add_payment_fields',
  },
  {
    up: migration_20260604_120000_seed_tshirts.up,
    down: migration_20260604_120000_seed_tshirts.down,
    name: '20260604_120000_seed_tshirts',
  },
  {
    up: migration_20260604_190000_add_pages_route_path.up,
    down: migration_20260604_190000_add_pages_route_path.down,
    name: '20260604_190000_add_pages_route_path',
  },
  {
    up: migration_20260608_071250_add_partners.up,
    down: migration_20260608_071250_add_partners.down,
    name: '20260608_071250_add_partners',
  },
  {
    up: migration_20260608_072911_add_partner_description.up,
    down: migration_20260608_072911_add_partner_description.down,
    name: '20260608_072911_add_partner_description',
  },
  {
    up: migration_20260608_075536_add_post_featured.up,
    down: migration_20260608_075536_add_post_featured.down,
    name: '20260608_075536_add_post_featured'
  },
  {
    up: migration_20260608_160000_posts_locale_columns.up,
    down: migration_20260608_160000_posts_locale_columns.down,
    name: '20260608_160000_posts_locale_columns'
  },
  {
    up: migration_20260608_170000_pages_media_menu_locale_columns.up,
    down: migration_20260608_170000_pages_media_menu_locale_columns.down,
    name: '20260608_170000_pages_media_menu_locale_columns'
  },
  {
    up: migration_20260608_180000_block_locale_columns.up,
    down: migration_20260608_180000_block_locale_columns.down,
    name: '20260608_180000_block_locale_columns'
  },
  {
    up: migration_20260608_190000_site_festival_hero_columns.up,
    down: migration_20260608_190000_site_festival_hero_columns.down,
    name: '20260608_190000_site_festival_hero_columns'
  },
];
