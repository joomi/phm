'use strict';

/* App Module */
var phmApp = angular.module('phmApp', [
  'ngRoute',
  'ngTouch',
  'ngSanitize',
//  'ngResource',
  'phmControllers'
]);

phmApp.service('userState', [ '$http', '$rootScope', 
	function ($http, $rootScope) {
		var url = Jbase+'index.php?option=com_k2&view=item&layout=item&id=1&Itemid=199&tmpl=user&callback=JSON_CALLBACK';
		$rootScope.state = null;
		$http({method: 'jsonp', url: url}).
			success(function(data, status) {
			//	console.log(data);
				if(data.user > 0)
				$rootScope.state = 'valid';
				else
				$rootScope.state = 'invalid';
			}).
			error(function(data, status) {
			//	console.log('error: '+status);
				$rootScope.state = 'invalid';
		});	
//	return state;		
}]);

phmApp.directive('backLink', function() {
	return {
		restrict: 'E'
	},{
		link: function(scope, element) {
			$(element).on('click', function() {
				history.back();
			});
		}
	}
});

phmApp.directive('monthChart', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var chart = new google.visualization.ColumnChart(element[0]);
			scope.$watch(attrs.monthChart, function(value) {
				var data = google.visualization.arrayToDataTable(value);
				var options = {
					colors:['#08b3c2','#08b3c2'],
					'tooltip' : {trigger: 'none'},
				//	width:600, 
				//	height:400,
					chartArea: {width: '85%'},
					legend: {position: 'none'},
					axisTitlesPosition: 'out',
					backgroundColor: 'none',
					isStacked: true
				};
				chart.draw(data, options);
			});
	}
	}
});
 
phmApp.directive('yearChart', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var chart = new google.visualization.LineChart(element[0]);
			scope.$watch(attrs.yearChart, function(value) {
			//	console.log(value);
				var data = google.visualization.arrayToDataTable(value);
				var options = {
				   tooltip: {trigger: 'none'},
				//	width:930, 
				//	height:380,
					fontSize:9,
					chartArea: {width: '100%'},
					legend: {position: 'none'},
					pointSize: 8,
					backgroundColor: 'none'
				};
				chart.draw(data, options);
			});
	}
	}
});

phmApp.directive('hboTabs', function() {
    return {
        restrict: 'A',
        link: function(scope, elm, attrs) {
            var jqueryElm = $(elm[0]);
            $(jqueryElm).tabs()
        }
    };
});

phmApp.directive('showTab',
    function () {
        return {
            link: function (scope, element, attrs) {
                element.click(function(e) {
                    e.preventDefault();
					//console.log($(element).attr('href'));
                    $($(element).parent().parent().parent()).tabs();
                });
            }
        };
    });

phmApp.directive('closeMenu',
    function () {
        return {
            link: function (scope, element, attrs) {
                element.click(function(e) {
					scope.$emit('toggleSlideMenu', false);
					$('nav#menu').css({opacity:0, zIndex:0});
                });
            }
        };
    });

