/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

//var MyLayer = cc.Layer.extend({
//    isMouseDown:false,
//    helloImg:null,
//    helloLabel:null,
//    circle:null,
//    sprite:null,
//
//    init:function () {
//
//        //////////////////////////////
//        // 1. super init first
//        this._super();
//
//        /////////////////////////////
//        // 2. add a menu item with "X" image, which is clicked to quit the program
//        //    you may modify it.
//        // ask director the window size
//        var size = cc.Director.getInstance().getWinSize();
//
//        // add a "close" icon to exit the progress. it's an autorelease object
//        var closeItem = cc.MenuItemImage.create(
//            s_CloseNormal,
//            s_CloseSelected,
//            function () {
//                cc.log("close");
//            },this);
//        closeItem.setAnchorPoint(0.5, 0.5);
//
//        var menu = cc.Menu.create(closeItem);
//        menu.setPosition(0, 0);
//        this.addChild(menu, 1);
//        closeItem.setPosition(size.width - 20, 20);
//
//        /////////////////////////////
//        // 3. add your codes below...
//        // add a label shows "Hello World"
//        // create and initialize a label
//        this.helloLabel = cc.LabelTTF.create("Hello World", "Impact", 38);
//        // position the label on the center of the screen
//        this.helloLabel.setPosition(size.width / 2, size.height - 40);
//        // add the label as a child to this layer
//        this.addChild(this.helloLabel, 5);
//
//        // add "Helloworld" splash screen"
//        this.sprite = cc.Sprite.create(s_HelloWorld);
//        this.sprite.setAnchorPoint(0.5, 0.5);
//        this.sprite.setPosition(size.width / 2, size.height / 2);
//        this.sprite.setScale(size.height/this.sprite.getContentSize().height);
//        this.addChild(this.sprite, 0);
//    }
//});

