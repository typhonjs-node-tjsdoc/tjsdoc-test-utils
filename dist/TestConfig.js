'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Defines a test config which holds parameters assigned by test modules and overridden by any local config file
 * relative to the execution directory.
 *
 * TODO: Add config verification!
 */
var TestConfig = function () {
   /**
    * Instantiates an instance with a given config object and a local path to a config which is loaded and merged
    * with the given config.
    *
    * @param {object}   config -
    * @param {string}   localConfigPath -
    * @param {string}   moduleName -
    */
   function TestConfig(config, localConfigPath, moduleName) {
      (0, _classCallCheck3.default)(this, TestConfig);

      this._moduleName = moduleName;

      // Attempt to load local test config. A local config must be provided to define any target runtimes.
      var localConfig = void 0;

      var npmScript = s_GET_NPM_SCRIPT(moduleName);

      try {
         localConfig = require(_path2.default.resolve(localConfigPath));
      } catch (err) {
         console.error('\'' + moduleName + '\' error: could not require \'' + localConfigPath + '\'.');
         process.exit(1);
      }

      var targets = (0, _typeof3.default)(localConfig.targets) === 'object' ? localConfig.targets[npmScript] : [];

      if (targets.length === 0) {
         console.error('\'' + moduleName + '\' error: Missing runtime configuration for NPM script \'' + npmScript + '\' in \'targets\' object hash of \'' + localConfigPath + '\'.');

         process.exit(1);
      }

      (0, _assign2.default)(this, config, localConfig, { targets: targets });

      console.log('\nnpm script: ' + npmScript);
      console.log('test runtimes: \n' + (0, _stringify2.default)(targets, null, 3) + '\n');
      console.log('test categories: ' + (0, _stringify2.default)(this.category) + '\n');
   }

   /**
    * A variable list
    *
    * @param {function|string}   category -
    * @param {string}            [test] -
    * @param {function}          [callback] -
    */


   (0, _createClass3.default)(TestConfig, [{
      key: 'forEachTarget',
      value: function forEachTarget(category, test, callback) {
         var catType = typeof category === 'undefined' ? 'undefined' : (0, _typeof3.default)(category);

         // Potentially invoke category as the callback
         if (catType === 'function') {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
               for (var _iterator = (0, _getIterator3.default)(this.targets), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  var target = _step.value;

                  this._currentTarget = target;
                  category(target);
               }
            } catch (err) {
               _didIteratorError = true;
               _iteratorError = err;
            } finally {
               try {
                  if (!_iteratorNormalCompletion && _iterator.return) {
                     _iterator.return();
                  }
               } finally {
                  if (_didIteratorError) {
                     throw _iteratorError;
                  }
               }
            }
         } else {
            if (this.category[category]) {
               if (this[category]['tests'][test]) {
                  var _iteratorNormalCompletion2 = true;
                  var _didIteratorError2 = false;
                  var _iteratorError2 = undefined;

                  try {
                     for (var _iterator2 = (0, _getIterator3.default)(this.targets), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var _target = _step2.value;

                        this._currentTarget = _target;
                        callback(_target);
                     }
                  } catch (err) {
                     _didIteratorError2 = true;
                     _iteratorError2 = err;
                  } finally {
                     try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                           _iterator2.return();
                        }
                     } finally {
                        if (_didIteratorError2) {
                           throw _iteratorError2;
                        }
                     }
                  }
               }
            }
         }

         this._currentTarget = void 0;
      }

      /**
       * Returns any current target set when forEachTarget is invoked for the given callback.
       *
       * @returns {{}}
       */

   }, {
      key: 'currentTarget',
      get: function get() {
         return this._currentTarget;
      }

      /**
       * Returns the module name for this config.
       *
       * @returns {*}
       */

   }, {
      key: 'moduleName',
      get: function get() {
         return this._moduleName;
      }
   }]);
   return TestConfig;
}();

// Module private ---------------------------------------------------------------------------------------------------

/**
 * Gets the NPM script being run.
 *
 * @param {string}   moduleName - The name of the source test module.
 *
 * @returns {*}
 * @ignore
 */


exports.default = TestConfig;
function s_GET_NPM_SCRIPT(moduleName) {
   try {
      var npmArgv = JSON.parse(process.env['npm_config_argv']).cooked;
      return npmArgv[1];
   } catch (err) {
      console.error('\'' + moduleName + '\' error: could not obtain \'npm_config_argv\' environment variable.');
      process.exit(1);
   }
}
module.exports = exports['default'];