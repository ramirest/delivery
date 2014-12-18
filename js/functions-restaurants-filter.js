var loadingMore = false;

var restTab;
var favTab;
var promosTab;

$(document).ready(function() {

	$("#page").val(1);// set the page to one to prevent to load empty html

	restTab = $(".content_restaurantes");
	favTab = $( ".content_orders");
	promosTab = $(".content_promos");
	
	$(".rest-list-filter").on("click","li", function() {
		var ul = $(this).closest(".rest-list-filter");
		var li = $(this).find(".filterTrigger");
		if(ul.hasClass("processing")) {
		//do nothing	
		} else {
			ul.addClass("processing");
			if(!li.hasClass("active")) {
				ul.find(".filterTrigger").removeClass("active");
				ul.find(".dd").hide();
			}
			li.toggleClass("active");
			$(this).find(".dd").slideToggle(function(){
				ul.removeClass("processing");
			});
		}
	});
	$(".rest-list-filter .dd").on("click",this,function(e) {
		e.stopPropagation();		
	});
	$(".rest-list-filter .dd").on("click", "input[type='checkbox']", function(e){
		e.stopPropagation();
	});
	$(".rest-list-filter .dd .close-btn").on("click",this,function(){
		$(this).closest(".dd").slideUp();
		$(".rest-list-filter").find(".filterTrigger").removeClass("active");
	});
	$(".rest-list-filter .dd").on("click","li",function(e){
		//e.stopPropagation();
		var checkBox = $(this).find("input[type='checkbox']");
		if(checkBox.is(":checked")) {
			checkBox.prop('checked',false).change();
		} else {
			checkBox.prop('checked',true).change();
		}
	});
	$(".select-all").on("change","input",function(){
		if($(this).prop("checked")) {
			$(this).closest(".dd").find("input[type='checkbox']").prop('checked',true);
		} else {
			$(this).closest(".dd").find("input[type='checkbox']").prop('checked',false);
		}
	});
	$(".rest-list-filter .dd").on("change","li input[type='checkbox']",function(){
		var listInputs = $(this).closest(".dd").find("li input[type='checkbox']");
		for (var i = 0; i < listInputs.length; i++) {
			if($(listInputs[i]).prop("checked") == false) {
				$(this).closest(".dd").find(".select-all input").prop('checked',false);
				return;
			}
		}
		$(this).closest(".dd").find(".select-all input").prop('checked',true);
	});
	$(".dd .btn").on("click",function(e){
		e.preventDefault();
		e.stopPropagation();
		var currentId = $(this).prop("id");
		
		if (currentId == 'filtroCozinha') {
			mudaFiltroCozinha();
		}
		if (currentId == 'filtroPreco') {
			mudaFiltroPreco();	
		}
		if (currentId == 'filtroTempo') {
			mudaFiltroTempo();
		}
		if (currentId == 'filtroPay') {
			mudaFiltroPagamento();
		}
		$(".rest-list-filter .filterTrigger").removeClass("active");
		$('.dd').hide();
		$("#page").val(1);
		filtroAjax();
	});
	
	$(window).scroll(function(){
		if((parseInt($("#page").val())-1 <= parseInt($("#quantidade").val())/parseInt($("#pageSize").val())) && $(window).scrollTop() >= $(document).height() - $(window).height() - $(".footer").height()){
			loadingMore = true;
			filtroAjax();
		}
	});
	var tipo_cozinha = $(".cozinhas_select").text(); //titulo do filtro de cozinhas

	filtroAjax();
	favoritosAjax();
	promoAjax();
	enableDisableFilter("enable");

	$('#searchFilterField').keyup(function(event) {
		if ($('#searchFilterField').val() == "" || event.keyCode == 13) {
			$("#page").val(1);
			filtroAjax();
		}
	});
	$("#filtroSearch").on("click", function(ev){
		ev.stopPropagation();

		$("#page").val(1);	
		//filterSearch();
		filtroAjax();

		//$('.restaurantes').hide();

	});
	$("select").change(function(){
		$("#page").val(1);

		filtroAjax();
	});

});
function enableDisableFilter(status) {
	if (status == "enable") {
		$(".last select").prop('disabled', false);
		$(".last").removeClass("disabled");
		if ($(window).width()+17 > 960) { //TODO find out WHY 17px
			$(".filter").slideDown();
		}
	}
	if (status == "disable") {
		$(".last select").prop('disabled', 'disabled');
		$(".last").addClass("disabled");
		$(".searchBarFilter").slideUp();
		$(".filter").slideUp();
	}
	if (status == "fakeDisable") {
		$(".last select").prop('disabled', false);
		$(".last").addClass("disabled");
	}
}
//filtro
function filtroAjax(target){
	if($("body").hasClass("searching")) {
		//
	}else {
		$("body").addClass("searching");
		var restaurantsContainer = $(".tabs","#restaurant_container");
		enableDisableFilter("enable");

		$(".tempo_filtro").hide();
		$(".price_filtro").hide();
		$(".pay_filtro").hide();

		if(target == 'rest'){
			$(".menu-nav").find(".active").removeClass("active");
			$("#rest").addClass("active");
		}

		if($("#throbber").length==0){
			$(".throbber").html('<img id="throbber" src="'+_ctx+'/images/gif_loading_red.gif" style="margin: auto; display: block; clear: both;"/>');
		}
		$.ajax({
			type: "POST",
			data: $("#filtro_restaurantes").serialize(), // serializes the form's elements.
			url: _ctx + URL_LIST_REST + URL_FILTER_REST,
			cache: false
		}).done(function(html) {
			var restaurantsContainer = $(".tabs","#restaurant_container");
			var page = $("#page").val();
			if (page == 1) {
				restaurantsContainer.empty();
			}

			if(!html || html.trim() != ""){
				var nextPage = +page+1;
				$("#page").val(nextPage);
				
				restaurantsContainer.append(html);
			}
			if($(".active").attr("id") == 'rest'){
				$('.menu-nav li a').removeClass('active');
				favTab.hide();
				promosTab.hide();
				restTab.fadeIn();
				$(".searchBarFilter").slideDown();
				$(".menu-nav li a:eq(0)").addClass("active");
			}else if($(".active").attr("id") == 'promo'){
				$("#promo").click();
			}
		}).always(function() {
			$("body").removeClass("searching");
			loadingMore = true;
			$("#throbber").remove();
			setOpeningHour();
		});
	}
};

