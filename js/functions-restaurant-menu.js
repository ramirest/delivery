$(document)
.on('click', '#cboxClose', function(event) {
	event.stopPropagation();
	jsonComplementos = [""];
});

$(document).ready(function(){
	var rid = $("#rid").val();
//	refreshCart(rid);
	setFloatingCart();

	addPromoAuto();
});

function changeDeliveryType(event){
	event.preventDefault();

	var url = _ctx + URL_DELIVERY + "/" + $('#siteUrl').val();
	
	if(location.search.indexOf("togo=true") > 0) {
		window.location = url;
	} else {
		window.location = url + "?togo=true";
	}
}

function addPromoAuto(){
	if($("#promoAuto")!=null && $("#promoAuto").val()!="" && $("#promoAuto").length>0){
		var code = $("#promoAuto").val();
		$("#promoAuto").remove();
		addToCart("form"+code);
	}else if($("#promoAutoGarnish")!=null && $("#promoAutoGarnish").val()!="" && $("#promoAutoGarnish").length>0){
		var code = $("#promoAutoGarnish").val();
		$("#promoAutoGarnish").remove();
		$("#garnish"+code).click();
	}
}

function setFloatingCart(){
	$(function() {
		var offset = $(".cartFloating").offset();
//		//Altura que a div vai ficar em relação ao topo do navegador
//		var topPadding = 15;
//		$(window).scroll(function() {
//			if ($(window).scrollTop() > offset.top) {
//				$(".cartFloating").stop().animate({
//					marginTop: $(window).scrollTop() - offset.top + topPadding
//				});
//			} else {
//				$(".cartFloating").stop().animate({
//					marginTop: 0
//				});
//			};
//		});
		$(window).scroll(function() {
			if ($(window).scrollTop() > offset.top - 20) {
				$(".cartFloating").addClass("fixedCart");
			} else {
				$(".cartFloating").removeClass("fixedCart");
			};
		});
		
	});
}