phmApp.directive('menuSlideout', ['$swipe', '$document', '$rootScope', function ($swipe, $document, $rootScope) {
    return {
        restrict: 'A',
        link: function (scope, $elem, attrs) {
            var startCoords, dir, endCoords, lastCoords,

                // how far horizontally do I need to move
                // before we do anything?
                tolerance = 5,

                // just keeping trying of if we met the tolerance
                toleranceMet = false,

                // if we slide this far in a particular
                // direction, we ignore the direction
                slideTolerance = 100,

                // NYI until Angular allows config of the tolerances
                moveYBufferRadius = 10,

                // we toggle transitionClass cuz we don't want to 
                // transition while we're actually dragging
                transitionClass = 'menu-slideout-transition',
                openClass = 'menu-slideout-open',
                isSlidingClass = 'menu-slideout-is-sliding',

                // TODO: make the menu open all but X pixels of window
                // var menuWidth = $document[0].width - 74;
                // angular.element(document).find('head').append('<style type="text/css">@charset "UTF-8";.slider.open{-webkit-transform: translate3d(' + menuWidth + 'px, 0, 0);</style>');
                menuWidth = 43,

                // adapted from http://davidwalsh.name/vendor-prefix
                prefix = (function () {
                    var styles = window.getComputedStyle(document.documentElement, ''),
                        pre = (Array.prototype.slice
                            .call(styles)
                            .join('') 
                            .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
                        )[1];
                    return '-' + pre + '-';
                })();

            $swipe.bind($elem, {
                start: function (coords, event) {
                    toleranceMet = false;
                    startCoords = angular.copy(lastCoords = coords);
                },
                end: function (coords, event) {
                    endCoords = coords;

                    $elem.removeAttr('style').addClass(transitionClass).removeClass(isSlidingClass);
                    if(!toleranceMet) return;

                    // if we slide more than slideTolerance pixels
                    // in a particular direction, then we override dir
                    if(coords.x - startCoords.x > slideTolerance) dir = 'right';
                    if(coords.x - startCoords.x < (-1 * slideTolerance)) dir = 'left';

                    if(dir == 'right') {
						$elem.addClass(openClass);
						$('nav#menu').css({opacity:1, zIndex:99});
					} else { 
						$elem.removeClass(openClass);
						$('nav#menu').css({opacity:0, zIndex:0});
					}

                    $rootScope.$broadcast('slideMenuToggled', dir == 'right');
                },
                move: function (coords, event) {
                    // set a tolerance before we kick in sliding
                    // (Angular does this to an extent, also, I believe)
                    if(!toleranceMet && Math.abs(startCoords.x - coords.x) < tolerance) return;
                    dir = lastCoords.x < coords.x ? 'right' : 'left';
                    $elem.removeClass(transitionClass).addClass(isSlidingClass);

                    // restrict x to be between 0 and menuWidth
                    var x = coords.x - startCoords.x + ($elem.hasClass(openClass) ? menuWidth : 0);
                    x = Math.max(0, Math.min(menuWidth, x));

                    // translate3d is WAY more performant than left
                    // thanks to GPU acceleration (especially
                    // noticeable on slower, mobile devices)
                    var props = {};
                    props[prefix + 'transform'] = 'translate3d(' + x + '%, 0, 0)';
                    $elem.css(props);
					var z = x * 2;
					var dirX = dir == 'right' ? 1 : 0;
					$('nav#menu').css({opacity:z/100, zIndex:dirX});
                    lastCoords = coords;
                    toleranceMet = true;
                },
                cancel: function (coords, event) {
                    $elem.addClass(transitionClass).removeClass(isSlidingClass);
                    $elem.removeAttr('style');
					$('nav#menu').css({opacity:0, zIndex:0});
                }
            }, {
                moveYBufferRadius: moveYBufferRadius
            });

            $rootScope.$on('toggleSlideMenu', function(event, isOpen) {
                $elem.toggleClass(openClass, isOpen);
				$('nav#menu').css({opacity:1});
				if(isOpen)
				$('nav#menu').css({zIndex:99});
				else
				$('nav#menu').css({zIndex:0});
            });
        }
    };
}]);
	
phmApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/login', {
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      }).
      when('/main', {
        templateUrl: 'templates/main.html',
        controller: 'MainCtrl'
      }).
      when('/keys', {
        templateUrl: 'templates/keys.html',
        controller: 'KeysCtrl'
      }).
      when('/league/sales', {
        templateUrl: 'templates/league_sales.html',
        controller: 'LgSalesCtrl'
      }).
      when('/league/messages', {
        templateUrl: 'templates/league_messages.html',
        controller: 'LgMessagesCtrl'
      }).
      when('/league/knowledge', {
        templateUrl: 'templates/league_knowledge.html',
        controller: 'LgKnowledgeCtrl'
      }).
      when('/league/gifts/:giftsId', {
        templateUrl: 'templates/league_gifts.html',
        controller: 'LgGiftsCtrl'
      }).
      when('/league/gift/:giftId', {
        templateUrl: 'templates/league_gift.html', 
        controller: 'LgGiftCtrl'
      }).
      when('/league/quiz/:quizId', {
        templateUrl: 'templates/quiz.html',
        controller: 'LgQuizCtrl'
      }).
      when('/league/:leagueId', {
        templateUrl: 'templates/league.html',
        controller: 'LeagueCtrl'
      }).
      when('/activity', {
		templateUrl: 'templates/league.html',
        controller: 'activityCtrl'
      }).
      when('/league/score/:leagueId', {
        templateUrl: 'templates/league_score.html',
        controller: 'LgScoreCtrl'
      }).
      when('/b_data/top_five', {
        templateUrl: 'templates/bdata_top_five.html',
        controller: 'BdataTopfiveCtrl'
      }).
      when('/b_data/month', {
        templateUrl: 'templates/bdata_month.html',
        controller: 'BdataMonthCtrl'
      }).
      when('/b_data/month/:month', {
        templateUrl: 'templates/bdata_month.html',
        controller: 'BdataMonthCtrl'
      }).
      when('/b_data/year', {
        templateUrl: 'templates/bdata_year.html',
        controller: 'BdataYearCtrl'
      }).
      when('/contact', {
        templateUrl: 'templates/contact.html',
        controller: 'contactCtrl'
      }).
      when('/about', {
        templateUrl: 'templates/about.html',
        controller: 'aboutCtrl'
      }).
      when('/about_phm', {
        templateUrl: 'templates/about_phm.html',
        controller: 'aboutPhmCtrl'
      }).
      when('/pricelist', {
        templateUrl: 'templates/pricelist.html',
        controller: 'pricelistCtrl'
      }).
      when('/catelogue', {
        templateUrl: 'templates/catelogue.html',
        controller: 'catelogueCtrl'
      }).
      when('/catelogue/item/:itemId', {
        templateUrl: 'templates/catelogue_item.html',
        controller: 'catelogueItemCtrl'
      }).
      when('/b_content', {
        templateUrl: 'templates/b_content.html',
        controller: 'BcontentCtrl'
      }).
      when('/b_content/item/:itemId', {
        templateUrl: 'templates/b_content_item.html',
        controller: 'BcontentItemCtrl'
      }).
      when('/gallery', {
        templateUrl: 'templates/gallery.html',
        controller: 'galleryCtrl'
      }).
      when('/gallery/item/:itemId', {
        templateUrl: 'templates/gallery_item.html',
        controller: 'galleryItemCtrl'
      }).
      when('/winners', {
        templateUrl: 'templates/winners.html',
        controller: 'winnersCtrl'
      }).
      when('/poll/:itemId', {
        templateUrl: 'templates/poll.html',
        controller: 'pollCtrl'
      }).
      when('/filter', {
        templateUrl: 'templates/filter.html',
        controller: 'LgFilterCtrl'
      }).
	  when('/filter_done', {
        templateUrl: 'templates/filter_done.html',
        controller: 'LgFilter_doneCtrl'
      }).
	  when('/filter_done1', {
        templateUrl: 'templates/filter_done1.html',
        controller: 'LgFilter_done1Ctrl'
      }).	  
      when('/league/filter/:filterId', {
        templateUrl: 'templates/league_filter.html',
        controller: 'LgStartfilterCtrl'
      }).	  
      otherwise({
        redirectTo: '/login'
      });
  }]);

//$(document).ready(function(e) {
//	$('body').on('click','#openPanel',function(e) {
//        e.preventDefault();
//		$('nav#menu').animate({left:0},300, null, function(){$('.mainWrapper').addClass('menu_opened')});
//    });
//	$('body').on('click','.menu_opened',function(e) {
//		$('nav#menu').animate({left:'-50%'},300, null, function(){$('.mainWrapper').toggleClass('menu_opened')});
//	});	
//	
//});


console.log("cordova.require PushNotification!!!")
//var PushNotification = cordova.require('PushNotification.js');

