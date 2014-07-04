(function($) {
    'use strict';

    var Test = function() {};

    Test.prototype = {

        //屏幕宽度
        screenWidth: $(window).width(),

        //屏幕高度 
        screenHeight: $(window).height(), 

        //格式化时间
        formatTime : function(timestamp){
            var date = new Date(parseInt(timestamp * 1000)),
                now = new Date(),
                diffValue = Math.round(now.getTime() / 1000) - timestamp;

            var nowYear = now.getFullYear(),
                nowMonth = now.getMonth() + 1,
                nowDay = now.getDate(),

                thatYear = date.getFullYear(),
                thatMonth = date.getMonth() + 1,
                thatDay = date.getDate(),
                thatHour = date.getHours(),
                thatMinute = date.getMinutes();

            var thatFullMinute = 10 > thatMinute ? "0" + thatMinute : thatMinute;
            var thatFullMonth = 10 > thatMonth ? "0" + thatMonth : thatMonth;
            var result;

            if(diffValue < 0){
                result = "刚刚";  // error time
            } else if(nowYear === thatYear && nowMonth === thatMonth) {
                if (nowDay === thatDay) {
                    if (diffValue < 3600) {
                        if (parseInt(diffValue/60) == 0) {
                            result = "刚刚";
                        } else {
                            result = parseInt(diffValue/60) + "分前";
                        }
                    } else {
                        result = "今天 " + thatHour + ":" + thatFullMinute;
                    }
                } else if(nowDay === thatDay + 1){
                    result = "昨天 " + thatHour + ":" + thatFullMinute;
                } else if(nowDay === thatDay + 2){
                    result = "前天 " + thatHour + ":" + thatFullMinute;
                } else {
                    result = thatFullMonth + "/" + thatDay + " " + thatHour + ":" + thatFullMinute;
                }
            } else if (nowYear === thatYear && nowMonth !== thatMonth){
                result = thatFullMonth + "/" + thatDay + " " + thatHour + ":" + thatFullMinute;
            } else {
                result = thatYear + "/ " + thatFullMonth + "/" + thatDay;
            }

            return result;
        }
    };

    window.MGJ = new Test();

})(window.Zepto);


(function($) {
    'use strict';
    
    $(document).ready(function(){
        var wall = new infinity(".scroll-wrap", {
            ajaxUrl: "data.json",             
            template: $('#tpl_timeline').html(),
            buffer: 1,               
            callback: function(content,index){
            }           
        });
    });

})(Zepto);