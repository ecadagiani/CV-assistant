import axios from 'axios';
import _ from 'lodash';
import net from 'net';

import { IPDATA_API_KEY } from '../config.js';
import BanModel from '../models/ban.js';
import { logError, logInfo } from '../utils/logger.js';

function fetchIpDataGeneric({ brockerName, urlConstructor, dataExtractor }) {
  return async (ip) => {
    try {
      const { data } = await axios.get(urlConstructor(ip));
      if (data?.error) throw new Error(data.reason);
      return dataExtractor(data);
    } catch (err) {
      logError({}, `Fetching IP data from ${brockerName} - ip=${ip}`, err.name, err.message, err.code);
    }
    return null;
  };
}

// use local version https://www.npmjs.com/package/ip2location-nodejs
const ipDataBrokers = [
  {
    brockerName: 'ipapi',
    urlConstructor: (ip) => `https://ipapi.co/${ip}/json/`,
    dataExtractor: (data) => ({
      country: data?.country,
      region: data?.region,
      city: data?.city,
    }),
  },
  {
    brockerName: 'ip.guide',
    urlConstructor: (ip) => `https://ip.guide/${ip}`,
    dataExtractor: (data) => ({
      country: data?.network?.autonomous_system?.country || data?.location?.country,
      city: data?.location?.city,
      region: null,
    }),
  },
  {
    brockerName: 'ipinfo',
    urlConstructor: (ip) => `http://ipinfo.io/${ip}/json`,
    dataExtractor: (data) => ({
      country: data?.country,
      region: data?.region,
      city: data?.city,
    }),
  },
  {
    brockerName: 'ipdata',
    urlConstructor: (ip) => `https://api.ipdata.co/${ip}?api-key=${IPDATA_API_KEY}`,
    dataExtractor: (data) => ({
      country: data?.country_code,
      region: data?.region,
      city: data?.city,
    }),
  },
];

/**
 * Retrieves IP data for a given IP address.
 * @param {string} ip - The IP address to retrieve data for.
 * @returns {Promise<{ country: string | null, region: string | null, city: string | null }>} The IP data containing country, region, and city information.
 * @throws {Error} If the IP address is invalid.
 */
export async function getIpData(ip) {
  if (net.isIP(ip) === 0) throw new Error('Invalid IP address');

  // Shuffle the IP data brokers to avoid always hitting the same one
  const shuffledIpDataBrokers = _.shuffle(ipDataBrokers);
  let ipData = null;
  let index = 0;
  while (!ipData && index < shuffledIpDataBrokers.length) {
    // call each broker in random order, until one of them returns data
    logInfo({}, `Fetching IP data from ${shuffledIpDataBrokers[index].brockerName}`);
    // eslint-disable-next-line no-await-in-loop
    ipData = await fetchIpDataGeneric(shuffledIpDataBrokers[index])(ip);
    index++;
  }

  if (ipData) return ipData;
  return {
    country: null,
    region: null,
    city: null,
  };
}

/**
 * Checks if an IP address is banned.
 * @param {string} ip - The IP address to check.
 * @returns {Promise<boolean>} A boolean indicating if the IP address is banned.
 */
export const isIpBanned = async (ip) => {
  // Fetch all active bans and cache for 30 seconds
  const activeBans = await BanModel.find({ active: true })
    .cache(30)
    .exec();

  // Check if IP matches any ban
  const isBanned = activeBans.some((ban) => {
    if (ban.type === 'IP') {
      return ban.value === ip;
    } if (ban.type === 'IP_REGEX') {
      const regex = new RegExp(ban.value);
      return regex.test(ip);
    }
    // We're not checking for country bans as per the request
    return false;
  });

  return isBanned;
};

/**
 * Checks if a country is banned.
 * @param {string} countryCode - The country code to check.
 * @returns {Promise<boolean>} A boolean indicating if the country is banned.
 */
export const isCountryBanned = async (countryCode) => {
  if (!countryCode || typeof countryCode !== 'string') return false;

  // Fetch all active bans and cache for 30 seconds
  const activeBans = await BanModel.find({ active: true })
    .cache(30)
    .exec();

  // Check if country matches any ban
  const isBanned = activeBans.some(
    (ban) => ban?.type === 'COUNTRY' && (ban?.value || '').toLowerCase() === (countryCode || '').toLowerCase(),
  );

  return isBanned;
};
