import 'dotenv/config';
import {resolveProvider} from '../src/studio/provider';

for (const kind of ['image','video','voice','music'] as const) {
  console.log(kind, '=>', resolveProvider(kind));
}
