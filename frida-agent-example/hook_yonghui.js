function httpsecurity(){
    // 获取 cn.yonghui.hyd.lib.utils.http.httpmiddware.HttpSecurity 类
    let HttpSecurity = Java.use("cn.yonghui.hyd.lib.utils.http.httpmiddware.HttpSecurity");

    // Hook signParams 方法
    HttpSecurity.signParams.implementation = function(str) {
        console.log("signParams: " + str);  // 打印传入的参数

        // 调用原始的 signParams 方法
        let ret = this.signParams(str);

        console.log("sign: " + ret);  // 打印返回值

        return ret;  // 返回原始的返回值
    };
    /*  
    // Hook signParamsNative 方法
    HttpSecurity.signParamsNative.implementation = function(str){
        console.log("signParamsNative: " + str);
    };
    */

}
  
function main(){ 
    // 使用 Java.perform 来执行我们的方法
    Java.perform(function(){
       httpsecurity();  // 调用 httpsecurity 函数
    });
}

// 使用 setImmediate 启动整个脚本
setImmediate(main);