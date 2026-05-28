#!/usr/bin/env node

import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import create from "./create.js";

const args = yargs(hideBin(process.argv));

args
  .command(
    "create",
    "Crea una entidad con estructura completa (modelos, rutas API, servicios, páginas admin)",
    {
      name: {
        description: `Nombre de la entidad en PLURAL usando kebab-case (ej: bands, my-entity, test-users)
                 Se genera automáticamente:
                 - Plural: my-entity (kebab-case para archivos)
                 - Singular: my-entit (kebab-case para tipos)
                 - Entity: MyEntity (PascalCase para clases)
                 - Type: MyEntit (PascalCase singular para tipos TS)`,
        alias: "n",
        type: "string",
        demandOption: true,
      },
      path: {
        description:
          "Path anidado para las páginas admin (ej: finances, config/users). Ej: app/(pages)/admin/PATH/ENTITY/",
        alias: "a",
        type: "string",
      },
      menu: {
        description: "Añade la entrada en el menú admin (permite seleccionar ubicación con -p)",
        alias: "m",
        type: "boolean",
      },
      parent: {
        description:
          "Menú padre donde insertar la ruta (solo con -m). Ej: config, instagram. Si se omite, pregunta interactivamente",
        alias: "p",
        type: "string",
      },
    },
    (argv) => {
      create(argv);
    }
  )
  .example([
    ["npx swq create -n bands", "Crear entidad 'bands' sin agregar al menú"],
    [
      "npx swq create -n test-users -m",
      "Crear 'test-users' con clase 'TestUsers' y agregar al menú",
    ],
    [
      "npx swq create -n tags -m -p config",
      "Crear entidad 'tags' y agregarla bajo el menú 'config'",
    ],
    [
      "npx swq create -n social-networks -a finances -m -p finances",
      "Crear 'social-networks' en app/(pages)/admin/finances/social-networks/",
    ],
  ])
  .version(false)
  .help("help", "Mostrar ayuda")
  .alias("help", "h").argv;

if (process.argv.length <= 2) {
  args.showHelp("log");
}