/*
var onDeviceReady = function() {
        console.log("Device ready!!!")

		PushNotification.register(
			successHandler,
			errorHandler, {
				"senderID":"951843911803",
				"ecb":"onNotificationGCM"
        });

		function onNotificationGCM(e) {
			$("#app-status-ul").append('<li>EVENT -> RECEIVED:' + e.event + '</li>');

			switch( e.event )
			{
			case 'registered':
				if ( e.regid.length > 0 )
				{
					$("#app-status-ul").append('<li>REGISTERED -> REGID:' + e.regid + "</li>");
					// Your GCM push server needs to know the regID before it can push to this device
					// here is where you might want to send it the regID for later use.
					console.log("regID = " + e.regid);
				}
			break;

			case 'message':
				// if this flag is set, this notification happened while we were in the foreground.
				// you might want to play a sound to get the user's attention, throw up a dialog, etc.
				if ( e.foreground )
				{
					$("#app-status-ul").append('<li>--INLINE NOTIFICATION--' + '</li>');

					// if the notification contains a soundname, play it.
					var my_media = new Media("/android_asset/www/"+e.soundname);
					my_media.play();
				}
				else
				{  // otherwise we were launched because the user touched a notification in the notification tray.
					if ( e.coldstart )
					{
						$("#app-status-ul").append('<li>--COLDSTART NOTIFICATION--' + '</li>');
					}
					else
					{
						$("#app-status-ul").append('<li>--BACKGROUND NOTIFICATION--' + '</li>');
					}
				}

				$("#app-status-ul").append('<li>MESSAGE -> MSG: ' + e.payload.message + '</li>');
				$("#app-status-ul").append('<li>MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '</li>');
			break;

			case 'error':
				$("#app-status-ul").append('<li>ERROR -> MSG:' + e.msg + '</li>');
			break;

			default:
				$("#app-status-ul").append('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
			break;
		  }
		}

        // Incoming message callback
        var handleIncomingPush = function(event) {
          if(event.message) {
            console.log("Incoming push: " + event.message)
          } else {
            console.log("No incoming message")
          }
        }

        // Registration callback
        var onRegistration = function(event)  {
          if (!event.error) {
            console.log("Reg Success: " + event.pushID)
            $('#id').text(event.pushID)
          } else {
            console.log(event.error)
          }
        }

        // Register for any urban airship events
        document.addEventListener("urbanairship.registration", onRegistration, false)
        document.addEventListener("urbanairship.push", handleIncomingPush, false)

        // Handle resume
        document.addEventListener("resume", function() {
          console.log("Device resume!")

          PushNotification.resetBadge()
          PushNotification.getIncoming(handleIncomingPush)

          // Reregister for urbanairship events if they were removed in pause event
          document.addEventListener("urbanairship.registration", onRegistration, false)
          document.addEventListener("urbanairship.push", handleIncomingPush, false)
        }, false)


        // Handle pause
        document.addEventListener("pause", function() {
          console.log("Device pause!")

          // Remove urbanairship events.  Important on android to not receive push in the background.
          document.removeEventListener("urbanairship.registration", onRegistration, false)
          document.removeEventListener("urbanairship.push", handleIncomingPush, false)
        }, false)

        // Register for notification types
        PushNotification.registerForNotificationTypes(PushNotification.notificationType.badge |
          PushNotification.notificationType.sound |

          PushNotification.notificationType.alert)

        // Get any incoming push from device ready open
        PushNotification.getIncoming(handleIncomingPush)
      };

	document.addEventListener("deviceready", onDeviceReady, false)

	// Callback for when a device has registered with Urban Airship.
	PushNotification.registerEvent('registration', function (error, id) {
		if (error) {
			console.log('there was an error registering for push notifications');
		} else {
			console.log("Registered with ID: " + id);
		}
	})

	// Register for any urban airship events
	document.addEventListener("urbanairship.registration", function (event) {
		if (event.error) {
			console.log('there was an error registering for push notifications');
		} else {
			console.log("Registered with ID: " + event.pushID);
		}
	}, false)

	document.addEventListener("urbanairship.push", function (event) {
		console.log("Incoming push: " + event.message)
	}, false)
*/

	// Set tags on a device that you can push to
	// http://docs.urbanairship.com/connect/connect_audience.html#tags
	/*
	PushNotification.setTags(["loves_cats", "shops_for_games"], function () {
		PushNotification.getTags(function (obj) {
			obj.tags.forEach(function (tag) {
				console.log("Tag: " + tag);
			});
		});
	});
	*/
	// Set an alias; lets you tie a device to a user in your system
	// http://docs.urbanairship.com/connect/connect_audience.html#aliases
	/*
	PushNotification.setAlias("awesomeuser22", function () {
		push.getAlias(function (alias) {
			console.log("The user formerly known as " + alias)
		});
	});
	*/
	// Check if push is enabled
	/*PushNotification.isPushEnabled(function (enabled) {
		if (enabled) {
			console.log("Push is enabled! Fire away!");
		}
	});*/
	
	
