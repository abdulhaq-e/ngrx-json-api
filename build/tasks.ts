import { Config } from './config';
import * as util from './util';

/**
 * Cleans the top level dist folder. All npm-ready packages are created
 * in the dist folder.
 */
export function removeDistFolder() {
  return util.exec('rimraf', ['./dist']);
}

/**
 * Uses the 'tsconfig-build.json' file in each package directory to produce
 * AOT and Closure compatible JavaScript
 */
export async function compilePackageWithNgc() {
  await util.exec('ngc', [`-p ./tsconfig-build.json`]);

  /**
   * Test modules are treated differently because nested inside top-level.
   * This step removes the top-level package from testing modules from the
   * export statement.
   * Also changes the module name from 'index' to 'testing'
   * i.e. export * from './effects/testing/index' becomes './testing/testing';
   *
   * See https://github.com/ngrx/platform/issues/94
   */
  // let [exportPath, moduleName] = /\/testing$/.test(pkg)
  //   ? [pkg.replace(/(.*\/)testing/i, 'testing'), 'testing']
  //   : [pkg, 'index'];
  //
  // const entryTypeDefinition = `export * from './ngrx-json-api/index';`;
  // const entryMetadata = `{"__symbolic":"module","version":3,"metadata":{},"exports":[{"from":"./${pkg}/index"}]}`;
  //
  // await Promise.all([
  //   util.writeFile(`./dist/index.d.ts`, entryTypeDefinition),
  //   util.writeFile(`./dist/${pkg}.metadata.json`, entryMetadata),
  // ]);
}

/**
 * Uses Rollup to bundle the JavaScript into a single flat file called
 * a FESM (Flat Ecma Script Module)
 */
export async function bundleFesms() {
  await util.exec('rollup', ['-c ./rollup.config.es.js']);

  await util.mapSources(`./dist/FESM/ngrx-json-api.js`);
}

/**
 * Copies each FESM into a TS file then uses TypeScript to downlevel
 * the FESM into ES5 with ESM modules
 */
export async function downLevelFesmsToES5() {
  const tscArgs = ['--target es5', '--module es2015', '--noLib', '--sourceMap'];

  const file = `./dist/FESM/ngrx-json-api.js`;
  const target = `./dist/FESM/ngrx-json-api.es5.ts`;

  await util.copy(file, target);
  await util.ignoreErrors(util.exec('tsc', [target, ...tscArgs]));
  await util.mapSources(target.replace('.ts', '.js'));
  await util.remove(target);

  await util.removeRecursively(`./dist/**/*/FESM/*.ts`);
}

/**
 * Re-runs Rollup on the downleveled ES5 to produce a UMD bundle
 */
export async function createUmdBundles() {
  const rollupArgs = [`-c ./rollup.config.umd.js`];

  await util.exec('rollup', rollupArgs);
  await util.mapSources(`./dist/bundles/ngrx-json-api.umd.js`);
}

/**
 * Removes any leftover TypeScript files from previous compilation steps,
 * leaving any type definition files in place
 */
export async function cleanTypeScriptFiles() {
  const tsFilesGlob = './dist/**/*.ts';
  const dtsFilesFlob = './dist/**/*.d.ts';
  const filesToRemove = await util.getListOfFiles(tsFilesGlob, dtsFilesFlob);

  await mapAsync(filesToRemove, util.remove);
}

/**
 * Removes any remaining source map files from running NGC
 */
export async function removeRemainingSourceMapFiles() {
  await util.removeRecursively(`./dist/src/**/*.map`);
  await util.removeRecursively(`./dist/*.map`);
}

/**
 * Creates minified copies of each UMD bundle
 */
export async function minifyUmdBundles() {
  const uglifyArgs = ['-c', '-m', '--screw-ie8', '--comments'];

  const file = `./dist/bundles/ngrx-json-api.umd.js`;
  const out = `./dist/bundles/ngrx-json-api.umd.min.js`;

  return util.exec('uglifyjs', [
    ...uglifyArgs,
    `-o ${out}`,
    `--source-map ${out}.map`,
    `--source-map-include-sources ${file}`,
    `--in-source-map ${file}.map`,
  ]);
}

/**
 * Copies the README.md, LICENSE, and package.json files into
 * each package
 */
export async function copyDocs() {
  const source = `.`;
  const target = `./dist/`;

  await Promise.all([
    util.copy(`${source}/README.md`, `${target}/README.md`),
    util.copy('./LICENSE', `${target}/LICENSE`),
  ]);
}

export async function copyPackageJsonFiles() {
  const source = `.`;
  const target = `./dist`;

  await util.copy(`${source}/package.json`, `${target}/package.json`);
}

/**
 * Deploy build artifacts to repos
 */
export async function publishToRepo() {
  const SOURCE_DIR = `./dist`;
  const REPO_URL = `git@github.com:abdulhaq-e/ngrx-json-api-builds.git`;
  const REPO_DIR = `./tmp`;
  const SHA = await util.git([`rev-parse HEAD`]);
  const SHORT_SHA = await util.git([`rev-parse --short HEAD`]);
  const COMMITTER_USER_NAME = await util.git([
    `--no-pager show -s --format='%cN' HEAD`,
  ]);
  const COMMITTER_USER_EMAIL = await util.git([
    `--no-pager show -s --format='%cE' HEAD`,
  ]);

  await util.cmd('rm -rf', [`${REPO_DIR}`]);
  await util.cmd('mkdir ', [`-p ${REPO_DIR}`]);
  await process.chdir(`${REPO_DIR}`);
  await util.git([`init`]);
  await util.git([`remote add origin ${REPO_URL}`]);
  await util.git(['fetch origin master --depth=1']);
  await util.git(['checkout origin/master']);
  await util.git(['checkout -b master']);
  await process.chdir('../');
  await util.cmd('rm -rf', [`${REPO_DIR}/*`]);
  await util.git([`log --format="%h %s" -n 1 > ${REPO_DIR}/commit_message`]);
  await util.cmd('cp', [`-R ${SOURCE_DIR}/* ${REPO_DIR}/`]);
  await process.chdir(`${REPO_DIR}`);
  await util.git([`config user.name "${COMMITTER_USER_NAME}"`]);
  await util.git([`config user.email "${COMMITTER_USER_EMAIL}"`]);
  await util.git(['add --all']);
  await util.git([`commit -F commit_message`]);
  await util.cmd('rm', ['commit_message']);
  await util.git(['push origin master --force']);
  await process.chdir('../');
}

export function mapAsync<T>(
  list: T[],
  mapFn: (v: T, i: number) => Promise<any>
) {
  return Promise.all(list.map(mapFn));
}
