console = (console) ? console : {"log":function (){}};
function getData(cb){
  return $.getJSON("data/data.json",cb);
}

$('document').ready(function (){

  $(this).on("completed", function (data){
    console.log("completed called" + data.mb);
    setTimeout(function(){
      data.mb = (data.mb > 1) ? Math.round(data.mb) : data.mb;
      $('.table-striped').append("<tr><td>"+data.key+"</td><td>"+data.size+"</td><td>   "+data.elapsed+"   </td><td>"+data.mb+"</td></tr>");
    },0);

  });

  var doc = $(this);
  var retdata = {};
  $('#addData').unbind().click(function(){
    var amount = $('input[name="amount"]').val();
    //file is .5MB * amount by 2

    var dataString="";
    //create Kilobyte string
    for(var k=1023; k > 0; k--){
      dataString+="s";
    }
    dataString+="\n";
    var mbString="";
    //create MB string
    for(var j=1024; j > 0; j--){
      if(!mbString){
        mbString = dataString;
      }else{
        mbString+=dataString;
      }
    }

      var c = new Lawnchair(function (){
        var db = this;
        for(var i=amount; i >0; i--){
          var key = "test"+i;
          this.save({key:key + i,val:mbString}, function (obj){
            var size = mbString.getBytes();
            var mb = (size / 1024)/1024;
            doc.trigger({type:"completed","key":obj.key, "elapsed":"",size:size,"mb":mb});
            db.get(obj.key, function (data){
              if(data.val){
                console.log("retrieved data from key  "+ data.key + " "+ data.val.getBytes());
                retdata[data.key] = data.val;
                console.log("recieve size = " + (JSON.stringify(retdata).getBytes()/ 1024)/1024);
              }else{
                console.log("did not receive data");
              }
            });
          });

        //get the last key saved

        }
      });

  });

  //http://stackoverflow.com/questions/2219526/how-many-bytes-in-a-javascript-string
  String.prototype.getBytes = function () {
    return  unescape(encodeURIComponent(this)).length
  };

  $('#addKeyData').unbind().click(function (){
    var amount = $('input[name="amount"]').val();
    var keyName = "mykey";
    var l = new Lawnchair({fail:function(err){
      console.log("called error function " + err);
    }},function (){
      $('#adapter').html(this.adapter);
      var db = this;
      var amounts = [2,4,10];
      var series = [];
      var dataString="";
      //create Kilobyte string
      for(var k=1023; k > 0; k--){
        dataString+="s";
      }
      dataString+="\n";
      var mbString="";
      //create MB string
      for(var j=1024; j > 0; j--){
        if(!mbString){
          mbString = dataString;
        }else{
         mbString+=dataString;
        }
      }

      console.log("data string size is ", mbString.getBytes() + " bytes");

      async.map(amounts, function(amount){
        console.log("mapping amount " + amount + "MB");
        series.push(function (callback){
          console.log("executing " + amount + "MB");
          try{
            var command = {val:null,key:keyName};
            for(var i=amount; i > 0; i--){
              if(!command.val){
                command.val = mbString;
              }else{
               command.val+=mbString;
              }
            }
            var length = command.val.length;
            var size = command.val.getBytes();
            var started = new Date().getTime();
            db.save(command, function (saved){
              var ended = new Date().getTime();
              var elapsed = ended - started;
              var mb = size / 1048576;
              console.log("saved : " + size );
              doc.trigger({"type":"completed","size":size,"elapsed":elapsed,"key":keyName,"mb":mb});
              console.log("finished");
              callback(undefined, {"length":length});
            });
          }catch(e){
            console.error("Caught e ",e);
            callback()
          }
        });
      });
      async.series(series, function(err, content){
        var l = new Lawnchair(function (){
//        this.get("mykey", function (data){
//              var ret = JSON.parse(data.data);
//              alert("number of array items saved " + content.pop().length + " number of items retrieved " + ret.length);
//         });
        });
      });
    });
  });

  $('#removeData').unbind().click(function (){
    var keyname = $('input[name="keyname"]').val();
    Lawnchair(function (){
       this.remove(keyname, function (){
          console.log("Removed");
       });
    });
  });


  $('#getData').click(function(){

      Lawnchair(function (){
        var start = new Date().getTime();
        this.get("mykey", function (data, err){
          var end = new Date().getTime();
          var elapsed = end - start;
          var size = data.val.length;
          var mb = Math.round((size / 1024 ) / 1024);
          console.log((data.val.length / 1024 ) / 1024 );
          $('.table-striped').append("<tr><td>"+data.key+"</td><td>"+size+"</td><td>"+elapsed+"</td><td>"+mb+"</td><td>"+data.val.substr(0,100)+"</td></tr>");
        });
      });
  });
});