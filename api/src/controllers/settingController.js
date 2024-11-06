import SettingModel from '../models/setting.js';
import { logError } from '../utils/logger.js';

let cachedSettings = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Saves a new setting to the database and updates the cache.
 *
 * @param {string} key - The key of the setting to be saved.
 * @param {*} value - The value of the setting to be saved. Can be of any type.
 * @param {string} [description] - The optional description of the setting to be saved.
 * @returns {Promise<boolean>} A promise that resolves to:
 *   - true if a new setting was successfully saved
 *   - false if the setting already existed in the database
 * @throws {Error} If there's an error saving to the database or updating the cache.
 */
export async function saveNewSetting(key, value, description = '') {
  // Check if the setting already exists in the database
  const existingSetting = await SettingModel.findOne({ key });
  if (existingSetting) {
    return false; // Indicate that the setting already existed
  }

  // Save the new setting in the database
  const newSetting = new SettingModel({
    key,
    value,
    description,
  });
  await newSetting.save();

  // Update the cache
  if (!cachedSettings) {
    cachedSettings = {};
  }
  cachedSettings[key] = value;

  return true; // Indicate that a new setting was saved
}

export async function getAllSettings() {
  const now = Date.now();
  if (!cachedSettings || now - lastFetchTime > CACHE_DURATION) {
    const settings = await SettingModel.find();
    cachedSettings = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    lastFetchTime = now;
  }
  return cachedSettings;
}

/**
 * Retrieves a specific setting value by its key.
 *
 * @async
 * @function getSetting
 * @param {string} key - The key of the setting to retrieve.
 * @returns {Promise<*>} The value of the setting. The type depends on what was stored.
 * @throws {Error} If the setting is not found.
 */
export async function getSetting(key) {
  const settings = await getAllSettings();
  const value = settings[key];
  if (value === undefined) {
    logError({}, `Setting '${key}' not found`);
    throw new Error(`Setting '${key}' not found`);
  }
  return value;
}

/**
 * Retrieves multiple setting values by their keys.
 *
 * @async
 * @function getSettings
 * @param {...string} args - The keys of the settings to retrieve.
 * @returns {Promise<Object>} An object where the keys are the requested setting keys and the values are the corresponding setting values.
 * @throws {Error} If any of the requested settings are not found.
 */
export async function getSettings(...args) {
  const settings = await getAllSettings();
  return args.reduce((acc, key) => {
    const value = settings[key];
    if (value === undefined) {
      logError({}, `Setting '${key}' not found`);
      throw new Error(`Setting '${key}' not found`);
    }
    acc[key] = value;
    return acc;
  }, {});
}
