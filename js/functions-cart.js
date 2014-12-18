var hourIndex = 0;

function makeSelectBox () {
	if (!$(".cart-schedule .custom-select > span").hasClass("selectboxit-container")) {
		$(".c2box").selectBoxIt();
	}
	$(".cart-schedule").each(function (){
		var hourList = $(this).find(".deliveryHour .custom-select > span.selectboxit-container");
		$(hourList[0]).css({"visibility":"visible"});
		var dateList = $(this).find(".deliveryDate .custom-select > span.selectboxit-container");
		$(dateList[0]).css({"visibility":"visible"});
	});
}
function selectDate() {
	$("select.deliveryDate").each(function() {
		$(this).on("change",this, function() {
			var currentGroup = $(this).closest(".cart-schedule");
			hourIndex = $(this)[0].selectedIndex;
			currentGroup.find(".deliveryHour .custom-select > span").hide();
			$(currentGroup.find(".deliveryHour .custom-select > span")[hourIndex]).show().css({"visibility":"visible","height":"auto"});
		})
	});
}
$(document).ready(function(){
	$(document).on("click",".schedule-title",function(){
		makeSelectBox();
		selectDate();
		$(this).closest(".cart-schedule").find(".inputs-area").slideToggle(function(){
			if($(this).closest(".cart-schedule").find(".inputs-area").is(":visible")) {
				$(".cart-schedule .inputs-area").addClass("is-schedule");
			}
			else {
				$(".cart-schedule .inputs-area").removeClass("is-schedule");
			}
		});
	});
	$(document).on("mouseover",".cart-content",function(){
		if(!$(this).hasClass("tool-tip-on")) {
			$(this).addClass("tool-tip-on");
			$(".jq-tooltip").each(function(){
				if(this.scrollWidth > $(this).innerWidth()) {
					$(".jq-tooltip").tooltip({track:false});
				}
			});
		}
	});
})