Lawnchair.adapter('localFileStorage', (function () {
  // private methods
  var fail = function (e, i) { console.log('error in file system adapter !', e, i) };


  function filenameForKey(key, cb) {
    key = $fh.app_props.appid + key;

    $fh.hash({
      algorithm: "MD5",
      text: key
    }, function(result) {
      var filename = result.hashvalue + '.txt';
      if (typeof navigator.externalstorage !== "undefined") {
        navigator.externalstorage.enable(function handleSuccess(res){
          var path = filename;
          if(res.path ) {
            path = res.path;
            if(!path.match(/\/$/)) {
              path += '/';
            }
            path += filename;
          }
          filename = path;
          console.log('filenameForKey key=' + key+ ' , Filename: ' + filename);
          return cb(filename);
        },function handleError(err){
          console.warn('filenameForKey ignoring error=' + JSON.stringify(err));
          console.log('filenameForKey key=' + key+ ' , Filename: ' + filename);
          return cb(filename);
        })
      } else {
        console.log('filenameForKey key=' + key+ ' , Filename: ' + filename);
        return cb(filename);
      }
    });
  }

  return {

    valid: function () { return !!(window.requestFileSystem && navigator && navigator.externalstorage) },

    init : function (options, callback){
      //calls the parent function fn and applies this scope
      if(options.fail) fail = options.fail;
      if (callback) this.fn(this.name, callback).call(this, this);
    },

    keys: function (callback){
      throw "Currently not supported";
    },

    save : function (obj, callback){
      var key = obj.key;
      filenameForKey(key, function(hash) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function gotFS(fileSystem) {
          console.log("WRITE: got file system 1");
          fileSystem.root.getFile(hash, {
            create: true
          }, function gotFileEntry(fileEntry) {
            console.log("WRITE: got file entry 2");
            fileEntry.createWriter(function gotFileWriter(writer) {
              console.log("WRITE: got file writer 3");
              writer.onwrite = function() {
                console.log("WRITE: write done 4");
                return callback({
                  key: key,
                  val: obj.val
                });
              };
              writer.write(obj.val);
            }, function() {
              fail('[save] Failed to create file writer');
            });
          }, function() {
            fail('[save] Failed to getFile');
          });
        }, function() {
          fail('[save] Failed to requestFileSystem');
        });
      });
    },

    batch : function (records, callback){
        throw "Currently not supported";
    },

    get : function (key, callback){
      filenameForKey(key, function(hash) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function gotFS(fileSystem) {
          fileSystem.root.getFile(hash, {}, function gotFileEntry(fileEntry) {
            fileEntry.file(function gotFile(file) {
              var reader = new FileReader();
              reader.onloadend = function (evt) {
                var text = evt.target.result;
                // Check for URLencoded
                // PG 2.2 bug in readAsText()
                try {
                  text = decodeURIComponent(text);
                } catch (e) {
                  // Swallow exception if not URLencoded
                  // Just use the result
                }
                return callback({
                  key: key,
                  val: text
                });
              };
              reader.readAsText(file);
            }, function() {
              fail('[load] Failed to getFile');
            });
          }, function() {
            // Success callback on key load failure
            callback({
              key: key,
              val: null
            });
          });
        }, function() {
          fail('[load] Failed to get fileSystem');
        });
      });
    },

    exists : function (key, callback){
      filenameForKey(key,function (hash){
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function gotFS(fileSystem) {
          fileSystem.root.getFile(hash, {},
            function gotFileEntry(fileEntry) {
              return callback(true);
            }, function (err){
              return callback(false);
            });
        });
      });
    },

    all : function (callback){
      throw "Currently not supported";
    },

    remove : function (key, callback){
      filenameForKey(key, function(hash) {
        console.log('remove: ' + key + '. Filename: ' + hash);

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function gotFS(fileSystem) {
          fileSystem.root.getFile(hash, {}, function gotFileEntry(fileEntry) {
            console.log('remove: ' + key +  '. Filename: ' + hash);
            fileEntry.remove(function() {
              return callback({
                key: key,
                val: null
              });
            }, function() {
              fail('[remove] Failed to remove file');
            });
          }, function() {
            fail('[remove] Failed to getFile');
          });
        }, function() {
          fail('[remove] Failed to get fileSystem');
        });
      });
    },

    nuke : function (callback){
      throw "Currently not supported";
    }


  };

}()));