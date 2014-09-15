 $(function () {

     var geocoder = new google.maps.Geocoder();
     var var_map;
     var manancial;
     var marker;
     var rmsp;
     var infoWindow;
     var sistema_produtor;
     var nome_sistema_produtor;
     var tbl_manancial = '16WX8tN7AeWzjXzWd4FJZLeKKW8n99em_SPowH9GB';
     var tbl_rmsp = '1OlS6pB_QPh6o9hJY0TZqJD8N5Te-WfGwe2QsPiAh';
     var current_position;
     var localizacao;


$('#cepLocal').on('hidden.bs.modal', function (e) {
  $('#form_cep').data('bootstrapValidator').resetForm(true);
})

     $('#liga').click(function () {

         $('#cepLocal').modal('show');

     })

     google.maps.event.addDomListener(window, 'load', inicializarMapa);

     $("#caixa-sistema").draggable();

     google.maps.event.addDomListener(window, 'resize', function () {
         var_map.panTo(var_map.getCenter());
     });


    $('#cepLocal').modal({
             show: true
         });
    $("#cep").mask("99999-999");

$('#form_cep').bootstrapValidator({

         fields: {
             cep: {
                 validators: {
                     notEmpty: {
                         message: 'Informe o CEP para prosseguir'
                      }//,
                     // CepRMSP: {
                     //     message: 'O sistema só funciona para moradores da Região Metropolitana de São Paulo'
                     // }
                 }
             }
         },
         submitHandler: function (validator, form, submitButton) {

            //alert(validator.getFieldElements('cep').val());
            //validator.defaultSubmit();
            if (manancial != null) {
                 manancial.setMap(null)
                 marker.setMap(null)
             }

             cep = validator.getFieldElements('cep').val();
             //console.debug(cep);
             exibeSistema(cep);
             $(form).data('bootstrapValidator').resetForm(true);
             $('#cepLocal').modal('hide');
             $('#caixa-sistema').removeClass('hide', 0, function () {
             $('#caixa-sistema').fadeIn(1500);
                 
             });


             }

         });     

     function obtemLocalizacao() {

         if (navigator.geolocation) {
             navigator.geolocation.getCurrentPosition(function (position) {

                 current_position = position.coords;

             }, function (e) {

             });
         } else {
             error('não suportado');
         }

     }



     function inicializarMapa() {

         var var_location = new google.maps.LatLng(-23.550520, -46.633309); //Sao Paulo, SP

         var var_mapoptions = {
             center: var_location,
             zoom: 10
         };

         infoWindow = new google.maps.InfoWindow();

         var_map = new google.maps.Map(document.getElementById("map-container"),
             var_mapoptions);

         rmsp = new google.maps.FusionTablesLayer({
             clickable: false,
             query: {
                 select: 'geometry',
                 from: tbl_rmsp
             },
             styles: [{
                 polygonOptions: {
                     fillColor: '#000000',
                     fillOpacity: 0.01
                 }
             }]
         });


         rmsp.setMap(var_map);

// todos_sistemas = new google.maps.FusionTablesLayer({
//              clickable: false,
//              query: {
//                  select: 'geometry',
//                  from: tbl_manancial
//               }//,
//              // styles: [{
//              //     polygonOptions: {
//              //         fillColor: '#000000',
//              //         fillOpacity: 0.01
//              //     }
//              // }]
//          });

//         todos_sistemas.setMap(var_map);


        // ptos_captacao = new google.maps.FusionTablesLayer({
        //     query: {
        //         select: 'geometry',
        //         from: '1BrBGlzN22lOf198MhWULe9rXwdauW1n1yGgQvABk'
        //     }
        // });

        // ptos_captacao.setMap(var_map);

         legenda = document.createElement('div');
         legenda.style.padding = '5px';
         legenda.innerHTML = '<a href="http://www.socioambiental.org/"><img src="./images/logo-20-1.png" border="0" id="logo-isa"></a>';
         var_map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legenda);

     } //init_map

     
     function renderMap(results) {

                var_map.setCenter(results[0].geometry.location);
                 var_map.setZoom(11);

                 //Consultar agora o manancial
                 manancial = new google.maps.FusionTablesLayer({
                     options: {
                         suppressInfoWindows: true
                     },
                     query: {
                         select: 'geometry',
                         from: tbl_manancial,
                         where: 'ST_INTERSECTS(\'geometry\', CIRCLE(LATLNG' + results[0].geometry.location + ',0.5))'
                     }
                 });
                 manancial.setMap(var_map);

                 var image = {
                     url: 'images/lugar.png',
                     // This marker is 20 pixels wide by 32 pixels tall.
                     size: new google.maps.Size(32, 37),
                     // The origin for this image is 0,0.
                     origin: new google.maps.Point(0, 0),
                     // The anchor for this image is the base of the flagpole at 0,32.
                     anchor: new google.maps.Point(0, 37)
                 };
                 // Shapes define the clickable region of the icon.
                 // The type defines an HTML &lt;area&gt; element 'poly' which
                 // traces out a polygon as a series of X,Y points. The final
                 // coordinate closes the poly by connecting to the first
                 // coordinate.
                 var shape = {
                     coords: [1, 1, 1, 20, 18, 20, 18, 1],
                     type: 'poly'
                 };

                 marker = new google.maps.Marker({
                     map: var_map,
                     icon: image,
                     position: results[0].geometry.location,
                     title: 'Você está aqui!'
                 });

                 marker.setMap(var_map);

     }

     function exibeSistema(cep) {
          geocoder.geocode({
             'address': cep,
             'componentRestrictions': {
                 'country': 'BR'
             }
         }, function (results, status) {

          if (status == google.maps.GeocoderStatus.OK) {
            renderMap(results);
            ConsultaSistema(results[0].geometry.location);

          } else {

              
          }

         });
     } // Fim exibeSistema

     function ConsultaSistema(latlng) {


         sql = 'SELECT id, sistema, descricao, risco, ha FROM ' + tbl_manancial + ' WHERE ST_INTERSECTS(\'geometry\', CIRCLE(LATLNG' + latlng + ',0.5))';

         encodedSQL = encodeURIComponent(sql);



         url = ['https://www.googleapis.com/fusiontables/v1/query'];
         url.push('?sql=' + encodedSQL);
         url.push('&key=AIzaSyAm9yWCV7JPCTHCJut8whOjARd7pwROFDQ');
         url.push('&callback=?');

         //console.debug(url.join(''));
         $.ajax({
             url: url.join(''),
             dataType: 'jsonp',
             success: function (data) {
                 rows = data['rows'];
                 $('#reservatorio').html(rows[0][1]);
                 $('#descricao_sistema').html(rows[0][2]);
                 $('#risco_sistema').html(rows[0][3]);
                 $('#area').html('Área: <strong><span id="numero">' + rows[0][4] + '</span> ha </strong>');
                 $('#numero').number( true, 2, '.' );
                 ga('send', 'pageview', '/deondevem/sistema/'+rows[0][1]);
                 //console.debug(rows);
             }

         });

     } //Fim ConsultaSistema

 });

//       (function($) {
//     $.fn.bootstrapValidator.validators.CepRMSP = {
//         /**
//          * @param {BootstrapValidator} validator The validator plugin instance
//          * @param {jQuery} $field The jQuery object represents the field element
//          * @param {Object} options The validator options
//          * @returns {boolean}
//          */
//         validate: function(validator, $field, options) {
//             // You can get the field value
//             // var value = $field.val();
//             //
//             // Perform validating
//             // ...
//             //
//             // return true if the field value is valid
//             // otherwise return false
//             var is_rmsp = $field.val();

//             if(is_rmsp.substring(1) != 0) {
//                 return false;
//             }
//         }
//     };
// }(window.jQuery));