//FastClick
window.addEventListener('load', function() {
    FastClick.attach(document.body);
}, false);

function calcage(secs, num1, num2) {
	var s = ((Math.floor(secs/num1))%num2).toString();
	var  LeadingZero = true;
	if (LeadingZero && s.length < 2) s = "0" + s;
  
	var number = s,
		output = [],
		sNumber = number.toString();
	
	for (var i = 0, len = sNumber.length; i < len; i += 1) {
		output.push(+sNumber.charAt(i));
	}
	return '<span class="nicenum num'+output[0]+'"></span><span class="nicenum num'+output[1]+'"></span>';
}

function CountBack(secs) {
  // var  FinishMessage = "";
  // var  CountStepper = -1;
  // CountStepper = Math.ceil(CountStepper);
  
	// var SetTimeOutPeriod = (Math.abs(CountStepper)-1)*1000 + 990;
	
  // if (secs < 0) {
	// $("#cntdwn").html(FinishMessage);
	// return;
  // }
  // var CountActive = true;
  // if (CountStepper == 0) CountActive = false;
  if(secs){
	  var DisplayFormat = "%%D%% %%H%% %%M%%";
	  var DisplayStr = DisplayFormat.replace(/%%D%%/g, calcage(secs,86400,100000));
	  DisplayStr = DisplayStr.replace(/%%H%%/g, calcage(secs,3600,24));
	  DisplayStr = DisplayStr.replace(/%%M%%/g, calcage(secs,60,60));
	  DisplayStr = DisplayStr.replace(/%%S%%/g, calcage(secs,1,60));
  } else {
	  var DisplayStr = '<span class="nicenum num0"></span><span class="nicenum num0"></span> <span class="nicenum num0"></span><span class="nicenum num0"></span> <span class="nicenum num0"></span><span class="nicenum num0"></span>';
  }
  // $("#cntdwn").html(DisplayStr);
  // if (CountActive)
	// setTimeout("CountBack(" + (secs+CountStepper) + ")", SetTimeOutPeriod);
	
	// var oneDay = 24*60*60*1000;	
	// $("#cntdwn").html(DisplayStr);
	console.log(secs);
	return DisplayStr;
}

//convert seconds to time
function secondsToHms(d) {
	d = Math.ceil(d);
	d = Number(d);
	var h = Math.floor(d / 3600);
	var m = Math.floor(d % 3600 / 60);
	var s = Math.floor(d % 3600 % 60);
	return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s); 
}					

(function( $ ){

  $.fn.fitText = function( kompressor, options ) {

    // Setup options
    var compressor = kompressor || 1,
        settings = $.extend({
          'minFontSize' : Number.NEGATIVE_INFINITY,
          'maxFontSize' : Number.POSITIVE_INFINITY
        }, options);

    return this.each(function(){

      // Store the object
      var $this = $(this);

      // Resizer() resizes items based on the object width divided by the compressor * 10
      var resizer = function () {
        $this.css('font-size', Math.max(Math.min($this.width() / (compressor*10), parseFloat(settings.maxFontSize)), parseFloat(settings.minFontSize)));
      };

      // Call once to set.
      resizer();

      // Call on resize. Opera debounces their resize by default.
      $(window).on('resize.fittext orientationchange.fittext', resizer);

    });

  };

})( jQuery );



