# 导入需要的库
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import frida, sys
import uvicorn

# 创建FastAPI应用实例
app = FastAPI()

# 定义一个GET请求的路由'/download-images/'
@app.get("/download-images/")
def download_images():
    # 定义处理frida消息的回调函数
    def on_message(message, data):
        message_type = message['type']
        if message_type == 'send':
            print('[* message]', message['payload'])
        elif message_type == 'error':
            stack = message['stack']
            print('[* error]', stack)
        else:
            print(message)

    # Frida脚本代码，用于在目标应用内部执行
    jsCode = """
    function getinfo(){
        var result = [];
        Java.perform(function(){
            Java.choose("com.zj.wuaipojie.ui.ChallengeNinth",{
                onMatch:function(instance){
                    instance.setupScrollListener(); // 调用目标方法
                },
                onComplete:function(){}
            });

            Java.choose("com.zj.wuaipojie.entity.ImageEntity",{
                onMatch:function(instance){
                    var name = instance.getName();
                    var cover = instance.getCover();
                    result.push({name: name, cover: cover}); // 收集数据
                },
                onComplete:function(){}
            });
        });
        return result; // 返回收集的结果
    }
    rpc.exports = {
        getinfo: getinfo // 导出函数供外部调用
    };
    """

    # 使用frida连接到设备并附加到指定进程
    process = frida.get_usb_device().attach("wuaipojie")
    # 创建并加载Frida脚本
    script = process.create_script(jsCode)
    script.on("message", on_message)  # 设置消息处理回调
    script.load()  # 加载脚本
    getcovers = script.exports.getinfo()  # 调用脚本中的函数获取信息
    print(getcovers)

    # 返回获取的信息作为JSON响应
    return JSONResponse(content=getcovers)

# 主入口，运行FastAPI应用
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)  # 使用uvicorn作为ASGI服务器启动应用