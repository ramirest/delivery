function setContentHeight () {
	var wHeight = $(window).height();
	$(".content").css({"min-height":wHeight});
}
jQuery.fn.redraw = function() {
    return this.hide(0, function() {
        $(this).show();
    });
};

function bodyParalax() {
	var contentHeight = $(".content").outerHeight();
	if ($(document).scrollTop() < contentHeight && $(window).width() > 960 ) {
		var paralax = $(document).scrollTop()/2;
		$(".home .content").css({"background-position": "50%"+ Math.round(paralax)+"px"})
		//$(".wrapper").redraw();
	}
}
function hideShowArrow() {
	if ($(document).scrollTop() > 30 ) {
		$(".content-under-the-fold .arrow").fadeOut();
	}
	else {
		$(".content-under-the-fold .arrow").fadeIn();
	}
}
function animateChain(list,time,screePosition) {
	var top = list.offset().top;
	var wHeight = $(window).height();
	if ($(document).scrollTop() > (top - wHeight/screePosition)) {
		if (!list.hasClass("animated")) {
			list.addClass("animated");
			var number = list.find("li").size();
			var animatingMe = 0;
			var animationChain = setInterval(function(){
				if (animatingMe < number) {
				$(list.find("li")[animatingMe]).addClass("animated");
				animatingMe++
				}
				else {
					clearInterval(animationChain);
				}
			},time);
		}
	}
}
$(document).ready(function(){
	setContentHeight();
	$(window).on("resize", function(){
		setContentHeight();
	});
	$(window).on("scroll", function(){
		bodyParalax();
		hideShowArrow();
		animateChain($(".walkthrough-list"),400,1.2);
		animateChain($(".phones-list"),300,1.4);
	});
	$(".content-under-the-fold .arrow").on("click", function(){
		var position = $(".content").outerHeight() - 60;
	 $('html, body').animate({
	        scrollTop: position
	    }, 500);
	});
	$('.submitCep').focus(function(event) {
		$('.submitCep').click();
	});
	
	$.smartbanner({
		title: 'iFood',
		author: 'http://www.ifood.com.br',
		icon: _ctx+'/css/images/ifood_app.png',
		daysHidden: 15, // Duration to hide the banner after being closed (0 = always show banner)
		daysReminder: 90 // Duration to hide the banner after "VIEW" is clicked (0 = always show banner)
	});

	var bannerHeight = $("#smartbanner").height();
	if($("#smartbanner").length > 0){
		$(".header").css("top", bannerHeight);
		$(".mobile-nav").css("top", bannerHeight);
		$(".mobile-nav").css("height", "-="+bannerHeight);


		$("#smartbanner").css("position", "fixed");
		$("#smartbanner .sb-close").click(function(){
			$(".header").css("top", "0");
			$(".mobile-nav").css("top", "0");
		})
		$("#smartbanner .sb-button").click(function(){
			$(".header").css("top", "0");
			$(".mobile-nav").css("top", "0");
		})
	}else{
		$(".header").css("top", "0");
		$(".mobile-nav").css("top", "0");
		$(".mobile-nav").css("height", "+="+bannerHeight);
	}

	var BUSCA_CEP = $("#buscaCep");
	var NAO_SEI_CEP = $("#buscaCepPorEndereco");
	var isLogged = false; //$("#logged").val();

	/*Event binding*/
	NAO_SEI_CEP.on("click", submitFormCepHandler);
	BUSCA_CEP.on("submit", submitFormCepHandler);
	$("input[type='button']", BUSCA_CEP).on("click", focusFormCepHandler);


	/**
	 * Quando o botao de submit eh focado (por exemplo, no mobile, quando o botao "proximo" eh pressionado,
	 * podemos submeter o formulario se cp parece OK.
	 */
	function focusFormCepHandler(){
		var cep = $("#cep").val();
		if($.trim(cep) != "") {
			BUSCA_CEP.submit();
		}
	}

	/**
	 * Submissao do formulario de busca de cep da homepage
	 * @param ev o evento de submissao
	 */
	function submitFormCepHandler(ev){
		/**
		 * Callback para tratar o locationId achado pelo webservice (ou, tratar o caso de não ter achado nenhum)
		 * @param result O resultado do WebService
		 */
		function selecionaEnderecoModuloCep(result){
			if (result != null && result.location != null) {
				var location = result.location;
				$('#locationId').val(location.locationId);
				$('#city').val(location.city);
				$('#state').val(location.state);
				$('#numeroCep').val(location.zipCode);
				$('#ruaString').val(location.address);
				$('#numeroCasa').val(location.streetNumber);

//				var form = BUSCA_CEP.serialize();
//				$.ajax({
//				type:"POST",
//				data: form,
//				url: _ctx + URL_DATA
//				}).done(function(){
				BUSCA_CEP.off("submit");
				BUSCA_CEP.submit();
//				});

			} else {
				$('#cep').focus();
			}
		}

		/**
		 * Abre popin para o usuário buscar o logradouro
		 */
		function buscarCepByLogradouroModuloCep(){
			buscaCepGlobal.abrirSemEndereco(selecionaEnderecoModuloCep, isLogged);
		}

		ev.stopPropagation();
		ev.preventDefault();

		var cep = $("#cep", ev.target).val();
		//TODO valida cep
		buscaCepGlobal.buscaNumCep(cep, selecionaEnderecoModuloCep, isLogged);
	}

	$("#cep").focus();
});
