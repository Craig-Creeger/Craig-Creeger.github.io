$(document).ready(function() {
	var contentWidth = $('.PxSliderWrapper').css('width');
	var curIdx = 0;
	var sliderItems = new Array();
	
	function nextItem() {
		if (curIdx===sliderItems.length - 1) {
			return 0;
		} else {
			return curIdx + 1;
		}
	}
	
	function prevItem() {
		if (curIdx===0) {
			return sliderItems.length - 1;
		} else {
			return curIdx - 1;
		}
	}
	
	$('.PxSliderNext').click(function() {
		$(sliderItems[nextItem()]).css({left:contentWidth});
		$(sliderItems[curIdx]).animate({left:"-"+contentWidth},800,'swing'); //push current item to the left
		$(sliderItems[nextItem()]).animate({left:0},800,'swing'); //slide new item left, into view
		curIdx = nextItem();
		lightCurrentIndicator();
	});
	
	$('.PxSliderPrev').click(function() {
		$(sliderItems[prevItem()]).css({left:"-"+contentWidth});
		$(sliderItems[curIdx]).animate({left:contentWidth},800,'swing'); //push current item to the right
		$(sliderItems[prevItem()]).animate({left:0},800,'swing'); //slide new item right, into view
		curIdx = prevItem();
		lightCurrentIndicator();
	});
	
	function lightCurrentIndicator() {
		$('.PxSliderIndicator button').removeClass('current');
		$($('.PxSliderIndicator button')[curIdx]).addClass('current');
	}

	$('.PxSliderContent').each(function(idx,elem) {
		if (idx===0) {
			$(this).css({left:0});
		} else {
			$(this).css({left:contentWidth});
		}
		sliderItems.push(elem);
	});
	
	//Create the navigation indicators
	var szInd = '<ul class="PxSliderIndicator">';
	for (var i=0;i<sliderItems.length;i++) {
		szInd += '<li><button></button></li>';
		//szInd += '<li><button>' + i + '</button></li>'; //Use this one if you want sequence numbers in the indicators.
	}
	szInd += '</ul>';
	$('.PxSliderIndicators').append(szInd).find('button').on('click',function() {
		var $btns = $('.PxSliderIndicators button');
		var existing = curIdx;
		for (var i=0; i<sliderItems.length; i++) {
			if (this===$btns[i]) {
				curIdx = i;
				break;
			}
		}
		$(sliderItems[curIdx]).css({left:"-"+contentWidth});
		$(sliderItems[existing]).animate({left:contentWidth},800,'swing'); //push current item to the right
		$(sliderItems[curIdx]).animate({left:0},800,'swing'); //slide new item right, into view
		lightCurrentIndicator();
	});
	lightCurrentIndicator();
});
