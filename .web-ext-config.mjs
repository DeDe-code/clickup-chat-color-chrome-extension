// web-ext config file
export default {
  // Global options:
  sourceDir: './dist',
  artifactsDir: './web-ext-artifacts',

  // Command options:
  build: {},
  run: {
    startUrl: ['https://app.clickup.com/'],
    browserConsole: true,
    target: ['chromium'],
    pref: [],
  },
  lint: {
    warningsAsErrors: true,
    selfHosted: false,
    output: 'text',
  },
}
