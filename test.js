const async = require('promise-async');

var arr = [0,1,2,3,4,5,6,7,8,9];

async.eachSeries(arr, (item, cb)=>{
  setTimeout(()=>{
    console.log(item);
    cb();
  }, 1000);
}).then(()=> console.log('finish'))