function mudaFiltroCozinha(){
	var checkBoxsArray = $('#filtroCozinha').closest('.dd').find('.dd-holder input');
	var checkedArray = [];
	for (var i = 0; i < checkBoxsArray.length; i++) {
		var currentCheckBox = $(checkBoxsArray[i]);
		var currentCheckBoxText = $(checkBoxsArray[i]).closest('li').find('a').text();
		if(currentCheckBox.is(':checked')) {
			checkedArray.push(currentCheckBoxText);
		}
	}
	if (checkedArray.length < 1) {
		$(".cozinhas_select").html("<strong>Cozinha:</strong> todos");
	}
	else {
		var text = checkedArray.toString();
		$(".cozinhas_select").html("<strong>Cozinha:</strong> " + text);
	}
}

function mudaFiltroPagamento(){
	$i=0;
	var vetor = new Array();
	$("input:checkbox[name='pagamento']:checked").each(function(){
		if(!($(this).next().text().indexOf("0")==0)){
			vetor[$i] = $(this).next().text();
			$i++;
		}else{
			vetor[$i] = $(this).next().text();
			$i++;
		}
	});

	if($i > 2){
		$(".pagamento_select").html("<strong>Pagamento:</strong> " + vetor[0] + ", " + vetor[1] + " e " + ($i-2) + " outra(s)");
	}else if ($i == 2){
		$(".pagamento_select").html("<strong>Pagamento:</strong> " + vetor[0] + " e " + vetor[1]);
	}else if($i==1){
		$(".pagamento_select").html("<strong>Pagamento:</strong> " + vetor[0]);
	}else{
		$(".pagamento_select").html("<strong>Pagamento:</strong> todos");
	}
}

function mudaFiltroPreco(){
	var vetor = new Array();
	$i = 0;
	$("input:checkbox[name='preco']:checked").each(function(){
		if(!($(this).val().indexOf("0")==0)){
			vetor[$i] = $(this).val().substring(0, 2);
			$i++;
			vetor[$i] = $(this).val().substring(3); //ignorando o "-"
			$i++;
		}else{
			vetor[$i] = $(this).val().substring(0, 1);
			$i++;
			vetor[$i] = $(this).val().substring(2); //ignorando o "-"
			$i++;
		}
	});
	if($i==0){
		$(".price_select").html("<strong>Preço:</strong> todos");
		return;
	}

	for($j=0; $j<$i; $j++){
		if($j >= vetor.length) break;
		if(vetor[$j]==vetor[$j+1]){
			vetor.splice($j, 2);
			$j=$j-1;
		}
	}

	var string = "de ";
	for($j=0; $j<vetor.length;){
		if($j>1){
			string += " e de ";
		}
		var numero = parseInt(vetor[$j])+1;
		if(numero==1) numero = 0;
		string += numero + " a " + vetor[$j+1];
		$j+=2;

	}
	string = string.replace("de 0 a", "até");
	string = string.replace("até +", "todos os preços");
	if(string.indexOf("+")!=-1){
		string = string.substring(0, string.indexOf("+")-2);
		string = string.replace(/de\s([^de]+)$/, 'acima de $1');
	}

	$(".price_select").html("<strong>Preço:</strong> " + string);
//	if($(".price_select").html().length > 40){
//	$(".price_select").html(string);
//	}

}

