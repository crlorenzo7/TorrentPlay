var app=null;
var plataforma="windows";
var version=3;
var shell = require('electron').shell;

const remote = require('electron').remote;
var sleepBlockId=null;

//PRUEBA//

window.setTimeout(function(){
    app={
        torrent:null,
        intervalos:{
            peerflixInfo:{
                play:true,
                interval:null
            },
            inactividad:{
                play:true,
                t:0,
                interval:null
            }
        },
        gesIntervalos:{
            _setIntervaloPeerflixInfo:function(cb,tiempo){
                app.intervalos.peerflixInfo.interval=setInterval(cb,tiempo);
            },
            _clearIntervaloPeerflixInfo:function(){
                clearInterval(app.intervalos.peerflixInfo.inteval);
                app.intervalos.inactividad.play=true;
            },
            _setIntervaloInactividad:function(cb,tiempo){
                app.intervalos.inactividad.interval=setInterval(cb,tiempo);
            },
            _clearIntervaloInactividad:function(){
                clearInterval(app.intervalos.inactividad.interval);
                app.intervalos.inactividad.t=0;
                app.intervalos.inactividad.play=true;
            }
        },
        gesReproductor:{
            _mostrarInfo:function(){
                $('#cover-player').fadeIn(500);
            },
            _ocultarInfo:function(){
                $('#cover-player').fadeOut(500);
            }
        },
        gesScreen:{
            _bloquear(){
                if(sleepBlockId==null){
                    sleepBlockId=remote.powerSaveBlocker.start("prevent-display-sleep");
                }
            },
            _desbloquear(){
                if(sleepBlockId!=null){
                    remote.powerSaveBlocker.stop(sleepBlockId);
                    sleepBlockId=null;
                }
            }
        },
        _closeApp:function(){
            remote.getCurrentWindow().close();
        },
        _getACE:function(magnet){
            console.log(magnet);
            var cb=function(){
                console.log(magnet);
                app.gesScreen._bloquear();
                player._reproducir(magnet,0);
            
                listeners.load();
                reproductor._loadListeners();
                
            }
            app._getReproductor(cb);
        },
        _getSystemBanner:function(msg,cb){
            Utils.templates.loadTemplate('./views/utils/system-notification-banner.ejs','wrapper-banner',{mensaje:msg}).then(function(data){
                app.gesBanner._show();
                listeners.load();
                $('#wrapper-banner [data-type="boton"]').click(function(){
                    var action=$(this).attr('data-action');
                    if(action=='continuar'){
                        cb();
                    }else{
                        app.gesBanner._hide();
                    }
                });
            });
        },

        _getReproductor:function(cb){
            
            Utils.templates.loadTemplate('./views/playerVLC.ejs','pantalla-reproductor',{}).then(function(data){
                    $('#pantalla-reproductor').css('display','block');
                    $('#pantalla-reproductor').animate({"opacity":1},500);
                    cb();
                }
            ).catch(function(err){
                    console.log(err);
                }
            )
        },

        _getControls:function(cb){
            Utils.templates.loadTemplate('./views/player/controls.ejs','controls-continer').then(function(data){
                cb();
            })
        },
        _getIndex: function(cb=null){
            
            Utils.templates.loadTemplate('./views/index.ejs','app').then(function(data){
                listeners.load();
            }).catch(function(err){ console.log(err)});
                    
            
        }
    }


    $(document).ready(function(){
        app._getIndex();
        $(document).on('click', 'a[href^="http"]', function(event) {
            event.preventDefault();
            shell.openExternal(this.href);
        });
        
    });
},600);