/*! TinySort 1.5.6
* Copyright (c) 2008-2013 Ron Valstar http://tinysort.sjeiti.com/
* License:
*     MIT: http://www.opensource.org/licenses/mit-license.php
*     GPL: http://www.gnu.org/licenses/gpl.html
*/
!function(a,b){"use strict";function c(a){return a&&a.toLowerCase?a.toLowerCase():a}function d(a,b){for(var c=0,d=a.length;d>c;c++)if(a[c]==b)return!e;return e}var e=!1,f=null,g=parseFloat,h=Math.min,i=/(-?\d+\.?\d*)$/g,j=/(\d+\.?\d*)$/g,k=[],l=[],m=function(a){return"string"==typeof a},n=function(a,b){for(var c,d=a.length,e=d;e--;)c=d-e-1,b(a[c],c)},o=Array.prototype.indexOf||function(a){var b=this.length,c=Number(arguments[1])||0;for(c=0>c?Math.ceil(c):Math.floor(c),0>c&&(c+=b);b>c;c++)if(c in this&&this[c]===a)return c;return-1};a.tinysort={id:"TinySort",version:"1.5.6",copyright:"Copyright (c) 2008-2013 Ron Valstar",uri:"http://tinysort.sjeiti.com/",licensed:{MIT:"http://www.opensource.org/licenses/mit-license.php",GPL:"http://www.gnu.org/licenses/gpl.html"},plugin:function(){var a=function(a,b){k.push(a),l.push(b)};return a.indexOf=o,a}(),defaults:{order:"asc",attr:f,data:f,useVal:e,place:"start",returns:e,cases:e,forceStrings:e,ignoreDashes:e,sortFunction:f}},a.fn.extend({tinysort:function(){var p,q,r,s,t=this,u=[],v=[],w=[],x=[],y=0,z=[],A=[],B=function(a){n(k,function(b){b.call(b,a)})},C=function(a,b){return"string"==typeof b&&(a.cases||(b=c(b)),b=b.replace(/^\s*(.*?)\s*$/i,"$1")),b},D=function(a,b){var c=0;for(0!==y&&(y=0);0===c&&s>y;){var d=x[y],f=d.oSettings,h=f.ignoreDashes?j:i;if(B(f),f.sortFunction)c=f.sortFunction(a,b);else if("rand"==f.order)c=Math.random()<.5?1:-1;else{var k=e,o=C(f,a.s[y]),p=C(f,b.s[y]);if(!f.forceStrings){var q=m(o)?o&&o.match(h):e,r=m(p)?p&&p.match(h):e;if(q&&r){var t=o.substr(0,o.length-q[0].length),u=p.substr(0,p.length-r[0].length);t==u&&(k=!e,o=g(q[0]),p=g(r[0]))}}c=d.iAsc*(p>o?-1:o>p?1:0)}n(l,function(a){c=a.call(a,k,o,p,c)}),0===c&&y++}return c};for(p=0,r=arguments.length;r>p;p++){var E=arguments[p];m(E)?z.push(E)-1>A.length&&(A.length=z.length-1):A.push(E)>z.length&&(z.length=A.length)}for(z.length>A.length&&(A.length=z.length),s=z.length,0===s&&(s=z.length=1,A.push({})),p=0,r=s;r>p;p++){var F=z[p],G=a.extend({},a.tinysort.defaults,A[p]),H=!(!F||""===F),I=H&&":"===F[0];x.push({sFind:F,oSettings:G,bFind:H,bAttr:!(G.attr===f||""===G.attr),bData:G.data!==f,bFilter:I,$Filter:I?t.filter(F):t,fnSort:G.sortFunction,iAsc:"asc"==G.order?1:-1})}return t.each(function(c,d){var e,f=a(d),g=f.parent().get(0),h=[];for(q=0;s>q;q++){var i=x[q],j=i.bFind?i.bFilter?i.$Filter.filter(d):f.find(i.sFind):f;h.push(i.bData?j.data(i.oSettings.data):i.bAttr?j.attr(i.oSettings.attr):i.oSettings.useVal?j.val():j.text()),e===b&&(e=j)}var k=o.call(w,g);0>k&&(k=w.push(g)-1,v[k]={s:[],n:[]}),e.length>0?v[k].s.push({s:h,e:f,n:c}):v[k].n.push({e:f,n:c})}),n(v,function(a){a.s.sort(D)}),n(v,function(a){var b=a.s,c=a.n,f=b.length,g=c.length,i=f+g,j=[],k=i,l=[0,0];switch(G.place){case"first":n(b,function(a){k=h(k,a.n)});break;case"org":n(b,function(a){j.push(a.n)});break;case"end":k=g;break;default:k=0}for(p=0;i>p;p++){var m=d(j,p)?!e:p>=k&&k+f>p,o=m?0:1,q=(m?b:c)[l[o]].e;q.parent().append(q),(m||!G.returns)&&u.push(q.get(0)),l[o]++}}),t.length=0,Array.prototype.push.apply(t,u),t}}),a.fn.TinySort=a.fn.Tinysort=a.fn.tsort=a.fn.tinysort}(jQuery);