'use strict';

/* Controllers */

var phmControllers = angular.module('phmControllers', []);

//login page
phmControllers.controller('LoginCtrl', ['$scope', '$rootScope', '$location', '$http', 'userState',
    function($scope, $rootScope, $location, $http, userState) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'valid') $location.path('/main');
        });

        $rootScope.hideFooter = true;
        $scope.hideLogin = '';
        angular.element(document).ready(function() {
            //	document.addEventListener("deviceready", function(){
            $scope.username = window.localStorage.getItem("user");
            $scope.password = window.localStorage.getItem("pass");
            $scope.checked = window.localStorage.getItem("checked");
        });

        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - login page';

        // callback for ng-click 'login':
        $scope.login = function() {
            if (!$('#trueTakanon').is(':checked')) {
                alert('יש לאשר תנאי שימוש');
                return false;
            }
            if ($.trim($('#username').val()).length == 0) {
                alert('יש להזין שם משתמש');
                return false;
            }
            if ($.trim($('#password').val()).length == 0) {
                alert('יש להזין סיסמא');
                return false;
            }
            //added ver 23
            if (window.localStorage.getItem("conf") != '1') {
                var conf = confirm('נא אשר כי הנך בגיר מעל גיל 18');
                if (!conf) return false;
            }
            window.localStorage.setItem("user", $('#username').val());
            window.localStorage.setItem("pass", $('#password').val());
            window.localStorage.setItem("checked", 1);
            //added ver 23
            window.localStorage.setItem("conf", '1');

            $rootScope.dispOverlay = 'show';
            var url = Jbase + 'index.php?option=com_k2&view=item&layout=item&id=1&tmpl=app&username=' + $scope.username + '&password=' + $scope.password + '&Itemid=188&callback=JSON_CALLBACK';

            $http({
                method: 'jsonp',
                url: url
            }).
            success(function(data, status) {
                $rootScope.dispOverlay = 'hide';
                if (!data) {
                    $scope.message = 'יש להזין שם משתמש וסיסמה תקינים';
                    return false;
                }
                if (data.authenticated == true) {
                    $scope.message = 'החיבור בוצע בהצלחה, אנא המתן';
                    //	$location.path('/main');
                    $scope.hideLogin = 'hideLogin';
                    if (data.poll !== null) {
                        $location.path('/poll/' + data.poll);
                    } else {
                        $location.path('/loading');
                    }
                } else {
                    $scope.message = 'יש להזין שם משתמש וסיסמה תקינים';
                }
            }).
            error(function(data, status, headers, config) {
                $rootScope.dispOverlay = 'hide';
                $scope.message = 'יש להזין שם משתמש וסיסמה תקינים';
            });
        };

        // callback for ng-click 'terms':
        $scope.terms = function() {
            //added ver 23
            $rootScope.dispOverlay = 'show';
            var url = Jbase + 'index.php?option=com_k2&view=item&layout=item&id=2&tmpl=app&Itemid=188&callback=JSON_CALLBACK';

            $http({
                method: 'jsonp',
                url: url
            }).
            success(function(data, status) {
                //console.log(data);
                angular.element('#terms_container h1').html(data.title);
                angular.element('#terms_container p').html(decodeURIComponent(data.intro));
                angular.element('#terms_container').fadeIn();
                angular.element('#closeLb').show();
                //added ver 23
                $rootScope.dispOverlay = 'hide';
            }).
            error(function(data, status, headers, config) {
                $scope.message = 'error: ' + status + ' data: ' + data;
            });
        };

        $scope.closeLb = function() {
            angular.element('#terms_container').fadeOut();
            angular.element('#closeLb').hide();
        }
    }
]);

//loading
phmControllers.controller('LoadingCtrl', ['$scope', '$rootScope', '$location', '$http', '$timeout', 'userState',
    function($scope, $rootScope, $location, $http, $timeout, userState) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'valid') {
                $location.path('/main');
                $timeout.cancel(timer);
                return false;
            }
        });

        $rootScope.hideFooter = true;

        var countUp = function() {
            location.reload();
        }

        var timer = $timeout(countUp, 2000);
    }
]);


//poll form
phmControllers.controller('pollCtrl', ['$scope', '$rootScope', '$location', '$http', '$routeParams',
    function($scope, $rootScope, $location, $http, $routeParams) {
        $rootScope.$watch('state', function() {
            $rootScope.state = $rootScope.state;
        });
        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - poll page';

        $rootScope.hideFooter = true;
        var url = Jbase + 'index.php?option=com_phm&view=poll&id=' + $routeParams.itemId + '&layout=json&tmpl=app&Itemid=188&callback=JSON_CALLBACK';

        $http({
                method: 'jsonp',
                url: url,
                cache: true
            })
            .success(function(data, status) {
                $rootScope.dispOverlay = 'hide';
                console.log(data);
                $scope.data = data;
            }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
        });
    }
]);

//poll save
phmControllers.controller('savePollCtrl', ['$scope', '$rootScope', '$location', '$http', '$element',
    function($scope, $rootScope, $location, $http, $element) {

        $scope.save = function() {
            var url = Jbase + 'index.php?option=com_phm&task=poll.save&tmpl=app&Itemid=188&' + $element.serialize() + '&callback=JSON_CALLBACK';
            $http({
                method: 'jsonp',
                url: url
            }).
            success(function(data, status) {
                $rootScope.state = 'valid';
                $location.path('/main');
            }).
            error(function(data, status) {
                $location.path('/main');
            });
        }
    }
]);

//main page
phmControllers.controller('MainCtrl', ['$scope', '$rootScope', 'userState', '$location', '$http', '$filter',
    function($scope, $rootScope, userState, $location, $http, $filter) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });
        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - Main page';

        var url = Jbase + 'index.php?tmpl=main&callback=JSON_CALLBACK';
        $rootScope.hideFooter = true;
        $http({
            method: 'jsonp',
            url: url,
            cache: true
        }).
        success(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log(data);
            $scope.data = data;
            $scope.end_date = data.end_date;

            if (data.end_date)
                angular.element(document).ready(function() {
                    // var  TargetDate = $filter('date')(data.end_date, "MM/dd/yyyy");;
                    // var  CountStepper = -1;
                    // var SetTimeOutPeriod = (Math.abs(CountStepper)-1)*1000 + 990;
                    // var dthen = new Date(TargetDate);
                    // var dnow = new Date();
                    // if(CountStepper>0)
                    // var  ddiff = new Date(dnow-dthen);
                    // else
                    // var  ddiff = new Date(dthen-dnow);
                    // var gsecs = Math.floor(ddiff.valueOf()/1000);
                    // CountBack(data.end_date);
                    $scope.DisplayStr = CountBack(data.end_date);
                });
                else
                $scope.DisplayStr = CountBack(null);
        }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
        });

        $scope.openMenu = false;
        $scope.toggleMenu = function() {
            $scope.$emit('toggleSlideMenu', $scope.openMenu = !$scope.openMenu);
        };

        $scope.logout = function() {
            var url = Jbase + 'index.php?option=com_k2&view=item&layout=item&id=1&tmpl=app&logout=9&callback=JSON_CALLBACK';

            $http({
                method: 'jsonp',
                url: url
            }).
            success(function(data, status) {

            }).
            error(function(data, status, headers, config) {
                $rootScope.dispOverlay = 'hide';
                $scope.message = 'error: ' + status + ' data: ' + data;
            });
            $rootScope.state = 'invalid';
            $location.path('/login');
        };

        $scope.$on('slideMenuToggled', function(event, isOpen) {
            $scope.openMenu = isOpen;
        });

    }
]);

