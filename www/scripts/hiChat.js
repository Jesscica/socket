window.onload = function() {
    //实例并初始化我们的hichat程序
    var hichat = new HiChat();
    hichat.init();
};

//定义我们的hichat类
var HiChat = function() {
    this.socket = null;
};

// //
// document.onkeydown=function(event){ 
//     var e = event || window.event || arguments.callee.caller.arguments[0]; 

//向原型添加业务方法
HiChat.prototype = {
    init: function() {//此方法初始化程序
        var that = this;
        //建立到服务器的socket连接
        this.socket = io.connect();
        //监听socket的connect事件，此事件表示连接已经建立
        this.socket.on('connect', function() {
            //连接到服务器后，显示昵称输入框
            document.getElementById('info').textContent = 'get yourself a nickname :)';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        });
        
        //昵称设置的确定按钮
        document.getElementById('loginBtn').addEventListener('click', function() {
            var nickName = document.getElementById('nicknameInput').value;
            //检查昵称输入框是否为空
            if (nickName.trim().length != 0) {//Trim()是去两边空格的方法
                //不为空，则发起一个login事件并将输入的昵称发送到服务器
                that.socket.emit('login', nickName);
            } else {
                //否则输入框获得焦点
                document.getElementById('nicknameInput').focus();
            };
        }, false);

        //发送消息的确定按钮
        document.getElementById('sendBtn').addEventListener('click', function() {
            var message = document.getElementById('messageInput').value;
            if (message.trim().length != 0) {
                that.socket.emit('send', message);
                document.getElementById('messageInput').value = "";
            } else {
                //否则输入框获得焦点
                document.getElementById('messageInput').focus();
            };
        }, false);


        //上传图片
        document.getElementById('sendImage').addEventListener('change', function() {
            //检查是否有文件被选中
             if (this.files.length != 0) {
                //获取文件并用FileReader进行读取
                 var file = this.files[0],
                     reader = new FileReader();
                 if (!reader) {
                     that._displayNewMsg('system', '!your browser doesn\'t support fileReader', 'red');
                     this.value = '';
                     return;
                 };
                 reader.onload = function(e) {
                    //读取成功，显示到页面并发送到服务器
                     this.value = '';
                     that.socket.emit('img', e.target.result);
                     that._displayImage('me', e.target.result);
                 };
                 reader.readAsDataURL(file);
             };
         }, false);

        this._initialEmoji();
        document.getElementById('emoji').addEventListener('click', function(e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            emojiwrapper.style.display = 'block';
            e.stopPropagation();
        }, false);
        document.body.addEventListener('click', function(e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            if (e.target != emojiwrapper) {
             emojiwrapper.style.display = 'none';
            };
        });
        document.getElementById('emojiWrapper').addEventListener('click', function(e) {
            //获取被点击的表情
            var target = e.target;
            if (target.nodeName.toLowerCase() == 'img') {
                var messageInput = document.getElementById('messageInput');
                messageInput.focus();
                messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
            };
        }, false);

        this.socket.on('system', function(nickName, userCount, type) {
             //判断用户是连接还是离开以显示不同的信息
             var msg = nickName + (type == 'login' ? ' joined' : ' left');
             that._displayNewMsg("system", msg, '#8B8B8B');

             //将在线人数显示到页面顶部
             document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';

        });

        //发送消息
        this.socket.on('chat', function(nickName, message,type) {
            message = message.toString();
            that._displayNewMsg(nickName, message, '#5B5B5B', type); 
        });


        this.socket.on('nickExisted', function() {
            document.getElementById('info').textContent = '!nickname is taken, choose another pls'; //显示昵称被占用的提示
        });

        this.socket.on('loginSuccess', function() {
            document.title = 'hichat | ' + document.getElementById('nicknameInput').value;
            document.getElementById('loginWrapper').style.display = 'none';//隐藏遮罩层显聊天界面
            document.getElementById('messageInput').focus();//让消息输入框获得焦点
        });

        this.socket.on('newImg', function(nickname, imgData) {
           that._displayNewMsg(nickname, imgData);
        });

    },

    _displayNewMsg: function(user, msg, color,type) {
         var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8),
            type = (type == 'me' ? 'msgr' : 'msgl');
        msgToDisplay.style.color = color || '#0101de';
        user = type == 'msgr' ? '' : user;
        msgToDisplay.innerHTML = '<div class=' + type + '>' + user + '<span class="timespan">(' + date + ')</span>' + '<div class="msg">' + msg + ' </div></div>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },

    _displayImage: function(user, imgData, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },

    _initialEmoji: function() {
        var emojiContainer = document.getElementById('emojiWrapper'),
            docFragment = document.createDocumentFragment();
        for (var i = 69; i > 0; i--) {
            var emojiItem = document.createElement('img');
            emojiItem.src = '../../content/emoji/' + i + '.gif';
            emojiItem.title = i;
            docFragment.appendChild(emojiItem);
        };
        emojiContainer.appendChild(docFragment);
    }
};

