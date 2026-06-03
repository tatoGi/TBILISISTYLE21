import * as migration_20260603_073137_init from './20260603_073137_init';
import * as migration_20260603_074116_add_payment_fields from './20260603_074116_add_payment_fields';

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
];
