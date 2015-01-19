[![Stories in Ready](https://badge.waffle.io/dashy-io/dashy-admin-ui.png?label=ready&title=Ready)](https://waffle.io/dashy-io/dashy-admin-ui)
dashy-admin-ui
==============

### Prerequisites
1) Node.js  
2) Grunt `npm install -g grunt-cli`  
3) Bower `npm install -g bower`  
4) Install all npm dependencies `npm install`, will automatically instal all bower dependencies

Optional for testing `npm install -g karma-cli`

### Dev 
`gulp watch` will start a webserver and watch the file for changes refreshing the page at localhost:9000

### Build
`gulp build` and you'll find the production code in `dist/`

### Test
`karma start karma.config.js` and then `karma run` to run the tests.

### Deploy on GitHub Pages
`gulp deploy` after you have made your build will commit your `dist/` directory and push it to `gh-pages` branch.
