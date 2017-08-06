import build from './builder';
import { packages } from './config';

build().catch(err => {
  console.error(err);
  process.exit(1);
});
