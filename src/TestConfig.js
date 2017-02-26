import path from 'path';

/**
 * Defines a test config which holds parameters assigned by test modules and overridden by any local config file
 * relative to the execution directory.
 *
 * TODO: Add config verification!
 */
export default class TestConfig
{
   /**
    * Instantiates an instance with a given config object and a local path to a config which is loaded and merged
    * with the given config.
    *
    * @param {object}   config -
    * @param {string}   localConfigPath -
    * @param {string}   moduleName -
    */
   constructor(config, localConfigPath, moduleName)
   {
      this._moduleName = moduleName;

      // Attempt to load local test config. A local config must be provided to define any target runtimes.
      let localConfig;

      const npmScript = s_GET_NPM_SCRIPT(moduleName);

      try
      {
         localConfig = require(path.resolve(localConfigPath));
      }
      catch (err)
      {
         console.error(`'${moduleName}' error: could not require '${localConfigPath}'.`);
         process.exit(1);
      }

      const targets = typeof localConfig.targets === 'object' ? localConfig.targets[npmScript] : [];

      if (targets.length === 0)
      {
         console.error(`'${moduleName}' error: Missing runtime configuration for NPM script '${
          npmScript}' in 'targets' object hash of '${localConfigPath}'.`);

         process.exit(1);
      }

      Object.assign(this, config, localConfig, { targets });

      console.log(`\nnpm script: ${npmScript}`);
      console.log(`test runtimes: \n${JSON.stringify(targets, null, 3)}\n`);
      console.log(`test categories: ${JSON.stringify(this.category)}\n`);
   }

   /**
    * A variable list
    *
    * @param {function|string}   category -
    * @param {string}            [test] -
    * @param {function}          [callback] -
    */
   forEachTarget(category, test, callback)
   {
      const catType = typeof category;

      // Potentially invoke category as the callback
      if (catType === 'function')
      {
         for (const target of this.targets)
         {
            this._currentTarget = target;
            category(target);
         }
      }
      else
      {
         if (this.category[category])
         {
            if (this[category]['tests'][test])
            {
               for (const target of this.targets)
               {
                  this._currentTarget = target;
                  callback(target);
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
   get currentTarget()
   {
      return this._currentTarget;
   }

   /**
    * Returns the module name for this config.
    *
    * @returns {*}
    */
   get moduleName()
   {
      return this._moduleName;
   }
}

// Module private ---------------------------------------------------------------------------------------------------

/**
 * Gets the NPM script being run.
 *
 * @param {string}   moduleName - The name of the source test module.
 *
 * @returns {*}
 * @ignore
 */
function s_GET_NPM_SCRIPT(moduleName)
{
   try
   {
      const npmArgv = JSON.parse(process.env['npm_config_argv']).cooked;
      return npmArgv[1];
   }
   catch (err)
   {
      console.error(`'${moduleName}' error: could not obtain 'npm_config_argv' environment variable.`);
      process.exit(1);
   }
}
