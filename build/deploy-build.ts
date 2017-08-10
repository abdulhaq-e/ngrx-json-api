import * as tasks from './tasks';
import { createBuilder } from './util';
import { packages } from './config';

const deploy = createBuilder([['Deploy builds', tasks.publishToRepo]]);

deploy().catch(err => {
  console.error(err);
  process.exit(1);
});