//winners page
phmControllers.controller('winnersCtrl', ['$scope', '$rootScope', 'userState', '$filter', '$http',
    function($scope, $rootScope, userState, $filter, $http) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });
        $rootScope.hideFooter = false;
        $rootScope.activeFooter = 'winners';
        $rootScope.footerUrl = function() {
            return 'templates/gallery_footer.html';
        }
        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - Winners page';

        var url = Jbase + 'index.php?option=com_phm&view=leaguewinnersplaces&layout=json&tmpl=app&Itemid=188&callback=JSON_CALLBACK';

        $http({
            method: 'jsonp',
            url: url,
            cache: true
        }).
                                          success(function(data, status) {
                                                  $rootScope.dispOverlay = 'hide';
                                                  if(data[0].name == null){
                                                  $scope.comming_soon = 'comming_soon';
                                                  $scope.data = null;
                                                  }
                                                  else {
                                                  var orderBy = $filter('orderBy');
                                                  $scope.data = data;
                                                  $scope.order = function(predicate, reverse) {
                                                  $scope.data = orderBy($scope.data, predicate, reverse);
                                                  };
                                                  $scope.order('place',false);
                                                  
                                                  }
                                                  // console.log(data);
                                                  }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log('error: '+status);
        });

        $scope.openMenu = false;
        $scope.toggleMenu = function() {
            $scope.$emit('toggleSlideMenu', $scope.openMenu = !$scope.openMenu);
        };

        $scope.$on('slideMenuToggled', function(event, isOpen) {
            $scope.openMenu = isOpen;
        });

    }
]);

//4 keys page
phmControllers.controller('KeysCtrl', ['$scope', '$rootScope', 'userState', '$location', '$http',
    function($scope, $rootScope, userState, $location, $http) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });
        $rootScope.dispOverlay = 'show';
        $rootScope.hideFooter = true;
        $scope.pagetitle = 'מפתחות להצלחה';
        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - 4 Keys page';

        var url = Jbase + 'index.php?option=com_phm&view=keys&layout=json&tmpl=app&Itemid=188&callback=JSON_CALLBACK';

        $http({
            method: 'jsonp',
            url: url,
            cache: true
        }).
        success(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            $scope.data = data;
        }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log('error: '+status);
        });
        $scope.openMenu = false;
        $scope.toggleMenu = function() {
            $scope.$emit('toggleSlideMenu', $scope.openMenu = !$scope.openMenu);
        };

        $scope.$on('slideMenuToggled', function(event, isOpen) {
            $scope.openMenu = isOpen;
        });
        //	$scope.openMenu = function(){


    }
]);

//contact page
phmControllers.controller('contactCtrl', ['$scope', '$rootScope', 'userState', '$location', '$http',
    function($scope, $rootScope, userState, $location, $http) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });
        $rootScope.dispOverlay = 'show';
        $rootScope.hideFooter = true;
        $scope.pagetitle = 'צור קשר';
        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - Contact page';

        var url = Jbase + 'index.php?option=com_phm&view=profiles&layout=json&tmpl=app&Itemid=188&callback=JSON_CALLBACK';

        $http({
            method: 'jsonp',
            url: url,
            cache: true
        }).
        success(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            $scope.data = data;
            //console.log(data);
        }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log('error: '+status);
        });
        $scope.openMenu = false;
        $scope.toggleMenu = function() {
            $scope.$emit('toggleSlideMenu', $scope.openMenu = !$scope.openMenu);
        };

        $scope.$on('slideMenuToggled', function(event, isOpen) {
            $scope.openMenu = isOpen;
        });


    }
]);

//league intro page
phmControllers.controller('LeagueCtrl', ['$scope', '$rootScope', 'userState', '$http', '$location', '$routeParams',
    function($scope, $rootScope, userState, $http, $location, $routeParams) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });
        $rootScope.hideFooter = false;
        $rootScope.activeFooter = 'league';
        $rootScope.footerUrl = function() {
            return 'templates/league_footer.html';
        }
        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - League intro page';

        $rootScope.dispOverlay = 'show';
        $scope.pagetitle = 'שיא השיאים';
        $rootScope.dispOverlay = 'show';
        var url = Jbase + 'index.php?option=com_phm&view=league&id=' + $routeParams.leagueId + '&layout=json&tmpl=app&Itemid=188&callback=JSON_CALLBACK';

        $http({
                method: 'jsonp',
                url: url,
                cache: true
            })
            .success(function(data, status) {
                $rootScope.dispOverlay = 'hide';
                console.log(data);
                $scope.data = data;
                //	var description = decodeURIComponent(data.league.description);
                //	angular.element('.description').html(description);
                $rootScope.dispOverlay = 'hide';
            }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log('error: '+status);
            $rootScope.dispOverlay = 'hide';
        });

        $scope.openMenu = false;
        $scope.toggleMenu = function() {
            $scope.$emit('toggleSlideMenu', $scope.openMenu = !$scope.openMenu);
        };

        $scope.$on('slideMenuToggled', function(event, isOpen) {
            $scope.openMenu = isOpen;
        });


    }
]);

//activity page
phmControllers.controller('activityCtrl', ['$http', '$location',
    function($http, $location) {
        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - Activity page';

        var url = Jbase + 'index.php?option=com_phm&view=keys&tmpl=activity&Itemid=188&callback=JSON_CALLBACK';
        $http({
                method: 'jsonp',
                url: url,
                cache: true
            })
            .success(function(data, status) {
                switch (data.assign) {
                    case 0:
                        $location.path('/league/1');
                        break;
                    case 1:
                        $location.path('/league/knowledge');
                        break;
                    case 2:
                        $location.path('/league/messages');
                        break;
                    case 3:
                        $location.path('/league/sales');
                        break;
                    case 4:
                        $location.path('/filter');
                        break;
                }
            }).
        error(function(data, status) {
            //console.log('error: '+status);
        });
    }
]);

