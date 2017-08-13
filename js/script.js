var $window   = $(window),
	$document = $(document);

(function (window, Modernizr) {
	'use strict';
	var md = new MobileDetect(navigator.userAgent),
		grade = md.mobileGrade();
	Modernizr.addTest({
		mobile: !!md.mobile(),
		phone: !!md.phone(),
		tablet: !!md.tablet(),
		mobilegradea: grade === 'A'
	});
	window.mobileDetect = md;
})(window, Modernizr);

var bereg = {modules : []};
bereg.extend = function(moduleName, moduleData){
	if(!moduleName){
		console.log("Error creating module")
		return;
	}
	if(!moduleData){
		var moduleData = {elements: {}, init: function(){console.log("Empty init for module")}};
	}
	this[moduleName] = moduleData;
	this.modules.push( moduleData );
	return moduleData;
}
bereg.init = function(){
	var totalModules = bereg.modules.length;
	for(var k = 0; k < totalModules; k++){
		bereg.modules[k].init();
	}
}

//*******************************************
//
//	DIFF
//
//*******************************************

bereg.extend("DIFF", {
	
	init: function() {
		console.log('init game');
		
		this.elements = {};
		this.elements.$html   = $("html");
		this.elements.$body   = $("body");
		this.elements.$window = $(window);
		
		var self = this;
		this.timer;
		this.timerVal = 0;
		this.score = 0;
		this.globalScore = 0;
		this.globalLevel = 0;
		
		this.statusGame = {};
		this.statusGame.show = false;
		
		this.object = {};
		this.method = {};
		this.count = {};
		
		this.elements.$block    = $(".block-contest");
		this.elements.$activeLevels    = $(".contest-level");
		/*this.elements.$images   = $(".DIFF img").filter(function() { return this.getAttribute("src").length !== 0; });
		 this.elements.$bgImages = $(".DIFF, .DIFF *").filter(function()   { return $(this).css("backgroundImage") != "none"; });
		 this.elements.$choiseLevel = this.elements.$block.find(".contest-level");*/
		
		this.elements.$progressLevel = $(".levels-progress");
		this.elements.$totalLevel = $(".levels-total");
		
		this.length = {};
		/*this.length.images    = this.elements.$images.length;
		 this.length.bgImages  = this.elements.$bgImages.length;*/
		
		this.firstStart = false;
		
		this.elements.$block.addClass("_active")
			.removeClass("_game");
		
		//TweenMax.set(this.elements.$block.find(".contest-level"), { autoAlpha: 0 }); todo 24 03
		
		if (!this.firstStart) {
			
			bereg.DIFF.randomizeLevels();
			bereg.DIFF.setGame(0);
			
		} else {
			
			this.setLevel(/*bereg.levels.currentLevel*/2)
			
		}
		
		$('.contest-btn-start').click(function() { bereg.DIFF.startGame() });
		$('.contest-btn-reload').click(function() { bereg.DIFF.reloadGame() });
	},
	
	setGame: function(level) { // настраиваем игру перед началом
		this.firstStart = true;
		
		this.elements.$level = /*$(".contest-level")*/this.elements.$activeLevels;
		this.elements.$levelCurrent = this.elements.$level[level];
		this.elements.$area = $(".contest-area-item");
		this.elements.$backlight = $(".contest-circle-item");
		this.elements.$progressItem = $(".num-progress");
		this.elements.$totalItem = $(".num-total");
		this.elements.$progressLevel = $(".levels-progress");
		
		bereg.DIFF.globalLevel = $(this.elements.$level[0]).attr('data-level');
		console.log('global level on set game '+bereg.DIFF.globalLevel);
		
		this.length.level = this.elements.$level.length;
		
		this.score = 0; // обнуляем счет внутри уровня
		this.elements.$area.css("display","block"); // возвращаем все состояния областей и иконок
		TweenMax.to(this.elements.$backlight, 0.3, { autoAlpha: 0 });
		TweenMax.set($(".contest-level"), { autoAlpha: 0 }); // прячем все уровни
		
		for (var i=0; i<this.length.level; i++) {
			this.getInstance($(this.elements.$level[i]));
		}
		
		TweenMax.set($(this.elements.$level[0]), { autoAlpha: 1 }); // показываем левел по переданному номеру
		
		this.elements.$progressItem.html('0'); // обнуляем прогресс в коде страницы
		this.elements.$progressLevel.html('1');
		
	},
	
	startGame: function() { // старт игры с кнопки
		
		//console.log('lets do it');
		
		if (!$('.contest-btn-start').attr('data-token')) {
			// Check auth
			response = post({
				'action':'sm',
				'auth':1
			});
			
			if (response && response.responseJSON) {
				response = response.responseJSON;
				
				if (response.success) {
					//$('.game').attr('data-token', response.token);
					$('.contest-btn-start').attr('data-token', response.token);
				} else {
					if (response.msg) {
						//alert(response.msg);
						openPopup('no-attempts');
					} else if (response.agree) {
						$('.popup[data-popup="agreement"]').show();
						
						response = post({
							'action':'sm',
							'auth':1
						});
						
						if (response && response.responseJSON) {
							response = response.responseJSON;
							
							if (response.success) {
								//$('.game').attr('data-token', response.token);
								$('.contest-btn-start').attr('data-token', response.token);
							} else {
								return;
							}
						}
						
						
					} else {
						$('.popup[data-popup="auth"]').show();
					}
					return;
				}
			}
		}
		
		//this.elements.$totalLevel.html(this.length.level);
		
		$('.contest-btn-start').hide();
		$('.contest-preloader').hide();
		$('.popup[data-popup="agreement"]').hide();
		$('.contest-btn-reload').show();
		$('.contest-btn-skip').show();
		this.elements.$totalLevel.html(this.length.level).parent('.contest-level-row').show();
		this.setTimer();
		
	},
	
	reloadGame: function() { // рестарт игры
		
		//console.log('reload');
		//console.log('global score '+this.globalScore);
		
		$('.popup[data-popup="finish"]').hide();
		bereg.DIFF.randomizeLevels();
		
		// Check auth
		response = post({
			'action':'sm',
			'auth':1
		});
		
		if (response && response.responseJSON) {
			response = response.responseJSON;
			
			if (response.success) {
				//$('.game').attr('data-token', response.token);
				$('.contest-btn-start').attr('data-token', response.token);
			} else {
				if (response.msg) {
					if (response.msg == 'Доступно только 3 попытки в сутки.') {
						openPopup('no-attempts');
					} else {
						alert(response.msg);
					}
				} else {
					$('.popup[data-popup="auth"]').show();
				}
				return;
			}
		}
		
		clearInterval(this.timer);
		//console.log(this.elements.$level[0]);
		var startLevel = $('.contest-level:first-child').attr('data-level');
		
		bereg.DIFF.setGame(startLevel);
		$('.contest-preloader').hide();
		$('.contest-btn-skip').show();
		this.setTimer();
		
	},
	
	finishGame: function() { // игра закончилась
		
		console.log('win!');
		
		clearInterval(this.timer);
		$('.contest-preloader').show();
		$('.contest-btn-skip').hide();
		//$('.popup[data-popup="finish"]').show();
		
		response = post({
			'action':'game',
			'status':3,
			'token':$('.contest-btn-start').attr('data-token'),
			'number':bereg.DIFF.globalLevel
		});
		
		if (response && response.responseJSON) {
			response = response.responseJSON;
			
			if (response.success) {
				$('.popup[data-popup="finish"]').attr({
					'data-time':response.time,
					'data-cnt':response.cnt,
					'data-short-url':response.short_url
				});
				
				$('.timer-result').html(response.time_symbols.m + ':' + response.time_symbols.s);
				$('.contest-timer').html('<span class="min">'+response.time_symbols.m+'</span>:<span class="sec">'+response.time_symbols.s+'</span>');
				$('.text-cnt').html($('.popup[data-popup="finish"]').attr('data-cnt'));
			} else {
				//console.log(response.msg);
				alert(response.msg);
			}
		}
		
		openPopup('finish');
	},
	
	setTimer: function() { // запускаем таймер
		
		//console.log('timer starts');
		var timeArr = [];
		
		function Calcage(secs, num1, num2) {
			s = ((Math.floor(secs / num1)) % num2).toString();
			if (s.length < 2) {
				s = "0" + s;
			}
			return (s);
		}
		
		var i = 0;//время в сек.
		function time(){
			timeArr.minutes = Calcage(i, 60, 60);
			timeArr.seconds = Calcage(i, 1, 60);
			$(".contest-timer .min").html(timeArr.minutes);
			$(".contest-timer .sec").html(timeArr.seconds);//визуальный счетчик
			i++;//увеличение счетчика
			timerValue = timeArr.minutes+':'+timeArr.seconds;
			//if (i > 75) { console.log('time is out'); clearInterval(timer); }
		}
		time();
		this.timer = setInterval(time, 1000);
		
	},
	
	getInstance: function(holder) {
		
		var instance = {};
		
		var parentElement = holder;
		
		instance.findDifference = this.findDifference;
		instance.wrongAnswer = this.wrongAnswer;
		instance.setLevel = this.setLevel;
		instance.skipLevel = this.skipLevel;
		instance.randomizeLevels = this.randomizeLevels;
		
		instance.setGame = this.setGame;
		instance.startGame = this.startGame;
		instance.reloadGame = this.reloadGame;
		instance.finishGame = this.finishGame;
		
		instance.elements = {};
		instance.elements.$level = this.elements.$activeLevels;
		instance.elements.$image = parentElement.find(".contest-area");
		instance.elements.$area = parentElement.find(".contest-area-item");
		instance.elements.$backlight = parentElement.find(".contest-circle-item");
		instance.elements.$progressItem = $(".num-progress");
		instance.elements.$totalItem = $(".num-total");
		
		//instance.score = 0;
		instance.count = 0;
		
		instance.total = instance.elements.$area.length / 2;
		instance.score = 0;
		
		instance.elements.$totalItem.html(instance.total);
		
		instance.elements.$area.off('click');
		instance.elements.$image.off('click');
		
		instance.elements.$area.on('click', function(event) { instance.findDifference($(event.currentTarget).data("item")) });
		
		instance.elements.$image.on('click', function(event) { instance.wrongAnswer(event, $(event.target)) });
		
		return instance;
		
	},
	
	setLevel: function(level) { // настраиваем уровень
		
		console.log('set level '+level);
		
		TweenMax.to(this.elements.$level.not("[data-level='" + level + "']"), 0.5, { autoAlpha: 0 });
		TweenMax.to(this.elements.$level.filter("[data-level='" + level + "']"), 0.5, { autoAlpha: 1 });
		
		//this.total = this.elements.$area.length;
		this.count = 0;
		
		this.countLevel = $(this.elements.$level).index($(this.elements.$level.filter("[data-level='" + level + "']"))) + 1;
		$(".levels-progress").html(this.countLevel);
		
		//console.log('countlevel'+this.countLevel);
		this.elements.$progressItem.html('0');
		this.elements.$area.css("display","block");
		
		TweenMax.set(this.elements.$backlight, { autoAlpha: 0 });
		
		bereg.DIFF.globalLevel = level;
		console.log('globalLevel on set level '+bereg.DIFF.globalLevel);
		
	},
	
	randomizeLevels: function() { // перемешиваем уровни
		
		console.log('randomize');
		$('.contest-level').removeClass('active-level');
		
		(function(jQuery){
			jQuery.fn.shuffle = function(){
				var allElems = this.get();
				
				var getRandom = function(max){
					return Math.floor(Math.random() * max);
				}
				
				var shuffled = jQuery.map(allElems, function(){
					var random = getRandom(allElems.length),
						randEl = jQuery(allElems[random]).clone(true)[0];
					allElems.splice(random, 1);
					return randEl;
				});
				
				this.each(function(i){
					jQuery(this).replaceWith(jQuery(shuffled[i]));
				});
				
				return jQuery(shuffled);
			};
		})(jQuery);
		
		$('.contest-level').shuffle();
		this.elements.$activeLevels = $('.contest-level:lt(5)');
		this.elements.$activeLevels.addClass('active-level');
		console.log(this.elements.$activeLevels.length);
		
	},
	
	skipLevel: function() { // пропускаем уровень
		
		console.log('skip');
		console.log('globalLevel on skip level '+bereg.DIFF.globalLevel);
		var nextLevel = this.elements.$level.filter("[data-level='" + bereg.DIFF.globalLevel + "']").next('.contest-level');
		if(nextLevel.hasClass('active-level')) { console.log('inArray'); } else { console.log('not inArray'); }
		//console.log($.inArray(nextLevel, this.elements.$level));
		
		if (nextLevel.length && nextLevel.hasClass('active-level')) {
			response = post({
				'action':'game',
				'token':$('.contest-btn-start').attr('data-token'),
				'status':2,
				'number':bereg.DIFF.globalLevel
			});
			
			if (response && response.responseJSON) {
				response = response.responseJSON;
				
				if (response.success) {
					//
				} else {
					console.log(response.msg);
					alert(response.msg);
				}
			}
			
			this.setLevel(nextLevel.attr('data-level'));
		} else {
			bereg.DIFF.finishGame();
		}
	},
	
	findDifference: function(id) { // ткнули в различие
		
		this.elements.$area.filter("[data-item='" + id + "']").css("display","none");
		TweenMax.to(this.elements.$backlight.filter("[data-item='" + id + "']"), 0.3, { autoAlpha: 1 });
		
		this.score++;
		
		$(this.elements.$progressItem).html(this.score);
		
		bereg.DIFF.count++;
		
		console.log('right!');
		bereg.DIFF.globalLevel = $(this.elements.$area).parents('.contest-level').attr('data-level');
		console.log('globalLevel on diff '+bereg.DIFF.globalLevel);
		
		if (this.score == 5) { // TODO 5 to total
			console.log('level finished');
			
			response = post({
				'action':'game',
				'token':$('.contest-btn-start').attr('data-token'),
				'number':$(this.elements.$area).parents('.contest-level').attr('data-level'),
				'status':1
			});
			
			if (response && response.responseJSON) {
				response = response.responseJSON;
				
				if (response.success) {
					var nextLevel = this.elements.$area.filter("[data-item='" + id + "']").parents('.contest-level').next('.contest-level');
					if (nextLevel.length && nextLevel.hasClass('active-level')) {
						console.log('is next');
						this.setLevel($(this.elements.$area).parents('.contest-level').next('.contest-level').attr('data-level'));
					} else {
						console.log('no next');
						bereg.DIFF.finishGame();
					}
				} else {
					console.log(response.msg);
				}
			}
		} else {
			//console.log($(this.elements.$area).parents('.contest-level').attr('data-level'));
			
			response = post({
				'action':'game',
				'token':$('.contest-btn-start').attr('data-token'),
				'number':$(this.elements.$area).parents('.contest-level').attr('data-level')
			});
			
			if (response && response.responseJSON) {
				response = response.responseJSON;
				
				if (response.success) {
					//
				} else {
					console.log(response.msg);
				}
			}
		}
		
	},
	
	wrongAnswer: function(e, target) { // ткнули мимо
		
		if (!target.hasClass("contest-area-item")) {
			
			console.log('wrong');
			
			var coordY = e.pageY - target.offset().top - 36;
			var coordX = e.pageX - target.offset().left - 36;
			
			target.append('<div class="contest-cross-item" style="top: ' + coordY + 'px; left: ' + coordX + 'px;"></div>');
			var clearError = setInterval(function() { $(".contest-cross-item").detach(); clearInterval(clearError); }, 1000);
			
		}
		
	}
	
});

