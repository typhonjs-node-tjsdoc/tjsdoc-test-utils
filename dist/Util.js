'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

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
       * @param {string}      cliPath - The file path to the CLI class to require.
       *
       * @param {string|null} [configPath=null] - The config path to load.
       *
       * @param {boolean}     [silent=true] - If false then console.log output is generated.
       */
      value: function cli(target) {
         var configPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
         var silent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
         var cwdPath = arguments[3];

         if (typeof target.cli !== 'string') {
            throw new TypeError('\'target.cli\' is not a \'string\'.');
         }

         var argv = ['node', target.cli];

         if (configPath) {
            configPath = _path2.default.resolve(configPath);

            console.log('process: ' + configPath);

            argv.push('-c', configPath);
         }

         var CLIClass = require(target.cli);

         var cwd = _process2.default.cwd();

         if (cwdPath) {
            _process2.default.chdir(cwdPath);
         }

         var cli = new CLIClass(argv);

         if (silent) {
            Util.consoleLogSwitch(false);
         }

         cli.exec();

         if (silent) {
            Util.consoleLogSwitch(true);
         }

         if (cwdPath) {
            _process2.default.chdir(cwd);
         }
      }

      /**
       * Turns on or off console logging.
       *
       * @param {boolean}  on - If true turn console logging on.
       */

   }, {
      key: 'consoleLogSwitch',
      value: function consoleLogSwitch(on) {
         if (on) {
            console.log = consoleLog;
         } else {
            console.log = function () {};
         }
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

         return _fsExtra2.default.ensureDirSync('./test/fixture/' + destDir + '/' + target.name + '/' + dirName);
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
       * @param {string}      target - The local file path or NPM module to require for TJSDoc class.
       *
       * @param {string|null} [configPath=null] - The config path to load.
       *
       * @param {boolean}     [silent=true] - If false then console.log output is generated.
       */

   }, {
      key: 'invoke',
      value: function invoke(target) {
         var configPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
         var silent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
         var swapRuntime = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
         var swapPublisher = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;

         if ((typeof target === 'undefined' ? 'undefined' : (0, _typeof3.default)(target)) !== 'object') {
            throw new TypeError('\'target\' is not an \'object\'.');
         }
         if (typeof configPath !== 'string') {
            throw new TypeError('\'configPath\' is not a \'string\'.');
         }

         configPath = _path2.default.resolve(configPath);

         var config = _path2.default.extname(configPath) === '.js' ? require(configPath) : JSON.parse((0, _stripJsonComments2.default)(_fsExtra2.default.readFileSync(configPath, { encode: 'utf8' }).toString()));

         var TJSDoc = require(target.tjsdoc);

         if (swapRuntime) {
            config.runtime = target.runtime;
         }
         if (swapPublisher) {
            config.publisher = target.publisher;
         }

         Util.modTargetConfig(target, config);

         console.log('processing (' + target.name + '): ' + configPath);

         if (silent) {
            Util.consoleLogSwitch(false);
         }

         if (typeof TJSDoc.default === 'function') {
            TJSDoc.default.generate(config);
         } else {
            TJSDoc.generate(config);
         }

         if (silent) {
            Util.consoleLogSwitch(true);
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
         if ((typeof target === 'undefined' ? 'undefined' : (0, _typeof3.default)(target)) !== 'object') {
            throw new TypeError('\'target\' is not an \'object\'.');
         }
         if (typeof target.name !== 'string') {
            throw new TypeError('\'target.name\' is not a \'string\'.');
         }
         if (typeof config.destination !== 'string') {
            throw new TypeError('\'config.destination\' is not a \'string\'.');
         }

         var splitPath = config.destination.split('./test/fixture/dest/');

         if (splitPath.length < 2) {
            throw new Error('Could not split \'config.destination\' (' + config.destination + ') by \'./test/fixture/dest/\'');
         }

         config.destination = './test/fixture/dest/' + target.name + '/' + splitPath[1];
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

         return _fsExtra2.default.readdirSync('./test/fixture/' + destDir + '/' + target.name + '/' + dirName);
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

         var html = _fsExtra2.default.readFileSync('./test/fixture/' + destDir + '/' + target.name + '/' + dirName + '/' + fileName, { encoding: 'utf-8' });

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

         return _fsExtra2.default.readFileSync('./test/fixture/' + destDir + '/' + target.name + '/' + dirName + '/' + fileName, { encoding: 'utf-8' });
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

         _fsExtra2.default.writeFileSync('./test/fixture/' + destDir + '/' + target.name + '/' + dirName + '/' + fileName, data);
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