// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  hmr: false,
  BASE_API_URL: 'http://localhost:3000/api',
  BASE_URL: 'http://localhost:3000',
  pk_stripe: 'pk_test_rgLsr0HrrbMcqQr5G7Wz1zFK'
};