//league scores page
phmControllers.controller('LgScoreCtrl', ['$scope', '$rootScope', 'userState', '$http', '$routeParams', '$location',
    function($scope, $rootScope, userState, $http, $routeParams, $location) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });
        $scope.pagetitle = 'נקודות';
        $rootScope.hideFooter = false;
        $rootScope.activeFooter = 'score';
        $rootScope.footerUrl = function() {
            return 'templates/league_footer.html';
        }
        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - League score page';

        $scope.class = 'gifts_page';
        $rootScope.dispOverlay = 'show';
        var url = Jbase + 'index.php?option=com_phm&view=league&id=' + $routeParams.leagueId + '&layout=score_json&tmpl=app&Itemid=188&callback=JSON_CALLBACK';

        $http({
            method: 'jsonp',
            url: url,
            cache: true
        })


        .success(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log(data);
            $scope.data = data;
            var total = 0;
            var message_score = 0;
            var knowledge_score = 0;
            if (data.messages != null) {
                $.each(data.messages, function(inx, el) {
                    if (el.messages.values)
                        $.each(el.messages.values, function(indx, ele) {
                            var scr = ele[indx].split('~');
                            message_score = message_score + parseInt(scr[1]);
                            //fix - count total
                            total += parseInt(scr[1]);
                        })
                });
            }
            if (data.knowledge != null) {
                $.each(data.knowledge, function(inx, el) {
                    if (el.knowledge.score && el.knowledge.score > 0)
                        total += parseInt(el.knowledge.score);
                });
            }
            if (data.sales.sale != null) {
                if (data.sales.sale.score)
                    total += parseInt(data.sales.sale.score);
            }

            $scope.message_score = message_score;
            $scope.total = total;
        }).

        /*
         .success(function(data, status) {
         $rootScope.dispOverlay = 'hide';
         //console.log(data);
         $scope.data = data;
         var total = 0;
         var message_score = 0;
         var knowledge_score = 0;
         if(data.messages != null){
         $.each(data.messages, function(inx, el){
         if(el.messages.values)
         $.each(el.messages.values, function(indx, ele){
         var scr = ele[indx].split('~');
         message_score = message_score + parseInt(scr[1]);
         
         })
         });
         total += parseInt(message_score);
         }
         if(data.knowledge != null){
         $.each(data.knowledge, function(inx, el){
         if(el.knowledge.score && el.knowledge.score > 0)
         total += parseInt(el.knowledge.score);
         });
         }
         if(data.sales.sale != null){
         if(data.sales.sale.score)
         total += parseInt(data.sales.sale.score);
         }
         
         $scope.message_score = message_score;
         $scope.total = total;
         }).
         */
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log('error: '+status);
        });

        $scope.openMenu = false;
        $scope.toggleMenu = function() {
            $scope.$emit('toggleSlideMenu', $scope.openMenu = !$scope.openMenu);
        };

        $scope.$on('slideMenuToggled', function(event, isOpen) {
            $scope.openMenu = isOpen;
        });


    }
]);

//league sales goals
phmControllers.controller('LgSalesCtrl', ['$scope', '$rootScope', 'userState', '$location', '$http', '$filter',
    function($scope, $rootScope, userState, $location, $http, $filter) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });
        $scope.pagetitle = 'פעילויות הליגה';
        $rootScope.hideFooter = false;
        $rootScope.activeFooter = 'activity';
        $rootScope.footerUrl = function() {
            return 'templates/league_footer.html';
        }
        $rootScope.dispOverlay = 'show';
        var url = Jbase + 'index.php?option=com_phm&view=salesgoalss&layout=json&tmpl=app&Itemid=188&callback=JSON_CALLBACK';
        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - league sales page';

        $http({
            method: 'jsonp',
            url: url,
            cache: true
        }).
        success(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log(data);
            if (typeof data !== 'undefined' && data.length > 0) {
                $scope.data = data;
                $scope.family_sells = parseInt((data[0].family_sells) ? data[0].family_sells : 0);
                $scope.family_goal = parseInt((data[0].family_goal) ? data[0].family_goal : 0);
                $scope.p1_sells = parseInt((data[0].p1_sells) ? data[0].p1_sells : 0);
                $scope.p1_goal = parseInt((data[0].p1_goal) ? data[0].p1_goal : 0);
                $scope.p2_sells = parseInt((data[0].p2_sells) ? data[0].p2_sells : 0);
                $scope.p2_goal = parseInt((data[0].p2_goal) ? data[0].p2_goal : 0);
                $scope.p3_sells = parseInt((data[0].p3_sells) ? data[0].p3_sells : 0);
                $scope.p3_goal = parseInt((data[0].p3_goal) ? data[0].p3_goal : 0);
                angular.element(document).ready(function() {
                //    var TargetDate = $filter('date')(data[0].end, "MM/dd/yyyy HH:mm:ss");;
                //    var CountStepper = -1;
                    //    var SetTimeOutPeriod = (Math.abs(CountStepper)-1)*1000 + 990;
                //    var SetTimeOutPeriod = 99000;
                //    var dthen = new Date(TargetDate);
                //    var dnow = new Date();
                //    if (CountStepper > 0)
                //        var ddiff = new Date(dnow - dthen);
                //    else
                //        var ddiff = new Date(dthen - dnow);
                //    var gsecs = Math.floor(ddiff.valueOf() / 1000);
                //    $scope.DisplayStr = CountBack(gsecs);
                                                if(data[0].endtime)
                                                $scope.DisplayStr = CountBack(data[0].endtime);
                });
            } else {
                $scope.message = 'No data found';
            }

        }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log('error: '+status);
        });
        $scope.openMenu = false;
        $scope.toggleMenu = function() {
            $scope.$emit('toggleSlideMenu', $scope.openMenu = !$scope.openMenu);
        };

        $scope.$on('slideMenuToggled', function(event, isOpen) {
            $scope.openMenu = isOpen;
        });


    }
]);

//league Masseges goals
phmControllers.controller('LgMessagesCtrl', ['$scope', '$rootScope', 'userState', '$location', '$http', '$filter',
    function($scope, $rootScope, userState, $location, $http, $filter) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });
        $scope.pagetitle = 'פעילויות הליגה';
        $rootScope.hideFooter = false;
        $rootScope.activeFooter = 'activity';
        $rootScope.footerUrl = function() {
            return 'templates/league_footer.html';
        }
        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - league Masseges page';

        $rootScope.dispOverlay = 'show';
        var url = Jbase + 'index.php?option=com_phm&view=messagings&layout=json&tmpl=app&Itemid=188&callback=JSON_CALLBACK';

        $http({
            method: 'jsonp',
            url: url,
            cache: true
        }).
        success(function(data, status) {

            //console.log(data);
            if (data !== 0) {
                $scope.data = data;
                angular.element(document).ready(function() {
                    var TargetDate = $filter('date')(data.end, "MM/dd/yyyy HH:mm:ss");;
                    var CountStepper = -1;
                    //     var SetTimeOutPeriod = (Math.abs(CountStepper)-1)*1000 + 990;
                    var SetTimeOutPeriod = 99000;
                    var dthen = new Date(TargetDate);
                    var dnow = new Date();
                    if (CountStepper > 0)
                        var ddiff = new Date(dnow - dthen);
                    else
                        var ddiff = new Date(dthen - dnow);
                    var gsecs = Math.floor(ddiff.valueOf() / 1000);
                    $scope.DisplayStr = CountBack(gsecs);
                    $rootScope.dispOverlay = 'hide';
                });
            } else {
                $scope.message = 'No data found';
            }

        }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log('error: '+status);
            $scope.message = 'No data found';
        });

        $scope.openMenu = false;
        $scope.toggleMenu = function() {
            $scope.$emit('toggleSlideMenu', $scope.openMenu = !$scope.openMenu);
        };

        $scope.$on('slideMenuToggled', function(event, isOpen) {
            $scope.openMenu = isOpen;

        });


    }
]);

