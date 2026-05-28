import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { PATHS } from "./constants.js";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(__dirname, "..");

// Convertir kebab-case a PascalCase
const kebabToPascal = (str) => {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
};

// Convertir kebab-case a camelCase
const kebabToCamel = (str) => {
  return str
    .split("-")
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join("");
};

const getEntity = (name) => {
  // Aceptar kebab-case: "test-users", "my-entity"
  const plural = name.toLowerCase().trim();

  // Derivar singular removiendo la 's' del último segment
  const parts = plural.split("-");
  const lastPart = parts[parts.length - 1];
  const singularLastPart = lastPart.endsWith("s") ? lastPart.slice(0, -1) : lastPart;
  const singularParts = parts.slice(0, -1).concat(singularLastPart);
  const singular = singularParts.join("-");

  // Convertir a otros formatos
  const entity = kebabToPascal(plural);
  const type = kebabToPascal(singular);
  const camelCasePlural = kebabToCamel(plural);
  const camelCaseSingular = kebabToCamel(singular);

  return {
    plural, // kebab-case para carpetas
    singular, // kebab-case para tipos
    entity, // PascalCase para clases
    type, // PascalCase para tipos TS
    camelCasePlural, // camelCase para nombres de archivo plural
    camelCaseSingular, // camelCase para nombres de archivo singular
  };
};

// Crear entidad a partir de valores específicos
const createCustomEntity = (plural, singular, entity, type) => {
  const pluralKebab = plural.toLowerCase().trim();
  const singularKebab = singular.toLowerCase().trim();

  // Si el usuario edita manualmente y usa mayúsculas, respetarlas
  // Si no tiene mayúsculas, procesar con kebabToPascal
  const entityPascal = /[A-Z]/.test(entity) ? entity.trim() : kebabToPascal(entity);
  const typePascal = /[A-Z]/.test(type) ? type.trim() : kebabToPascal(type);

  return {
    plural: pluralKebab,
    singular: singularKebab,
    entity: entityPascal,
    type: typePascal,
    camelCasePlural: kebabToCamel(pluralKebab),
    camelCaseSingular: kebabToCamel(singularKebab),
  };
};

// Mostrar resumen de nomenclatura
const displayEntitySummary = (entity) => {
  console.log("\n📋 Nomenclatura que se va a generar:");
  console.log("━".repeat(60));
  console.log(`  Carpetas:  ${entity.plural.padEnd(40)} (kebab-case)`);
  console.log(
    `  Archivos:  ${entity.camelCasePlural}.ts${" ".repeat(entity.plural.length - entity.camelCasePlural.length)} (camelCase)`
  );
  console.log(`  Clase:     ${entity.entity.padEnd(40)} (PascalCase)`);
  console.log(`  Tipo TS:   ${entity.type.padEnd(40)} (PascalCase singular)`);
  console.log("━".repeat(60));
};

// Pedir confirmación o edición
const confirmEntity = async (entity) => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const askConfirmation = () => {
      rl.question("\n¿Continuar con estos valores? (s/n/e para editar): ", (answer) => {
        if (answer.toLowerCase() === "s" || answer.toLowerCase() === "") {
          rl.close();
          resolve({ confirmed: true, entity });
        } else if (answer.toLowerCase() === "e") {
          rl.close();
          resolve({ confirmed: false, edit: true });
        } else if (answer.toLowerCase() === "n") {
          rl.close();
          resolve({ confirmed: false, edit: false });
        } else {
          console.log("Opción no válida. Por favor, ingresa 's', 'n' o 'e'.");
          askConfirmation();
        }
      });
    };
    askConfirmation();
  });
};

// Editar valores de la entidad
const editEntity = async (entity) => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log("\n✏️  Editar valores (deja en blanco para mantener el valor actual):\n");

    rl.question(`Plural [${entity.plural}]: `, (plural) => {
      rl.question(`Singular [${entity.singular}]: `, (singular) => {
        rl.question(`Entity [${entity.entity}]: `, (entityName) => {
          rl.question(`Type [${entity.type}]: `, (type) => {
            rl.close();

            const newPlural = plural.trim() || entity.plural;
            const newSingular = singular.trim() || entity.singular;
            const newEntity = entityName.trim() || entity.entity;
            const newType = type.trim() || entity.type;

            const updatedEntity = createCustomEntity(newPlural, newSingular, newEntity, newType);

            resolve(updatedEntity);
          });
        });
      });
    });
  });
};

