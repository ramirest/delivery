var chooseGarnish = null;
var jsonComplementos = [""];
$(document).ready(function(){
	chooseGarnish = new ChooseGarnish();
});

function ChooseGarnish(){
	var root = this;
}

function returnComplemento(id){
	var idForm = $('#idForm').val();
	var formBtnAdd = $(".btn_next");
	console.log(formBtnAdd);
	var form = JSON.stringify($("#form"+idForm).serializeObject());
	var content = {rid: id, garnish: jsonComplementos, item: form};
	 $.ajax({
		 cache: false,
		 type: "POST",
		 dataType: "json",
		 data: content,
		 async: true,
		 beforeSend: initLoadingAnimationDots(formBtnAdd),
		 url: _ctx + URL_DELIVERY + URL_ADD_ITEM_GARNISH
	  }).always(function(data) {
		  jsonComplementos = [""];
		  $('.popup-content-garnish:visible').stop(true,true).slideUp(300); //close mobile slide
		  $('#cboxClose').click(); //close web popup
		  refreshCart(id);
		  increaseMobileCounter();
		  successLoadingAnimation();
		  cartLoadedAnimation();
	 });
}

/* validacao do complemento escolhido (quantidade/obrigatoriedade)*/
function garnishValidation(garnishQty, minGarnish, maxGarnish ){
	var i;
	var totalGarnishQty = 0;
	for(i = 0; i < garnishQty.length; i++){
		totalGarnishQty += parseInt(garnishQty[i]);
	}
	if(totalGarnishQty < minGarnish){
		modal("Quantidade inválida de complementos. Favor verifique seu pedido.");
		return false;
	}
	if(totalGarnishQty > maxGarnish){
		modal("Quantidade inválida de complementos. Favor verifique seu pedido.");
		return false;
	}
	return true;
}

/* adiciona o complemento escolhido ao json de resposta e monta a proxima
 * tela exibindo o proximo set de complementos */
function addComplemento(id, garnishCode){

	var chosenGarnishCode = new Array();
	var chosenGarnishQty = new Array();
	var complementoIsEmpty = true;

	var tabPane = $('.tabPane-' + garnishCode.replace(/\ /g, '.'))[0]; //tab corrente

	var codProduto = $(".codProduto:first", tabPane).val();   //codigo do item
	var codeGarnish = $(".codeGarnish:first", tabPane).val(); //codigo do tipoComplemento
	var minGarnish = $(".minGarnish:first", tabPane).val();   //minimo de complementos necessario para o tipoComplemento corrente
	var maxGarnish = $(".maxGarnish:first", tabPane).val();   //maximo de complementos possivel para o tipoComplemento corrente

	//salva no codeGarnish os codigos do complementos escolhidos
	$(".codeGarnishItemClass", tabPane).each(function(index){
		if ($(this).attr("type").toLowerCase() == "radio" && $(this).is(":checked") || $(this).hasClass("unico")){
			chosenGarnishCode = new Array($(this).val());
			chosenGarnishQty[0] = 1;
			complementoIsEmpty = false;
			return false;
		} else if ($(this).attr("type").toLowerCase() != "radio") {
			chosenGarnishCode[index] = $(this).val();
		}
	});

	//salva no codeGarnish as quantidades do complementos escolhidos, no caso ser possivel qty > 1
	$(".qty-garnishitem-input", tabPane).each(function(index){
		chosenGarnishQty[index] = parseInt($(this).html());
		if(chosenGarnishQty[index] != '0'){
			complementoIsEmpty = false;
		}
	});
	if(chosenGarnishCode.length == 1 && chosenGarnishQty.length == 0){
		chosenGarnishQty[0] = minGarnish;
	}

	//Monta JSON deste tipoComplemento {<codigo do tipoComplemento>, <array com codigos dos complementos escolhidos>,  <array com quantidades dos complementos escolhidos> }
	var content = {garnishCode: codeGarnish, garnishItensCode: jQuery.makeArray(chosenGarnishCode), garnishItensQuantity: jQuery.makeArray(chosenGarnishQty) };

	if (garnishValidation(chosenGarnishQty, minGarnish, maxGarnish)){

		//Adiciona ao json do produto a lista de tipoComplementos corrent
		jsonComplementos.push(JSON.stringify(content));

		//Muda para a tab do pr�ximo tipoComplemento
		if(findNextTab(garnishCode) != null){
			var nextTabPane = findNextTab(garnishCode);
			tabPane.style.display = 'none';
			nextTabPane.style.display = 'block';
		} else {
			returnComplemento(id);
		}

		/* Preenchendo aba do resumo
		var resumo = "-";
		if(chosenGarnishCode.length == 1 && chosenGarnishQty[0] > 0){
			resumo = $(".li-garnish-"+chosenGarnishCode[0]+" .text-wrap", tabPane).html();
		} else {
			$.each(chosenGarnishCode, function(index, cod) {
				var nome = $(".li-garnish-"+cod+" .text-wrap", tabPane).html().replace("<strong>", "");
				var qtde = chosenGarnishQty[index];
				resumo = "<strong>" + (index > 0 ? resumo : "") + (qtde && qtde > 0 ? qtde +"x " + nome  : "");
			});
		}
		$(".tabPane-resumo."+codProduto+" .resumo-"+codeGarnish+" span").html(resumo); */
	}
	$.colorbox.resize();

	if ($(window).width() <= 479){
		var container = tabPane.parent();
	    scrollTo = tabPane;

		container.animate({
		    scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
		});
	}

	return false;

}

