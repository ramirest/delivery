/* Evaluation area */
function calcRestaurantAverage () {
	$(".star-container").addClass("animated");
	var avgPure = parseFloat($(".rest-score").html().replace(/,/g, '.'));
	var avgPercent = avgPure * 100 /5;
	$(".star-sliding").css({"width": avgPercent+"%"});
}
$(document).ready(function() {
	if($(".text-col-right").length > 0) {
		calcRestaurantAverage();
	}
	$(".tag").tooltip({ tooltipClass: "tooltip-arrowless" });
});