function post(data) {
	return $.ajax({
		type: 'POST',
		url: '/utils/',
		async: false,
		data: data,
		dataType: 'json'
	});
}

function sm_auth_result(token) {
	response = post({
		'action':'sm',
		'auth':1,
		'token':token
	});
	
	if (response && response.responseJSON) {
		response = response.responseJSON;
		
		if (response.success) {
			$('.popup[data-popup="auth"]').hide();
			if (response.agree) {
				$('.popup[data-popup="agreement"]').show();
			} else {
				bereg.DIFF.startGame();
			}
		} else {
			console.log(response.msg);
			alert(response.msg);
		}
	}
}

function shareIni(event) {
	
	Share = {
		vkontakte: function(purl, ptitle, pimg, text) {
			text = text.replace(/#cnt#/g, $('.popup[data-popup="finish"]').attr('data-cnt'));
			text = text.replace(/#time#/g, $('.popup[data-popup="finish"]').attr('data-time'));
			purl += '/' + $('.popup[data-popup="finish"]').attr('data-short-url');
			
			response = post({
				'action':'share',
				'token':$('.contest-btn-start').attr('data-token'),
				'sm':'vk'
			});
			
			if (response && response.responseJSON) {
				response = response.responseJSON;
				
				if (response.success) {
				} else {
					console.log(response.msg);
				}
			}
			
			url  = 'http://vkontakte.ru/share.php?';
			url += 'url='          + encodeURIComponent(purl);
			url += '&title='       + encodeURIComponent(ptitle);
			url += '&description=' + encodeURIComponent(text);
			url += '&image='       + encodeURIComponent(pimg);
			url += '&noparse=true';
			Share.popup(url);
		},
		odnoklassniki: function(purl, text) {
			url  = 'http://www.odnoklassniki.ru/dk?st.cmd=addShare&st.s=1';
			url += '&st.comments=' + encodeURIComponent(text);
			url += '&st._surl='    + encodeURIComponent(purl);
			Share.popup(url);
		},
		facebook: function(purl, ptitle, pimg, text) {
			text = text.replace(/#cnt#/g, $('.popup[data-popup="finish"]').attr('data-cnt'));
			text = text.replace(/#time#/g, $('.popup[data-popup="finish"]').attr('data-time'));
			purl += '/' + $('.popup[data-popup="finish"]').attr('data-short-url');
			
			response = post({
				'action':'share',
				'token':$('.contest-btn-start').attr('data-token'),
				'sm':'fb'
			});
			
			if (response && response.responseJSON) {
				response = response.responseJSON;
				
				if (response.success) {
				} else {
					console.log(response.msg);
				}
			}
			
			if (Modernizr.mobile) {
				url  = 'http://www.facebook.com/sharer.php?m2w&s=100';
			} else {
				url  = 'http://www.facebook.com/sharer.php?s=100';
			}
			url += '&p[title]='     + encodeURIComponent(ptitle);
			url += '&p[summary]='   + encodeURIComponent(text);
			url += '&p[url]='       + encodeURIComponent(purl);
			url += '&p[images][0]=' + encodeURIComponent(pimg);
			Share.popup(url);
		},
		twitter: function(purl, ptitle) {
			ptitle = ptitle.replace(/#cnt#/g, $('.popup[data-popup="finish"]').attr('data-cnt'));
			ptitle = ptitle.replace(/#time#/g, $('.popup[data-popup="finish"]').attr('data-time'));
			purl += '/' + $('.popup[data-popup="finish"]').attr('data-short-url');
			
			response = post({
				'action':'share',
				'token':$('.contest-btn-start').attr('data-token'),
				'sm':'tw'
			});
			
			if (response && response.responseJSON) {
				response = response.responseJSON;
				
				if (response.success) {
				} else {
					console.log(response.msg);
				}
			}
			
			url  = 'http://twitter.com/share?';
			url += 'text='      + encodeURIComponent(ptitle);
			url += '&url='      + encodeURIComponent(purl);
			url += '&counturl=' + encodeURIComponent(purl);
			Share.popup(url);
		},
		mailru: function(purl, ptitle, pimg, text) {
			url  = 'http://connect.mail.ru/share?';
			url += 'url='          + encodeURIComponent(purl);
			url += '&title='       + encodeURIComponent(ptitle);
			url += '&description=' + encodeURIComponent(text);
			url += '&imageurl='    + encodeURIComponent(pimg);
			Share.popup(url)
		},
		
		popup: function(url) {
			window.open(url,'','toolbar=0,status=0,width=626,height=436');
			return false;
		}
	};
}

$(bereg.init);