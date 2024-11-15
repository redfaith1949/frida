// from https://xz.aliyun.com/t/16185?time__1311=GuD%3D7IqjOx%2FD78G7DyCm3i%3DeGQC3itbT4D

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
    hook_android_dlopen_ext();
  });
}

// 使用 setImmediate 启动整个脚本
setImmediate(main);