import { registerManager } from "./utils/register";

interface HistoryConfig {
  maxLength: number;
}
export class Config {
  history: HistoryConfig = {
    maxLength: 500,
  };
}

export const configRegister = registerManager.create<Config>("history");

const defaultConfig = new Config();
configRegister.put("config", defaultConfig);
