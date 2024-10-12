//定义一个名为hookTest1的函数
function hookTest1(){
    //获取一个名为"类名"的Java类，并将其实例赋值给JavaScript变量utils
    var utils = Java.use("com.zj.wuaipojie.Demo");
    //修改"类名"的"method"方法的实现。这个新的实现会接收两个参数（a和b）
    utils.a.implementation = function(str){
    //将参数a和b的值改为123和456。
    // a = 123;
    // b = 456;
    str = "特权"
    //调用修改过的"method"方法，并将返回值存储在`retval`变量中
    var retval = this.a(str);
    //在控制台上打印参数a，b的值以及"method"方法的返回值
    console.log(str, retval);
    //返回"method"方法的返回值
    return retval;
}
}

// .overload()
// .overload('自定义参数')
// .overload('int')
function hookTest2(){
    var utils = Java.use("com.zj.wuaipojie.Demo");
    //overload定义重载函数，根据函数的参数类型填
    utils.Inner.overload('com.zj.wuaipojie.Demo$Animal','java.lang.String').implementation = function(a, b){
        b = "aaaaaaaaaa";
        this.Inner(a,b);
        console.log(b);
    }
}

function hookTest3(){
    var utils = Java.use("com.zj.wuaipojie.Demo");
    //修改类的构造函数的实现，$init表示构造函数
    utils.$init.overload('java.lang.String').implementation = function(str){
        console.log(str);
        str = "52";
        this.$init(str);
    }
}

function hookTest4(){
    Java.perform(function(){
        //静态字段的修改
        var utils = Java.use("com.zj.wuaipojie.Demo");
        //修改类的静态字段"flag"的值
        utils.staticField.value = "我是被修改的静态变量";
        console.log(utils.staticField.value);
        //非静态字段的修改
        //使用`Java.choose()`枚举类的所有实例
        Java.choose("com.zj.wuaipojie.Demo", {
            onMatch: function(obj){
                    //修改实例的非静态字段"_privateInt"的值为"123456"，并修改非静态字段"privateInt"的值为9999。
                obj._privateInt.value = "123456"; //字段名与函数名相同 前面加个下划线
                obj.privateInt.value = 9999;
            },
            onComplete: function(){

            }
        });
    });

}

function hookTest5(){
    Java.perform(function(){
        //内部类
        var innerClass = Java.use("com.zj.wuaipojie.Demo$innerClass");
        console.log(innerClass);
        innerClass.$init.implementation = function(){
            console.log("eeeeeeee");
        }

    });
}

function hookTest6(){
    let Demo = Java.use("com.zj.wuaipojie.Demo");
    Demo["setPublicInt"].implementation = function (i) {
    console.log('setPublicInt is called' + ', ' + 'i: ' + i);
    let ret = this.setPublicInt(i);
    console.log('setPublicInt ret value is ' + ret);
    return ret;
    };
}




function main(){
    Java.perform(function(){
        hookTest6();
    });
}
setImmediate(main);