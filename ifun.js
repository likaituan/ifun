var cp = require("child_process");
var {isString,isArray} = require("util");

//提示
var log = exports.log = function(message){
    console.log(message);
    //process.argv.indexOf("--show") && console.log(__dirfile);
};

//获取JSON
exports.requireJson = function(file){
    var json;
    try{
        json = require(file);
    }catch(e){
        json = {};
    }
    return json;
};

//spawn封装
//ops类型: String/Array/PlainObject
exports.cmd = function(ops, callback) {
    if(isString(ops) || isArray(ops)){
        ops = {
            text: ops
        };
    }
    var args = ops.text;
    if(isString(args)) {
        args = args.split(/\s+/);
    }
    var cmdName = args.shift();
    if(cmdName=="npm" && process.platform=="win32"){
        cmdName = "npm.cmd"
    }
    ops.stdio = ops.stdio || "inherit";
    ops.shell = ops.shell!==false;

    if(callback) {
        var sp = cp.spawn(cmdName, args, ops);
        sp.on("data", data => {
            log("data:", data.toString());
        });
        sp.on("error", data => {
            log("error:", data.toString());
        });
        sp.on('close', code => {
            callback(code !== 0);
        });
    }else{
        cp.spawnSync(cmdName, args, ops);
    }
};

//spawn封装
exports.spawn_bak = function(cmdExp, callback, dir) {
    var args = cmdExp;
    if(typeof args=="string") {
        args = args.split(/\s+/);
    }
    var cmd = args.shift();
    if(cmd=="npm" && process.platform=="win32"){
        cmd = "npm.cmd"
    }
    var ops = {stdio:"inherit",shell:true};
    if(dir){
        ops.cwd = dir;
    }
    var sp = cp.spawn(cmd, args, ops);
    sp.on("data", data => {
        console.log("error:",data.toString());
    });

    callback && sp.on('close', code => {
        callback(code!==0);
    });
};

//同步执行
exports.cmd_bak = function(cmdExp){
    var sudo = process.platform!="win32"&&process.env.USER!="root" ? "sudo " : "";
    sudo  = !cmdExp.includes("sudo") && cmdExp.includes("npm") && cmdExp.includes("-g") && sudo || "";
    process.argv.indexOf("--show") && log(`cmd: ${cmdExp}`);
    return cp.execSync(sudo + cmdExp).toString().trim();
};

//提示并退出
exports.end = function(message){
    message && log(message);
    process.exit();
};

//获取当前分支
exports.getCurrentBranch = function() {
    try {
        return cp.execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
    } catch (e) {
        return null;
    }
};


//获取本地IP
exports.getLocalIp = function(){
    var ret = [];
    try{
        var ips = os.networkInterfaces();
        for(var k in ips) {
            var a = ips[k];
            for (var j = 0; j < a.length; j++) {
                var o = a[j];
                if (o.family == "IPv4" && o.internal === false) {
                    ret.push(o.address);
                }
            }
        }

    }catch(e){}
    return ret.join("/") || "localhost";
};

//获取参数列表
exports.getArgs = function() {
    var keys = arguments;
    var argv = process.argv.slice(2);
    var args = {};
    args.more = [];

    argv.forEach(function(kv,i){
        kv = kv.split("=");
        var k = kv[0];
        var v = kv[1];
        if(kv.length==2){
            if(/\./.test(k)) {
                exports.parseDot(args,k.split("."),v);
            }else{
                args[k] = v;
            }
        }else if(/^\-\-(\w+)$/.test(k)){
            args[RegExp.$1] = true;
        }else if(/^\-(\w+)$/.test(k)){
            RegExp.$1.split("").forEach(function(k2){
                args[k2] = true;
            });
        }else{
            if(keys[i]){
                args[keys[i]] = true;
            }else {
                args.more.push(k);
            }
        }
    });
    return args;
};

//解析多个.相隔开的key
exports.parseDot = function(args, kk, v){
    var k = kk.shift();
    if(kk.length>0){
        args[k] = args[k] || {};
        exports.parseDot(args[k],kk,v);
    }else{
        args[k] = v;
    }
};

exports.read = function (prompt, callback) {
    process.stdout.write(prompt + ':');
    process.stdin.resume();
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', function(chunk) {
        process.stdin.pause();
        callback(chunk.replace(/[\r\n]/g, ''));
    });
};

Object.assign(exports, require("./ip"));