var fs = require("fs");
var dotObject = require("dot-object");
var os = require("os");

function getLanguageContent(filePath) {
  var languageContent = fs.readFileSync(filePath);

  return JSON.parse(languageContent) || {};
}

function parseObjectToDotObject(object) {
  return dotObject.dot(object);
}

function diffLanguageKeys(sourceLangDotObj, destLangDotObj) {
  return destLangDotObj.filter(function(idx) {
    return sourceLangDotObj.indexOf(idx) < 0;
  });
}

function syncLanguage(sourceLangObj, destLangObj) {
  var sourceLangDotObj = parseObjectToDotObject(sourceLangObj);
  var destLangDotObj = parseObjectToDotObject(destLangObj);
  var diffKeys = diffLanguageKeys(Object.keys(sourceLangDotObj), Object.keys(destLangDotObj));

  while(diffKeys.length > 0) {
    for (var idx in diffKeys) {
      dotObject.pick(diffKeys[idx], destLangObj, true);
    }

    destLangDotObj = parseObjectToDotObject(destLangObj);
    diffKeys = diffLanguageKeys(Object.keys(sourceLangDotObj), Object.keys(destLangDotObj));
  }

  for (var langKey in sourceLangDotObj) {
    if (destLangDotObj[langKey] === undefined) {
      dotObject.str(langKey, sourceLangDotObj[langKey], destLangObj);
    }
  }

  return destLangObj;
}

module.exports = {
  sync: function(configs) {
    var sourceConfig = configs.source;
    var destConfig = configs.dest;
    var sourceLangFile = sourceConfig.dir + sourceConfig.lang + ".json";
    var destLangFile = destConfig.dir + destConfig.lang + ".json";
    var sourceLanguageObj = getLanguageContent(sourceLangFile);
    var destLangObj = getLanguageContent(destLangFile);
    destLangObj = syncLanguage(sourceLanguageObj, destLangObj);

    fs.writeFile(destLangFile, JSON.stringify(destLangObj, null, configs.tabSize) + os.EOL, function(err, ok) {
      if (!err) {
        console.log("Sync done");
      }
    });
  }
}