//league Knolegde goals
phmControllers.controller('LgKnowledgeCtrl', ['$scope', '$rootScope', 'userState', '$location', '$http', '$filter',
    function($scope, $rootScope, userState, $location, $http, $filter) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });
        $scope.pagetitle = 'פעילויות הליגה';
        $rootScope.dispOverlay = 'show';
        $rootScope.hideFooter = false;
        $rootScope.activeFooter = 'activity';
        $rootScope.footerUrl = function() {
            return 'templates/league_footer.html';
        }
        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - league Knolegde page';

        var url = Jbase + 'index.php?option=com_phm&view=knowledges&layout=json&tmpl=app&Itemid=188&callback=JSON_CALLBACK';

        $scope.gotoquiz = function($id) {
            var chk = $('.demos input:checked').val();
            if (!chk) {
                alert('יש לבחור אחת מהאפשרויות!');
                return false;
            } else if (chk != 3) {
                alert('האפשרות שנבחרה אינה נכונה!');
                return false;
            }
            $location.path('/league/quiz/' + $id);
        }

        $http({
            method: 'jsonp',
            url: url,
            cache: true
        }).
        success(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            console.log(data);
            if (data.knoledge.id !== null) {
                $scope.data = data;
                $scope.time = data.knoledge.microtime_format;
                $scope.date = data.knoledge.datetime.split(' ');
                $scope.status = 'knowledge';
            } else {
                $scope.data = data;
                $scope.status = 'startQuiz';
            }
            $scope.description = decodeURIComponent(data.assign.description);

            angular.element(document).ready(function() {
                $scope.DisplayStr = CountBack(data.assign.end_time);

            });
        }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log('error: '+status);
            //console.log(data);
            $location.path('/main');
            $scope.message = 'No data found';
        });
        $scope.openMenu = false;
        $scope.toggleMenu = function() {
            $scope.$emit('toggleSlideMenu', $scope.openMenu = !$scope.openMenu);
        };

        $scope.$on('slideMenuToggled', function(event, isOpen) {
            $scope.openMenu = isOpen;
        });


    }
]);

//league quiz page
phmControllers.controller('LgQuizCtrl', ['$scope', '$rootScope', 'userState', '$location', '$http', '$filter', '$routeParams',
    function($scope, $rootScope, userState, $location, $http, $filter, $routeParams) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });
        $scope.pagetitle = 'פעילויות הליגה';
        $rootScope.dispOverlay = 'show';
        var url = Jbase + 'index.php?option=com_phm&view=quiz&id=' + $routeParams.quizId + '&layout=json&tmpl=app&Itemid=188&callback=JSON_CALLBACK';
        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - league quiz page';

        $http({
            method: 'jsonp',
            url: url,
            cache: true
        }).
        success(function(data, status) {
            //console.log(data);
            $rootScope.dispOverlay = 'hide';
            $scope.data = data;
        }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //	$location.path('/league/knowledge');
        });
    }
]);

//league quiz form
phmControllers.controller('QuizFormCtrl', ['$scope', '$location', '$http', '$element',
    function($scope, $location, $http, $element) {
        $scope.save = function() {

            //	console.log($element);
            var checked = 0;
            $('.radios').each(function(i, el) {
                if (!$('input:checked', this).val())
                    checked++;
            });
            if (checked > 0) {
                alert('יש לענות על כל השאלות');
                return false;
            }
            var url = Jbase + 'index.php?option=com_phm&task=quiz.mobile_save&tmpl=app&Itemid=188&' + $element.serialize() + '&callback=JSON_CALLBACK';
            $http({
                method: 'jsonp',
                url: url,
                cache: true
            }).
            success(function(data, status) {
                $location.path('/league/knowledge');
            }).
            error(function(data, status) {
                $scope.message = 'No data found';
            });
        }
    }
]);


//league filter
phmControllers.controller('LgFilterCtrl', ['$scope', '$rootScope', 'userState', '$location', '$http', '$filter',
    function($scope, $rootScope, userState, $location, $http, $filter) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });

        $scope.pagetitle = 'פעילויות הליגה';
        $rootScope.dispOverlay = 'show';
        $rootScope.hideFooter = false;
        $rootScope.activeFooter = 'activity';
        $rootScope.footerUrl = function() {
            return 'templates/league_footer.html';
        }
        var url = Jbase + 'index.php?option=com_phm&view=filter&layout=json&tmpl=app&device=ios&Itemid=188&callback=JSON_CALLBACK';

        $http({
            method: 'jsonp',
            url: url,
            cache: true
        }).
        success(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            console.log(data);
            if (data.done === 1 && data.filter_results.id !== null) {
                $scope.data = data;
                $scope.time = data.filter_results.microtime_format;
                $scope.date = data.filter_results.datetime.split(' ');
                $scope.status = 'done';
            } else {
                $scope.data = data;
                $scope.story = decodeURIComponent(data.filter.story);
                $scope.status = 'startQuiz';
            }


            angular.element(document).ready(function() {
                $scope.DisplayStr = CountBack(data.assign.end_time);

            });
        }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log('error: '+status);
            //console.log(data);
            $location.path('/main');
            $scope.message = 'No data found';
        });
        $scope.openMenu = false;
        $scope.toggleMenu = function() {
            $scope.$emit('toggleSlideMenu', $scope.openMenu = !$scope.openMenu);
        };

        $scope.$on('slideMenuToggled', function(event, isOpen) {
            $scope.openMenu = isOpen;
        });


    }
]);

