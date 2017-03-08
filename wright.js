const wright = require('wright')

wright({
  main: 'index.html',
  debug: true,
  serve: './',
  run: 'm.redraw',

  /* See more in the docs
  css: [{
    compile: '',
    path: '',
    watch: ''
  }],
  */
  /* See more in the docs
  js: [{
    compile: '',
    path: '',
    watch: ''
  }],
  */
  /* See more in the docs
  execute: [{
    command: undefined,
    watch: undefined
  }]
  */
})
