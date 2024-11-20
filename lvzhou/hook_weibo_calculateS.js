function callcalculateS(){
  Java.perform(function() {
    let WeiboSecurityUtils = Java.use("com.sina.weibo.security.WeiboSecurityUtils");
    let current_application = Java.use('android.app.ActivityThread').currentApplication();
    let arg1 = current_application.getApplicationContext();
    let arg2 = "hello world";
    let arg3 = "123456";
    let ret = WeiboSecurityUtils.$new().calculateS(arg1, arg2, arg3);
    console.log("ret:" + ret);
  })
}


function main(){
  Java.perform(function(){
    callcalculateS();
  });
}


setImmediate(main);