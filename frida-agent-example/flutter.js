function hook_dlopen() {
    var android_dlopen_ext = Module.findExportByName(null, "android_dlopen_ext");
    Interceptor.attach(android_dlopen_ext, {
        onEnter: function (args) {
            var so_name = args[0].readCString();
            if (so_name.indexOf("libflutter.so") >= 0) this.call_hook = true;
        }, onLeave: function (retval) {
            if (this.call_hook) hookFlutter();
        }
    });
}

function hook_ssl_verify_result(address) {
    Interceptor.attach(address, {
            onEnter: function(args) {
                console.log("Disabling SSL validation")
            },
            onLeave: function(retval) {
                                console.log("Retval: " + retval);
                retval.replace(0x1);
            }
        });
    }
function hookFlutter() {
    var m = Process.findModuleByName("libflutter.so");
    //利用函数前10字节定位
    var pattern = "FF C3 01 D1 FD 7B 01 A9 FC 6F 02 A9FA 67 03 A9 F8 5F 04 A9 F6 57 05 A9 F4 4F 06 A9 08 0A 80 52 48 00 00 39";
    var res = Memory.scan(m.base, m.size, pattern, {
        onMatch: function(address, size){
            console.log('[+] ssl_verify_result found at: ' + address.toString());
        // Add 0x01 because it's a THUMB function
        // Otherwise, we would get 'Error: unable to intercept function at 0x9906f8ac; please file a bug'
            hook_ssl_verify_result(address);
        },
        onError: function(reason){
            console.log('[!] There was an error scanning memory');
        },
        onComplete: function() {
            console.log("All done")
        }
    });
}


let android_dlopen_ext = Module.findExportByName(null, "android_dlopen_ext");
if(android_dlopen_ext != null) {
    Interceptor.attach(android_dlopen_ext, {
        onEnter: function(args) {
            let so_name = args[0].readCString();
            if(so_name.indexOf("libapp.so") !== -1) {
                this.hook = true;
            }
        }, onLeave: function(retval) {
            if(this.hook) {
                this.hook = false;
                dlopen_todo();
            }
        }
    });
}

function dlopen_todo() {
    //todo
}


function hook_init() {
    let linker_name = "linker64";
    let already_hook = false;
    let call_constructor_addr = null;
    if (Process.arch.endsWith("arm")) {
        linker_name = "linker";
    }

    let symbols = Module.enumerateSymbolsSync(linker_name);
    for (let i = 0; i < symbols.length; i++) {
        let symbol = symbols[i];
        if (symbol.name.indexOf("call_constructor") !== -1) {
            call_constructor_addr = symbol.address;
        }
    }

    if (call_constructor_addr != null) {
        console.log(`get construct address ${call_constructor_addr}`);
        Interceptor.attach(call_constructor_addr, {
            onEnter: function (args) {
                if(already_hook === false) {
                    const targetModule = Process.findModuleByName("libapp.so");
                    if (targetModule !== null) {
                        already_hook = true;
                        init_todo();
                    }
                }
            }
        });
    }
}

function hook_ko() {
    var addr = Module.findBaseAddress('libapp.so');     // 基地址
    console.log(`基地址: ${addr}`);
    var funcAddr = addr.add(0xC34D44)                   // 偏移地址0xC34D44
    console.log(`hook地址: ${funcAddr}`);
    
    // 使用 Interceptor.attach 钩住该地址
    Interceptor.attach(funcAddr, {
        onEnter: function (args) {
            console.log("Entering function at address 0xC34D44");
            this.x1 = args[1];
            console.log('args0:',args[0])
            console.log('Arguments:', args);
        },
        onLeave: function (retval) {
            console.log("Leaving function at address 0xC34D44");
            // 你可以在此处修改返回值
            // 例如：修改返回值 retval.replace(123);
            console.log('返回值：', hexdump(retval))
        }
    });
}