//league filter start
phmControllers.controller('LgStartfilterCtrl', ['$scope', '$rootScope', '$routeParams', 'userState', '$location', '$http', '$filter',
    function($scope, $rootScope, $routeParams, userState, $location, $http, $filter) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });

        $scope.pagetitle = 'פעילויות הליגה';
        $rootScope.dispOverlay = 'show';
        $rootScope.hideFooter = false;
        $rootScope.activeFooter = 'activity';
        $rootScope.footerUrl = function() {
            return 'templates/league_footer.html';
        }
        var url = Jbase + 'index.php?option=com_phm&view=filter&layout=json&startfromapp=9&id=' + $routeParams.filterId + '&tmpl=app&Itemid=188&callback=JSON_CALLBACK';

        $http({
            method: 'jsonp',
            url: url,
            cache: true
        }).
        success(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            $scope.base = Jbase;
            console.log(data);
            if (data.done === 1 && data.filter_results.id !== null) {
                $location.path('/filter');
            } else {
                // console.log(data);
                $scope.data = data;
                //str.charCodeAt(index) row_1col_1
                var correct1 = 'row_' + (data.filter.option1_row.charCodeAt(0) - 96) + 'col_' + data.filter.option1_col,
                    correct2 = 'row_' + (data.filter.option2_row.charCodeAt(0) - 96) + 'col_' + data.filter.option2_col,
                    correct3 = 'row_' + (data.filter.option3_row.charCodeAt(0) - 96) + 'col_' + data.filter.option3_col,
                    correct4 = 'row_' + (data.filter.option4_row.charCodeAt(0) - 96) + 'col_' + data.filter.option4_col,
                    correct5 = 'row_' + (data.filter.option5_row.charCodeAt(0) - 96) + 'col_' + data.filter.option5_col;
                var pos = new Array(correct1, correct2, correct3, correct4, correct5);
                document.clicks = 0;
                document.correct = 0;
                angular.element(document).ready(function() {
                    $('.grid_image_wrapper input').click(function(e) {
                        // console.log(document.clicks);
                        // console.log(document.correct);
                        document.clicks++;
                        var idX = $(this).attr('id');
                        if ($.inArray(idX, pos) !== -1) {
                            document.correct++;
                            $(this).parent().addClass('correct');
                        } else {
                            $(this).parent().addClass('wrong');
                        }
                        if (document.clicks >= 10) {
                            //get out
                            e.preventDefault();
                            var jform = $('#quizfilter').serializeArray();
                            var url = Jbase + 'index.php?option=com_phm&view=filter&tmpl=app&task=filter_results.val';
                            $.each(jform, function(index, value) {
                                url = url + '&' + value.name + '=' + value.value;
                            });
                            url = url + '&callback=JSON_CALLBACK';

                            $http({
                                method: 'jsonp',
                                url: url,
                                cache: true
                            }).
                            success(function(data, status) {
                                if (document.correct == 5)
                                    $location.path('/filter_done');
                                else
                                    $location.path('/filter_done1');
                            }).
                            error(function(data, status) {
                                $scope.message = 'No data found';
                            });

                            if (document.correct == 5)
                                $location.path('/filter_done');
                            else
                                $location.path('/filter_done1');
                        }
                        if (document.correct == 5) {
                            //get out
                            e.preventDefault();
                            var jform = $('#quizfilter').serializeArray();
                            var url = Jbase + 'index.php?option=com_phm&view=filter&tmpl=app&task=filter_results.val';
                            $.each(jform, function(index, value) {
                                url = url + '&' + value.name + '=' + value.value;
                            });
                            url = url + '&callback=JSON_CALLBACK';

                            $http({
                                method: 'jsonp',
                                url: url,
                                cache: false
                            }).
                            success(function(data, status) {
                                $location.path('/filter_done');
                            }).
                            error(function(data, status) {
                                // $scope.message = 'No data found';
                                $location.path('/filter_done');
                            });

                            //	$location.path('/filter_done');
                        }
                    });
                });

                $scope.story = decodeURIComponent(data.filter.story);
                $scope.status = 'startQuiz';
            }

        }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log('error: '+status);
            //console.log(data);
            $location.path('/main');
            $scope.message = 'No data found';
        });
        $scope.openMenu = false;
        $scope.toggleMenu = function() {
            $scope.$emit('toggleSlideMenu', $scope.openMenu = !$scope.openMenu);
        };

        $scope.$on('slideMenuToggled', function(event, isOpen) {
            $scope.openMenu = isOpen;
        });


    }
]);

//league filter
phmControllers.controller('LgFilter_doneCtrl', ['$scope', '$rootScope', 'userState', '$location', '$http', '$filter',
    function($scope, $rootScope, userState, $location, $http, $filter) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });
        $rootScope.dispOverlay = 'hide';
        $scope.pagetitle = 'פעילויות הליגה';
        $rootScope.hideFooter = false;
        $rootScope.activeFooter = 'activity';
        $rootScope.footerUrl = function() {
            return 'templates/league_footer.html';
        }
        var url = Jbase + 'index.php?option=com_phm&view=filter&layout=json&device=ios&tmpl=app&Itemid=188&callback=JSON_CALLBACK';

        $http({
            method: 'jsonp',
            url: url,
            cache: true
        }).
        success(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            if (data.done === 1 && data.filter_results.id !== null) {
                var time = data.filter_results.microtime_format;
            }


            angular.element(document).ready(function() {
                $scope.time = time;
                $scope.DisplayStr = CountBack(data.assign.end_time);

            });
        }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log('error: '+status);
            //console.log(data);
            $location.path('/main');
            $scope.message = 'No data found';
        });
    }
]);
phmControllers.controller('LgFilter_done1Ctrl', ['$scope', '$rootScope', 'userState', '$location', '$http', '$filter',
    function($scope, $rootScope, userState, $location, $http, $filter) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });
        $rootScope.dispOverlay = 'hide';
        $scope.pagetitle = 'פעילויות הליגה';
        $rootScope.hideFooter = false;
        $rootScope.activeFooter = 'activity';
        $rootScope.footerUrl = function() {
            return 'templates/league_footer.html';
        }
        var url = Jbase + 'index.php?option=com_phm&view=filter&layout=json&device=ios&tmpl=app&Itemid=188&callback=JSON_CALLBACK';

        $http({
            method: 'jsonp',
            url: url,
            cache: true
        }).
        success(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            console.log(data);
            if (data.done === 1 && data.filter_results.id !== null) {
                $scope.data = data;
                $scope.time = data.filter_results.microtime_format;
                $scope.date = data.filter_results.datetime.split(' ');
                $scope.status = 'done';
            } else {
                $scope.data = data;
                $scope.story = decodeURIComponent(data.filter.story);
                $scope.status = 'startQuiz';
            }


            angular.element(document).ready(function() {
                $scope.DisplayStr = CountBack(data.assign.end_time);

            });
        }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log('error: '+status);
            //console.log(data);
            $location.path('/main');
            $scope.message = 'No data found';
        });
    }
]);

//Gifts page
phmControllers.controller('LgGiftsCtrl', ['$scope', '$rootScope', 'userState', '$location', '$http', '$routeParams',
    function($scope, $rootScope, userState, $location, $http, $routeParams) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });
        $rootScope.hideFooter = false;
        $rootScope.activeFooter = 'gift';
        $rootScope.footerUrl = function() {
            return 'templates/league_footer.html';
        }
        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - Gifts page';

        $scope.pagetitle = 'מתנות';
        $scope.category = $routeParams.giftsId;
        $scope.base = Jbase;
        $rootScope.dispOverlay = 'show';
        var url = Jbase + 'index.php?option=com_phm&view=gifts&category=' + $routeParams.giftsId + '&layout=json&tmpl=app&Itemid=188&callback=JSON_CALLBACK';

        $http({
            method: 'jsonp',
            url: url,
            cache: true
        }).
        success(function(data, status) {
            //console.log(data);
            $rootScope.dispOverlay = 'hide';

            $.each(data, function(inx, el) {
                data[inx].title = decodeURIComponent(data[inx].title);
            });

            $scope.data = data;
        }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log('error: '+status);
        });
        $scope.openMenu = false;
        $scope.toggleMenu = function() {
            $scope.$emit('toggleSlideMenu', $scope.openMenu = !$scope.openMenu);
        };

        $scope.$on('slideMenuToggled', function(event, isOpen) {
            $scope.openMenu = isOpen;
        });


    }
]);

