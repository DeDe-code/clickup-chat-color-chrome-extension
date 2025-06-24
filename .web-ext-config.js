// web-ext config file
export default {
  // Global options:
  sourceDir: './dist',
  artifactsDir: './web-ext-artifacts',
  overwriteDest: true,

  // Command options:
  build: {
    overwriteDest: true,
  },
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
