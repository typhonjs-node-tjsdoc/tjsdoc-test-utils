import { assert }          from 'chai';
import cheerio             from 'cheerio';
import fs                  from 'fs-extra';
import path                from 'path';
import process             from 'process';
import stripJsonComments   from 'strip-json-comments';

import TestConfig          from './TestConfig.js';

const consoleLog = console.log;

export default class Util
{
   static assert = assert;

   /**
    * Helper function to invoke TJSDoc via the CLI interface.
    *
    * @param {string}   target - The file path to the CLI class to require.
    *
    * @param {string}   [configPath=null] - The config path to load.
    *
    * @param {boolean}  [silent=true] - If false then console.log output is generated.
    */
   static cli(target, configPath = void 0, { cwdPath = void 0, silent = true } = {})
   {
      if (typeof target.cli !== 'string') { throw new TypeError(`'target.cli' is not a 'string'.`); }

      const argv = ['node', target.cli];

      if (configPath)
      {
         configPath = path.resolve(configPath);

         console.log(`process (${target.name}): ${configPath}`);

         argv.push('-c', configPath);
      }
      else if (cwdPath)
      {
         console.log(`process cwd (${target.name}): ${path.resolve(cwdPath)}`);
      }

      const CLIClass = require(target.cli);

      const cwd = process.cwd();

      if (cwdPath) { process.chdir(cwdPath); }

      const cli = new CLIClass(argv);

      if (silent) { Util.consoleLogSilent(true); }

      cli.exec();

      if (silent) { Util.consoleLogSilent(false); }

      if (cwdPath) { process.chdir(cwd); }
   }

   /**
    * Turns on or off console logging.
    *
    * @param {boolean}  silent - If true then turn console logging off.
    */
   static consoleLogSilent(silent)
   {
      console.log = silent ? () => {} : consoleLog;
   }

   static createTestConfig(config, localConfigPath, moduleName)
   {
      return new TestConfig(config, localConfigPath, moduleName);
   }

   /**
    * Ensures that a directory is available.
    *
    * @param {string}   fileName - Local file path to load relative to `dirName`.
    *
    * @param {string}   dirName] - Directory name to ensure.
    *
    * @returns {*}
    */
   static ensureDir(target, dirName, destDir = 'dest')
   {
      return fs.ensureDirSync(`./test/fixture/${destDir}/${target.type}/${target.name}/${dirName}`);
   }

   /**
    * Finds the element with a given selector and invokes the callback with the first node in the element.
    *
    * @param {HTMLElement} $el - The target HTML element.
    * @param {string}      selector - The selector to find.
    * @param {function}    callback - A callback to invoke with the first result.
    */
   static find($el, selector, callback)
   {
      const $els = $el.find(selector);

      if (!$els.length) { assert(false, `node is not found. selector = "${selector}"`); }

      if ($els.length !== 1) { assert(false, `many nodes are found. selector = "${selector}"`); }

      callback($els.first());
   }

   /**
    * Finds the parent element with a given selector / parent selector and invokes the callback with the parents first
    * node.
    *
    * @param {HTMLElement} $el - The target HTML element.
    * @param {string}      selector - The selector to find.
    * @param {string}      parentSelector - The parent selector to find.
    * @param {function}    callback - A callback to invoke with the first result.
    */
   static findParent($el, selector, parentSelector, callback)
   {
      Util.find($el, selector, ($child) =>
      {
         const $parents = $child.parents(parentSelector);

         if (!$parents.length) { assert(false, `parent is not found. selector = "${parentSelector}"`); }

         if ($parents.length !== 1) { assert(false, `many parents are found. selector = "${parentSelector}"`); }

         callback($parents.first());
      });
   }

   /**
    * Helper function to invoke TJSDoc via the CLI interface.
    *
    * @param {string}         target - The local file path or NPM module to require for TJSDoc class.
    *
    * @param {string|object}  [configPathOrObject] - The config path to load or local object to use as the config.
    *
    * @param {boolean}        [silent=true] - If false then console.log output is generated.
    */
   static invoke(target, configPathOrObject = void 0, { modConfig = true, silent = true, swapPublisher = true,
    swapRuntime = true } = {})
   {
      if (typeof target !== 'object') { throw new TypeError(`'target' is not an 'object'.`); }

      let config;

      switch (typeof configPathOrObject)
      {
         case 'string':
         {
            const configPath = path.resolve(configPathOrObject);

            config = path.extname(configPath) === '.js' ? require(configPath) :
             JSON.parse(stripJsonComments(fs.readFileSync(configPath, { encode: 'utf8' }).toString()));

            console.log(`processing (${target.name}): ${configPath}`);
            break;
         }

         case 'object':
            config = configPathOrObject;

            console.log(`processing (${target.name}): ${JSON.stringify(config)}`);
            break;

         default:
            throw new TypeError(`'configPathOrObject' is not a 'string' or 'object'.`);
            break;
      }

      const TJSDoc = require(target.tjsdoc);

      if (swapRuntime) { config.runtime = target.runtime; }
      if (swapPublisher) { config.publisher = target.publisher; }

      if (modConfig) { Util.modTargetConfig(target, config); }

      if (silent) { Util.consoleLogSilent(true); }

      if (typeof TJSDoc.default === 'function')
      {
         TJSDoc.default.generate(config);
      }
      else
      {
         TJSDoc.generate(config);
      }

      if (silent) { Util.consoleLogSilent(false); }
   }

