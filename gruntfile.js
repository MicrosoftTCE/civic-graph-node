module.exports = function(grunt){
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jsbeautifier: {
      files: ["public/scripts/visualization.js", "public/stylesheets/*.css", "!public/stylesheets/*.min.css"],
      options: {
        css: {
          indentChar: " ",
          indentSize: 2
        },
        js: {
              braceStyle: "collapse",
              breakChainedMethods: false,
              e4x: false,
              evalCode: false,
              indentChar: " ",
              indentLevel: 0,
              indentSize: 2,
              indentWithTabs: false,
              jslintHappy: false,
              keepArrayIndentation: false,
              keepFunctionIndentation: false,
              maxPreserveNewlines: 10,
              preserveNewlines: true,
              spaceBeforeConditional: true,
              spaceInParen: false,
              unescapeStrings: false,
              wrapLineLength: 0
          }
      }
    },
    uglify: {
      my_target: {
        files: {
          'public/scripts/visualization.min.js': ['public/scripts/visualization.js']
        }
      }
    },
    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: [{
          expand: true,
          cwd: 'public/stylesheets',
          src: ['*.css', '!*.min.css'],
          dest: 'public/stylesheets',
          ext: '.min.css'
        }]
      }
    }
  }); 

  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['jsbeautifier', 'uglify', 'cssmin']);
}