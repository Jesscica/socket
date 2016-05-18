// //引入http模块
// var http = require('http'),
//     //创建一个服务器
//     server = http.createServer(function(req, res) {
//     res.writeHead(200, {
//         'Content-Type': 'text/html' //将返回类型由text/plain改为text/html
//     });
//     res.write('<h1>hello world!</h1>'); //返回HTML标签
//     res.end();
// });
// //监听80端口
// server.listen(80);
// console.log('server started');

var express = require("express"),
	app = express(),
	server = require("http").createServer(app),
	io = require("socket.io").listen(server),
	users = [];//引入socket.io模块并绑定到服务器
app.use('/',express.static(__dirname + '/www'));
server.listen(80,"0.0.0.0");



//socket部分
io.on('connection', function(socket) {
      socket.emit('open');//通知客户端已连接

  // 打印握手信息
  // console.log(socket.handshake);
    socket.on('login', function(nickname) {//登陆
        //将消息输出到控制台
        if(users.indexOf(nickname)>-1){
        	socket.emit('nickExisted');

        }
        else{
        	socket.userIndex = users.length;
            socket.nickname = nickname;
        	users.push(nickname);
        	socket.emit('loginSuccess');//自己
        	io.sockets.emit('system',nickname,users.length, 'login');//io指整个socket通知
        	// socket.broadcast.emit('foo')，指除了自己
        }
    });

    socket.on('send', function(message) {//发送消息
    	socket.broadcast.emit('chat', socket.nickname, message);
		socket.emit('chat', socket.nickname, message,'me');//自己
	});

    socket.on('disconnect', function(nickname) {//下线
		users.splice(socket.userIndex, 1);
		console.log(users);
		socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
	});

	//接收用户发来的图片
	socket.on('img', function(imgData) {
		//通过一个newImg事件分发到除自己外的每个用户
		socket.broadcast.emit('newImg', socket.nickname, imgData);
	});
    
});