//Gift page
phmControllers.controller('LgGiftCtrl', ['$scope', '$rootScope', 'userState', '$location', '$http', '$routeParams',
    function($scope, $rootScope, userState, $location, $http, $routeParams) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });
        $rootScope.dispOverlay = 'show';
        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - Gift page';

        var place = new Array();
        place[1] = 'ראשון';
        place[2] = 'שני';
        place[3] = 'שלישי';
        place[4] = 'רביעי';

        var category = new Array();
        category[1] = 'ספורט';
        category[2] = 'אקסטרים';
        category[3] = 'נופש';
        category[4] = 'בידור';

        $rootScope.hideFooter = false;
        $rootScope.activeFooter = 'gift';
        $rootScope.footerUrl = function() {
            return 'templates/league_footer.html';
        }
        $scope.pagetitle = 'מתנות';
        $scope.base = Jbase;
        var url = Jbase + 'index.php?option=com_phm&view=gift&id=' + $routeParams.giftId + '&layout=json&tmpl=app&Itemid=188&callback=JSON_CALLBACK';

        $http({
            method: 'jsonp',
            url: url,
            cache: true
        }).
        success(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            console.log(data);
            $scope.place = place[data.place];
            $scope.category = category[data.category];
            data.intro = decodeURIComponent(data.intro);
            $scope.data = data;
        }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log('error: '+status);
        });
        $scope.openMenu = false;
        $scope.toggleMenu = function() {
            $scope.$emit('toggleSlideMenu', $scope.openMenu = !$scope.openMenu);
        };

        $scope.$on('slideMenuToggled', function(event, isOpen) {
            $scope.openMenu = isOpen;
        });

        $scope.openOrder = function() {
        angular.element('.linkBtn').hide();
            angular.element('#order_container').fadeIn();
            angular.element('#closeLb').show();
        }
        $scope.closeLb = function() {
            angular.element('#order_container').fadeOut();
            angular.element('#closeLb').hide();
        }

    }
]);

//order form
phmControllers.controller('orderSubmitCtrl', ['$scope', '$rootScope', '$location', '$http', '$element',
    function($scope, $rootScope, $location, $http, $element) {
        $scope.save = function() {
            $rootScope.dispOverlay = 'show';
            //	console.log($element.serialize());
            location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - order form page';

            var err = 0;
            $('.required').each(function(i, el) {
                                if(!$(this).val()){
                                err++;
                                $(this).addClass('error');
                                } else {
                                $(this).removeClass('error');
                                }
            });
            if (err > 0) {
                alert('יש למלא את כל שדות החובה');
                //added ver 23
                $rootScope.dispOverlay = 'hide';
                return false;
            }
$rootScope.dispOverlay = 'show';
            var url = Jbase + 'index.php?option=com_phm&task=gift.orderGift&tmpl=app&Itemid=188&' + decodeURIComponent($element.serialize()) + '&callback=JSON_CALLBACK';
            $http({
                method: 'jsonp',
                url: url,
                cache: true
            }).
            success(function(data, status) {
                $rootScope.dispOverlay = 'hide';
                if (data == 'true') {
                    angular.element('.orderSubmit').hide();
                    angular.element('.linkBtn').hide();
                    angular.element('.hidethis2').hide();
                    angular.element('#hidethisform').hide();
                    $scope.message = 'הזמנתך נקלטה במערכת';
                }
            }).
            error(function(data, status) {
                $rootScope.dispOverlay = 'hide';
                $scope.message = 'No data found';
            });
        }
    }
]);

//Business data - top five
phmControllers.controller('BdataTopfiveCtrl', ['$scope', '$rootScope', 'userState', '$location', '$http',
    function($scope, $rootScope, userState, $location, $http) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });
        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - Business data - top five page';

        $rootScope.hideFooter = false;
        $rootScope.activeFooter = 'top_five';
        $rootScope.footerUrl = function() {
            return 'templates/bdata_footer.html';
        }
        $scope.pagetitle = 'נתונים עסקיים';
        $rootScope.dispOverlay = 'show';
        $rootScope.base = Jbase;
        var url = Jbase + 'index.php?option=com_phm&view=businessdatas5&layout=json&tmpl=app&Itemid=188&callback=JSON_CALLBACK';

        $http({
            method: 'jsonp',
            url: url,
            cache: true
        }).
        success(function(data, status) {
            angular.element(document).ready(function() {
                $rootScope.dispOverlay = 'hide';
            });
            $scope.data = data;
        }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log('error: '+status);
        });
        $scope.openMenu = false;
        $scope.toggleMenu = function() {
            $scope.$emit('toggleSlideMenu', $scope.openMenu = !$scope.openMenu);
        };

        $scope.$on('slideMenuToggled', function(event, isOpen) {
            $scope.openMenu = isOpen;
        });


    }
]);

//Business data - month sales
phmControllers.controller('BdataMonthCtrl', ['$scope', '$rootScope', 'userState', '$location', '$http', '$routeParams',
    function($scope, $rootScope, userState, $location, $http, $routeParams) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });
        $rootScope.hideFooter = false;
        $rootScope.activeFooter = 'month';
        $scope.pagetitle = 'נתונים עסקיים';
        $rootScope.footerUrl = function() {
            return 'templates/bdata_footer.html';
        }
        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - Business data - month sales page';

        $rootScope.dispOverlay = 'show';
     //   var dateX = new Date();
     //   var month = dateX.getMonth() + 1;
      //  if (month <= 9) month = '0' + month;
        //	var month = ($routeParams.month)?$routeParams.month:month;
        if ($routeParams.month)
            var url = Jbase + 'index.php?option=com_phm&view=businessdatas1&month=' + $routeParams.month + '&layout=json&tmpl=app&Itemid=188&callback=JSON_CALLBACK';
        else
            var url = Jbase + 'index.php?option=com_phm&view=businessdatas1&layout=json&tmpl=app&Itemid=188&callback=JSON_CALLBACK';

        $http({
            method: 'jsonp',
            url: url,
            cache: true
        }).
        success(function(data, status) {
            //console.log(data);
            $rootScope.dispOverlay = 'hide';
            $scope.data = data;
            $scope.values = data.values;
        }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log('error: '+status);
        });
        $scope.openMenu = false;
        $scope.toggleMenu = function() {
            $scope.$emit('toggleSlideMenu', $scope.openMenu = !$scope.openMenu);
        };

        $scope.$on('slideMenuToggled', function(event, isOpen) {
            $scope.openMenu = isOpen;
        });


    }
]);

