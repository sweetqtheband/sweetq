import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { PATHS } from './constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(__dirname, '..');

const getEntity = (name) => {
  const plural = name.toLowerCase();
  const singular = plural.slice(0, -1);
  const entity = plural.charAt(0).toUpperCase() + plural.slice(1);
  const type = singular.charAt(0).toUpperCase() + singular.slice(1);

  return {
    plural,
    singular,
    entity,
    type,
  };
};

const createMenu = (entity) => {
  console.log('Creando entrada en el menu');
  const route = entity.plural;

  const menu = fs.readFileSync(
    path.resolve(root, PATHS.ADMIN, 'routes.ts'),
    'utf8'
  );

  const paths = menu.match(/\{[^}]*\}/g);

  const pathExists = paths.find((path) => {
    const pathMatch = path.match(/path: '([^']*)'/);
    return pathMatch && pathMatch.at(1) === `/admin/${route}`;
  });

  if (!pathExists) {
    const lastPath = paths.at(-1);
    const lastPathIndex = menu.indexOf(lastPath);

    const newMenu =
      menu.slice(0, lastPathIndex) +
      `{
    text: '${route}',
    path: '/admin/${route}'
  },
  ` +
      menu.slice(lastPathIndex);
    fs.writeFileSync(path.resolve(root, PATHS.ADMIN, 'routes.ts'), newMenu);
  }
};

const createFactory = (entity) => {
  console.log('Creando entrada en el archivo factory');

  const factory = fs.readFileSync(
    path.resolve(root, PATHS.API_SERVICES, 'factory.ts'),
    'utf8'
  );

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
      `import { ${entity.plural}Svc } from './${entity.plural}';
` +
      factory.slice(lastImportIndex);

    newFactory = newFactory.replace(
      /(let factory: FactoryType = \{[^}]*)/g,
      `$1  ${entity.plural}: ${entity.plural}Svc,
`
    );

    fs.writeFileSync(
      path.resolve(root, PATHS.API_SERVICES, 'factory.ts'),
      newFactory
    );
  }
};

const createFile = ({ entity, tpl, folder, fileName }) => {
  const file = path.join(folder, fileName);

  const tplContent = fs.readFileSync(tpl, 'utf8');

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

const createFiles = (entity, folder) => {
  fs.readdirSync(folder).map((fileName) => {
    const file = path.join(folder, fileName);
    if (fs.lstatSync(file).isDirectory()) {
      createFiles(entity, file);
    } else {
      const folderPathname = folder.split('/').at(-1).toUpperCase();
      let fileFolder = PATHS[folderPathname] || PATHS.API;

      if (folderPathname === 'API' && folder.split('/').at(-2) === 'services') {
        fileFolder = PATHS.API_SERVICES;
      }

      if (folderPathname) {
        createFile({
          entity,
          tpl: file,
          folder: path.resolve(
            root,
            fileFolder,
            folderPathname === '[ID]'
              ? entity.plural + '/' + folder.split('/').at(-1)
              : '',
            [PATHS.ADMIN, PATHS.API].includes(fileFolder) ? entity.plural : ''
          ),
          fileName: fileName
            .replace('.txt', '')
            .replace('placeholder', entity.plural)
            .replace('type', entity.singular),
        });
      }
    }
  });
};

const create = async (argv) => {
  if (argv.name) {
    const entity = getEntity(argv.name);

    createFactory(entity);
    createFiles(entity, PATHS.TPLS);
    if (argv.menu) {
      createMenu(entity);
    }
  }
};
export default create;
