var linebot = require('linebot');
var express = require('express');
var getJSON = require('get-json');
var http = require('http');

var bot = linebot({
  channelId: '1535963795',
  channelSecret: '2e0982cd380bd1aa3c93c5d2be30a6d2',
  channelAccessToken: 'HxdHJUI1tO5gE0LmV0g06JeiADJM5Vz67yb1V87Qu2y5fFL6Zson4EH3THNoPR8eFiT/mv9rfWCgTXbHf5cKeK1P6Bxt4dcoi0TGumShf0TSlFPNTWtD5PnryFoV7YiluLMxuUz9KfFBUZ571QsS4gdB04t89/1O/w1cDnyilFU='
});

var timer;
var pm = [];
_getJSON();
_bot();

// bot.on('message', function(event) {
//   if (event.message.type = 'text') {
//     var msg = event.message.text;
//     event.reply(msg).then(function(data) {
//       // success 
//       console.log(msg);
//     }).catch(function(error) {
//       // error 
//       console.log('error');
//     });
//   }
// });

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});

function _bot() {
  bot.on('message', function(event) {
    if (event.message.type == 'text') {
      var msg = event.message.text;
      var replyMsg = '';
      var XiaoiResContext = '';  
      var XiaoiResImage = '';  
      var obj;
      
      if (msg.indexOf('PM2.5') != -1) {
        pm.forEach(function(e, i) {
          if (msg.indexOf(e[0]) != -1) {
            replyMsg = e[0] + '的 PM2.5 數值為 ' + e[1];
          }
        });
        if (replyMsg == '') {
          replyMsg = '請輸入正確的地點';
        }
      }
      if (replyMsg == '') {
        // replyMsg = '不知道「'+msg+'」是什麼意思 :p';
        var options = {
            host: '210.61.110.62',
            port: '8080',
            path: '/Middleware/ServiceInvoke?Model=LINE&Serial=99&Request='+encodeURIComponent(msg)
          // path: '/Middleware3/ServiceInvoke?Model=LINE&Serial=99&Request='+encodeURIComponent(msg)
          };

          console.log('options='+options);

          callback = function(response) {
            var str = '';

            //another chunk of data has been recieved, so append it to `str`
            response.on('data', function (chunk) {
              str += chunk;
            });

            //the whole response has been recieved, so we just print it out here
            response.on('end', function () {
              console.log(str);
              str.indexOf("context\":\"");
              str.indexOf("\",\"NodeId");  
              XiaoiResContext =  str.substring(str.indexOf("context\"\:\"")+10,str.indexOf("\",\"image"));               
              XiaoiResImage =  str.substring(str.indexOf("image\"\:\"")+8,str.indexOf("\",\"jid"));               
              
              obj = JSON.parse(str);
              console.log("json result==" + obj.context);
              console.log("XiaoiResContext==" +XiaoiResContext);
              console.log("XiaoiResImage==" +XiaoiResImage);
              
              // 判斷回傳為文字、圖片、音樂 
              // Replay by text
              if(XiaoiResImage == ""){
               event.reply([
                     { 
                       type: 'text', 
                       text: XiaoiResContext 
                     },
                ]);
              }
              // Replay by image
              else{
                  _botReplayImg();
                  console.log('回傳結果:'+ XiaoiResImage);
              }
            });
          }
          http.request(options, callback).end();
      }   
    }
  });

}

function _botReplayImg(){
  bot.pushImageMessage('XpG8kKwKvxksC53+j3ItKuPEu62mKDLD6ykPHWF+vu0g3kMVJGQ0KwVhanREDjqDReW5t2weJiH6JuuLcG1zolOnG9mzsd99Nyq1H7glsPuLX5PbXPOKBpIm5UyMw4na9tMcR6lCX1VF729mRwgG+AdB04t89/1O/w1cDnyilFU=', 'http://i.imgur.com/xjTET8v.jpg', 'https://sdl-stickershop.line.naver.jp/stickershop/v1/product/1179553/iphone/main@2x.png');
}

function _getJSON() {
  clearTimeout(timer);
  getJSON('http://opendata2.epa.gov.tw/AQX.json', function(error, response) {
    response.forEach(function(e, i) {
      pm[i] = [];
      pm[i][0] = e.SiteName;
      pm[i][1] = e['PM2.5'] * 1;
      pm[i][2] = e.PM10 * 1;
    });
  });
  timer = setInterval(_getJSON, 1800000); //每半小時抓取一次新資料
}
