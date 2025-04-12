import packageInfo from '../package.json';
import env from './env';

const app = {
  version: packageInfo.version,
  name: 'Wirecrest',
  logoUrl: 'https://www.wirecrest.com/images/logo.svg',
  url: env.appUrl,
};

export default app;
