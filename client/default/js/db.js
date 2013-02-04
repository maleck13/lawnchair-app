
function getData(cb){
  return $.getJSON("data/data.json",cb);
}

$('document').ready(function (){

  $(this).on("completed", function (data){
     console.log("completed called", data);
    setTimeout(function(){
      data.mb = (data.mb > 1) ? Math.round(data.mb) : data.mb;
     $('.table-striped').append("<tr><td>"+data.key+"</td><td>"+data.size+"</td><td>   "+data.elapsed+"   </td><td>"+data.mb+"</td></tr>");
    },0);

  });

  var doc = $(this);

  $('#addData').unbind().click(function(){
    var amount = $('input[name="amount"]').val();
    //file is .5MB * amount by 2
    amount = amount * 2;

      getData(function (data){
       var c = new Lawnchair(function (){
         for(var i=amount; i >0; i--){
           var stData = JSON.stringify(data);

           this.save({key:"test" + i,data:stData}, function (obj){
             var size = stData.getBytes();
             var mb = size / 1048576;
               doc.trigger({type:"completed","key":"test"+ i, "elapsed":"",size:size,"mb":mb});
           });
         }
         //get the last key saved
         this.get("test" + amount, function (data){
            if(data.data){
              alert("retrieved data from key " + "test" + amount);
            }else{
              alert("did not receive data");
            }
         });
        });

      });

  });


  String.prototype.getBytes = function () {
    return  unescape(encodeURIComponent(this)).length
  };

  $('#addKeyData').unbind().click(function (){
    console.log("clicked");
    var amount = $('input[name="amount"]').val();
    var keyName = "mykey";
    //file is .5MB * amount by 2
    var l = new Lawnchair(function (){
      console.log("in lawnchair");
    var db = this;

    var amounts = [5,10, 20, 35];
    var series = [];

    async.map(amounts, function(amount){
      console.log("called map");
       var calcAmount = amount * 2;
       series.push(function (callback){
         console.log("executing " + amount);
         db.remove(keyName, function (){
           getData(function (d){
             var content=[];
             for(var i=calcAmount; i > 0; i--){
               content.push(d);
             }
             var length = content.length;
             content = JSON.stringify(content);

             var started = new Date().getTime();
             db.save({key:keyName,"data":content}, function (saved){
               var ended = new Date().getTime();
               var elapsed = ended - started;
               var size = JSON.stringify(saved).getBytes();
               var mb = size / 1048576;
               console.log("saved : " + size );
               console.log("finished");
               doc.trigger({"type":"completed","size":size,"elapsed":elapsed,"key":keyName,"mb":mb});
               callback(undefined, {"length":length, "db":db});
             });
           });
         });
       });
    });

    async.series(series, function(err, content){

      var l = new Lawnchair(function (){
         this.get("mykey", function (data){
              var ret = JSON.parse(data.data);
              alert("number of array items saved " + content.pop().length + " number of items retrieved " + ret.length);
         });
      });
      //
    });
  });
});

  $('#getData').click(function(){
    var c = new Lawnchair(function (){
      this.keys(function(keys) {
        console.log(keys.length);
      });
      this.get("test60", function (data, err){
        console.log(data);
      });
    });
  });
});