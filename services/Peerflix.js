var fs = require('fs'); // sistema de archivo
var path = require('path');
var util = require('util');
var os = require('os');
var peerflix = require('peerflix');
var extra = require('fs-extra');
var http = require('http');



var servicio="";

var player={
    engine:null,
    videoTag:null,
    verified:0,
    estado:0,
    proc:null,
    timeoutInterval:null,
    timeout:0,
    descargar:null,
    download:{
        interval:null,
        valor:0
    },
    _init:function(tag){
        player.videoTag=tag;
        player.verified=0;
    },
    _resetTimeout:function(){
        clearInterval(player.timeoutInterval);
        player.timeoutInterval=null;
        player.timeout=0;
    },
    _seek:function(porcentaje){
        var selection=player.engine.selection[0];
        var to=selection.to;
        var pieceLength=player.engine.torrent.pieceLength;
        var totalPieces=player.engine.torrent.pieces.length;
        var offset=porcentaje*player.engine.torrent.length;
        var pieceTarget=Math.ceil(offset/pieceLength)-1;
        console.log('selection: '+selection+'\npieceLength: '+pieceLength+'\ntotalPieces: '+totalPieces+'\noffset: '+offset+'\npieceTarget: '+pieceTarget);
        player.engine.deselect(selection.from,selection.to,selection.priority,selection.notify);
        player.engine.select(pieceTarget, to, 1);
        reproductor._setCurrentTime(porcentaje);
    },
    _getFilePath:function(ruta){        
        console.log('holapath');
        var arrayfiles = fs.readdirSync(ruta);
        var n = arrayfiles.length
        console.log(n);
        for (i = 0; i < n; i++) {
            if (arrayfiles[i].match(/(.mkv|.avi|.mp4)$/)) {
                console.log(ruta + '\\' + arrayfiles[i]);
                return (ruta + '\\' + arrayfiles[i]);
            } else {
                try {
                    var archivo_actual = ruta + '\\' + arrayfiles[i];
                    var stats = fs.statSync(ruta + '\\' + arrayfiles[i]);
                    if (stats.isDirectory()) {
                        console.log('entrando en carpeta');
                        console.log(archivo_actual + '');
                        console.log(player);
                        return player._getFilePath(archivo_actual);
                    }
                } catch (err) {
                    console.log(err);
                }
            }
        }
        
    },
    _initDownloadInfo:function(){
        var fileSize=player.engine.server.index.length;

        $('#download-info #total-descargado').html(Utils.video._bytes(fileSize));
    },
    _cerrarReproductor:function(){
        
        player._destroy();
        reproductor._destroy();
        
        
    },
    _updateDownloadInfo:function(){
        var started =new Date().getTime();
        var fileSize=player.engine.server.index.length;
        var descargado=player.engine.swarm.downloaded;
        var wires=player.engine.swarm.wires;
        var velocidad=player.engine.swarm.downloadSpeed();

        var porcentaje=descargado/fileSize;
        var peers=wires.length;
        
        //var runtime = Math.floor((Date.now() - started - timePaused - timeCurrentPause) / 1000);
        
        if (descargado >= fileSize) {
            $('#download-info #parcial-descargado').html(Utils.video._bytes(fileSize));
            $('#download-info #speed-download').html('completado');
            $('#buffering #speed-buffer').html('completado');
            $('#download-info #peers').html(peers);
            $('#buffering #peers-buffer').html(peers);
            $('#download-info #progress-descargado .fill-bar').css('width',(100)+'%');
        } else {
            $('#download-info #parcial-descargado').html(Utils.video._bytes(descargado));
            $('#download-info #peers').html(peers);
            $('#buffering #peers-buffer').html(peers);
            $('#download-info #speed-download').html(Utils.video._bytes(velocidad)+'ps');
            $('#buffering #speed-buffer').html(Utils.video._bytes(velocidad)+'ps');
            $('#download-info #progress-descargado .fill-bar').css('width',(porcentaje*100)+'%');
        }

    },
    _revisar_archivos:function(ruta, titulo) {
        if (fs.existsSync(ruta)) {
            var arrayFiles = fs.readdirSync(ruta);
            var n = arrayFiles.length;
            for (i = 0; i < n; i++) {
                var pathfile = arrayFiles[i].split('.')[0];
                if (pathfile == titulo) {
                    return (ruta + arrayFiles[i]);
                }
            }
    
            return '';
        } else {
            return '';
        }
    },
    _getControls(cb=null){
        $('#controls-continer').fadeOut(500,function(){
            $('#controls-continer').attr('data-type','flex');
            $('#controls-continer').html('');
            var callback=function(){
                listeners.load();
                reproductor._loadListeners();
                
                $('#controls-continer').fadeIn(500,function(){
                    if(cb!=null){
                        cb();
                    }
                });
            }
            app._getControls(callback);
        })
    },
    _loadBuffering:function(){
        $('#buffering').fadeIn(500);
    },
    _hideBuffering:function(){
        $('#buffering').fadeOut(500);
    },
    _reproducir:function(torrent,start_time=0){
        
            //app._getLoader('conectando');
            reproductor._ocultarLauncher();
           
            player.engine = peerflix(torrent, {
                dht: true || 50,
                tracker: true,
                trackers: torrentTrakers,
                //tmp:main_dir+'\\torrents\\',
                buffer: (1.5 * 1024 * 1024).toString(),
            });

            var c = 0;
            var es_copiado = 0;

            var intervaloCarga=function(){
                player.timeout+=1
                if (player.timeout==30){
                    app.gesLoader._changeLoaderMessage('error en la conexion');
                    player._resetTimeout();
                    var resetControls=function(){
                        //app.gesLoader._ocultarLoader();
                        reproductor._mostrarLauncher();
                    }
                    window.setTimeout(resetControls,3000);

                }
            }
            player.timeoutInterval=window.setInterval(intervaloCarga,1000);

            player.engine.server.on('listening', function() {
                if (player.engine) {
                    //console.log(player.engine);
                    var title=player.engine.torrent.name;
                    reproductor.setVideoName(title);
                    player._resetTimeout();
                    //app.gesLoader._ocultarLoader();
                    player._loadBuffering();
                    player._getControls();
                    console.log('http://127.0.0.1:' + player.engine.server.address().port + '/');
                    var mpv=document.getElementById('screen');
                    reproductor._loadreproductor(mpv);
                    reproductor.loadVideo('http://127.0.0.1:' + player.engine.server.address().port + '/',start_time);
                    /*MFApi._getSubtitles().done(function(data){
                        if(data.resultado==200){
                            if(data.subs!=''){
                                var decodedData = window.atob(data.subs.replace("b'",'').replace("'",''));
                                fs.writeFileSync(player.engine.path.split('.torrent')[0]+'/subs-es.srt',decodedData);
                                reproductor._addSubtitulo(player.engine.path.split('.torrent')[0]+'subs-es.srt');
                            }
                            //reproductor._loadSubtitles(__dirname+'\\subs-es.srt');
                        }
                    }).fail(function(err){console.log(err);})*/
                    var fileSize=player.engine.server.index.length;

                    if(player.download.interval!=null){
                        clearInterval(player.download.interval);
                    }
                    
                    $('#download-info #total-descargado').html(Utils.video._bytes(fileSize));
                    console.log(fileSize);
                    player.download.interval=setInterval(player._updateDownloadInfo,500);

                }
            });
            player.engine.on('verify', function() {
                player.verified++;
            });

            player.engine.on('idle', function() {
                /*if (es_copiado == 0 && player.descargar) {
                    es_copiado++;
                    var rutaOrigen= player._getTorrentFile(player.engine.path.split('.torrent')[0]);
                    console.log(rutaOrigen);
                    player._saveFile(ruta_path,nombre_archivo,rutaOrigen);
                    
                }*/
            });

        


        
    },
    _saveFile:function(destino,nombre_archivo,origen){
        var trozos_origen=origen.split('\\');
        var trozos_video=trozos_origen[trozos_origen.length-1].split('.');
        var extension=trozos_video[trozos_video.length-1];
        
        var destino=destino+nombre_archivo+'.'+extension;
        
      
          extra.move(origen, destino, function (err) {
              if (err) return console.error(err);
              console.log("success!");
          });
    },
    _getTorrentFile:function(ruta){
        var arrayfiles=fs.readdirSync(ruta);
        var n=arrayfiles.length
        for(i=0;i<n;i++){
            if(arrayfiles[i].match(/(.mkv|.avi|.mp4)$/)){
                return (ruta+'\\'+arrayfiles[i]);
            }else{
                try{
                    var archivo_actual=ruta+'\\'+arrayfiles[i];
                    var stats=fs.statSync(ruta+'\\'+arrayfiles[i]);
                    if(stats.isDirectory()){
                        console.log('entrando en carpeta');
                        console.log(archivo_actual+'');
                        return player._getTorrentFile(archivo_actual);
                    }
                }catch(err){
                    console.log(err);
                }
            }
        }
    },
    _destroy:function(){
        app.gesIntervalos._clearIntervaloPeerflixInfo();
        console.log('destruyendo..');
        if (player.engine != null && player.engine!=-1) {
            player.engine.server.close();
            player.engine.remove(function() {});
            player.engine.destroy();
        }
    }
}