function hook_kotaiqiu(){
    // 获取 libapp.so 模块的基地址
    var addr = Module.findBaseAddress('libapp.so');
    console.log(addr); // 输出 libapp.so 模块的基地址，比如：0xb696387d

    // 计算需要 hook 的目标地址
    var funcAddr = addr.add(0xC34D44); // 假设需要 hook 的函数地址是从基地址偏移 0xC34D44（地址偏移值）
    console.log(funcAddr); // 输出计算出的目标函数地址，比如：0xb6980000

    // 使用 Interceptor.attach 来 hook 目标函数
    Interceptor.attach(funcAddr, {
        onEnter: function (args) {
            // 函数进入时的回调，`args` 是传递给目标函数的参数数组

            console.log("hook到了------------------"); // 打印 hook 到的消息

            // 存储 args[1] 到 `this.x1`，用于后续访问
            this.x1 = args[1];

            // 打印不同参数的内容
            console.log('args0:', args[0]); // 打印第一个参数 (args[0])
            console.log('args1:', args[1]); // 打印第二个参数 (args[1])

            console.log('args2:', hexdump(args[2])); 
            console.log('args3:', hexdump(args[3])); 
            console.log('args4:', hexdump(args[4], {length: 1000})); 


            // console.log('args5:',args[5])
            // console.log('args6:',args[6])
            // console.log('args7:',args[4])
            // console.log('args8:',args[8])

            console.log('args2:',hexdump(args[2]))
        },

        // 函数离开时的回调，`retval` 是目标函数返回值
        onLeave: function (retval) {
            console.log("--------------------"); // 输出分隔线，表示函数调用结束

            // 在这里可以读取返回值的内容，并打印出来
            // 假设 retval 是一个指针或内存地址，使用 hexdump 打印它的十六进制数据
            //console.log(Memory.readCString(this.x1));
            //console.log(Memory.readCString(retval));
            console.log('返回值：', hexdump(retval)); // 打印函数的返回值，查看其十六进制内容
        }
    });
}

function hook_updateHash() {
    // 获取 libapp.so 模块基地址
    var addr = Module.findBaseAddress('libapp.so');
    console.log("Base Address:", addr); // 输出模块的基地址
    
    // 计算 `updateHash_c34d44` 函数的地址，假设函数的偏移地址为 0xC34D44
    var funcAddr = addr.add(0xC34D44); 
    console.log("Function Address:", funcAddr); // 输出目标函数的地址
    
    // Hook 函数
    Interceptor.attach(funcAddr, {
        onEnter: function(args) {
            // 打印所有参数的值
            console.log("hook到了------------------");

            // 这里假设参数是通过栈传递的，按顺序打印出来
            console.log('args0:', args[0]);                             // 打印第一个参数 
            console.log('args1:', args[1]);                             // 打印第二个参数 
            console.log('args2:', hexdump(args[2]));                    // 打印第三个参数
            console.log('args3:', hexdump(args[3]));                    // 打印第四个参数 
            console.log('args4:', hexdump(args[4], {length: 1000}));    // 打印第五个参数
            //console.log('args5:', hexdump(args[5], {length: 64}));    // 打印第六个参数
            //console.log('args6:', hexdump(args[6], {length: 64}));    // 打印第七个参数
            //console.log('args7:', hexdump(args[7], {length: 64}));    // 打印第八个参数
        },
        onLeave: function(retval) {
            // 可以在这里进一步处理返回值
            console.log("--------------------");
            console.log('返回值:', hexdump(retval));
        }
    });
}

function hook_updateHash_test() {
    // 获取 libapp.so 模块基地址
    var addr = Module.findBaseAddress('libapp.so');
    console.log("Base Address:", addr); // 输出模块的基地址
  
    // 计算 `updateHash_c34d44` 函数的地址，假设函数的偏移地址为 0xC34D44
    var funcAddr = addr.add(0xC34D44); 
    console.log("Function Address:", funcAddr); // 输出目标函数的地址
  
    // Hook 函数
    Interceptor.attach(funcAddr, {
      onEnter: function(args) {
        console.log("hook------------------");
  
        // 动态打印所有参数，直到没有更多参数为止
        for (var i = 0; i < args.length; i++) {
          if (args[i] === undefined) {
            break;  // 如果没有更多参数，跳出循环
          }
          console.log('args' + i + ':', hexdump(args[i], {length: 64}));
        }
      },
      onLeave: function(retval) {
        console.log("--------------------");
        console.log('返回值:', hexdump(retval, {length: 64}));
      }
    });
  }

Java.perform(function (){
    var hashMap = Java.use("java.util.HashMap");
    hashMap.put.implementation = function (a, b) {
    if(a!=null && a.equals("sign")){ 
        console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Throwable").$new()))
        console.log("hashMap.put: ", a, b);
    }
    return this.put(a, b);
}
})

// 调用函数来进行 Hook
hook_updateHash();


function main(){
    Java.perform(function(){
        hook_updateHash_test();
    });
}

setImmediate(main);