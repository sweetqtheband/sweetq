import 'dotenv/config';
import { createLogger } from './shared/logger.js';

const { logProcess } = createLogger('cron.log');
logProcess('CRON STARTED');
