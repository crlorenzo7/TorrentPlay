const { dialog } = require('electron').remote;
var magnetLink = require('magnet-link');

var listeners={
    
    _getIndex: function(){

        var reproducirVideo=function(magnet){
            console.log(magnet);
            app._getACE(magnet);
        }

        var selectTorrent=function(){
            var torrent=dialog.showOpenDialog({ properties: ['openFile'] });
            if(torrent!=undefined){
                magnetLink(torrent[0],function(err,link){
                    app.torrent=link;
                    console.log(app.torrent);
                });
            }
        }
        var playTorrent=function(){
            if(/^magnet:\?xt=urn:btih:(\S)*$/gi.test($('#mltp').val())){
                app.torrent=$('#mltp').val();
            }
            
            if(app.torrent!=null){
                reproducirVideo(app.torrent);
            }else{
                alert("selecciona un torrent");
            }
        }

        $('#mltp').unbind();
        $('#select-torrent').unbind();
        $('#play-torrent').unbind();

        $('#mltp').keypress(function(e){
            
            if(e.which==13){
                
                if($(this).val()!=''){
                    if(/^magnet:\?xt=urn:btih:(\S)*$/gi.test($(this).val())){
                        reproducirVideo($(this).val());
                    }
                }
            }
        });

        $('#select-torrent').click(selectTorrent);
        $('#play-torrent').click(playTorrent);
    },
    
    
    
    _getReproductor:function(){
        var moverCursor=function(e){
            var x =e.pageX - $(this).offset().left-7;
            $('#progress-time #cursor').css('left',x+'px');

        }

        var fijarCursor=function(e){
            var x =e.pageX - $(this).offset().left;
            $('#progress-time #fill').width(x);
            reproductor._seek(x);
        }

        var resetCursor=function(){
            var x=$('#progress-time #fill').width()-7;
            $('#progress-time #cursor').css('left',x+'px');
        }

        var cerrarReproductor=function(){
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
              } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
              } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
              }
            
            
            app.gesScreen._desbloquear();
            
            $('#pantalla-reproductor').animate({'opacity':'0'},500,function(){
                $('#pantalla-reproductor').css('display','none');
                player._destroy();
                reproductor._destroy();
                window.setTimeout(function(){$('#pantalla-reproductor').html('');},500);
            })
        }

        var showHideDownloadInfo=function(){
            
            if(!$('#download-info').is(':visible')){
                $('#download-info').fadeIn(500);
                $('#download-info').attr('data-estado','visible');
            }else{
                $('#download-info').fadeOut(500);
                $('#download-info').attr('data-estado','invisible');
            }
        }

        var loadSubtitles=function(boton){
            if(reproductor.estado.showingSubs){
                $(boton).attr('data-estado','inactive');
                reproductor.disableSubs();
            }else{
                $(boton).attr('data-estado','active');
                var subs=dialog.showOpenDialog({ properties: ['openFile'] });
                if(subs!=undefined){
                    reproductor._loadSubtitles(subs);
                }
            }
        }

       
        

        var analizarBoton=function(){
            var action=$(this).attr('data-action');
            switch(action){
                case 'close-player':cerrarReproductor();break;
                case 'descargar':showHideDownloadInfo();break;
                case 'maximize':toggleFullScreen(this);break;
                case 'activar-subtitulos':loadSubtitles(this);break;
                case 'play-video':reproducirVideo();break;
                case 'back':
                case 'next':cargarCapitulo(this);break;
            }
        }

        var activarRaton=function(){
            app.intervalos.inactividad.t=0;
            if (!app.intervalos.inactividad.play) {
                reproductor._mostrarControles();
                app.intervalos.inactividad.play=true;
                $('html').css('cursor', 'auto');
            }
        }

        var toggleFullScreen=function(item) {
            if (!document.fullscreenElement &&    // alternative standard method
                !document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
              if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
              } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
              } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
              }
              $(item).find('i').html('resize');
            } else {
              if (document.cancelFullScreen) {
                document.cancelFullScreen();
              } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
              } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
              }
              $(item).find('i').html('maximizar');
            }
          }
        
          

        $('#move-bar').unbind();
        $('#cover-player [data-type="boton"]').unbind();
        $('#pantalla-reproductor').unbind();
        $('#descarga-disco-player').unbind();
        
        $('#move-bar').mousemove(moverCursor);
        $('#move-bar').click(fijarCursor);
        
        //$('#move-bar').mouseleave(resetCursor);
        $('#cover-player [data-type="boton"]').click(analizarBoton);
        $('#pantalla-reproductor').mousemove(activarRaton);
    },
    
    
    _getGlobal:function(){
        var hv=window.innerHeight;
        var wv=window.innerWidth;
        
        $('html').unbind();
        $('html').click(function(e){
            
            var r0=($(e.target).parents('#download-info').length==0);
            var r1=($(e.target).parents('.boton[data-action="descargar"]').length==0);
            var r2=($(e.target).attr('data-action')!='descargar')
            if(r0 && r1 && r2 ){
                
                if($('#download-info').is(':visible')){
                    $('#download-info').attr('data-estado','invisible');
                    $('#download-info').fadeOut(500);
                }
            }
        });
    },
    load:function(){
        this._getGlobal();
        this._getIndex();
        this._getReproductor();
    }

}

