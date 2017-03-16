'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _chai = require('chai');

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _process = require('process');

var _process2 = _interopRequireDefault(_process);

var _stripJsonComments = require('strip-json-comments');

var _stripJsonComments2 = _interopRequireDefault(_stripJsonComments);

var _TestConfig = require('./TestConfig.js');

var _TestConfig2 = _interopRequireDefault(_TestConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var consoleLog = console.log;

var Util = function () {
   function Util() {
      (0, _classCallCheck3.default)(this, Util);
   }

   (0, _createClass3.default)(Util, null, [{
      key: 'cli',


      /**
       * Helper function to invoke TJSDoc via the CLI interface.
       *
       * @param {string}   target - The file path to the CLI class to require.
       *
       * @param {string}   [configPath=null] - The config path to load.
       *
       * @param {boolean}  [silent=true] - If false then console.log output is generated.
       */
      value: function cli(target) {
         var configPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : void 0;

         var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
             _ref$cwdPath = _ref.cwdPath,
             cwdPath = _ref$cwdPath === undefined ? void 0 : _ref$cwdPath,
             _ref$silent = _ref.silent,
             silent = _ref$silent === undefined ? true : _ref$silent;

         if (typeof target.cli !== 'string') {
            throw new TypeError('\'target.cli\' is not a \'string\'.');
         }

         var argv = ['node', target.cli];

         if (configPath) {
            configPath = _path2.default.resolve(configPath);

            console.log('process (' + target.name + '): ' + configPath);

            argv.push('-c', configPath);
         } else if (cwdPath) {
            console.log('process cwd (' + target.name + '): ' + _path2.default.resolve(cwdPath));
         }

         var CLIClass = require(target.cli);

         var cwd = _process2.default.cwd();

         if (cwdPath) {
            _process2.default.chdir(cwdPath);
         }

         var cli = new CLIClass(argv);

         if (silent) {
            Util.consoleLogSilent(true);
         }

         cli.exec();

         if (silent) {
            Util.consoleLogSilent(false);
         }

         if (cwdPath) {
            _process2.default.chdir(cwd);
         }
      }

      /**
       * Turns on or off console logging.
       *
       * @param {boolean}  silent - If true then turn console logging off.
       */

   }, {
      key: 'consoleLogSilent',
      value: function consoleLogSilent(silent) {
         console.log = silent ? function () {} : consoleLog;
      }
   }, {
      key: 'createTestConfig',
      value: function createTestConfig(config, localConfigPath, moduleName) {
         return new _TestConfig2.default(config, localConfigPath, moduleName);
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

   }, {
      key: 'ensureDir',
      value: function ensureDir(target, dirName) {
         var destDir = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'dest';

         return _fsExtra2.default.ensureDirSync('./test/fixture/' + destDir + '/' + target.type + '/' + target.name + '/' + dirName);
      }

      /**
       * Finds the element with a given selector and invokes the callback with the first node in the element.
       *
       * @param {HTMLElement} $el - The target HTML element.
       * @param {string}      selector - The selector to find.
       * @param {function}    callback - A callback to invoke with the first result.
       */

   }, {
      key: 'find',
      value: function find($el, selector, callback) {
         var $els = $el.find(selector);

         if (!$els.length) {
            (0, _chai.assert)(false, 'node is not found. selector = "' + selector + '"');
         }

         if ($els.length !== 1) {
            (0, _chai.assert)(false, 'many nodes are found. selector = "' + selector + '"');
         }

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

   }, {
      key: 'findParent',
      value: function findParent($el, selector, parentSelector, callback) {
         Util.find($el, selector, function ($child) {
            var $parents = $child.parents(parentSelector);

            if (!$parents.length) {
               (0, _chai.assert)(false, 'parent is not found. selector = "' + parentSelector + '"');
            }

            if ($parents.length !== 1) {
               (0, _chai.assert)(false, 'many parents are found. selector = "' + parentSelector + '"');
            }

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

   }, {
      key: 'invoke',
      value: function invoke(target) {
         var configPathOrObject = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : void 0;

         var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
             _ref2$modConfig = _ref2.modConfig,
             modConfig = _ref2$modConfig === undefined ? true : _ref2$modConfig,
             _ref2$silent = _ref2.silent,
             silent = _ref2$silent === undefined ? true : _ref2$silent,
             _ref2$swapPublisher = _ref2.swapPublisher,
             swapPublisher = _ref2$swapPublisher === undefined ? true : _ref2$swapPublisher,
             _ref2$swapRuntime = _ref2.swapRuntime,
             swapRuntime = _ref2$swapRuntime === undefined ? true : _ref2$swapRuntime;

         if ((typeof target === 'undefined' ? 'undefined' : (0, _typeof3.default)(target)) !== 'object') {
            throw new TypeError('\'target\' is not an \'object\'.');
         }

         var config = void 0;

         switch (typeof configPathOrObject === 'undefined' ? 'undefined' : (0, _typeof3.default)(configPathOrObject)) {
            case 'string':
               {
                  var configPath = _path2.default.resolve(configPathOrObject);

                  config = _path2.default.extname(configPath) === '.js' ? require(configPath) : JSON.parse((0, _stripJsonComments2.default)(_fsExtra2.default.readFileSync(configPath, { encode: 'utf8' }).toString()));

                  console.log('processing (' + target.name + '): ' + configPath);
                  break;
               }

            case 'object':
               config = configPathOrObject;

               console.log('processing (' + target.name + '): ' + (0, _stringify2.default)(config));
               break;

            default:
               throw new TypeError('\'configPathOrObject\' is not a \'string\' or \'object\'.');
               break;
         }

         var TJSDoc = require(target.tjsdoc);

         if (swapRuntime) {
            config.runtime = target.runtime;
         }
         if (swapPublisher) {
            config.publisher = target.publisher;
         }

         if (modConfig) {
            Util.modTargetConfig(target, config);
         }

         if (silent) {
            Util.consoleLogSilent(true);
         }

         if (typeof TJSDoc.default === 'function') {
            TJSDoc.default.generate(config);
         } else {
            TJSDoc.generate(config);
         }

         if (silent) {
            Util.consoleLogSilent(false);
         }
      }

      /**
       *
       *
       * @param {string}   targetName - The target runtime name
       *
       * @param {TJSDocConfig}   config - A TSDocConfig.
       */

   }, {
      key: 'modTargetConfig',
      value: function modTargetConfig(target, config) {
         var destDir = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'dest';

         if ((typeof target === 'undefined' ? 'undefined' : (0, _typeof3.default)(target)) !== 'object') {
            throw new TypeError('\'target\' is not an \'object\'.');
         }
         if (typeof target.name !== 'string') {
            throw new TypeError('\'target.name\' is not a \'string\'.');
         }
         if (typeof target.type !== 'string') {
            throw new TypeError('\'target.type\' is not a \'string\'.');
         }
         if (typeof config.destination !== 'string') {
            throw new TypeError('\'config.destination\' is not a \'string\'.');
         }

         var splitPath = config.destination.split('./test/fixture/' + destDir + '/');

         if (splitPath.length < 2) {
            throw new Error('Could not split \'config.destination\' (' + config.destination + ') by \'./test/fixture/' + destDir + '/\'');
         }

         config.destination = './test/fixture/' + destDir + '/' + target.type + '/' + target.name + '/' + splitPath[1];
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

   }, {
      key: 'readDir',
      value: function readDir(target, dirName) {
         var destDir = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'dest';

         return _fsExtra2.default.readdirSync('./test/fixture/' + destDir + '/' + target.type + '/' + target.name + '/' + dirName);
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

   }, {
      key: 'readDoc',
      value: function readDoc(target, fileName) {
         var dirName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'tjsdoc';
         var destDir = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'dest';

         var html = _fsExtra2.default.readFileSync('./test/fixture/' + destDir + '/' + target.type + '/' + target.name + '/' + dirName + '/' + fileName, { encoding: 'utf-8' });

         var $ = _cheerio2.default.load(html);

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

   }, {
      key: 'readFile',
      value: function readFile(target, fileName) {
         var dirName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'tjsdoc';
         var destDir = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'dest';

         return _fsExtra2.default.readFileSync('./test/fixture/' + destDir + '/' + target.type + '/' + target.name + '/' + dirName + '/' + fileName, { encoding: 'utf-8' });
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

   }, {
      key: 'readJSON',
      value: function readJSON(target, fileName) {
         var dirName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'tjsdoc';
         var destDir = arguments[3];

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

   }, {
      key: 'writeFile',
      value: function writeFile(target, dirName, fileName, data) {
         var destDir = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'dest';

         _fsExtra2.default.writeFileSync('./test/fixture/' + destDir + '/' + target.type + '/' + target.name + '/' + dirName + '/' + fileName, data);
      }
   }]);
   return Util;
}();

/**
 *
 * @param {HTMLElement} $el - The target HTML element.
 * @param {string}      [selector] - The selector to find.
 * @param {string}      [attr] - Attribute to find.
 *
 * @returns {*}
 */


Util.assert = _chai.assert;
exports.default = Util;
function getActual($el, selector, attr) {
   var $target = void 0;

   if (selector) {
      var $els = $el.find(selector);

      if (!$els.length) {
         (0, _chai.assert)(false, 'node is not found. selector = "' + selector + '"');
      }

      if ($els.length !== 1) {
         (0, _chai.assert)(false, 'many nodes are found. selector = "' + selector + '"');
      }

      $target = $els.first();
   } else {
      $target = $el;
   }

   if (!$target.length) {
      (0, _chai.assert)(false, 'node is not found. selector = "' + selector + '"');
   }

   var actual = void 0;

   if (attr) {
      actual = $target.attr(attr);
   } else {
      actual = $target.text().replace(/\s+/g, ' ');
   }

   if (actual === null) {
      (0, _chai.assert)(false, 'actual is null. selector = ' + selector + ', attr = ' + attr);
   }

   return actual;
}

_chai.assert.includes = function ($el, selector, expect, attr) {
   var actual = getActual($el, selector, attr);

   (0, _chai.assert)(actual.includes(expect) === true, 'selector: "' + selector + '",\nactual: ' + actual + '\nexpect: ' + expect);
};

_chai.assert.multiIncludes = function ($el, selector, expects, attr) {
   var $targets = $el.find(selector);

   if ($targets.length !== expects.length) {
      (0, _chai.assert)(false, 'node length and expects length is mismatch. selector = "' + selector + '"');
   }

   for (var i = 0; i < $targets.length; i++) {
      var $target = $targets.eq(i);
      var actual = void 0;

      if (attr) {
         actual = $target.attr(attr);
      } else {
         actual = $target.text().replace(/\s+/g, ' ');
      }

      if (actual === null) {
         (0, _chai.assert)(false, 'actual is null. selector = ' + selector + ', attr = ' + attr);
      }

      var expect = expects[i];

      (0, _chai.assert)(actual.includes(expect) === true, 'selector: "' + selector + '",\nactual: ' + actual + '\nexpect: ' + expect);
   }
};

_chai.assert.notIncludes = function ($el, selector, expect, attr) {
   var actual = getActual($el, selector, attr);

   (0, _chai.assert)(actual.includes(expect) === false, 'selector: "' + selector + '"');
};
module.exports = exports['default'];