#!/usr/bin/env ts-node

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import create from './create.js';

const args = yargs(hideBin(process.argv));

args
  .command(
    'create',
    'Crea una entidad',
    {
      name: {
        description: 'El nombre de la persona',
        alias: 'n',
        type: 'string',
      },
      menu: {
        description: 'Añade la ruta para la entidad al menu',
        alias: 'm',
        type: 'boolean',
      },
    },
    (argv) => {
      create(argv);
    }
  )
  .version(false)
  .help('help', 'Mostrar ayuda')
  .alias('help', 'h').argv;
