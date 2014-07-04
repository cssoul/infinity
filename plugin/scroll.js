/*
 * @require:        zepto.js
 *                  iScroll.js
 * @author:         天明<tianming@mogujie.com>
 * @create:         2014/07/04
 * @description:    页面上拉加载更多，下拉刷新
 */

;(function ($) {
    'use strict';
    
    var Scroll = function (element, options) {
        this.element = $(element);
        this._init(options);
    };

    Scroll.settings = {  
        pullDown: '.pull-down',
        pullUp: '.pull-up',
        downCallBack: function(){},
        upCallBack: function(){}
    };

    Scroll.prototype = {

        _init: function (options) {
            var self = this;

            self.options = $.extend(true, {}, Scroll.settings, options);
            var pullDown = self.options.pullDown,
                pullUp = self.options.pullUp;

            self.box           =    self.element;
            self.pullDown      =    $(pullDown);
            self.pullUp        =    $(pullUp);
            self.downCallBack  =    self.options.downCallBack;
            self.upCallBack    =    self.options.upCallBack;

            if(self.scroll) self.destroy();

            self._scrollView();
        },

        _scrollView: function(){
            var self = this,
                $box = self.box,
                $pullDown = self.pullDown,
                $pullUp = self.pullUp;

            var pullDownOffset = $pullDown.height(), pullUpOffset =  $pullUp.height();

            this.scrollPage = new iScroll($box[0], {
                vScrollbar: true,
                useTransition: true,
                hideScrollbar: true,
                topOffset: pullDownOffset,
                onRefresh: function () {
                    if ($pullDown.hasClass('loading')) {
                        $pullDown.removeClass('loading');
                    } else if ($pullUp.hasClass('loading')) {
                        $pullUp.removeClass('loading');
                    }
                },
                onScrollMove: function () {
                    if (this.y > 5 && !$pullDown.hasClass('flip')) {
                        $pullDown.addClass('flip');
                        this.minScrollY = 0;
                    } else if (this.y < 5 && $pullDown.hasClass('flip')) {
                        $pullDown.removeClass('flip');
                        this.minScrollY = -pullDownOffset;
                    } else if (this.y < (this.maxScrollY - 5) && !$pullUp.hasClass('flip')) {
                        $pullUp.addClass('flip');
                        this.maxScrollY = this.maxScrollY;
                    } else if (this.y > (this.maxScrollY + 5) && $pullUp.hasClass('flip')) {
                        $pullUp.removeClass('flip');
                        this.maxScrollY = pullUpOffset;
                    }
                },
                onScrollEnd: function (callBack) {
                    if ($pullDown.hasClass('flip')) {
                        $pullDown.removeClass('flip').addClass('loading');

                        if(self.downCallBack) self.downCallBack();

                    } else if ($pullUp.hasClass('flip')) {
                        $pullUp.removeClass('flip').addClass('loading'); 
                        
                        if(self.upCallBack) self.upCallBack();
                    }

                    $box.trigger('scrollend');  //滚动结束事件
                }
            });
        },

        refresh: function(){
            this.scrollPage.refresh();
        },

        destroy: function(){
            this.scrollPage.destroy();
        },

        scrollTo: function(x, y, time, relative){
            this.scrollPage.scrollTo(x, y, time, relative);
        },

        scrollToElement: function(el,time){
            this.scrollPage.scrollToElement(el,time);
        }
    }

    window.mScroll = Scroll;

})(window.Zepto);