   /**
    *
    *
    * @param {string}   targetName - The target runtime name
    *
    * @param {TJSDocConfig}   config - A TSDocConfig.
    */
   static modTargetConfig(target, config, destDir = 'dest')
   {
      if (typeof target !== 'object') { throw new TypeError(`'target' is not an 'object'.`); }
      if (typeof target.name !== 'string') { throw new TypeError(`'target.name' is not a 'string'.`); }
      if (typeof target.type !== 'string') { throw new TypeError(`'target.type' is not a 'string'.`); }
      if (typeof config.destination !== 'string') { throw new TypeError(`'config.destination' is not a 'string'.`); }

      const splitPath = config.destination.split(`./test/fixture/${destDir}/`);

      if (splitPath.length < 2)
      {
         throw new Error(
          `Could not split 'config.destination' (${config.destination}) by './test/fixture/${destDir}/'`);
      }

      config.destination = `./test/fixture/${destDir}/${target.type}/${target.name}/${splitPath[1]}`;
   }

   /**
    * Reads files from a local directory.
    *
    * @param {string}   target - Local file path to load relative to `dirName`.
    *
    * @param {string}   dirName - Optionally define the directory.
    *
    * @returns {*}
    */
   static readDir(target, dirName, destDir = 'dest')
   {
      return fs.readdirSync(`./test/fixture/${destDir}/${target.type}/${target.name}/${dirName}`);
   }

   /**
    * Reads a local document and loads it into cheerio and returns the top level HTML node.
    *
    * @param {string}   fileName - Local file path to load relative to `dirName`.
    *
    * @param {string}   [dirName='./test/fixture/dest/tjsdoc'] - Optionally define the directory.
    *
    * @returns {*}
    */
   static readDoc(target, fileName, dirName = 'tjsdoc', destDir = 'dest')
   {
      const html = fs.readFileSync(`./test/fixture/${destDir}/${target.type}/${target.name}/${dirName}/${fileName}`,
       { encoding: 'utf-8' });

      const $ = cheerio.load(html);

      return $('html').first();
   }

   /**
    * Reads a local file.
    *
    * @param {string}   fileName - Local file path to load relative to `dirName`.
    *
    * @param {string}   [dirName='./test/fixture/dest/tjsdoc'] - Optionally define the directory.
    *
    * @returns {*}
    */
   static readFile(target, fileName, dirName = 'tjsdoc', destDir = 'dest')
   {
      return fs.readFileSync(`./test/fixture/${destDir}/${target.type}/${target.name}/${dirName}/${fileName}`,
       { encoding: 'utf-8' });
   }

   /**
    * Reads a local JSON file.
    *
    * @param {string}   fileName - Local file path to load relative to `dirName`.
    *
    * @param {string}   [dirName='./test/fixture/dest/tjsdoc'] - Optionally define the directory.
    *
    * @returns {*}
    */
   static readJSON(target, fileName, dirName = 'tjsdoc', destDir)
   {
      return JSON.parse(Util.readFile(target, fileName, dirName, destDir));
   }

   /**
    * Writes a files from a local directory.
    *
    * @param {string}   fileName - Local file path to load relative to `dirName`.
    *
    * @param {string}   dirName] - Directory name to ensure.
    *
    * @returns {*}
    */
   static writeFile(target, dirName, fileName, data, destDir = 'dest')
   {
      fs.writeFileSync(`./test/fixture/${destDir}/${target.type}/${target.name}/${dirName}/${fileName}`, data);
   }
}

/**
 *
 * @param {HTMLElement} $el - The target HTML element.
 * @param {string}      [selector] - The selector to find.
 * @param {string}      [attr] - Attribute to find.
 *
 * @returns {*}
 */
function getActual($el, selector, attr)
{
   let $target;

   if (selector)
   {
      const $els = $el.find(selector);

      if (!$els.length) { assert(false, `node is not found. selector = "${selector}"`); }

      if ($els.length !== 1) { assert(false, `many nodes are found. selector = "${selector}"`); }

      $target = $els.first();
   }
   else
   {
      $target = $el;
   }

   if (!$target.length)
   {
      assert(false, `node is not found. selector = "${selector}"`);
   }

   let actual;

   if (attr)
   {
      actual = $target.attr(attr);
   }
   else
   {
      actual = $target.text().replace(/\s+/g, ' ');
   }

   if (actual === null)
   {
      assert(false, `actual is null. selector = ${selector}, attr = ${attr}`);
   }

   return actual;
}

assert.includes = function($el, selector, expect, attr)
{
   const actual = getActual($el, selector, attr);

   assert(actual.includes(expect) === true, `selector: "${selector}",\nactual: ${actual}\nexpect: ${expect}`);
};

assert.multiIncludes = function($el, selector, expects, attr)
{
   const $targets = $el.find(selector);

   if ($targets.length !== expects.length)
   {
      assert(false, `node length and expects length is mismatch. selector = "${selector}"`);
   }

   for (let i = 0; i < $targets.length; i++)
   {
      const $target = $targets.eq(i);
      let actual;

      if (attr)
      {
         actual = $target.attr(attr);
      }
      else
      {
         actual = $target.text().replace(/\s+/g, ' ');
      }

      if (actual === null)
      {
         assert(false, `actual is null. selector = ${selector}, attr = ${attr}`);
      }

      const expect = expects[i];

      assert(actual.includes(expect) === true, `selector: "${selector}",\nactual: ${actual}\nexpect: ${expect}`);
   }
};

assert.notIncludes = function($el, selector, expect, attr)
{
   const actual = getActual($el, selector, attr);

   assert(actual.includes(expect) === false, `selector: "${selector}"`);
};
