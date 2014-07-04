/*
 * @require:        zepto.js
 *                  iScroll.js
 *                  doT.js
 * @author:         天明<tianming@mogujie.com>
 * @create:         2014/07/04
 * @description:    滚动页面，无限加载内容，并删掉之前容器的DOM元素
 */

(function ($) {
    'use strict';
    
    var Infinity = function (element, options) {
        this.element = $(element);

        this.pageData = [];      //存储返回后的list数据
        this.startIndex = 0;     //起始位置
        this.mbook = "";         //翻页参数
        this.isEnd = false;      //是否结束
        this.pointer = 0;        //当前页码

        this._init(options);
    };

    Infinity.settings = {  
        ajaxUrl: '',             //请求接口
        container: '.timeline',  //数据容器
        template: '',            //模板
        buffer: 1,               //缓冲参数
        callback: null           //渲染后回调函数
    };

    Infinity.prototype = {

        _init: function (options) {
            
            this.options = $.extend(true, {}, Infinity.settings, options);

            this.template = this.options.template;
            this.buffer = this.options.buffer;
            this.container = this.element.find(this.options.container);
            this.callback = this.options.callback;

            this.scrollView();
            this.bindEvent();
        },

        // 滚动页面
        scrollView: function(){
            var self = this;

            var myScroll = new mScroll(self.element[0],{
                pullUp: '.pull-up',
                downCallBack: function(){
                    self.resetParam();
                    self.probeData();
                },
                upCallBack: function(){
                    if(!self.isEnd){
                        self.getData();
                    }
                }
            });

            self.scroll = myScroll;
            myScroll = null;
        },

        // 绑定事件
        bindEvent: function(){
            var self = this,
                $views = self.element;

            $views.on('scrollend', function(){
                var _timer = null,
                    scrollY = self.scroll.scrollPage.y;
                scrollY = Math.abs(scrollY);

                self.probeData(scrollY);     //首屏判断

                _timer = setTimeout(function(){
                    try{
                        $('.lazy').lazyload.detect();     //检测可视区图片
                    }catch(err){

                    } 
                }, 0);
            });
        },

        // 获取数据
        getData: function(){
            var self = this;

            $.ajax({
                url: self.options.ajaxUrl,
                data: {
                     mbook: self.mbook
                },
                success: function(data) {
                    if(data.status.code === 1001){
                        var content = data.result;
                        //没数据
                        if(content.list.length <= 0 &&  self.startIndex == 0)
                        {
                            self.noContent(); 
                        }

                        self.appendPage(content);
                        self.updateParam(content);

                    }else{
                        console.log("数据格式不对!");
                    }
                },
                error: function() {
                    console.log("网络连接出错，请稍后再试!");
                }
            });
        },

        // 追加数据
        appendPage: function (content){
            var self = this,
                index = self.startIndex;

            var appendStr = "";
            appendStr += "<div class='branch on' data-page="+index+">";
            appendStr += doT.template(self.template)(content);
            appendStr += "</div>";
            
            if(index == 0){
                self.container.html(appendStr);
            }else{
                self.container.append(appendStr);
            }

            self.lazyloadImg();
            self.scroll && self.scroll.refresh();

            //执行回调
            if (self.callback && $.isFunction(self.callback)) {
                self.callback(content, index);
            }
            index = null;
        },

        // 没有内容
        noContent: function(){
            var self = this,
                appendStr = "<div class='no-content'><p>暂无内容</p></div>";
            
            self.element.html(appendStr);

            return;
        },

        // 更新参数
        updateParam: function(content){
            this.mbook = content.mbook;
            this.isEnd = content.isEnd;

            this.startIndex++;
            this.pageData.push({"list":content.list});

            this.hideMore();
        },

        // 重置参数
        resetParam: function(){
            this.pageData = [];
            this.startIndex = 0;
            this.mbook = "";
            this.isEnd = false;
            this.pointer = 0;
        },

        // 最后一页
        hideMore: function(){
            if(this.isEnd){
                this.element.find('.pull-up').hide();
            }
        },

        // 填充容器
        fillPage: function($el, content){
            var self = this;

            var html = doT.template(self.template)(content);
            $el.html(html);
            $el.addClass('on').removeClass('off');

            //再次渲染不使用lazyload
            $el.find('img').each(function(){
                var $this = $(this),
                    imgUrl = $this.attr('data-original');
                
                if(imgUrl && imgUrl!=""){
                    $this.attr('src',imgUrl);
                }
            });
        },

        // 清空容器
        clearPage: function($el) {
            $el.css("height", $el.height());
            $el.addClass('off').removeClass('on');
            $el.empty();
        },

        // 探测数据
        probeData: function(scrollY){
            var self = this,
                position = scrollY+ window.innerHeight/2;

            if(self.pageData.length == 0){
                self.getData();
            }

            var $pages = self.element.find('.branch');
            $pages.each(function(i){
                var box = $(this)[0],
                    height = box.offsetHeight,
                    top = box.offsetTop;

                //获取当前屏幕内指针
                if((position < (top+height) && position>top) ||
                   (scrollY < (top+height) && scrollY>top))
                {
                    self.pointer = parseInt($(this).attr('data-page'));
                }
            });

            var firstPage = self.pointer-self.buffer,
                lastPage = self.pointer+self.buffer;

            if(self.pointer == 0) firstPage = 0;

            console.log('page:'+firstPage+' > '+lastPage);

            self.showScreen(firstPage, lastPage);
        },

        // 显示、隐藏
        showScreen: function(start, end){
            var self = this,
                page = self.pageData.length;

            for(var i=0; i<page; i++){
                var $page = self.element.find('.branch[data-page="'+i+'"]');

                if(i>=start && i<=end){
                    if($page.children().length === 0){
                        self.fillPage($page, self.pageData[i]);
                    }
                }else{
                    if($page.children().length > 0){
                        self.clearPage($page);
                    }
                }
            }
        },

        // 懒加载图片
        lazyloadImg: function () {
            var self = this;

            $('.lazy').lazyload({
                container: self.element,
                innerScroll: true
            });
        }
    }

    window.infinity = Infinity;

})(window.Zepto);