function mudaFiltroTempo(){
	var vetor = new Array();
	$i = 0;
	$("input:checkbox[name='entrega']:checked").each(function(){
		if(!($(this).val().indexOf("0")==0)){
			vetor[$i] = $(this).val().substring(0, 2);
			$i++;
			vetor[$i] = $(this).val().substring(3); //ignorando o "-"
			$i++;
		}else{
			vetor[$i] = $(this).val().substring(0, 1);
			$i++;
			vetor[$i] = $(this).val().substring(2); //ignorando o "-"
			$i++;
		}
	});
	if($i==0){
		$(".tempo_select").html("<strong>Entrega:</strong> todos");
		return;
	}

	for($j=0; $j<$i; $j++){
		if($j >= vetor.length) break;
		if(vetor[$j]==vetor[$j+1]){
			vetor.splice($j, 2);
			$j=$j-1;
		}
	}

	var string = "de ";
	for($j=0; $j<vetor.length;){
		if($j>1){
			string += " e de ";
		}
		string += vetor[$j] + " a " + vetor[$j+1];
		$j+=2;

	}
	string = string.replace("de 0 a", "até");
	string = string.replace("até +", "todos as faixas");
	if(string.indexOf("+")!=-1){
		string = string.substring(0, string.indexOf("+")-2);
		string = string.replace(/de\s([^de]+)$/, 'acima de $1');
	}
	$(".tempo_select").html("<strong>Entrega:</strong> "+ string);
};

function promoAjax(){
	$("#promo").click(function(){
		enableDisableFilter("fakeDisable");
		$.ajax({
			type: "POST",
			data: $("#filtro_restaurantes").serialize(),
			url: _ctx + URL_LIST_REST + URL_PROMO_REST,
			cache: false
		})
		.done(function(html) {
			if($(".spec .restaurants").length==0){ //ainda nao carregou a aba de promos
				restTab.hide();
				favTab.hide();
				$('.menu-nav li a').removeClass('active');
				promosTab.append(html);
				promosTab.fadeIn();
				$(".menu-nav li a:eq(2)").addClass("active");
			}else{
				restTab.hide();
				favTab.hide();
				$('.menu-nav li a').removeClass('active');
				promosTab.fadeIn();
				$(".menu-nav li a:eq(2)").addClass("active");
			}
			enableDisableFilter("disable");
		});
	});
}

function favoritosAjax(){
	enableDisableFilter("fakeDisable");
	$("#favoritos").click(function(){
		abreFav();

		if($(".favorites").length==0){
			favTab.append('<img id="throbberFav" src="'+_ctx+'/images/gif_loading_red.gif" style="margin: auto; display: block; clear: both; margin-top: 50px;"/>');

			$.ajax({
				type: "GET",
				data: {locationId : $("#locationId").val()},
				url: _ctx + URL_LIST_REST + URL_FAVORITES,
				cache: false
			})
			.done(function(html) {
				favTab.append( html );
			}).always(function() {
				$("#throbberFav").remove();
			});
		}
	});
}

function abreFav(){
	restTab.hide();
	promosTab.hide();
	enableDisableFilter("disable");
	
	$('.menu-nav li a').removeClass('active');
	favTab.fadeIn();
	$(".menu-nav li a:eq(1)").addClass("active");
}

function redirectRestaurante(event, clickedElement){
	var btn = $(clickedElement).closest(".item").find("a.btn");
	event.stopPropagation();

	if (!event.ctrlKey && !event.shiftKey && !event.metaKey && event.which != 2) {
		initLoadingAnimationDots(btn);
	}
}

function setOpeningHour(){
	$('.stat').each(function(){
		var id = $(this).attr('class').split('stat ')[1];
		if($('.nextOpening-' + id).val() != ""){
			var nowDate = new Date($('.comparisonDate').val());
			var openingDate = new Date($('.nextOpening-' + id).val());

			var diffMs = (openingDate - nowDate);
			var diffHrs = Math.round((diffMs % 86400000) / 3600000); // hours
			var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
			if(diffHrs < 1){
				$(this).html('Abrirá em ' + diffMins + ' minutos' );
			} else {
				if(diffMins < 10){
					diffMins = "0" + diffMins;
				}
				$(this).html('Abrirá em ' + diffHrs + ':' + diffMins + ' horas' );
			}
		}
	});
}