/*** UTILS ***/

$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

/* retorna a proxima tab de complemento, se existir. se nao, retorna null*/
function findNextTab(garnishCode){
	var nextTabPane = null;
	if ($('.tabPane-' + garnishCode).next('.tabPane').length > 0){
		nextTabPane = $('.tabPane-' + garnishCode).next('.tabPane')[0];
	}
	return nextTabPane;
}


/* Resize popup's height according to new content*/
function resizePopUp(){
	$.colorbox.resize();

	var popupPos = parseInt($("#colorbox").css("top"));
	window.scrollTo(0, popupPos);
}

/* Funcao que valida se o valor recebido eh um numero */
function isNumber(value){
	var regex = new RegExp("^\\d+$");
	if (value.match(regex)){
		return true;
	} else {
		return false;
	}
}

/* Decrementa a quantidade existente no campo passado como parametro.
 * Este campo deve ser um element */
function reduceQty(campo){
	if (!isNumber(campo.html())){
		modal("A quantidade deve ser um n\u00famero maior ou igual a 0.");
		// Reinicia o valor do campo
		campo.html(0);
		return;
	}
	if (campo.html() == null || campo.html() == "0"){
		return false;
	}
	campo.html(parseInt(campo.html()) - 1);
	return false;
}

/* Incremanta a quantidade existente no campo passado como parametro.
 * Este campo deve ser um element */
function increaseQty(campo){
	var panelCode = $(campo).closest('.tabPane').find('.codeGarnish').val();
	var maxGarnish = parseInt($(campo).closest('.tabPane.tabPane-'+panelCode).find('.maxGarnish').val());
	var totalGarnish = 0;
	$('.tabPane.tabPane-'+panelCode+' .qty-garnishitem-input').each(function(){
		totalGarnish += parseInt($(this).html());
	});
	if(totalGarnish+1 > maxGarnish){
		return false;
	}
	if (!isNumber(campo.html())){
		modal("A quantidade deve ser um n\u00famero maior ou igual a 0.");
		// Reinicia o valor do campo
		campo.html(0);
		return;
	}
	if (campo.html() == null || campo.html() == ""){
		// Seta o valor para zero antes de incrementar
		campo.html(0);
	}
	campo.html(parseInt(campo.html()) + 1);
	return false;
}

function clear(){
	jsonComplementos = [""];
}
