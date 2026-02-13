export interface StoixConfig {
  port: number;
  framework: 'react';
  server: {
    apiPrefix: string;
    cors: string | string[] | false;
  };
}

const config: StoixConfig = {
  port: 3000,
  framework: 'react',
  server: {
    apiPrefix: '/api',
    cors: false,
  },
};

export default config;
