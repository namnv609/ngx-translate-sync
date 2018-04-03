var ngxTransSyncConfigs = require(process.cwd() + "/ngxtsconfig");
var ngxTransSync = require("./sync");

ngxTransSync.sync(ngxTransSyncConfigs);