//Business data - year's sales
phmControllers.controller('BdataYearCtrl', ['$scope', '$rootScope', 'userState', '$location', '$http',
    function($scope, $rootScope, userState, $location, $http) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });
        $rootScope.hideFooter = false;
        $rootScope.activeFooter = 'year';
        $rootScope.footerUrl = function() {
            return 'templates/bdata_footer.html';
        }
        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - Business data - year sales page';

        $scope.pagetitle = 'נתונים עסקיים';
        $rootScope.dispOverlay = 'show';
        var url = Jbase + 'index.php?option=com_phm&view=businessdatas2&layout=json&tmpl=app&Itemid=188&callback=JSON_CALLBACK';

        $http({
            method: 'jsonp',
            url: url,
            cache: true
        }).
        success(function(data, status) {
            //console.log(data);
            $rootScope.dispOverlay = 'hide';
            $scope.data = data;
            $scope.values = data.values;
        }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log('error: '+status);
        });
        $scope.openMenu = false;
        $scope.toggleMenu = function() {
            $scope.$emit('toggleSlideMenu', $scope.openMenu = !$scope.openMenu);
        };

        $scope.$on('slideMenuToggled', function(event, isOpen) {
            $scope.openMenu = isOpen;
        });


    }
]);

//About page
phmControllers.controller('aboutCtrl', ['$scope', '$rootScope', 'userState', '$location', '$http',
    function($scope, $rootScope, userState, $location, $http) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });
        $scope.pagetitle = 'אודות';
        $rootScope.hideFooter = false;
        $rootScope.activeFooter = 'about';
        $rootScope.dispOverlay = 'show';
        $rootScope.footerUrl = function() {
            return 'templates/content_footer.html';
        }
        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - About page page';


        var url = Jbase + 'index.php?option=com_k2&view=item&layout=item&id=10&layout=json&tmpl=app&Itemid=188&callback=JSON_CALLBACK';

        $http({
            method: 'jsonp',
            url: url,
            cache: true
        }).
        success(function(data, status) {
            //console.log(data);
            $rootScope.dispOverlay = 'hide';
            $scope.data = data;
            var tab0 = decodeURIComponent(data.tabs[0].field_value);
            var tab1 = decodeURIComponent(data.tabs[1].field_value);
            var tab2 = decodeURIComponent(data.tabs[2].field_value);
            angular.element(document).ready(function() {
                $('#tab0').html(tab0);
                $('#tab1').html(tab1);
                $('#tab2').html(tab2);
            });
        }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log('error: '+status);
        });
        $scope.openMenu = false;
        $scope.toggleMenu = function() {
            $scope.$emit('toggleSlideMenu', $scope.openMenu = !$scope.openMenu);
        };

        $scope.$on('slideMenuToggled', function(event, isOpen) {
            $scope.openMenu = isOpen;
        });


    }
]);

//About philip morris LTD page
phmControllers.controller('aboutPhmCtrl', ['$scope', '$rootScope', 'userState', '$location', '$http',
    function($scope, $rootScope, userState, $location, $http) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });
        $scope.pagetitle = 'אודות';
        $rootScope.hideFooter = false;
        $rootScope.activeFooter = 'about_phm';
        $rootScope.footerUrl = function() {
            return 'templates/content_footer.html';
        }
        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - About philip morris LTD page';

        $scope.base = Jbase;
        $rootScope.dispOverlay = 'show';
        var url = Jbase + 'index.php?option=com_k2&view=item&layout=item&id=11&layout=json&tmpl=app&Itemid=188&callback=JSON_CALLBACK';

        $http({
            method: 'jsonp',
            url: url,
            cache: true
        }).
        success(function(data, status) {
            //console.log(data);
            $rootScope.dispOverlay = 'hide';
            var intro = decodeURIComponent(data.intro);
            angular.element('.contents').html(intro);
            var title = decodeURIComponent(data.title);
            angular.element('.mainTitle').html(title);

            $scope.data = data;
        }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log('error: '+status);
        });
        $scope.openMenu = false;
        $scope.toggleMenu = function() {
            $scope.$emit('toggleSlideMenu', $scope.openMenu = !$scope.openMenu);
        };

        $scope.$on('slideMenuToggled', function(event, isOpen) {
            $scope.openMenu = isOpen;
        });


    }
]);

//pricelist page
phmControllers.controller('pricelistCtrl', ['$scope', '$rootScope', 'userState', '$location', '$http',
    function($scope, $rootScope, userState, $location, $http) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });
        $scope.pagetitle = 'אודות';
        $rootScope.hideFooter = false;
        $rootScope.activeFooter = 'pricelist';
        $rootScope.footerUrl = function() {
            return 'templates/content_footer.html';
        }
        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - pricelist page';

        $rootScope.dispOverlay = 'show';
        var url = Jbase + 'index.php?option=com_k2&view=itemlist&layout=category&task=category&id=5&layout=json&tmpl=app&Itemid=188&callback=JSON_CALLBACK';

        $http({
            method: 'jsonp',
            url: url,
            cache: true
        }).
        success(function(data, status) {
            console.log(data);
            $rootScope.dispOverlay = 'hide';
            if (data.subCategories != null) {
                $.each(data.subCategories, function(inx, el) {
                    data.subCategories[inx].subCategory_name = decodeURIComponent(data.subCategories[inx].subCategory_name);
                    if (el.subCategory_items)
                        $.each(el.subCategory_items, function(indx, ele) {
                            data.subCategories[inx].subCategory_items[indx].title = decodeURIComponent(data.subCategories[inx].subCategory_items[indx].title);
                            data.subCategories[inx].subCategory_items[indx].ex_22 = decodeURIComponent(data.subCategories[inx].subCategory_items[indx].ex_22);
                            data.subCategories[inx].subCategory_items[indx].ex_23 = decodeURIComponent(data.subCategories[inx].subCategory_items[indx].ex_23);
                            data.subCategories[inx].subCategory_items[indx].ex_24 = decodeURIComponent(data.subCategories[inx].subCategory_items[indx].ex_24);
                        })
                });
            }
            $scope.data = data;
        }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log('error: '+status);
        });
        $scope.openMenu = false;
        $scope.toggleMenu = function() {
            $scope.$emit('toggleSlideMenu', $scope.openMenu = !$scope.openMenu);
        };

        $scope.$on('slideMenuToggled', function(event, isOpen) {
            $scope.openMenu = isOpen;
        });


    }
]);

//catalogue page
phmControllers.controller('catelogueCtrl', ['$scope', '$rootScope', 'userState', '$location', '$http',
    function($scope, $rootScope, userState, $location, $http) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });
        $scope.pagetitle = 'אודות';
        $scope.base = Jbase;
        $rootScope.hideFooter = false;
        $rootScope.activeFooter = 'catalogue';
        $rootScope.footerUrl = function() {
            return 'templates/content_footer.html';
        }
        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - catalogue page';

        $rootScope.dispOverlay = 'show';
        var url = Jbase + 'index.php?option=com_k2&view=itemlist&layout=category&task=category&id=11&layout=json&tmpl=app&Itemid=188&callback=JSON_CALLBACK';

        $http({
            method: 'jsonp',
            url: url,
            cache: true
        }).
        success(function(data, status) {
            //console.log(data);
            $rootScope.dispOverlay = 'hide';
            $scope.data = data;
        }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log('error: '+status);
        });
        $scope.openMenu = false;
        $scope.toggleMenu = function() {
            $scope.$emit('toggleSlideMenu', $scope.openMenu = !$scope.openMenu);
        };

        $scope.$on('slideMenuToggled', function(event, isOpen) {
            $scope.openMenu = isOpen;
        });


    }
]);

