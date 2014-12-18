$(document)
	.on('click', '.back', function(e) {
		e.preventDefault()
		nextPage($(this).attr('alt'));
	});

//Moulo de busca de cep
var buscaCepGlobal = null;
$(document).ready(function(){
	buscaCepGlobal = new BuscaCep();
});


function BuscaCep (){
    //Atributos
	//Public
    this.callbackFunction = null;
    this.zipCode = null;

    //Private
    var root = this;
    var clienteLogado = false;

    var enderecoUnicoLogado = "#box2"; //logado
    var enderecoUnico = "#box4"; //nao logado
    var enderecosMultiplos = "#box5"; //nao logado
    var completarEndereco = "#box6"; //logado
    var naoSeiMeuCep = "#box7"; //nao logado
    
    var submitCepBtn = $("#buscaCep .submitCep");

    var resultLocation = null;
	var status = null;
	var message = null; // Sempre trocar essa propriedade usando o m�todo setMessage, para atualizar as DIVs de erro/aviso
	var jtableMultiplosEnderecos = null;
	var recordsLoaded = null;

    //Metodos
    this.buscaNumCep = function(zipCode, callbackFunction, logado){
    	clienteLogado = logado;

    	root.callbackFunction = callbackFunction;
    	root.zipCode = root.normalizarCep(zipCode);

    	if(zipCode == undefined || zipCode == ''){
    		return root.abrirSemEndereco(callbackFunction, clienteLogado);
    	}

		$.ajax({
			 	url: _ctx + URL_LOCATION + URL_ZIP,
				type: "POST",
					data : {
						zipCode : root.zipCode,
					address : "",
					streetNumber: ""
					},
     			beforeSend: initLoadingAnimationDots(submitCepBtn),
				success: function(locationresult) {
					$(".loadingDots").removeClass("loadingDots");
					if(locationresult.Result == "OK"){
						if(locationresult.Records && locationresult.Records.length == 1){
							root.resultLocation = locationresult.Records[0];
							if(clienteLogado){
								root.abrirEnderecoUnicoLogado();
							} else {
								root.abrirEnderecoUnico();
							}

						} else if(locationresult.Records && locationresult.Records.length > 1 && locationresult.Records.length <= 5){
							root.resultLocation = locationresult.Records[0];
							root.abrirEnderecosMultiplos(locationresult.Records.length, 'none');
						} else if(locationresult.Records && locationresult.Records.length > 5){
							root.resultLocation = locationresult.Records[0];
							root.abrirEnderecosMultiplos(locationresult.Records.length, 'block');
						} else{
							root.setMessage("O cep digitado é inválido.");
							modal(root.message);
							root.abrirSemEndereco(callbackFunction, clienteLogado);
						}
					} else {
						if(locationresult.Message.indexOf("O número do CEP não é válido") > -1){
							root.abrirSemEndereco(callbackFunction, clienteLogado);
							return;
						} else {
							root.status = "error";
							root.setMessage(locationresult.Message || locationresult.Message);
							root.resultLocation = null;
			 	 			root.zipCode = null;
			 	 			modal(root.message);
							root.retornoParaCallBack();
						}
					}
				},
				error: function(locationresult){
					$(".loadingDots").removeClass("loadingDots");
					root.setMessage("Erro encontrado no processamento.");
					modal(root.message);
					return;
				}
			});

	};

	//Private methods
	this.returnMethod = function(){
		var submitBtns = $("input[type=submit]");
		var reference = root.resultLocation.reference;
		var compl = root.resultLocation.compl;
		var alias = root.resultLocation.alias;
		submitBtns.each(function(){initLoadingAnimationDots(this);});
		$.ajax({
				url: _ctx + URL_LOCATION + URL_ZIP,
				type: "POST",
				data: { zipCode : root.zipCode,
						address : root.resultLocation.address,
						streetNumber: root.resultLocation.streetNumber
					   },
				success: function(locationresult) {
					if(locationresult.Result == "OK" && locationresult.Records && locationresult.Records.length >= 1){
						root.status = "sucess";
						var streetNumber = root.resultLocation.streetNumber;
						root.resultLocation = locationresult.Records[0];
						root.resultLocation.streetNumber = streetNumber;
						root.resultLocation.reference = reference;
						root.resultLocation.compl = compl;
						root.resultLocation.alias = alias;
						root.retornoParaCallBack();
					} else{
						root.setMessage("Endereço inválido.");
						modal(root.message);
		 				root.status = "error";
		 	 			root.retornoParaCallBack();
					}
				},
				error: function(locationresult){
				root.setMessage("Erro encontrado no processamento.");
					if(!root.resultLocation.requireCompl){
						modal(root.message);
					}
	 				root.status = "error";
	 				root.retornoParaCallBack();
				}
			}).always(function(){submitBtns.each(function(){$(this).removeClass("loadingDots");});});
	};

	this.retornoParaCallBack = function(){
		if(root.callbackFunction){
			root.callbackFunction({
				status : (root.status == null ? "error" : root.status),
				message : root.message,
				location : root.resultLocation
			});
		}
	};

	this.nextPage = function(page) {
		var visibleBox = $('.box:visible')
		visibleBox.animate({
			left : - 500,
			opacity : 0
		}, function  () {
			$(this).hide();
			var newBox = page;
			$(newBox).css({
				left :  0,
				opacity : 1
			}).fadeIn();
		});
	};

	this.abrirEnderecoUnico = function(){
		console.log("abrirEnderecoUnico");
		if(!root.resultLocation.requireCompl){
			root.nextPage(enderecoUnico);
		}
		var box = $(enderecoUnico);

		$(".zipCode", box).val(root.zipCode);
		$(".address", box).val(root.resultLocation.address);
		$(".city", box).val(root.resultLocation.city);
		$(".state", box).val(root.resultLocation.state);
		$(".streetNumber", box).focus();
		
		if(root.resultLocation.requireCompl){
			$('.formEnderecoUnico').submit();
		}
	};

	this.abrirEnderecoUnicoLogado = function(){
		console.log("abrirEnderecoUnicoLogado");
		root.nextPage(enderecoUnicoLogado);
		var box = $(enderecoUnicoLogado);

		$(".zipCode", box).val(root.zipCode);
		$(".address", box).val(root.resultLocation.address);
		$(".city", box).val(root.resultLocation.city);
		$(".state", box).val(root.resultLocation.state);

		$(".streetNumber", box).get(0).focus();
		
		if(root.resultLocation.requireCompl){
			$('input.streetNumber').hide();
			$('span.radio-holder.field-n7').hide();
			$('.box').addClass('special_zip');
		}
	};

	this.abrirCompletarEndereco = function(){
		root.nextPage(completarEndereco);
		var box = $(completarEndereco);
		if(root.resultLocation.requireCompl){
			$(".streetNumber").hide();
			$("span.radio-holder.field-n7").hide();
			$('.box').addClass('special_zip');
		}

		$(".zipCode", box).val(root.zipCode);
		$(".address", box).val(root.resultLocation.address);
		$(".city", box).val(root.resultLocation.city);
		$(".state", box).val(root.resultLocation.state);
		$(".streetNumber", box).val(root.resultLocation.streetNumber);
	};

	this.abrirSemEndereco = function(callbackFunction, logado){
		clienteLogado = logado;

		root.nextPage(naoSeiMeuCep);
		root.callbackFunction = callbackFunction;

		var box = $(naoSeiMeuCep);
		var select = $(".formSemEndereco select.city:first", box);
		$.ajax({
		 	url: _ctx + URL_LOCATION + URL_STATE,
			type: "POST",
			data: {state : $(".formSemEndereco select.state:first", box).val()},
			success: function(locationresult) {
				if(locationresult.data.Cities){

					var stateVal = $(".formSemEndereco select.state:first", box).val();
					$(select).closest(".select").html('<select class="city"></select>');
					select = $(".formSemEndereco select.city");
					$.each(locationresult.data.Cities, function(index, value) {
						if (((stateVal == 'SP') && (value == 'SAO PAULO')) || ((stateVal == 'RJ') && (value == 'RIO DE JANEIRO'))){
							select.append("<option selected>"+value+"</option>");
						} else {
						  	select.append("<option>"+value+"</option>");
						}
					});
//					select.next().remove();
					select.removeAttr("disabled").css({"width":" 100%"});
//					select.c2Selectbox();
					select.selectBoxIt({
						autoWidth: false
					});
					$(".city", box).focus();
				}
			},
			error: function(locationresult){
				root.message= "Erro encontrado no processamento. 3";
				$(".state", box).focus();
				return;
			}
		});
	};

	this.abrirEnderecosMultiplos = function(numResults, display){
		root.nextPage(enderecosMultiplos);
		var box = $(enderecosMultiplos);

		$(".zipCode", box).val(root.zipCode);
		$(".city", box).val(root.resultLocation.city);
		$(".state", box).val(root.resultLocation.state);

		root.jtableMultiplosEnderecos = $(enderecosMultiplos + " .buscaCepJTable:first");
		root.jtableMultiplosEnderecos.jtable({
            paging : true,
            pageSize : 5,
            pageSizeChangeArea : false,
            columnSelectable : false,
            gotoPageArea : "none",
            actions: {
                listAction: _ctx + URL_LOCATION + URL_ZIP,
            },
            fields: {
                locationId	: {key: true,list: false},
                address		: {title: "Logradouro", width: "40%"},
                district	: {title: "Bairro", width: "35%"},
                city		: {list: false},
                zipCode 	: {list: false},
                state 		: {list: false},
                selecionar :  {
				              	title : "",
				                display: function (data) {
				                	return "<a class='searchbutton selecionar'>Selecionar &#187;</a>";
				                },
				                width: "25%"
				              }

			},
			recordsLoaded : function(event, data) {
								for (row in data.records) {
									data.records[row].zipCode = root
											.normalizarCep(data.records[row].zipCode);
								}
								root.recordsLoaded = data.records;
				            }
        });
	};

	this.normalizarCep = function(cep) {
		// Casting para String
		cep = cep + '';

		// L�gica: Se o cep tiver menos que 8 d�gitos, cria um array preenchido
		// de '0' com tantas posi��es quanto faltam d�gitos para o cep chegar a
		// 8,
		// e concatena o cep original
		return cep.length >= 8 ? cep : new Array(8 - cep.length + 1).join('0')
				+ cep;
	};

	this.setMessage = function(msg){
		root.message = msg;
		$(root).trigger("messageChange");
	};

	//Appended methods

	$(".streetNumber").change(function(){
		$(this).val($(this).val().replace(/[^\d.]/g, ''));
	});

	$(document).on("submit", ".formEnderecoUnico", function(event){
		event.preventDefault();
		event.stopPropagation();
		
		var form = $(this);

		root.resultLocation.streetNumber = form.find(".field5.streetNumber").val();
		console.log(root.resultLocation.streetNumber);

		if(!root.resultLocation.requireCompl && (!root.resultLocation.streetNumber || root.resultLocation.streetNumber == null)){
			root.setMessage("Digite um número!");
			modal(root.message);
			return;
		}
		root.status = "success";
		root.setMessage(null);
		root.returnMethod();
	});

	$(document).on("submit", ".formEnderecoUnicoLogado", function(event){
		event.preventDefault();
		event.stopPropagation();
		
		var form = $(this);
		root.resultLocation.streetNumber = $(".streetNumber", form).val();
		root.resultLocation.reference = $(".reference", form).val();
		root.resultLocation.compl = $(".compl", form).val();
		root.resultLocation.alias = getAlias();

		if(!root.resultLocation.requireCompl && (!root.resultLocation.streetNumber || root.resultLocation.streetNumber == null)){
			root.setMessage("Digite um número!");
			modal(root.message);
			return;
		}
		if((!root.resultLocation.compl || root.resultLocation.compl == null) && !$(".semcompl", document).is(':checked')){
			root.setMessage("Informe o complemento!");
			modal(root.message);
			return;
		}
		root.status = "success";
		root.setMessage(null);
		root.returnMethod();
	});

	$(document).on("submit", ".formCompleteEndereco", function(event){
		event.preventDefault();
		event.stopPropagation();

		var form = $(this);
		root.resultLocation.reference = $(".reference", form).val();
		root.resultLocation.compl = $(".compl", form).val();
		root.resultLocation.alias = getAlias();

		if((!root.resultLocation.compl || root.resultLocation.compl == null) && !$(".semcompl", document).is(':checked')){
			root.setMessage("Informe o complemento!");
			modal(root.message);
			return;
		}
		root.status = "success";
		root.setMessage(null);
		root.returnMethod();
	});

	$(document).on("submit", ".formEnderecosMultiplos", function(event){
		event.preventDefault();
		event.stopPropagation();
		$(".buscaCepJTable:first")[0].style.display = 'none';

		var form = $(this);
		var address = $(".address:first", form).val();
		var streetNumber = $(".streetNumber:first", form).val();

		if(!streetNumber || streetNumber == null){
			root.setMessage("Digite um número!");
			modal(root.message);
			return;
		}

		root.jtableMultiplosEnderecos.jtable("load", {
				m : "locationsByZipCode",
                zipCode : root.zipCode,
				address : address,
				streetNumber: streetNumber
            });
		$(".buscaCepJTable:first")[0].style.display = 'block';
	});


	$(document).on("click", ".buscaCepJTableNaoSeiMeuCep .jtable-data-row", function(event){
		event.preventDefault();
		event.stopPropagation();
		$(this).children("td").children("a").click();
	});

	$(document).on("click", ".buscaCepJTableNaoSeiMeuCep .selecionar", function(event){
		event.preventDefault();
		event.stopPropagation();

		var box = $(naoSeiMeuCep);

		var tbody = $(this).parents("tbody:first");
		var tr = $(this).parents("tr:first");
		var index = $("tr", tbody).index(tr);
		root.resultLocation = root.recordsLoaded[index];
		root.resultLocation.streetNumber = $(".streetNumber:first", box).val();
		if(root.zipCode == null || root.zipCode == "undefined" || root.zipCode == '')
			root.zipCode = root.resultLocation.zipCode;

		if(!root.resultLocation.requireCompl &&  (!root.resultLocation.streetNumber || root.resultLocation.streetNumber == null)){
			root.setMessage("Digite um número!");
			modal(root.message);
		} else if(clienteLogado){
			return root.abrirCompletarEndereco();
		} else {
			root.status = "success";
			root.returnMethod();
		}
	});
	$(document).on("click", ".buscaCepJTable .selecionar", function(event){
		event.preventDefault();
		event.stopPropagation();

		var box = $(enderecosMultiplos);

		var tbody = $(this).parents("tbody:first");
		var tr = $(this).parents("tr:first");
		var index = $("tr", tbody).index(tr);
		root.resultLocation = root.recordsLoaded[index];
		root.resultLocation.streetNumber = $(".streetNumber:first", box).val();
		if(root.zipCode == null || root.zipCode == "undefined"  || root.zipCode == '')
			root.zipCode = root.resultLocation.zipCode;

		if(!root.resultLocation.streetNumber || root.resultLocation.streetNumber == null){
			root.setMessage("Digite um número!");
			modal(root.message);
		} else if(clienteLogado){
			return root.abrirCompletarEndereco();
		} else {
			root.status = "success";
			root.returnMethod();
		}
	});
	$(document).on("click", ".buscaCepJTable .jtable-data-row", function(event){
		event.preventDefault();
		event.stopPropagation();
		$(this).children("td").children("a").click();
	});
	$(document).on("focus", ".formSemEndereco select.state",function(event){
		$(".formSemEndereco select.city:first", document).attr("disabled", "disabled");
	});
	$(document).on("change", ".formSemEndereco select.state" ,function(event){
		event.preventDefault();
		event.stopPropagation();
		var box = $(naoSeiMeuCep);
		var select = $(".formSemEndereco select.city:first", box);
		$.ajax({

		 	url: _ctx + URL_LOCATION + URL_STATE,
			type: "POST",
			data: {m : "citiesByState", state : $(this).val()},
			success: function(locationresult) {
				if(locationresult.data.Cities){

					var stateVal = $(".formSemEndereco select.state:first", box).val();
					$(select).closest(".select").html('<select class="city"></select>');
					select = $(".formSemEndereco select.city");
					$.each(locationresult.data.Cities, function(index, value) {
						if (((stateVal == 'SP') && (value == 'SAO PAULO')) || ((stateVal == 'RJ') && (value == 'RIO DE JANEIRO'))){
							select.append("<option selected>"+value+"</option>");
						} else {
						  	select.append("<option>"+value+"</option>");
						}
					});
					select.next().remove();
					select.removeAttr("disabled").css({"width":" 100%"});;
					select.removeClass("c2-sb-enabled");
					select.selectBoxIt({
						autoWidth: false
					});

				}
			},
			error: function(locationresult){
				root.setMessage("Erro encontrado no processamento.");
				modal(root.message);
				return;
			}
		});
	});

	$(naoSeiMeuCep).on("submit", ".formSemEndereco" ,function(event){
		event.preventDefault();
		event.stopPropagation();
		$(".buscaCepJTableNaoSeiMeuCep:first")[0].style.display = 'none';
		//$(".streetNumber").css('background', 'url('+_ctx+'/images/loader.gif) no-repeat right');
		var form = $(this);
		var tipoAddress = $(".tipoAddress:first", form).val();
		var complAddress = $(".address:first", form).val();
		var address = /*tipoAddress + " " +*/ complAddress;
		var streetNumber = $(".formSemEndereco .streetNumber").val();
		var state = $(".state:first", form).val();
		var city = $(".city:first", form).val();

		if(!complAddress || !city || !state){
			root.setMessage("Preencha todos os campos!");
			modal(root.message);
			return;
		}
		root.jtableMultiplosEnderecos = $(".buscaCepJTableNaoSeiMeuCep:first");
		root.jtableMultiplosEnderecos.jtable({
            paging : true,
            pageSize : 5,
            pageSizeChangeArea : false,
            columnSelectable : false,
            gotoPageArea : "none",
            actions: {
                listAction: _ctx + URL_LOCATION + URL_NAME,
            },
            fields: {
                locationId	: {key: true,list: false},
                address		: {title: "Logradouro", width: "40%"},
                district	: {title: "Bairro", width: "35%"},
                zipCode 	: {list: false},
                state 		: {list: false},
                selecionar : {
			                	title : "",

			                	display: function (data) {
			                        return "<a class='searchbutton selecionar'>Selecionar &#187;</a>";
			                    },
			                    width: "25%"
			                 }
			},
			recordsLoaded : function(event, data) {
								var recordOk = true;
								for (row in data.records) {
									if(!data.records[row].requireCompl && $(".formSemEndereco .streetNumber").val() === "") {
										console.log("Por favor, insira um número");
										recordOk = false;
									} else if(data.records[row].requireCompl) {
										$(".formSemEndereco .streetNumber").hide();
										$('.box').addClass('special_zip');
									}
									data.records[row].zipCode = root
											.normalizarCep(data.records[row].zipCode);
								}
								root.recordsLoaded = data.records;
								if(data.records.length == 1){
									$('.selecionar').trigger('click');
									return;
								}
								$(".streetNumber").css('background', '');
								if(recordOk) {
									$(".buscaCepJTableNaoSeiMeuCep:first")[0].style.display = 'block';
								} else {
									modal("Por favor, insira um número");
								}
				            }
        });
		root.jtableMultiplosEnderecos.jtable('load',{
			state 		: state,
			city		: city,
			address		: address,
			streetNumber: streetNumber
		});
	});

	function getAlias(){
		var alias;
		if($(".checked").length>1){
			alias = $(".checked").get(1).id;
			if(alias=="Outros"){
				alias = $(".other").val();
			}
		}else{
			alias = $(".checked").attr("id");
			if(alias == "Outros"){
				alias = $(".other").val();
			}
		}

		return alias;
	}

};

