import frida
import sys

# 定义 Frida 脚本
js_code = """
let android_dlopen_ext = Module.findExportByName(null, "android_dlopen_ext");
if (android_dlopen_ext != null) {
    Interceptor.attach(android_dlopen_ext, {
        onEnter: function(args) {
            let so_name = args[0].readCString(); // 获取动态库名称
            if (so_name.indexOf("libapp.so") !== -1) {
                this.hook = true; // 标记 libapp.so 被加载
            }
        },
        onLeave: function(retval) {
            if (this.hook) {
                this.hook = false;
                dlopen_todo(); // 如果 libapp.so 被加载，执行初始化操作
            }
        }
    });
}

// dlopen_todo 函数 - 用于对 libapp.so 进行 hook 或其他初始化操作
function dlopen_todo() {
    const targetModule = Process.findModuleByName("libapp.so");
    if (targetModule !== null) {
        console.log("Found libapp.so, starting initialization...");

        // 获取 libapp.so 模块中的函数符号
        let symbols = targetModule.enumerateExportsSync();
        for (let i = 0; i < symbols.length; i++) {
            let symbol = symbols[i];
            if (symbol.name === "some_function") { // 假设我们要 hook "some_function"
                console.log(`Found function some_function at address: ${symbol.address}`);
                Interceptor.attach(symbol.address, {
                    onEnter: function (args) {
                        console.log("some_function called");
                        // 可以在这里分析传入的参数
                    },
                    onLeave: function (retval) {
                        console.log("some_function returned");
                        // 可以在这里修改返回值
                    }
                });
            }
        }

        // 其他初始化操作，例如修改全局变量、设置断点等
    }
}

// hook_init 函数 - 在 call_constructor 被调用时执行初始化操作
function hook_init() {
    let linker_name = "linker64";
    let already_hook = false;
    let call_constructor_addr = null;
    if (Process.arch.endsWith("arm")) {
        linker_name = "linker"; // 如果是 ARM 架构，使用 linker
    }

    // 查找 call_constructor 函数的地址
    let symbols = Module.enumerateSymbolsSync(linker_name);
    for (let i = 0; i < symbols.length; i++) {
        let symbol = symbols[i];
        if (symbol.name.indexOf("call_constructor") !== -1) {
            call_constructor_addr = symbol.address;
        }
    }

    if (call_constructor_addr != null) {
        console.log(`Found constructor address at ${call_constructor_addr}`);
        Interceptor.attach(call_constructor_addr, {
            onEnter: function (args) {
                if (!already_hook) {
                    const targetModule = Process.findModuleByName("libapp.so");
                    if (targetModule !== null) {
                        already_hook = true;
                        init_todo(); // 目标模块 libapp.so 加载后，执行初始化操作
                    }
                }
            }
        });
    }
}

// init_todo 函数 - 对目标模块进行进一步的 hook 或操作
function init_todo() {
    const targetModule = Process.findModuleByName("libapp.so");
    if (targetModule !== null) {
        console.log("Initializing libapp.so...");

        // 假设我们需要 hook libapp.so 中的一个特定函数
        let symbols = targetModule.enumerateExportsSync();
        for (let i = 0; i < symbols.length; i++) {
            let symbol = symbols[i];
            if (symbol.name === "target_function") { // 假设需要 hook 的函数
                console.log(`Found target_function at address: ${symbol.address}`);
                Interceptor.attach(symbol.address, {
                    onEnter: function (args) {
                        console.log("target_function called");
                        // 分析函数参数或执行其他操作
                    },
                    onLeave: function (retval) {
                        console.log("target_function returned");
                        // 修改函数的返回值，或执行其他清理工作
                    }
                });
            }
        }

        // 可以在这里继续进行其他操作，如修改内存、设置断点等
    }
}
"""

# 启动目标进程
def on_message(message, data):
    print(message)

# 连接到手机设备并启动目标进程
def run_frida(target_pid):
    session = frida.get_usb_device().attach(target_pid)  # 使用 USB 设备连接手机
    script = session.create_script(js_code)  # 创建 Frida 脚本
    script.on('message', on_message)  # 注册回调
    script.load()  # 加载脚本
    print("Script loaded. Hooking started...")

    # 保持脚本运行
    sys.stdin.read()

if __name__ == '__main__':
    target_pid = 22619  # 目标进程 PID，替换为实际的进程 ID
    run_frida(target_pid)
