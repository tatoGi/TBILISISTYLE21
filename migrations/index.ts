import * as migration_20260603_073137_init from './20260603_073137_init';
import * as migration_20260603_074116_add_payment_fields from './20260603_074116_add_payment_fields';
import * as migration_20260604_120000_seed_tshirts from './20260604_120000_seed_tshirts';
import * as migration_20260604_190000_add_pages_route_path from './20260604_190000_add_pages_route_path';

export const migrations = [
  {
    up: migration_20260603_073137_init.up,
    down: migration_20260603_073137_init.down,
    name: '20260603_073137_init',
  },
  {
    up: migration_20260603_074116_add_payment_fields.up,
    down: migration_20260603_074116_add_payment_fields.down,
    name: '20260603_074116_add_payment_fields'
  },
  {
    up: migration_20260604_120000_seed_tshirts.up,
    down: migration_20260604_120000_seed_tshirts.down,
    name: '20260604_120000_seed_tshirts'
  },
  {
    up: migration_20260604_190000_add_pages_route_path.up,
    down: migration_20260604_190000_add_pages_route_path.down,
    name: '20260604_190000_add_pages_route_path'
  },
];
