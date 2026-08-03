import StyleDictionary from "style-dictionary";

import config from "../style-dictionary.config";

const styleDictionary = new StyleDictionary(config);
await styleDictionary.buildAllPlatforms();
