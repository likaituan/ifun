let os = require('os');

//获取本机IP
exports.getMyIp = function(){
    try{
        var ips = os.networkInterfaces();
        for(var k in ips) {
            if(/en|eth/.test(k)) {
                var a = ips[k];
                for (var j = 0; j < a.length; j++) {
                    var o = a[j];
                    if (o.family == "IPv4" && o.internal === false) {
                        return o.address;
                    }
                }
            }
        }
    }catch(err){
        console.log({err});
        return "localhost";
    }
};

//获取客户端IP
//代码，第一段判断是否有反向代理IP(头信息：x-forwarded-for)，在判断connection的远程IP，以及后端的socket的IP
exports.getClientIp = function (req) {
    var getIp = function(ip) {
        if(/\d+(\.\d+){3}/.test(ip)){
            return RegExp.lastMatch;
        }
        return "";
    };
    var ip = getIp(req.headers['x-forwarded-for']);
    if(!ip) {
        try {
            ip = getIp(req.connection.remoteAddress);
        } catch (e2) {}
    }
    if(!ip) {
        try {
            ip = getIp(req.socket.remoteAddress);
        } catch (e3) {}
    }
    if(!ip){
        try {
            ip = getIp(req.connection.socket.remoteAddress);
        }catch(e4){
            ip = "";
        }
    }
    return ip || exports.getMyIp();
};