// Parsear los menús disponibles del archivo routes.ts
const parseAvailableMenus = (routesContent) => {
  const menus = [];

  // Expresión para encontrar objetos con 'children'
  const menuRegex = /\{\s*text:\s*['"]([^'"]+)['"]\s*,\s*children:/g;
  let match;

  while ((match = menuRegex.exec(routesContent)) !== null) {
    menus.push(match[1]);
  }

  return menus;
};

// Hacer una pregunta interactiva al usuario
const promptUser = (question) => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

// Insertar la ruta en el menú padre especificado
const insertIntoParentMenu = (menu, parentText, entity) => {
  // Crear un pattern para encontrar el menú padre y su bloque de children
  const pattern = new RegExp(
    `(\\{\\s*text:\\s*['"]${parentText}['"]\\s*,\\s*children:\\s*\\[[^\\]]+)\\]`,
    "s"
  );

  const match = menu.match(pattern);

  if (!match) {
    console.error(`No se encontró el menú padre: ${parentText}`);
    return null;
  }

  // Verificar si la ruta ya existe
  if (menu.includes(`path: '/admin/${entity.plural}'`)) {
    return null; // Ya existe
  }

  // Insertar la nueva entrada antes del cierre del children
  const updatedMenu = menu.replace(
    pattern,
    `$1,
      {
        text: '${entity.plural}',
        path: '/admin/${entity.plural}'
      }
    ]`
  );

  return updatedMenu;
};

// Insertar la ruta en el nivel raíz
const insertAtRootLevel = (menu, entity) => {
  const route = entity.plural;

  const paths = menu.match(/\{[^}]*\}/g);
  const pathExists = paths.find((path) => {
    const pathMatch = path.match(/path:\s*['"]([^'"]*)['"]/);
    return pathMatch && pathMatch.at(1) === `/admin/${route}`;
  });

  if (pathExists) {
    return null; // Ya existe
  }

  const lastPath = paths.at(-1);
  const lastPathIndex = menu.indexOf(lastPath);

  return (
    menu.slice(0, lastPathIndex) +
    `{
    text: '${route}',
    path: '/admin/${route}'
  },
  ` +
    menu.slice(lastPathIndex)
  );
};

const createMenu = async (entity, parentMenu) => {
  const routesPath = path.resolve(root, PATHS.ADMIN, "routes.ts");
  const menu = fs.readFileSync(routesPath, "utf8");

  // Obtener menús disponibles
  const availableMenus = parseAvailableMenus(menu);

  let updatedMenu = null;

  if (parentMenu) {
    // Si se especifica un menú padre, insertarlo ahí
    if (!availableMenus.includes(parentMenu)) {
      console.error(
        `✗ Menú padre '${parentMenu}' no encontrado.\n  Menús disponibles: ${availableMenus.join(", ")}`
      );
      return;
    }
    updatedMenu = insertIntoParentMenu(menu, parentMenu, entity);
  } else {
    // Si no se especifica, preguntar interactivamente
    console.log("\n¿Dónde deseas insertar la entrada en el menú admin?");
    console.log("Opciones:");
    console.log(`  0. Nivel raíz (sin agrupar)`);
    availableMenus.forEach((m, i) => {
      console.log(`  ${i + 1}. Dentro del grupo '${m}'`);
    });

    const choice = await promptUser("\nSelecciona una opción (0): ");
    const selectedIndex = parseInt(choice || "0", 10);

    if (selectedIndex === 0) {
      updatedMenu = insertAtRootLevel(menu, entity);
    } else if (selectedIndex > 0 && selectedIndex <= availableMenus.length) {
      const selectedMenu = availableMenus[selectedIndex - 1];
      updatedMenu = insertIntoParentMenu(menu, selectedMenu, entity);
    } else {
      console.error("✗ Opción inválida");
      return;
    }
  }

  if (updatedMenu && updatedMenu !== menu) {
    fs.writeFileSync(routesPath, updatedMenu);
    const location = parentMenu ? `dentro del grupo '${parentMenu}'` : "en el menú";
    console.log(`✓ Entrada '${entity.plural}' agregada ${location}`);
  } else {
    console.log(`✓ La entrada '${entity.plural}' ya existe en el menú`);
  }
};

const createFactory = (entity) => {
  const factory = fs.readFileSync(path.resolve(root, PATHS.API_SERVICES, "factory.ts"), "utf8");

  const imports = factory.match(/import [^;]*;/g);

  const importExists = imports.find((imp) => {
    const importMatch = imp.match(/from '\.\/([^;]*)';/);
    return importMatch && importMatch.at(1) === entity.plural;
  });

  if (!importExists) {
    const lastImport = imports.at(-1);
    const lastImportIndex = factory.indexOf(lastImport);

    let newFactory =
      factory.slice(0, lastImportIndex) +
      `import { ${entity.entity}Svc } from './${entity.plural}';
` +
      factory.slice(lastImportIndex);

    newFactory = newFactory.replace(
      /(let factory: FactoryType = \{[^}]*)/g,
      `$1  ${entity.plural}: ${entity.entity}Svc,
`
    );

    fs.writeFileSync(path.resolve(root, PATHS.API_SERVICES, "factory.ts"), newFactory);
  }
};

