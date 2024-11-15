function call_so_name(str) {
  Java.perform(function() {
      // 获取 'com.stub.StubApp' 类的引用
      var Class = Java.use('com.stub.StubApp');
      
      // 指定要调用的静态方法 'getString2'
      var Method = 'getString2';
      
      // 调用该方法，并传入参数 str
      var result = Class[Method](str);
      
      // 打印返回结果
      console.log('name:' + result);  // 示例输出: so_name:cryptoDD
  });
}

function call() {
  Java.perform(function() {
      var hashMap = Java.use("java.util.HashMap");
      hashMap.put.implementation = function (a, b) {
      if(a!=null && a.equals("sign")){ 
          console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Throwable").$new()))
          console.log("hashMap.put: ", a, b);
      }
      return this.put(a, b);
    }
    });
  }

function hook_md5_crypt(){
  Java.perform(function(){
      var ByteString = Java.use("com.android.okhttp.okio.ByteString");
      var Base64 = Java.use("android.util.Base64");
      var Class = Java.use('com.luckincoffee.safeboxlib.CryptoHelper'); 
      var Method = 'md5_crypt';
      Class[Method].implementation = function(){
          console.log('****md5加密*****');
          var result = this[Method]['apply'](this,arguments);
          console.log('arg1:'+ByteString.of(arguments[0]).utf8());
          console.log('arg2:'+arguments[1]);
          console.log('result_sign:'+ByteString.of(result).utf8());   
          return result;
      }
  })
}
function hook_android_dlopen_ext() {
    Interceptor.attach(Module.findExportByName(null, "android_dlopen_ext"),
        {
            onEnter: function (args) {
                this.fileName = args[0].readCString()
                console.log(`dlopen onEnter: ${this.fileName}`)
            }, onLeave: function(retval){
                console.log(`dlopen onLeave fileName: ${this.fileName}`)
            }
        }
    );
}

function main(){ 
  // 使用 Java.perform 来执行我们的方法
  Java.perform(function(){
    // call_so_name("30491");  // 调用 test 函数
    // call();
    hook_md5_crypt();
  });
}

// 使用 setImmediate 启动整个脚本
setImmediate(main);