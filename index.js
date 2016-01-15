'use strict';

var Stream = require('stream');
var path = require('path');
var fs = require('fs');

var uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    minifyCSS = require('gulp-minify-css'),
    rename = require("gulp-rename"),
    minifyHTML = require('gulp-minify-html');

module.exports = {
  minjs: [],
  js: [],
  mincss: [],
  css: [],
  name: '',
  init : function(opts){        
    var self = this;
    var stream = new Stream.Transform({objectMode: true});
    stream._transform = function(file, unused, callback) {
      self.name = file.history[0].replace(file.cwd, '').replace(/^[\/\\]/g, '').replace(/[\/\\]/g, '.');
      self.name = self.name.substr(0, self.name.lastIndexOf('.'));
      self.minjs = [];
      self.js = [];
      self.css = [];
      self.mincss = [];    

      var str = file.contents.toString();
      var regex = /<script [^>]*?src[\r|\n|\t|\s]*=[\r|\n|\t|\s]*['"]([\w\W]*?)['"\s]/gim;
      var matches;
      while(matches = regex.exec(str)){
        if(matches[1].indexOf('min.js') != -1){
          self.minjs.push(file.base + '/' + matches[1]);  
        }else{
          self.js.push(file.base + '/' + matches[1]);  
        }
      }
      regex = /<link [^>]*?href[\r|\n|\t|\s]*=[\r|\n|\t|\s]*['"]([\w\W]*?)['"\s]/gim;
      matches;
      while(matches = regex.exec(str)){
        if(matches[1].indexOf('min.css') != -1){
          self.mincss.push(file.base + '/' + matches[1]);
        }else{
          self.css.push(file.base + '/' + matches[1]);
        }
      }
      if(opts && opts.done) opts.done(self);
      var devPattern = /<optz-dev>[\r|\n|\t|<|\w\W]*?<\/optz-dev>/igm;
      str = str.replace(devPattern, '');
      str = str.replace(/<\/?optz-production>/g, '').replace(/optz-link/g, 'link').replace(/optz-script/g, 'script').replace(/\$optz\[name\]/gmi, self.name);
      file.contents = new Buffer(str);
      callback(null, file);
    };  
    return stream;
  }
}