const createFile = ({ entity, tpl, folder, fileName }) => {
  const file = path.join(folder, fileName);

  const tplContent = fs.readFileSync(tpl, "utf8");

  const fileContent = Object.keys(entity).reduce(
    (content, key) => content.replaceAll(`{{${key}}}`, entity[key]),
    tplContent
  );

  if (!fs.existsSync(file)) {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    fs.writeFileSync(file, fileContent);
  }
};

const createFiles = (entity, folder, adminPath = "") => {
  fs.readdirSync(folder).map((fileName) => {
    const file = path.join(folder, fileName);
    if (fs.lstatSync(file).isDirectory()) {
      createFiles(entity, file, adminPath);
    } else {
      const folderPathname = folder.split("/").at(-1).toUpperCase();
      let fileFolder = PATHS[folderPathname] || PATHS.API;

      if (folderPathname === "API" && folder.split("/").at(-2) === "services") {
        fileFolder = PATHS.API_SERVICES;
      }

      if (folderPathname) {
        // Para carpetas especiales como [ID], agregar ruta sin entity.plural adicional
        const isSpecialFolder = folderPathname.startsWith("[") && folderPathname.endsWith("]");

        // Determinar el path adicional
        let additionalPath = "";
        if (isSpecialFolder) {
          additionalPath = entity.plural + "/" + folder.split("/").at(-1);
        } else if (fileFolder === PATHS.ADMIN) {
          // Si hay un adminPath personalizado, usarlo; si no, usar entity.plural
          additionalPath = adminPath ? adminPath + "/" + entity.plural : entity.plural;
        } else if (fileFolder === PATHS.API) {
          additionalPath = entity.plural;
        }

        createFile({
          entity,
          tpl: file,
          folder: path.resolve(root, fileFolder, additionalPath),
          fileName: fileName
            .replace(".txt", "")
            .replace("placeholder", entity.camelCasePlural)
            .replace("type", entity.camelCaseSingular),
        });
      }
    }
  });
};

const create = async (argv) => {
  if (argv.name) {
    let entity = getEntity(argv.name);
    let confirmed = false;

    // Bucle interactivo para confirmar/editar la nomenclatura
    while (!confirmed) {
      displayEntitySummary(entity);

      const result = await confirmEntity(entity);

      if (result.confirmed) {
        confirmed = true;
      } else if (result.edit) {
        entity = await editEntity(entity);
        console.log("\n✏️  Valores actualizados");
      } else {
        console.log("\n❌ Operación cancelada por el usuario.");
        process.exit(0);
      }
    }

    console.log("\n📦 Creando estructura para la entidad...\n");

    console.log("Generando archivos...");
    createFactory(entity);
    console.log("✓ Factory actualizado");

    const adminPath = argv.path || "";
    createFiles(entity, PATHS.TPLS, adminPath);
    console.log("✓ Archivos creados:");
    console.log(`  • app/models/${entity.camelCasePlural}.ts`);
    console.log(`  • app/services/${entity.camelCasePlural}.ts`);
    console.log(`  • app/services/api/${entity.camelCasePlural}.ts`);
    console.log(`  • app/(pages)/api/${entity.plural}/route.ts`);
    console.log(`  • app/(pages)/api/${entity.plural}/[id]/route.ts`);

    // Mostrar path admin correcto
    const adminDisplayPath = adminPath
      ? `app/(pages)/admin/${adminPath}/${entity.plural}/`
      : `app/(pages)/admin/${entity.plural}/`;
    console.log(`  • ${adminDisplayPath}page.tsx`);
    console.log(`  • ${adminDisplayPath}view.tsx`);
    console.log(`  • types/${entity.camelCaseSingular}.d.ts`);

    if (argv.menu) {
      console.log("\n📋 Configurando menú...");
      await createMenu(entity, argv.parent);
    } else {
      console.log("\n💡 Para agregar una entrada en el menú admin, ejecuta con la opción -m:");
      console.log(`   npx swq create -n ${entity.plural} -m`);
    }

    console.log(
      "\n✨ ¡Entidad creada exitosamente! Recuerda personalizar los campos según tus necesidades.\n"
    );
  }
};
export default create;
