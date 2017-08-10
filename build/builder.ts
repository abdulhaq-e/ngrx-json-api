import * as tasks from './tasks';
import { createBuilder } from './util';

export default createBuilder([
  ['Removing "./dist" Folder', tasks.removeDistFolder],
  ['Compiling package with NGC', tasks.compilePackageWithNgc],
  ['Bundling FESMs', tasks.bundleFesms],
  ['Down-leveling FESMs to ES5', tasks.downLevelFesmsToES5],
  ['Creating UMD Bundles', tasks.createUmdBundles],
  ['Cleaning TypeScript files', tasks.cleanTypeScriptFiles],
  ['Removing remaining sourcemap files', tasks.removeRemainingSourceMapFiles],
  ['Minifying UMD bundles', tasks.minifyUmdBundles],
  ['Copying documents', tasks.copyDocs],
  ['Copying package.json files', tasks.copyPackageJsonFiles],
]);
