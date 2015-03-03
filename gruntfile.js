module.exports = function(grunt){
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jade: {
      compile: {
        options: {
          data: {
            debug: false
          }
        },
        files: {
          "views/html/layout.html": ["views/layout.jade"],
          "views/html/join.html": ["views/join.jade"],
          "views/html/index.html":["views/index.jade"],
          "views/html/community.html":["views/community.jade"],
          "views/html/api.html":["views/api.jade"],
          "views/html/about.html":["views/about.jade"],
          "views/html/partials/*.html" : ["views/partials/*.jade"]
        }
      }
    },
    jsbeautifier: {
      files: ["views/html/*.html", "views/html/partials/*.html","public/scripts/visualization.js", "public/stylesheets/custom/*.css", "!public/stylesheets/custom/*.min.css"],
      options: {
        html: {
          braceStyle: "collapse",
          indentChar: " ",
          indentScripts: "keep",
          indentSize: 4,
          maxPreserveNewlines: 10,
          preserveNewlines: true,
          unformatted: ["a", "sub", "sup", "b", "i", "u"],
          wrapLineLength: 0
        },
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
              maxPreserveNewlines: 1000,
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
      target: {
        files: [{
          expand: true,
          cwd: 'public/stylesheets/custom',
          src: ['*.css', '!*.min.css'],
          dest: 'public/stylesheets/custom-compress',
          ext: '.min.css'
        }]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');


  grunt.registerTask('default', ['jade', 'jsbeautifier', 'uglify', 'cssmin']);
}