/*Filtro*/
var selectBox = $("select#categoryFilter").selectBoxIt().data("selectBoxIt");
$("#categoryFilter").change(function() {
	var id = $('#categoryFilter').val().trim().replace(/\ /g, "\\ ").replace(/\'/g, "");
	$(".results-section", document).each(function(index){
		if(id == ''){
			$(this)[0].style.display = 'block';
		} else {
			$(this)[0].style.display = 'none';
		}
	});
	$('#' + id)[0].style.display = 'block';
	
	return false;
});
$('#searchField')
.focusout(function(e) {
	search();    
})
.keyup(function(event) {
	if (event.which === 13 || event.keyCode == 13 || $('#searchField').val() == "" ) {
		search();    
	}
});

function refreshCart(rid){
	$.ajax({
		cache: false,
		type: "GET",
		dataType: "html",
		url: _ctx + URL_DELIVERY + URL_REFRESH_CART + "?rid="+rid
	}).done(function(data){
		cart(data);
	});
}

function applyingCampaign(rid){

	var voucherCampaign = "";
	var btns = $(".btnOk");
	$(".field-wrap.campaign input#voucherCampaign").each(function(i) {
		if ($(this).val() != ""){
			voucherCampaign = $(this).val();
		}
	});

	$.ajax({
		cache: false,
		type: "GET",
		dataType: "html",
		data: { voucher : voucherCampaign, rid: rid },
		beforeSend: initLoadingAnimationDots(btns),
		url: _ctx + URL_DELIVERY + URL_APPLYING_CAMPAIGN
	}).done(function(data){
		cart(data);
		btns.removeClass("loadingDots");
		if ($("#campaignMessage").val() != null){
			modal($("#campaignMessage").val());
		}
	});
}

function addToCart(idForm, closed, supportsSchedule){
	if(closed && !supportsSchedule){
		modal("O restaurante está fechado neste momento.");
		return;
	}

	if ($(window).width() <= 479){
		var hasAnotherCart = $('#anotherCart').val();
		if(hasAnotherCart == 'true'){
			if(!confirm('Você tem itens em outro carrinho.\nAdicionar novos itens apagará os itens selecionados no outro restaurante.\nTem certeza?')){
				return;
			}
		}
	}

	var form = $("#"+idForm).serialize();
	var formBtnAdd = $("#"+idForm).find(".btn-add");
	$.ajax({
		cache: false,
		type: "POST",
		dataType: "html",
		data: form,
		beforeSend: initLoadingAnimation(formBtnAdd),
		url: _ctx + URL_DELIVERY + URL_ADD_ITEM
	}).done(function(data){
		cart(data);
		increaseMobileCounter();
		successLoadingAnimation(formBtnAdd);
		cartLoadedAnimation();
	});
}

function cart(data){
	$("#cartContent").children().remove();
	$("#cartContent").append(data);
	$("#cartContent").find("script").each(function(i) {
		eval($(this).text());
	});

	$("#mobileCart").children().remove();
	$("#mobileCart").append(data);
	$("#mobileCart").find("script").each(function(i) {
		eval($(this).text());
	});
}

function increaseCartItem(id, code, pos){
	var form = "rid="+id+"&code="+code+"&pos="+pos+"&description=&unitPrice=&qty=1";
	$.ajax({
		cache: false,
		type: "POST",
		dataType: "html",
		data: form,
		url: _ctx + URL_DELIVERY + URL_ADD_ITEM
	}).done(function(data){
		//increase qty counter
		var currentQty = $('.qty_' + code).html();
		var qty = parseInt(currentQty) + 1;
		$('.qty_' + code).html(qty) ;

		cart(data);
		increaseMobileCounter();
	});
}

function decreaseCartItem(id, code, p){
//	var form = "id="+id+"&code=" + code
	$.ajax({
		cache: false,
		type: "GET",
		data: {rid: id, code: code, pos: p},
		url: _ctx + URL_DELIVERY + URL_REMOVE_ITEM
	}).done(function(data){
		cart(data);
		decreaseMobileCounter();
	});
}

function increaseMobileCounter(){
	var n = parseInt($("#itensCart").html())
	$("#itensCart").html(n + 1);
}

function decreaseMobileCounter(){
	var n = parseInt($("#itensCart").html())
	if (n >= 1){
		$("#itensCart").html(n - 1);
	} else {
		$("#itensCart").html(0);
	}
}

function addObs(type){
	if (type == "V3") {
		var obs = $("#cboxContent").find("textarea").val();
		var rid = parseFloat($("#rid").val());
		$("#pizzaType option:selected").data("obs",obs);
		$('#cboxClose').click();
		addPizzaToCart(rid);
	}
	else {
		var sufixId = $("#sufixId").val();
		var itemId = $("#itemId").val();
		var template = $("#template").val();
		var obsValue = $("#obs").val();
		var obsInputId = '#obs' + sufixId;
	
		$('#cboxClose').click();
		if(template == 'default'){
			var popUpId = '#popup' + sufixId;
			$(obsInputId).val(obsValue);
			$(popUpId).attr('href', _ctx + URL_DELIVERY + URL_POPUP_OBS + "?sufixId=" + sufixId + "&itemId=" + itemId + "&obs=" + escape(obsValue) + "&template=" + template);
	
			var garnishId = '#garnish' + sufixId;
			if ($(garnishId).length > 0) {
				setTimeout(function() { $(garnishId).click()}, 500);
			} else {
				addToCart("form" + sufixId);
				$(obsInputId).val("");
				$(popUpId).attr('href', _ctx + URL_DELIVERY + URL_POPUP_OBS + "?sufixId=" + sufixId + "&itemId=" + itemId + "&obs=" + "&template=" + template);
			}
		} else {
			var popUpId = '.popup' + sufixId;
			$(obsInputId).val(obsValue);
			//salva no codeGarnish os codigos do complementos escolhidos
			$(popUpId, document).each(function(index){
				var link = $(this).attr('href').split("&obs=");
				var newLink = link[0] + "&obs=" + escape(obsValue);
				$(this).attr('href', newLink);
	
			});
			$(".btn-add." + itemId).click();
		}
	}
}

function addObsMobile(sufixId, itemId, template, closed, supportsSchedule){
	if(closed && !supportsSchedule){
		modal("O restaurante está fechado neste momento.");
		return;
	}

	var obsValue = $("#obsForm" + sufixId).val();
	var obsInputId = '#obs' + sufixId;
	$(obsInputId).val(obsValue);
	$('.popup-content:visible').stop(true,true).slideUp(300);

	if(template == 'default'){
		if ($('#garnishMobile' + sufixId).length > 0) {
			$('#garnishMobile' + sufixId).click();
		} else {
			addToCart("form" + sufixId);
			$(obsInputId).val("");
		}
	} else {
		$(".btn-add." + itemId).click();
	}
}

function formatMoney(money){
	money = money.toLocaleString();
	var comma = money.indexOf(",");
	if(comma > 0){
		money = money.substring(0, comma+2);
		if(money.substring(comma).length<3){
			money = money + "0";
		}
	} else {
		money = money + ",00";
	}
	return money;
}

function verify(event, closed, supportsSchedule){
	if(closed && !supportsSchedule){
		if(event){
			event.stopPropagation();
			event.preventDefault();
		}

		modal("O restaurante está fechado neste momento.");
		return;
	}
}

function finishOrder(minOrder, closed, clickedEl){
	if(closed && $('.cart-schedule').length == 0){
		modal("O restaurante está fechado neste momento.");
		return;
	} else if(closed && $('.cart-schedule').length > 0 && !$(".cart-schedule .inputs-area").hasClass("is-schedule")) {
		modal("O restaurante está fechado, favor agendar o pedido.");
		return;
	}

	var subtotal = parseFloat($("#subtotal").val());
	var deliveryfee = $("#deliveryfee").val();
	var credit = ($("#credit").val()==undefined? 0 : parseFloat($("#credit").val()));
	var emptyCart = ($('#emptyCart').val() == undefined? false : true);
//	if(minOrder != null && subtotal - deliveryfee < minOrder){
	if(emptyCart){
		modal("Carrinho vazio!");
	} else if(minOrder != null && subtotal+credit < minOrder){
		modal("Pedido mínimo é de " + formatMoney(minOrder));
	} else {
		var url = _ctx + URL_ORDER + URL_FINISH_ORDER;
		
		if($('.cart-schedule').length > 0 && $(".cart-schedule .inputs-area").hasClass("is-schedule")) {
			var date = $(clickedEl).closest(".cart").find("select[name=deliveryDate]").val()
			var hour;
			if($(clickedEl).closest(".cart").find(".deliveryHour .custom-select > span:visible .selectboxit-text").length > 1) {
				hour = $($(clickedEl).closest(".cart").find(".deliveryHour .custom-select > span:visible .selectboxit-text")[hourIndex]).text();
			} else {
				hour = $(clickedEl).closest(".cart").find(".deliveryHour .custom-select > span:visible .selectboxit-text").text();
			}

			url += "?date=" + date + " " + hour;
		}
		
		document.location = url;
		initLoadingAnimationDots(clickedEl);
		console.log(clickedEl + "   " + $(clickedEl)); 
	}
}

function checkSearchResults(input) {
	var countVis = 0;
	var countHide = 0;
	var totalInfos = $("div.info").length;
	$("div.info").each(function(){ 
		if( $(this).attr("style") == "display: block;") {
			countVis++;
		}
		if( $(this).attr("style") == "undefined") {
			countVis++;
		}
		if( $(this).attr("style") == "display: none;") {
			countHide++;
		}
	});
	if (countHide == totalInfos) {
		$("#searchMsg").html('nenhum resultado referente a "'+input+'"');
		$("#searchMsg").show();
	}
	else {
		$("#searchMsg").hide();
	}
}
function search(){
	$("#searchMsg").hide();
	var input = $('#searchField').val().toLowerCase();
	$("div.info .results-section .result-exp-content.pizza-content").each(function(){
		var found = 0;
		$(this).find("div.list form .text-wrap").each(function(){
			if($(this).html().toLowerCase().search(input)==-1){
				$(this).closest("form").hide();
			}else{
				$(this).closest("form").show();
				found++;
			}
		});
		if(found == 0){
			$(this).closest("div.info").hide();
		}else{
			$(this).closest("div.info").show();
		}
	});
	$("div.info .results-section .result-exp-content:not(.pizza-content)").each(function(){
		var found = 0;
		$(this).find("li .text-wrap").each(function(){
			if($(this).html().toLowerCase().search(input)==-1){
				$(this).closest("li").hide();
			}else{
				$(this).closest("li").show();
				found++;
			}
		});
		if(found == 0){
			$(this).closest("div.info").hide();
		}else{
			$(this).closest("div.info").show();
		}
	});
	checkSearchResults(input);
}
/*
function search(){
	$("#searchMsg").hide();
	//show itens template default
	$(".results-section li", document).each(function(index){
		$($(this)[0]).closest(".info").show();
		$(this)[0].style.display = 'block';
	});

	//show itens template pizza
	/*$(".saborForm", document).each(function(index){
		$(this)[0].style.display= 'block';
	});
	if($('.pizza-content').size() > 0){
		$('.pizza-content').find('.options').show();
		getTamanho();
	}
	 *//*
	var input = $('#searchField').val();
	if(input != ''){
		//hide itens template default
		$(".results-section li", document).each(function(index){
			if($(this).find('.text-wrap').size() > 0 && $(this).find('.text-wrap').html().toLowerCase().indexOf(input.toLowerCase()) == -1){
				$($(this)[0]).closest(".info").hide();
			}
		});
		checkSearchResults(input);
		//hide itens template pizza
		$(".saborForm", document).each(function(index){
			if($(this).find('.text-wrap').html().toLowerCase().indexOf(input.toLowerCase()) == -1){
				$(this)[0].style.display = 'none';
			} else {
				$(this)[0].style.display = 'block';
				console.log("nada")
			}
		});

		if($('.pizza-content').size() > 0){
			//hide radios template pizza
			var showPizza = false;
			$('.pizza-content').find('.list').find('li').each(function(index){
				var showoption = false;
				$(this).find('.saborForm').each(function(index){
					if($(this).css('display') == 'block'){
						showPizza = true;
						showoption = true;
					}
				});
				if (showoption) {
					$(this).attr("display", "list-item");
					$(this).show();
				}
			});
			if(!showPizza){
				$('.pizza-content').find('.options').hide();
			}
		}
	}
}
*/

function garnish(form, index){
	chooseGarnish.popinGarnish(form + "&index=" + index);
}
