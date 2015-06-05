(function($) {
    function create_cookie(name, value, path) {
        var date = new Date();
        var expires = new Date( (new Date()).getTime() + ( 86400 - 3600*date.getHours() - 60*date.getMinutes() - date.getSeconds()) );
        document.cookie = name + '=' + value + ';' +
            'expires=' + expires + ';' +
            'path=' + path + ';';
    }

    //read cookies
    function read_cookie(name) {
        var cookie_value = "",
            current_cookie = "",
            name_expr = name + "=",
            all_cookies = document.cookie.split(';'),
            n = all_cookies.length;

        for(var i = 0; i < n; i++) {
            current_cookie = all_cookies[i].trim();
            if(current_cookie.indexOf(name_expr) === 0) {
                cookie_value = current_cookie.substring(name_expr.length, current_cookie.length);
                break;
            }
        }
        return cookie_value;
    }

    $(function(){
        var REFRESH_LIMIT = 99;
        var TIMER_4_REFRESH = 60 * 5 * 1000;
        var stateKey, eventKey, refreshTimer, hasFocus, stopRefresh = false, windowEvent = '';
        var keys = {
            hidden: "visibilitychange",
            webkitHidden: "webkitvisibilitychange",
            mozHidden: "mozvisibilitychange",
            msHidden: "msvisibilitychange"
        };

        for (stateKey in keys) {
            if (stateKey in document) {
                eventKey = keys[stateKey];
                break;
            }
        }


        ////core////
        function stopTimer() {
            clearInterval(refreshTimer);
        }

        function startTimer(event) {
            stopTimer();
            if (event) {
                //console.log(event.type);
                windowEvent = event.type;
            }
            console.log('isFocus ~ ' + document.hasFocus() + ' + ' + document.hidden);
            if (stopRefresh) return;
            refreshTimer = setInterval(refreshOrNotRefresh,5000);
        }

        function stopDetect() {
            document.removeEventListener(eventKey, startTimer, false);
            $("input, textarea").off('keyup.refresh keypress.refresh');
            stopRefresh = true;
        }

        function refreshOrNotRefresh () {

           // console.log(!hasFocus && (document.visibilityState === 'hidden' || windowEvent === 'blur'));
            if (!hasFocus && (document.visibilityState === 'hidden' || windowEvent === 'blur')) {
                refresh();
            } else {
                stopTimer()
            }
        }

            ///refresh///
            function refresh(){
                var valCookie = read_cookie('reload_page');
                var num = 0;
                num = parseInt(valCookie);
                if (isNaN(num)) num = 0;
                if(num <= REFRESH_LIMIT){
                    num = num + 1;
                    create_cookie('reload_page', num, "/");
                    location.reload(true);
                } else {
                    stopDetect();
                }
            }

        //////events//////
        function initEvents () {
            ///form active///
            $("input, textarea").bind("keyup.refresh keypress.refresh", function(e) {
                var editSTR = this.value;
                hasFocus = ($.trim(editSTR) !== '')?true:false;
            });

            ////tab focus///
            document.addEventListener(eventKey, startTimer);

            ///window focus///
            var notIE = (document.documentMode === undefined),
                isChromium = window.chrome;

            if (notIE && !isChromium) {

                // for Firefox and NON IE Chrome
                $(window).on("focusin", function() {
                    stopTimer();
                }).on("focusout", function() {
                    if (!hasFocus) {
                        startTimer({type: 'blur'});
                    }
                });

            } else {

                if (window.addEventListener) {

                    window.addEventListener("focus", function(event) {
                        stopTimer();
                    }, false);

                    window.addEventListener("blur", function(event) {
                        if (!hasFocus) {
                            startTimer(event);
                        }
                    }, false);

                } else {

                    window.attachEvent("focus", function(event) {
                        stopTimer();
                    });

                    window.attachEvent("blur", function(event) {
                        if (!hasFocus) {
                            startTimer(event);
                        }
                    });
                }
            }
        }


        /////start/////
        var currentURL = window.location.href;
        if( currentURL.indexOf( "/tests/" ) !== -1 ) { ///not for tests

        } else {
            initEvents();
            console.log(document.hasFocus(), document.hidden);
            if (typeof document.hasFocus === 'function' || document.hidden)
                if (!document.hasFocus() || document.hidden) {
                    startTimer({type: 'blur'});
                }
        }
    })
})(jQuery);