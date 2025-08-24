import fs from 'fs';
export const logger = (...args:any) => {
  const msg = args.map((arg:any) => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
  ).join(' ');

  const line = `[${new Date().toISOString()}] ${msg}`;

  fs.appendFileSync('/var/log/sweeetq.log', line + '\n');
};
