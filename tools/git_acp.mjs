import {run} from './run.mjs'

await run('git add *');
await run('git commit -m "' + new Date() + "\"");
await run('git push');