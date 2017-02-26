export default class TestConfig
{
   constructor(config, localConfigPath, moduleName)
   {
      this._moduleName = moduleName;

      // Attempt to load local test config. A local config must be provided to define any target runtimes.
      let localConfig;

      const npmScript = s_GET_NPM_SCRIPT();

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

      this._config = Object.assign(config, localConfig, { targets });

      console.log('!!! TestConfig - ctor - this._config: ' + JSON.stringify(this._config));

      console.log(`\nnpm script: ${npmScript}`);
      console.log(`test runtimes: \n${JSON.stringify(targets, null, 3)}\n`);
      console.log(`test categories: ${JSON.stringify(this._config.category)}\n`);
   }

   /**
    *
    * @param category
    * @param test
    * @param callback
    */
   forEachTarget(category, test, callback)
   {
      const catType = typeof category;

      // Potentially invoke category as the callback
      if (catType === 'function')
      {
         for (const target of this._config.targets)
         {
            this._currentTarget = target;
            category(target);
         }
      }
      else
      {
         if (this._config.category[category])
         {
            if (this._config[category]['tests'][test])
            {
               for (const target of this._config.targets)
               {
                  this._currentTarget = target;
                  callback(target);
               }
            }
         }
      }
   }

   get()
   {
      return this._config;
   }

   get currentTarget()
   {
      return this._currentTarget;
   }

   get moduleName()
   {
      return this._moduleName;
   }
}

function s_GET_NPM_SCRIPT()
{
   try
   {
      const npmArgv = JSON.parse(process.env['npm_config_argv']).cooked;
      return npmArgv[1];
   }
   catch (err)
   {
      console.error(`'tjsdoc-tests' error: could not obtain 'npm_config_argv' environment variable.`);
      process.exit(1);
   }
}
