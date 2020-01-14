var Utils={
    http:{
        ajaxRequest:function(url,metodo,variables={}){
            headers={}
            if(localStorage.getItem("token")!=null){
                headers['Authorization']='Bearer '+localStorage.getItem("token");
            }
            return $.ajax({
                url:url,
                method:metodo,
                data:variables,
                headers:headers
            });
        },
        ajaxRequestJSON:function(url,metodo,variables={}){
            
            return $.ajax({
                url:url,
                method:metodo,
                data:variables,
                processData:false
            });
        }
    },
    templates:{
        loadTemplate:function(template,continer,datos={},clase='',cb=[]){
            return new Promise(function(resolve,reject){
                $.get(template+'?v='+timestamp).done(function(data){
                    var html=ejs.render(data,datos);
                    if(clase!=''){
                        $('.'+clase).html(html);
                    }else{
                        $('#'+continer).html(html);
                    }
                    if(cb.length>0){
                        if(cb.length>1){
                            resolve(Utils.templates.loadMultipleTemplate(cb));
                        }else{
                            resolve(Utils.templates.loadTemplate(cb.template,cb.continer,cb.datos,cb.clase,cb.cb));
                        }
                    }else{
                        resolve('ok');
                    }
                    
                }).fail(function(err){
                    reject(err);
                })
            });
        },
        loadMultipleTemplate:function(cargas){
            var promesas=[];
            for(var i=0;i<cargas.length;i++){
                var promesa=Utils.templates.loadTemplate(cargas[i].template,cargas[i].continer,cargas[i].datos,cargas[i].clase,cargas[i].cb);
                promesas.push(promesa);
            }
            return Promise.all(promesas);
        },
        include:function(template,continer,datos={},tipo='html'){
            $.get(template+'?v='+timestamp).done(function(data){
                if(tipo=='html'){
                    var html=ejs.render(data,datos);
                    $(continer).html(html);
                    listeners.load();
                   
                }
            }).fail(function(err){
                reject(err);
            });
        }
    },
    formato:{
        normalizarCadena:function(cadena){
            return cadena.normalize('NFD').replace(/[\u0300-\u036f]/g,"");
        }
    },
    animaciones:{
        encadenarAnimaciones:function(arrayElementos,propiedades,duracion,index){
            $(arrayElementos[index]).animate(propiedades,duracion,function(){
                if(index<arrayElementos.length-1){
                    Utils.animaciones.encadenarAnimaciones(arrayElementos,propiedades,duracion,(index+1));
                }
            });
        }
    },
    formularios:{
        confirmarPassword:function(c1,c2){
            if(c1.value != c2.value) {
                c2.setCustomValidity("las contraseñas no coinciden");
            } else {
                c2.setCustomValidity('');
            }
        },
        validarPassword:function(c1){
            var patrones=[
                { patron:/\d/, nombre:'decimal'},
                { patron:/[A-Z]/,nombre:'mayuscula'},
                { patron:/[a-z]/,nombre:'minuscula'},
                { patron:/\W/,nombre:'otros'},
                { patron:/\s/,nombre:'espacios'}
            ];
            var valido=true;
            for(var i=0;i<patrones.length && valido;i++){
                if(i==patrones.length-1){
                    if(patrones[i].patron.test(c1.value)){
                        c1.setCustomValidity('la contraseña no puede contener espacios');
                        valido=false;
                    }
                }else{
                    if(!patrones[i].patron.test(c1.value)){
                        c1.setCustomValidity('la contraseña debe contener numeros, mayusculas, minusculas y caracteres extraños');
                        valido=false;
                    }
                }
            }
            if(valido==true){
                c1.setCustomValidity('');
            }
        },
        formArrayToJSON:function(serializedArray){
            var datos={};
            for(var i=0;i<serializedArray.length;i++){
                datos[serializedArray[i]['name']]=serializedArray[i]['value'];
            }
            return datos;
        }
    },
    youtube:{
        _cargar:function(tag1,id,loop){
            var player;
            
            player = new YT.Player(tag1, {
                height: 'auto',
                width: '100%',
                videoId: id,
                suggestedQuality: 'highres',
                playerVars: {'iv_load_policy':3,'loop':loop, 'autoplay': 1, 'controls': 0,'rel':0,'showinfo':0,'origin':'http://localhost:80','modestbranding':1 },
                events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
                }
            });
            function onPlayerReady(event) {
                //event.target.mute();
            }
            var done = false;
            function onPlayerStateChange(event) {
                if(e.data === YT.PlayerState.ENDED){
                    player.loadVideoById(id);
                }
            }
            function stopVideo() {
                player.stopVideo();
            }
            
        }
    },
    video:{
        _round:function(n,d){
            var m=10^d;
            return Math.round(n*m)/m;
        },
        _bytes:function(n){
            

            var unidad = 'bytes';
            if (n > 1024) {
                n = n / 1024.0
                unidad = 'KB';
            }
            if (n > (1024)) {
                n = n / 1024.0;
                unidad = 'MB';
            }
            if (n > (1024)) {
                n = n / 1024.0;
                unidad = 'GB';
            }
            n = Utils.video._round(n, 2);

            return n + ' ' + unidad;
        },
        _parseHour:function(segundos) {
            var horas = 0;
            var minutos = 0;
            var segundos = segundos;
            if (segundos >= 3600) {
                horas = Math.floor(segundos / 3600);
                segundos = (segundos % 3600);
            }
            if (segundos >= 60) {
                minutos = Math.floor(segundos / 60);
                segundos = (segundos % 60);
            }
        
            if (horas != 0) {
                var str_h = horas + '';
                if (horas < 10) {
                    str_h = '0' + horas;
                }
            }
            var str_m = minutos + '';
            if (minutos < 10) {
                str_m = '0' + minutos;
            }
            var str_s = segundos + '';
            if (segundos < 10) {
                str_s = '0' + segundos;
            }
        
            if (horas == 0) {
                cadena_final = str_m + ':' + str_s;
            } else {
                cadena_final = str_h + ':' + str_m + ':' + str_s;
            }
        
            return cadena_final;
        }
    }

}
