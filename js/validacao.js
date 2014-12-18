//VALIDAÇÃO HTML5 ADICIONAR ENDEREÇO / CADASTRO
$(function() {
    //$('form[name="addEndereco"]').validValDebug();
    $('form[name="addEndereco"]').validVal({ keepAttributes: ['pattern']});
    $('form[name="addCadastro"]').validVal({ keepAttributes: ['pattern']});
});

