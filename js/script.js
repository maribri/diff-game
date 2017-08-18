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
		
		var self = this;
		//this.globalScore = 0;
		this.score = 0;
		this.globalLevel = 0;
		this.timer;
		this.timerVal = {};
		console.log(this.timerVal);
		this.count = {};
		this.length = {};
		
		this.statusGame = {};
		this.statusGame.show = false;
		
		this.elements.$block         = $(".block-contest");
		this.elements.$activeLevels  = $(".contest-level");
		this.elements.$progressLevel = $(".levels-progress");
		this.elements.$totalLevel    = $(".levels-total");
		this.elements.$btnStart      = $('.contest-btn-start');
		this.elements.$btnReload     = $('.contest-btn-reload');
		
		//this.firstStart = false;
		
		this.elements.$block.addClass("_active").removeClass("_game");
		
		//TweenMax.set(this.elements.$block.find(".contest-level"), { autoAlpha: 0 }); todo 24 03
		
		/*if (!this.firstStart) {
			
		} else {
			
			this.setLevel(bereg.levels.currentLevel)
			
		}*/
		this.randomizeLevels();
		this.setGame(0);
		
		this.elements.$btnStart.click(function() { self.startGame() });
		this.elements.$btnReload.click(function() { self.reloadGame() });
		
		//localStorage["diffGameStat"] = gGameInProgress;
	},
	
	setGame: function(level) { // set game before start
		
		//this.firstStart = true;
		
		this.elements.$level = /*$(".contest-level")*/this.elements.$activeLevels;
		this.elements.$levelCurrent = this.elements.$level[level];
		this.elements.$area = $(".contest-area-item");
		this.elements.$backlight = $(".contest-circle-item");
		this.elements.$progressItem = $(".num-progress");
		this.elements.$totalItem = $(".num-total");
		this.elements.$progressLevel = $(".levels-progress");
		
		this.globalLevel = $(this.elements.$level[0]).attr('data-level');
		console.log('global level on set game '+this.globalLevel);
		
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
	
	startGame: function() { // start game with button
		
		// Check auth
		
		//this.elements.$totalLevel.html(this.length.level);
		
		this.elements.$btnStart.hide();
		$('.contest-preloader').hide();
		$('.contest-btn-reload').show();
		$('.contest-btn-skip').show();
		this.elements.$totalLevel.html(this.length.level).parent('.contest-level-row').show();
		this.setTimer();
		//console.log(this.timerVal);
	},
	
	reloadGame: function() { // game restarted
		
		//console.log('global score '+this.globalScore);
		
		$('.popup[data-popup="finish"]').hide();
		this.randomizeLevels();
		
		// Check attempts
		/*response.msg == 'Доступно только 3 попытки в сутки.');
		bereg.common.openPopup('no-attempts');*/
		
		clearInterval(this.timer);
		var startLevel = $('.contest-level:first-child').attr('data-level');
		
		this.setGame(startLevel);
		$('.contest-preloader').hide();
		$('.contest-btn-skip').show();
		this.setTimer();
		
	},
	
	finishGame: function() { // game finished
		
		console.log('win!');
		
		clearInterval(this.timer);
		$('.contest-preloader').show();
		$('.contest-btn-skip').hide();
		//$('.popup[data-popup="finish"]').show();
		
		$('.timer-result').html($('.contest-timer .min').html() + ':' + $('.contest-timer .sec').html()); // todo
		//$('.contest-timer').html('<span class="min">'+15+'</span>:<span class="sec">'+15+'</span>');
		$('.text-cnt').html($('.popup[data-popup="finish"]').attr('data-cnt'));
		
		//console.log(response.msg);
		bereg.common.openPopup('finish');
	},
	
	setTimer: function() { // start timer
		
		//console.log('timer starts');
		var self = this;
		//var timeArr = [];
		
		function Calcage(secs, num1, num2) {
			s = ((Math.floor(secs / num1)) % num2).toString();
			if (s.length < 2) {
				s = "0" + s;
			}
			return (s);
		}
		
		var i = 0;//время в сек.
		function time(){
			self.timerVal.minutes = Calcage(i, 60, 60);
			self.timerVal.seconds = Calcage(i, 1, 60);
			$(".contest-timer .min").html(self.timerVal.minutes);
			$(".contest-timer .sec").html(self.timerVal.seconds);//визуальный счетчик
			i++;//увеличение счетчика
			//self.timerVal = timeArr;
			//timerValue = timeArr.minutes+':'+timeArr.seconds;
			//if (i > 75) { console.log('time is out'); clearInterval(timer); }
			console.log(self.timerVal);
		}
		time();
		this.timer = setInterval(time, 1000);
		console.log(this.timerVal);
	},
	
	getInstance: function(holder) {
		
		var instance = {};
		
		var parentElement = holder;
		
		instance.rightAnswer = this.rightAnswer;
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
		
		instance.elements.$area.on('click', function(event) { instance.rightAnswer($(event.currentTarget).data("item")) });
		
		instance.elements.$image.on('click', function(event) { instance.wrongAnswer(event, $(event.target)) });
		
		return instance;
		
	},
	
	setLevel: function(level) { // set level
		
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
		
		this.globalLevel = level;
		console.log('globalLevel on set level '+this.globalLevel);
		
	},
	
	randomizeLevels: function() { // mixing levels
		
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
	
	skipLevel: function() { // skip level
		
		console.log('skip');
		console.log('globalLevel on skip level '+this.globalLevel);
		var nextLevel = this.elements.$level.filter("[data-level='" + this.globalLevel + "']").next('.contest-level');
		//if(nextLevel.hasClass('active-level')) { console.log('inArray'); } else { console.log('not inArray'); }
		//console.log($.inArray(nextLevel, this.elements.$level));
		
		if (nextLevel.length && nextLevel.hasClass('active-level')) {
			this.setLevel(nextLevel.attr('data-level'));
		} else {
			this.finishGame();
		}
	},
	
	rightAnswer: function(id) { // ткнули в различие
		console.log(this.timerVal);
		this.elements.$area.filter("[data-item='" + id + "']").css("display","none");
		TweenMax.to(this.elements.$backlight.filter("[data-item='" + id + "']"), 0.3, { autoAlpha: 1 });
		
		this.score++;
		
		$(this.elements.$progressItem).html(this.score);
		
		this.count++;
		
		console.log('right!');
		this.globalLevel = $(this.elements.$area).parents('.contest-level').attr('data-level');
		console.log('globalLevel on diff '+this.globalLevel);
		
		if (this.score === 5) { // TODO 5 to total
			console.log('level finished');
			
			var nextLevel = this.elements.$area.filter("[data-item='" + id + "']").parents('.contest-level').next('.contest-level');
			if (nextLevel.length && nextLevel.hasClass('active-level')) {
				console.log('is next');
				this.setLevel($(this.elements.$area).parents('.contest-level').next('.contest-level').attr('data-level'));
			} else {
				console.log('no next');
				this.finishGame();
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

//*******************************************
//
//	Common functions
//
//*******************************************

bereg.extend("common", {
	
	init: function() {
		
		this.elements = {};
		this.elements.$popup = $(".popup");
		this.elements.$close = this.elements.$popup.find(".close");
		
		var self = this;
		this.elements.$close.click(function() { self.closePopup() });
		
	},
	
	openPopup: function(popup) {
		
		var popupBlock = this.elements.$popup.filter("[data-popup='" + popup + "']");
		var top = ($(window).height() - popupBlock.height()) / 2;
		popupBlock.css('top', top).show();
		
	},
	
	closePopup: function(popup) {
		
		$(this).parents(this.elements.$popup).hide();
		
	}
	
});

$(bereg.init);