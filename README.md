[![Stories in Ready](https://badge.waffle.io/dashy-io/dashy-admin-ui.png?label=ready&title=Ready)](https://waffle.io/dashy-io/dashy-admin-ui)
dashy-admin-ui
==============

### Prerequisites
1) Node.js  
2) Install all npm dependencies `npm install`, will automatically install all bower dependencies

### Dev 
`npm start` will start a webserver and watch the file for changes refreshing the page at localhost:9000

### Build
`npm run-script build` and you'll find the production code in `dist/`

### Test
`npm test` to run the tests.

### Deploy on GitHub Pages
`gulp deploy` after you have made your build will commit your `dist/` directory and push it to `gh-pages` branch.
