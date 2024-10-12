function hookTest1(){
    Java.perform(function(){
        //打印导入表
        var imports = Module.enumerateImports("lib52pojie.so");
        for(var i =0; i < imports.length;i++){
            if(imports[i].name == "vip"){
                console.log(JSON.stringify(imports[i])); //通过JSON.stringify打印object数据
                console.log(imports[i].address);
            }
        }
        //打印导出表
        var exports = Module.enumerateExports("lib52pojie.so");
        for(var i =0; i < exports.length;i++){
            console.log(JSON.stringify(exports[i]));
        }

    })
}

function hookTest2(){
    Java.perform(function(){
        //根据导出函数名打印地址
        var helloAddr = Module.findExportByName("lib52pojie.so","Java_com_zj_wuaipojie_util_SecurityUtil_vipLevel");
        // console.log(helloAddr); 
        if(helloAddr != null){
            //Interceptor.attach是Frida里的一个拦截器
            Interceptor.attach(helloAddr,{
                //onEnter里可以打印和修改参数
                onEnter: function(args){  //args传入参数
                    var JNIEnv = Java.vm.getEnv();
                    var originalStrPtr = JNIEnv.getStringUtfChars(args[2], null).readCString();        
                    console.log("参数:", originalStrPtr);
                    var modifiedContent = "至尊";
                    var newJString = JNIEnv.newStringUtf(modifiedContent);
                    args[2] = newJString;                                
                },
                //onLeave里可以打印和修改返回值
                onLeave: function(retval){  //retval返回值
                    var returnedJString = Java.cast(retval, Java.use('java.lang.String'));
                    console.log("返回值:", returnedJString.toString());
                    var JNIEnv = Java.vm.getEnv();
                    var modifiedContent = "无敌" + returnedJString;
                    var newJString = JNIEnv.newStringUtf(modifiedContent);
                    retval.replace(newJString);
                }
            })
        }
    })
}

function hookTest3(){
    // 打印基址
    var moduleAddr1 = Process.findModuleByName("lib52pojie.so").base;  
    var moduleAddr2 = Process.getModuleByName("lib52pojie.so").base;  
    var moduleAddr3 = Module.findBaseAddress("lib52pojie.so"); 
    console.log(moduleAddr1)
    console.log(moduleAddr2)
    console.log(moduleAddr3)
}

function hookTest4(){
    Java.perform(function(){
        //根据导出函数名打印基址
        var soAddr = Module.findBaseAddress("lib52pojie.so");
        console.log(soAddr);
        var funcaddr = soAddr.add(0x1071C);  
        console.log(funcaddr);
        if(funcaddr != null){
            Interceptor.attach(funcaddr,{
                onEnter: function(args){  //args参数

                },
                onLeave: function(retval){  //retval返回值
                    console.log(retval.toInt32());
                }
            })
        }
    })
}

function hook_Java_com_zj_wuaipojie_util_SecurityUtil_diamondNum() {
    let base_addr = Module.findBaseAddress("lib52pojie.so");

    Interceptor.attach(base_addr.add(0x1071C), {
        onEnter: function(args) {
            console.log(`onEnter Java_com_zj_wuaipojie_util_SecurityUtil_diamondNum`);
        }, onLeave: function(retval) {
            console.log(`onLeave Java_com_zj_wuaipojie_util_SecurityUtil_diamondNum ${retval}`);
        }
    });
}

function hook_dlopen() {
    var dlopen = Module.findExportByName(null, "dlopen");
    Interceptor.attach(dlopen, {
        onEnter: function (args) {
            var so_name = args[0].readCString();
            if (so_name.indexOf("lib52pojie.so") >= 0) this.call_hook = true;
        }, onLeave: function (retval) {
            if (this.call_hook) hookTest2();
        }
    });
    // 高版本Android系统使用android_dlopen_ext
    var android_dlopen_ext = Module.findExportByName(null, "android_dlopen_ext");
    Interceptor.attach(android_dlopen_ext, {
        onEnter: function (args) {
            var so_name = args[0].readCString();
            if (so_name.indexOf("lib52pojie.so") >= 0) this.call_hook = true;
        }, onLeave: function (retval) {
            if (this.call_hook) hookTest2();
        }
    });
}

function hookTest5(){
    Java.perform(function(){
        //根据导出函数名打印地址
        var helloAddr = Module.findExportByName("lib52pojie.so","Java_com_zj_wuaipojie_util_SecurityUtil_vipLevel");
        // console.log(helloAddr); 
        if(helloAddr != null){
            //Interceptor.attach是Frida里的一个拦截器
            Interceptor.attach(helloAddr,{
                //onEnter里可以打印和修改参数
                onEnter: function(args){  //args传入参数                          
                },
                //onLeave里可以打印和修改返回值
                onLeave: function(retval){  //retval返回值
                    var returnedJString = Java.cast(retval, Java.use('java.lang.String'));
                    console.log("返回值：" + returnedJString.toString());
                    var file_path = "/data/user/0/com.zj.wuaipojie/test.txt";
                    var file_handle = new File(file_path, "wb");
                    if (file_handle && file_handle != null) {
                            file_handle.write(returnedJString.toString()); //写入数据
                            file_handle.flush(); //刷新
                            file_handle.close(); //关闭
                            console.log("写入成功！")
                }
            }
            })
        }
    })
}

function inline_hook() {
    var soAddr = Module.findBaseAddress("lib52pojie.so");
    console.log("gogogo")
    if (soAddr) {
        var func_addr = soAddr.add(0x10428);
        Java.perform(function () {
            Interceptor.attach(func_addr, {
                onEnter: function (args) {
                    console.log(JSON.stringify(this.context))
                    console.log(this.context.x22); //注意此时就没有args概念了
                    // this.context.x22 = ptr(1); //赋值方法参考上一节课
                    // console.log(this.context.x22)
                },
                onLeave: function (retval) {
                }
            }
            )
        })
    }
}


function hookTest6(){
    Java.perform(function(){
        //根据导出函数名打印地址
        var soAddr = Module.findBaseAddress("lib52pojie.so");
        var codeAddr = Instruction.parse(soAddr.add(0x10428));
        console.log(codeAddr.toString());
    })
}


function hookTest7(){
    Java.perform(function(){
        //根据导出函数名打印地址
        console.log("gogogo");
        var funcAddr = Module.findBaseAddress("lib52pojie.so").add(0xE85C);
        //声明函数指针
        //NativeFunction的第一个参数是地址，第二个参数是返回值类型，第三个[]里的是传入的参数类型(有几个就填几个)
        var aesAddr = new NativeFunction(funcAddr , 'pointer', ['pointer', 'pointer']);
        var encry_text = Memory.allocUtf8String("OOmGYpk6s0qPSXEPp4X31g==");    //开辟一个指针存放字符串       
        var key = Memory.allocUtf8String('wuaipojie0123456'); 
        console.log(aesAddr(encry_text ,key).readCString());
    })
}

function main(){
    Java.perform(function(){
        hookTest7();
    });
}
setImmediate(main);