var MyLayer = cc.LayerColor.extend({
    plane:null,
    _bullets:null,
    _targets:null,
    var _score = 0,

    init:function () {
        // 1. super init first
        // 必须调用父类init()方法，很多bug都是由于没有调用父类init()方法造成的
        this._super();
        //用来装子弹的数组
        this._bullets = [];
        //用来装敌机
        this._targets = [];
        // 设置Layer的背景
        this.setColor(cc.c4(126,126,126,126));
        //获得游戏屏幕的尺寸
        var winSize = cc.Director.getInstance().getWinSize();
        //获得屏幕的坐标原点
        var origin = cc.Director.getInstance().getVisibleOrigin();

        // 创建一个飞机，游戏中大部分物体都能使用cc.Sprite表示
        // 飞机的图案按照cc.rect(x,y,width,height）从图片中截取
        // 以（x,y）为左上角，width为宽，height为高的矩形
        //this.plane = cc.Sprite.create(s_Plane,cc.rect(2,168,62,89));
        this.plane = cc.Sprite.create(s_Plane,cc.rect(2,168,62,75));
        // 将飞机设置在屏幕底部，居中的位置
        // 图片的锚点在矩形的中心点，设置的就是这个点的位置
        this.plane.setPosition(cc.p(origin.x + winSize.width/2, origin.y + this.plane.getContentSize().height/2));
        this.addChild(this.plane,1);
        //设置定时器,定时器每隔0.2秒调用依次addBullet方法
        this.schedule(this.addBullet,0.2);
        //添加增加敌机的定时器
        this.schedule(this.addTarget,0.4);
        //添加碰撞监测
        this.schedule(this.updateGame);
        //将层设置为可摸
        this.setTouchEnabled(true);
        return true;
    },

    onTouchesMoved:function(touches,event){
        var touch = touches[0];
        var location = touch.getLocation();
        if(this.onClickFlag){
            this.plane.setPosition(location);
        }
    },

    onTouchesEnded:function(touches, event){
        this.onClickFlag = false;
    },

    onTouchesBegan:function(touches,event){
        var touch = touches[0];
        var location = touch.getLocation();
        if(cc.rectContainsPoint(this.plane.getBoundingBox(),location)){
            this.onClickFlag = true;
        }
    },

    addBullet:function(){

        var winSize = cc.Director.getInstance().getWinSize();
        var origin = cc.Director.getInstance().getVisibleOrigin();
        // 获得飞机的位置
        var planePosition = this.plane.getPosition();
        // 子弹穿越屏幕要花费的秒数
        var bulletDuration = 1;

        // 创建一个子弹
        var bullet = cc.Sprite.create(s_Plane,cc.rect(66,237,7,20));

        // 根据飞机的位置，初始化子弹的位置
        bullet.setPosition(cc.p(planePosition.x,planePosition.y+bullet.getContentSize().height));

        // 一个移动的动作
        // 第一个参数为移动到目标所需要花费的秒数，为了保持速度不变，需要按移动的距离与屏幕高度按比例计算出花费的秒数
        var actionMove = cc.MoveTo.create(bulletDuration * ((winSize.height - planePosition.y - bullet.getContentSize().height/2)/winSize.height),
            cc.p(planePosition.x,
                origin.y + winSize.height + bullet.getContentSize().height/2));
        // 设置一个回调函数，移动完毕后回调spriteMoveFinished（）方法。
        var actionMoveDone = cc.CallFunc.create(this.spriteMoveFinished,this);
        // 让子弹执行动作
        bullet.runAction(cc.Sequence.create(actionMove,actionMoveDone));
        // 为子弹设置标签，以后可以根据这个标签判断是否这个元素为子弹
        bullet.setTag(6);

        this._bullets.push(bullet);
        this.addChild(bullet,0);
    },
    addTarget:function() {
        var target = cc.Sprite.create(s_Plane,cc.rect(201,88,39,27));
        target.setTag(1);
        var winSize = cc.Director.getInstance().getWinSize();

        // 设置敌机随机出现的X轴的值
        var minX = target.getContentSize().width/2;
        var maxX = winSize.width - target.getContentSize().width/2;
        var rangeX = maxX - minX;
        var actualX = Math.random() * rangeX + minX;
        // 在一定范围内随机敌机的速度
        var minDuration = 2.5;
        var maxDuration = 4;
        var rangeDuration = maxDuration - minDuration;
        var actualDuration = Math.random() * rangeDuration + minDuration;

        target.setPosition(cc.p(actualX, winSize.height + target.getContentSize().height/2));

        var actionMove = cc.MoveTo.create(actualDuration ,cc.p(actualX, 0 - target.getContentSize().height));
        var actionMoveDone = cc.CallFunc.create(this.spriteMoveFinished,this);

        target.runAction(cc.Sequence.create(actionMove,actionMoveDone));

        this.addChild(target,1);
        this._targets.push(target);
    },
    updateGame:function(){
        var targets2Delete = [];

        var i ;
        //遍历屏幕上的每个敌机
        for( i in this._targets ){
            //console.log("targetIterator");
            var target = this._targets[ i ];
            // 获得敌机的碰撞矩形
            var targetRect = target.getBoundingBox();

            //add by viviant 160228
            var planeRect = this.plane.getBoundingBox();
            if (cc.rectIntersectsRect(targetRect,planeRect)) {
                alert("score : " + this._score);
                var gameOverScene = GameOverScene.create();// 创建结束场景
                cc.Director.getInstance().replaceScene(cc.TransitionProgressRadialCCW.create(1.2,gameOverScene));  // 场景转换代码
            }
            //add by viviant end

            var bullets2Delete = [];
            // 对于每个敌机，遍历每个屏幕上的子弹，判断是否碰撞
            for(i in this._bullets){
                var bullet = this._bullets[ i ];
                var bulletRect = bullet.getBoundingBox();
                // 判断两个矩形是否碰撞
                if(cc.rectIntersectsRect(bulletRect,targetRect)){
                    // 碰撞则将子弹加入待删除列表
                    bullets2Delete.push(bullet);
                }
            }
            // 如果待删除的子弹数组的内容大于零，说明敌机碰到了子弹，将敌机加入待删除数组
            if(bullets2Delete.length > 0){
                targets2Delete.push(target);
            }

            //删除发生碰撞的每个子弹
            for(i in bullets2Delete){
                var bullet = bullets2Delete[ i ];
                var index = this._bullets.indexOf(bullet);
                if (index > -1) {
                    this._bullets.splice(index, 1);
                }
                this.removeChild(bullet);
            }

            bullets2Delete = null;
        }
        //删除发生碰撞的每个敌机
        for( i in targets2Delete){
            var target = targets2Delete[ i ];

            var index = this._targets.indexOf(target);
            if (index > -1) {
                this._targets.splice(index, 1);
            }

            this.removeChild(target);
            this._score = this._score + 10;
        }

        targets2Delete = null;

    },
    spriteMoveFinished:function(sprite){
        // 将元素移除出Layer
        this.removeChild(sprite, true);
        if(sprite.getTag() == 1) {
            //把目标从数组中移除
            var index = this._targets.indexOf(sprite);
            if (index > -1) {
                this._targets.splice(index, 1);
            }
        } else if(sprite.getTag()==6){
            // 把子弹从数组中移除
            var index = this._bullets.indexOf(sprite);
            if (index > -1) {
                this._bullets.splice(index, 1);
            }
        }
    }
});

var MyScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new MyLayer();
        this.addChild(layer);
        layer.init();
    }
});


