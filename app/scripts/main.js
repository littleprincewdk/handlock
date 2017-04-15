$(function(){
    var $Grid=$('#grid');
    var CANVAS_SIZE=$Grid.width(),
        CANVAS_OFFSET=$Grid.offset(),
        GRID_ITEM_NUM=9;
    var password=[];
    var defaults={
        gridItemSize:0.5,
        gridItemDotSize:0.3,
        gridItemBorderWidth:4,
        gridItemBorderColor:'#fafafa',
        gridItemDotColor:'#fafafa',
        lineWidth:10,
        lineColor:'#fafafa',
        doneGridItemDotColor:'#91ddff',
        doneLineColor:'#91ddff'
    };
    var gridItemSize=CANVAS_SIZE/3;
    defaults.gridItemSize=defaults.gridItemSize*gridItemSize;
    defaults.gridItemDotSize=defaults.gridItemDotSize*gridItemSize;

    var canvas=document.getElementById('grid');
    canvas.width=CANVAS_SIZE;
    canvas.height=CANVAS_SIZE;
    var context=canvas.getContext('2d');

    //当前绘制状态
    var drawState={};
    drawState.isStart=false;
    drawState.x=0;
    drawState.y=0;
    drawState.lastX=0;
    drawState.lastY=0;
    drawState.index=0;
    //web端事件
    $Grid
        .on('mousedown',startEvent)
        .on('mouseup',endEvent)
        .on('mousemove',moveEvent);
    //移动端事件
    canvas.addEventListener('touchstart',startEvent,false);
    canvas.addEventListener('touchend',endEvent,false);
    canvas.addEventListener('touchmove',moveEvent,false);

    //网格渐渐显现
    context.globalAlpha=0;
    var countAlpha=0;
    var showTimer=setInterval(function(){
        countAlpha+=20;
        context.globalAlpha=countAlpha/1000;
        context.clearRect(0,0,CANVAS_SIZE,CANVAS_SIZE);
        drawGrid();
        if(context.globalAlpha===1){
            clearInterval(showTimer);
        }
    },20);

    //开始手势
    function startEvent(e){
        drawState.isStart=true;
        repaint();
    }
    //结束手势
    function endEvent(e){
        drawState.isStart=false;
        if(password.length>0){//输入了密码
            repaint();

            //手势完成,判断密码是否正确
            var pd=localStorage.getItem('password');
            if(pd!==null){
                if(pd.toString()===password.toString()){
                    alert('密码正确');
                }else{
                    alert('密码不正确');
                }
            }else{
                localStorage.setItem('password',password);
                alert('密码设置成功');
            }
            //密码清空
            password=[];
        }
    }
    //手势绘制中
    function moveEvent(e){
        if(drawState.isStart){
            if(e.type.indexOf('touch')>-1){
                e = e.touches[0]||e.changedTouches[0];
            }
            var x=e.clientX-CANVAS_OFFSET.left;
            var y=e.clientY-CANVAS_OFFSET.top;
            var index=getIndexByPosition(x,y);
            var position=getPositionByIndex(index);
            if(Math.sqrt((x-position.x)*(x-position.x)+(y-position.y)*(y-position.y))<defaults.gridItemSize/2){//在某网格中
                if(password.indexOf(index)===-1){
                    password.push(index);

                    drawState.lastX=position.x;
                    drawState.lastY=position.y;
                }
            }
            if(password.length>0){//画连接线
                repaint();
                drawLine(drawState.lastX,drawState.lastY,x,y);
            }
        }
    }
    //重绘,并根据password绘制已输入的密码
    function repaint(){
        context.clearRect(0,0,CANVAS_SIZE,CANVAS_SIZE);
        //画网格
        drawGrid();
        //画连接线
        for(var i=0,len=password.length;i<len;i++){
            var position=getPositionByIndex(password[i]);
            //画dot
            drawGridItemDot(position.x,position.y);
            //画连接线
            if(i!==0){
                drawLine(drawState.lastX,drawState.lastY,position.x,position.y);
            }
            drawState.lastX=position.x;
            drawState.lastY=position.y;
        }
    }
    //画网格
    function drawGrid(){
        context.save();
        context.strokeStyle=defaults.gridItemBorderColor;
        context.lineWidth=defaults.gridItemBorderWidth;
        for(var i=0;i<GRID_ITEM_NUM;i++){
            var x=(i%3*2+1)*(gridItemSize/2);
            var y=(parseInt(i/3)*2+1)*(gridItemSize/2);

            drawGridItem(x,y);
        }
        context.restore();
    }
    //画圆圈
    function drawGridItem(x,y){
        context.beginPath();
        context.arc(x,y,defaults.gridItemSize/2,0,Math.PI*2);
        context.stroke();
        context.closePath();
    }
    //画中心的实心点
    function drawGridItemDot(x,y){
        context.save();
        context.beginPath();

        context.fillStyle=drawState.isStart?defaults.gridItemDotColor:defaults.doneGridItemDotColor;
        context.arc(x,y,defaults.gridItemDotSize/2,0,Math.PI*2);
        context.fill();

        context.closePath();
        context.restore();
    }
    //画连接线
    function drawLine(x1,y1,x2,y2){
        context.save();
        context.beginPath();

        context.strokeStyle=drawState.isStart?defaults.lineColor:defaults.doneLineColor;
        context.lineWidth=defaults.lineWidth;
        context.lineCap='round';
        context.moveTo(x1,y1);
        context.lineTo(x2,y2);
        context.stroke();

        context.closePath();
        context.restore();
    }
    //通过位置获取网格下表
    function getPositionByIndex(index){
        var i=(index-1)%3;
        var j=parseInt((index-1)/3);

        return {
            x:(i*2+1)*gridItemSize/2,
            y:(j*2+1)*gridItemSize/2
        };
    }
    //通过网格下标获取网格中心点位置
    function getIndexByPosition(x,y){
        var i=parseInt(x/gridItemSize);
        var j=parseInt(y/gridItemSize);
        return j*3+i+1;
    }
});