//catalogue item
phmControllers.controller('catelogueItemCtrl', ['$scope', '$rootScope', 'userState', '$location', '$http', '$routeParams',
    function($scope, $rootScope, userState, $location, $http, $routeParams) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });
        $scope.pagetitle = 'אודות';
        $scope.base = Jbase;
        $rootScope.hideFooter = false;
        $rootScope.activeFooter = 'catalogue';
        $rootScope.footerUrl = function() {
            return 'templates/content_footer.html';
        }
        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - catalogue item page';

        $rootScope.dispOverlay = 'show';
        var url = Jbase + 'index.php?option=com_k2&view=item&id=' + $routeParams.itemId + '&layout=json&tmpl=app&Itemid=188&callback=JSON_CALLBACK';

        $http({
            method: 'jsonp',
            url: url,
            cache: true
        }).
        success(function(data, status) {
            console.log(data);
            $rootScope.dispOverlay = 'hide';
            $scope.data = data;
        }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log('error: '+status);
        });
        $scope.openMenu = false;
        $scope.toggleMenu = function() {
            $scope.$emit('toggleSlideMenu', $scope.openMenu = !$scope.openMenu);
        };

        $scope.$on('slideMenuToggled', function(event, isOpen) {
            $scope.openMenu = isOpen;
        });


    }
]);

//biz contents
phmControllers.controller('BcontentCtrl', ['$scope', '$rootScope', 'userState', '$location', '$http',
    function($scope, $rootScope, userState, $location, $http) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });
        $scope.pagetitle = 'תכנים עסקיים';
        $scope.base = Jbase;
        $rootScope.hideFooter = true;
        $rootScope.dispOverlay = 'show';
        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - biz contents page';

        var url = Jbase + 'index.php?option=com_k2&view=itemlist&layout=category&task=category&id=10&layout=json&tmpl=app&Itemid=188&callback=JSON_CALLBACK';

        $http({
            method: 'jsonp',
            url: url,
            cache: true
        }).
        success(function(data, status) {
            console.log(data);
            $rootScope.dispOverlay = 'hide';
            if (data.items != null) {
                $.each(data.items, function(inx, el) {
                    data.items[inx].intro = decodeURIComponent(data.items[inx].intro);
                });
            }
            $scope.data = data;
        }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log('error: '+status);
        });
        $scope.openMenu = false;
        $scope.toggleMenu = function() {
            $scope.$emit('toggleSlideMenu', $scope.openMenu = !$scope.openMenu);
        };

        $scope.$on('slideMenuToggled', function(event, isOpen) {
            $scope.openMenu = isOpen;
        });


    }
]);

//biz content item
phmControllers.controller('BcontentItemCtrl', ['$scope', '$rootScope', 'userState', '$location', '$http', '$routeParams',
    function($scope, $rootScope, userState, $location, $http, $routeParams) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });
        $scope.pagetitle = 'תכנים עסקיים';
        $scope.base = Jbase;
        $rootScope.hideFooter = true;
        $rootScope.dispOverlay = 'show';
        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - biz content item page';

        var url = Jbase + 'index.php?option=com_k2&view=item&id=' + $routeParams.itemId + '&layout=json&tmpl=app&Itemid=188&callback=JSON_CALLBACK';

        $http({
            method: 'jsonp',
            url: url,
            cache: true
        }).
        success(function(data, status) {
            //console.log(data);
            $rootScope.dispOverlay = 'hide';
            $scope.data = data;
            var fulltext = decodeURIComponent(data.fulltext);
            angular.element('.contents').html(fulltext);
        }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log('error: '+status);
        });
        $scope.openMenu = false;
        $scope.toggleMenu = function() {
            $scope.$emit('toggleSlideMenu', $scope.openMenu = !$scope.openMenu);
        };

        $scope.$on('slideMenuToggled', function(event, isOpen) {
            $scope.openMenu = isOpen;
        });


    }
]);

//galleries page
phmControllers.controller('galleryCtrl', ['$scope', '$rootScope', 'userState', '$location', '$http',
    function($scope, $rootScope, userState, $location, $http) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });
        $scope.pagetitle = 'זוכים ותמונות';
        $scope.base = Jbase;
        $rootScope.hideFooter = false;
        $rootScope.activeFooter = 'gallery';
        $rootScope.footerUrl = function() {
            return 'templates/gallery_footer.html';
        }
        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - galleries page';

        $rootScope.dispOverlay = 'show';
        var url = Jbase + 'index.php?option=com_k2&view=itemlist&layout=category&task=category&id=2&layout=json&tmpl=app&Itemid=188&callback=JSON_CALLBACK';

        $http({
            method: 'jsonp',
            url: url,
            cache: true
        }).
        success(function(data, status) {
            //console.log(data);
            $rootScope.dispOverlay = 'hide';
            $scope.data = data;
        }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
            //console.log('error: '+status);
        });
        $scope.openMenu = false;
        $scope.toggleMenu = function() {
            $scope.$emit('toggleSlideMenu', $scope.openMenu = !$scope.openMenu);
        };

        $scope.$on('slideMenuToggled', function(event, isOpen) {
            $scope.openMenu = isOpen;
        });


    }
]);

//gallery item
phmControllers.controller('galleryItemCtrl', ['$scope', '$rootScope', 'userState', '$location', '$http', '$routeParams',
    function($scope, $rootScope, userState, $location, $http, $routeParams) {
        $rootScope.$watch('state', function() {
            if ($rootScope.state == 'invalid') $location.path('/login');
        });

        $scope.pagetitle = 'זוכים ותמונות';
        $scope.base = Jbase;
        $rootScope.hideFooter = false;
        $rootScope.activeFooter = 'gallery';
        $rootScope.footerUrl = function() {
            return 'templates/gallery_footer.html';
        }
        location.href = "contactphm://" + encodeURIComponent(window.localStorage.getItem("user")) + ' - gallery page';

        $rootScope.dispOverlay = 'show';
        var url = Jbase + 'index.php?option=com_k2&view=item&id=' + $routeParams.itemId + '&layout=json&tmpl=app&Itemid=188&callback=JSON_CALLBACK';

        $http({
            method: 'jsonp',
            url: url,
            cache: true
        }).
        success(function(data, status) {
            console.log(data);
            $rootScope.dispOverlay = 'hide';
            $scope.data = data;
            var Img = data.gallery[0];
            Img = Img.replace('"', '');
            $('#gallery').prepend(Img);
            var images = data.gallery;
            images.shift();

            $('#gallery').cycle({
                loader: true,
                progressive: images,
                next: '#rightGal',
                prev: '#leftGal',
                fx: 'scrollHorz',
                //	swipe:true,
                //	easing: 'easeInOutBack',
                timeout: 7000
            });
            $('#gallery').on('cycle-before', function(event, opts) {
                $rootScope.dispOverlay = 'show';
            });
            $('#gallery').on('cycle-after', function(event, opts) {
                $rootScope.dispOverlay = 'hide';
            });
        }).
        error(function(data, status) {
            $rootScope.dispOverlay = 'hide';
        });
    }
]);