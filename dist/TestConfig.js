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

var TestConfig = function () {
   function TestConfig(config, localConfigPath, moduleName) {
      (0, _classCallCheck3.default)(this, TestConfig);

      this._moduleName = moduleName;

      // Attempt to load local test config. A local config must be provided to define any target runtimes.
      var localConfig = void 0;

      var npmScript = s_GET_NPM_SCRIPT();

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

      this._config = (0, _assign2.default)(config, localConfig, { targets: targets });

      console.log('!!! TestConfig - ctor - this._config: ' + (0, _stringify2.default)(this._config));

      console.log('\nnpm script: ' + npmScript);
      console.log('test runtimes: \n' + (0, _stringify2.default)(targets, null, 3) + '\n');
      console.log('test categories: ' + (0, _stringify2.default)(this._config.category) + '\n');
   }

   /**
    *
    * @param category
    * @param test
    * @param callback
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
               for (var _iterator = (0, _getIterator3.default)(this._config.targets), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
            if (this._config.category[category]) {
               if (this._config[category]['tests'][test]) {
                  var _iteratorNormalCompletion2 = true;
                  var _didIteratorError2 = false;
                  var _iteratorError2 = undefined;

                  try {
                     for (var _iterator2 = (0, _getIterator3.default)(this._config.targets), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
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
      }
   }, {
      key: 'get',
      value: function get() {
         return this._config;
      }
   }, {
      key: 'currentTarget',
      get: function get() {
         return this._currentTarget;
      }
   }, {
      key: 'moduleName',
      get: function get() {
         return this._moduleName;
      }
   }]);
   return TestConfig;
}();

exports.default = TestConfig;


function s_GET_NPM_SCRIPT() {
   try {
      var npmArgv = JSON.parse(process.env['npm_config_argv']).cooked;
      return npmArgv[1];
   } catch (err) {
      console.error('\'tjsdoc-tests\' error: could not obtain \'npm_config_argv\' environment variable.');
      process.exit(1);
   }
}
module.exports = exports['default'];