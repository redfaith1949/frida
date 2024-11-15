// 获取 RegisterNatives 函数的内存地址，并赋值给addrRegisterNatives。
var addrRegisterNatives = null;
var symbols = Module.enumerateSymbolsSync("libart.so");
for (var i = 0; i < symbols.length; i++) {
    var symbol = symbols[i];
    if (symbol.name.indexOf("art") >= 0 &&
        symbol.name.indexOf("JNI") >= 0 &&
        symbol.name.indexOf("RegisterNatives") >= 0 &&
        symbol.name.indexOf("CheckJNI") < 0) {

        addrRegisterNatives = symbol.address;
        console.log("RegisterNatives is at ", symbol.address, symbol.name);
        break
    }
}
if (addrRegisterNatives) {
    Interceptor.attach(addrRegisterNatives, {
        onEnter: function (args) {
            var env = args[0];        // jni对象
            var java_class = args[1]; // 类
            var class_name = Java.vm.tryGetEnv().getClassName(java_class);
            var taget_class = "com.luckincoffee.safeboxlib.CryptoHelper";   //111 某个类中动态注册的so
            if (class_name === taget_class) {
                console.log("\n[RegisterNatives] method_count:", args[3]);
                var methods_ptr = ptr(args[2]);
                var method_count = parseInt(args[3]);
                for (var i = 0; i < method_count; i++) {
                    // Java中函数名字的
                    var name_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3));
                    // 参数和返回值类型
                    var sig_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3 + Process.pointerSize));
                    // C中的函数内存地址
                    var fnPtr_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3 + Process.pointerSize * 2));
                    var name = Memory.readCString(name_ptr);
                    var sig = Memory.readCString(sig_ptr);
                    var find_module = Process.findModuleByAddress(fnPtr_ptr);
                    // 地址、偏移量、基地址
                    var offset = ptr(fnPtr_ptr).sub(find_module.base);
                    console.log('class_name:',class_name,"name:", name, "sig:", sig,'module_name:',find_module.name ,"offset:", offset);
                }
            }
        }
    });
}