function removeNonNumber(elem){
	var value = $(elem).val();
	if(value.match(/\D/g)) {
		$(elem).val(value.replace(/\D/g, ""));
	}
	if(($(elem).hasClass('streetNumber') || $(elem).attr('id') == "cep") && $(elem).val().length > 8){
		$(elem).val($(elem).val().substring(0,8));
    }
}

$(document).ready(function(){
	
	$(".state").selectBoxIt({
		autoWidth: false
	});
	if ($(window).width() <= 480) {
		$(".state").css({width:"100%"});
	}
	$(".tipoAddress").selectBoxIt({
		autoWidth: false
	});
	if ($(window).width() <= 480) {
		$(".tipoAddress").css({width:"100%"});
	}
	if ($(window).width() <= 480) {
		$(".city").css({width:"100%"});
	}
	$('input.field4_semEndereco.address').keyup(function(){
//		var suggestions = Array();
		if($(this).val().length < 4){
			return;
		}
		var divAddress = $(this).closest('.row').find('.dynamicAddress');
		var divAddresses = $(this).closest('.row').find('.dynamicAddress ul');
		$(divAddress).hide();
		$(divAddress).css({'position' : 'absolute',
							'width': $(this).outerWidth(),
							'top': $(this).position().top + $(this).outerHeight(),
							'left':$(this).position().left,
							'background-color': '#fff',
							'z-index': 100});
		$(divAddresses).css({'list-style': 'none'});
		$(divAddresses).html('');
		var state = $('select.state').val();
		var city = $('select.city').val();
		var adress = "";
		$('input.address').each(function(){
			if($(this).val().length > 0){
				address = $(this).val();
			}
		});
		var number = "";
		$('input.streetNumber').each(function(){
			if($(this).val().length > 0){
				number = $(this).val();
			}
		});
		$.ajax({
			url: _ctx + URL_LOCATION + URL_NAME,
			type: "POST",
			data: {
				jtStartIndex: "0",
	            jtPageSize  : "5",
	            state 		: state,
	            city		: city,
	            address		: address,
	            streetNumber: number
			}
		}).success(function(data){
			if(data.Result === "OK"){
				for(var i = 0; i < data.Records.length; i++){
//					if(suggestions.indexOf(data.Records[i].address) == -1){
//						suggestions.push(data.Records[i].address);
//					}
					if($(divAddresses).html().indexOf(data.Records[i].address) == -1){
						$(divAddresses).html($(divAddresses).html()+'<li>'+data.Records[i].address+'</li>')						
					}
				}
//				console.log(suggestions);
//				$('input.field4_semEndereco.address').autocomplete({source: suggestions});
				$('li', divAddresses).click(function(){
					$(this).closest('.row').find('input.field4_semEndereco.address').val($(this).html());
					$(this).closest('div').hide();
				});
				$('body').click(function(e){
					var top = $(divAddress).offset().top;
					var left = $(divAddress).offset().left;
					var right = $(divAddress).offset().left + $(divAddress).outerWidth();
					var bottom = $(divAddress).offset().top + $(divAddress).outerHeight();
					
					if(e.pageX > left && e.pageX < right && e.pageY > top && e.pageY < bottom){
						//dentro
					}else{
						//fora
						$('li', divAddresses).closest('div').hide();
						$('body').unbind('click');
					}
				});
			}
		});
		$(divAddress).show();
	});
});