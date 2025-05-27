import axios from 'axios';
import qs from 'qs';

export const client = axios.create({
  baseURL: import.meta.env.VITE_OPEN_API_BASE_URL,
  paramsSerializer: (params) => qs.stringify(params, { encode: false }),
});

client.interceptors.request.use((config) => {
  if (!config.url) {
    return config;
  }

  config.params = {
    serviceKey: import.meta.env.VITE_OPEN_API_KEY,
    ...(config.params || {}),
    MobileApp: 'polzzak',
    MobileOS: 'ETC',
    _type: 'json',
  };

  return config;
});
