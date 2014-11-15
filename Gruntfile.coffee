
module.exports = (grunt) =>

  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    
    concurrent:
      dev:
        tasks: ['nodemon', 'watch']
        options:
          logConcurrentOutput: true
      
    nodemon:
      dev:
        script: 'core/app.js'
        options:
          ignore: [
            'node_modules/**',
            'public/**'
          ]
          ext: 'js,coffee'
          
    watch:
      nodeJs:
         files: ['(core|lib)/**/*(.js|.coffee)']
         tasks: ['newer:jshint:nodeJs', 'mochaTest']
         
    jshint:
      nodeJs:
        options:
          jshintrc: '.jshintrc-server'
        src: [
          'schema/**/*.js',
          'views/**/*.js'
        ]
    
    mochaTest:
      test:
        options:
            reporter: 'spec',
            require: 'coffee-script/register'
          src: ['**/*_spec.coffee']

  
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-concurrent'
  grunt.loadNpmTasks 'grunt-nodemon'
  grunt.loadNpmTasks 'grunt-newer'
  grunt.loadNpmTasks 'grunt-mocha-test'

  grunt.registerTask 'default', ['concurrent', 'mochaTest']
  
