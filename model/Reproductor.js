var net=require('net');
var xpipe=require('xpipe');
var path = require("path");
var reproductor={
    start_time:0,
    estado:{
        current_time:0,
        paused:true,
        duration:0,
        volume:50,
        seeking:false,
        controls:0,
        playing:false,
        subtitulos:[],
        showingSubs:false
    },
    mpv:null,
    inactividad:{
        interval:null,
        valor:0
    },
    _addSubtitulo:function(sub){
        reproductor.estado.subtitulos.push(sub);
        reproductor._mostrarSubtitulos();
    },
    _mostrarSubtitulos:function(){
        $('#subtitle-control').css('display','flex');
    },
    _ocultarSubtitulos:function(){
        $('#subtitle-control').css('display','none');
    },
    _loadSubtitles:function(subs){
        reproductor.estado.showingSubs=true;
        reproductor.estado.subtitulos.push(subs);
        reproductor.command("sub-add", subs);
    },
    _loadreproductor:function(mpv){
        reproductor.mpv=mpv;
        reproductor.observe("time-pos");
        reproductor.observe("pause");
        reproductor.observe("duration");
        reproductor.observe("eof-reached");
        reproductor.property("hwdec", "auto");
        reproductor.property('input-ipc-server',path.dirname(process.execPath)+'/mpvsocket');
        reproductor.mpv.addEventListener("message", function(e){
            const msg = e.data;
            const {type, data} = msg;
            if (type === "property_change") {
                const {name, value} = data;
                reproductor.onPropertyChange(name, value);
            } else if (type === "ready") {
                console.log('hola evento');
                //reproductor.showControls();
            }
        });
    },

    updateInterval:function(){
        console.log('intervalo');
        console.log(reproductor.estado);
        console.log(reproductor.inactividad.valor);
        if(!reproductor.estado.paused && reproductor.estado.controls==1){
            console.log('hola');
            if(reproductor.inactividad.valor==5){
                reproductor.hideControls();
                reproductor.inactividad.valor=0;
            }else{
                reproductor.inactividad.valor++;
            }
        }else{
            reproductor.inactividad.valor=0;
        }
    },

    disableSubs(){
        reproductor.estado.showingSubs=false;
        reproductor.property("sid","no");
    },
        

    loadVideo:function(url,start_time){
        reproductor.start_time=start_time;
        reproductor.command("loadfile", url);
    },

    showControls:function(){
        reproductor.estado.controls=1;
        $('#cover-player [data-component="controls"]').css('opacity',1);
        $('#cover-player').animate({"opacity":1},250);
    },

    hideControls:function(){
        reproductor.estado.controls=0;
        $('#cover-player').animate({"opacity":0},250);
        if($('#download-info').is(':visible')){
            $('#download-info').fadeOut(250);
        }
    },

    seek:function(per){
        var time=Math.floor(reproductor.estado.duration*per);
        reproductor.estado.current_time=time;
        reproductor.property("time-pos", time);
    },

    play_pause:function(){
        if(!reproductor.estado.paused){
            reproductor.estado.paused=true;
            reproductor.property("pause",true);
        }else{
            reproductor.estado.paused=false;
            reproductor.property("pause",false);
        }  
    },

    play:function(){
        if(reproductor.estado.paused){
            reproductor.play_pause();
        }
        var item=$('[data-action="play-video-r"]')[0];
        $(item).css('justify-content','center');
        $(item).css('padding-left','0px');
        $(item).find('i').html('pause');
        $(item).attr('data-action','pause-video');
    }, 

    

    command:function(cmd, ...args) {
        args = args.map(arg => arg.toString());
        reproductor.postData("command", [cmd].concat(args));
    },

    postData:function(type, data) {
        const msg = {type, data};
        reproductor.mpv.postMessage(msg);
    },

    property:function(name, value) {
        const data = {name, value};
        reproductor.postData("set_property", data);
    },

    observe(name){
        reproductor.postData("observe_property", name);
    },
    
    setVideoName(title){
        $('#cover-player .toolbar .titulo').html(title);
    },

    _ocultarDownloadInfo:function(){
        $('#download-info').fadeOut(500);
    },
    _mostrarDownloadInfo:function(){
        $('#download-info').fadeIn(500);
    },
    _mostrarLauncher:function(){
        $('#cover-player .big-controls').fadeIn(500);
    },
    _ocultarLauncher:function(){
        $('#cover-player .big-controls').fadeOut(500);
    },
    _destroy:function(){
        if(reproductor.estado.duration>0){
            //app._updateViendo();
        }
        if(reproductor.mpv!=null){
            reproductor.property("time-pos", 0);
            reproductor.property('pause',true);
        }
        reproductor.inactividad.valor=0;
        reproductor.mpv=null;
        reproductor.estado.current_time=0;
        reproductor.estado.paused=true;
        reproductor.estado.subtitulos=[];
        reproductor.estado.duration=0;
        reproductor.estado.seeking=false;
        reproductor.estado.controls=0;
        reproductor.estado.playing=false;
        reproductor.estado.showingSubs=false;
    },

    onPropertyChange:function(name,value){
        if(name=='time-pos'){
          reproductor.estado.current_time=value;
          document.getElementById('progreso').value=value;
          $('#ptiempo').html(secondsToHour(value));
          var per=(value/reproductor.estado.duration);
          var width=$('#progress-time').width()*per;
          var move=width-10;
          $('#current-cursor').css('left',move+'px');
          
        }
        if(name=='metadata'){
            console.log('hola - metadata');
        }
        
        if(name=='duration'){
            console.log('en duracion');
            player._hideBuffering();
            reproductor.estado.duration=value;
            document.getElementById('progreso').max=reproductor.estado.duration;
            $('#ttiempo').html(secondsToHour(value));
            reproductor.showControls();
            $('#poster-player').fadeOut(500);
            if(reproductor.inactividad.interval!=null){
                clearInterval(reproductor.inactividad.interval);
            }
            reproductor.property("time-pos", reproductor.start_time);
            //app._updateViendo();
            reproductor.inactividad.interval=setInterval(reproductor.updateInterval,1000);
            reproductor.estado.playing=true;
            reproductor.play();
            window.setTimeout(() => {
                var client = net.connect(xpipe.eq(path.dirname(process.execPath)+'/mpvsocket'), () => {
                  console.log('connected to IPC server')
                  const command = JSON.stringify(
                    { 'command': ['get_property','track-list'], 'request_id': 100 }
                  )
                  client.write(Buffer.from(command + '\n'))
                })
            
                client.on('data', (res) => {
                  res = res.toString('utf8')
                  console.log(res);
                  res = res.trim()
                  res = `[${res}]`
                  res = res.replace(/(\r\n|\n|\r)/g, ',')
                  res = JSON.parse(res)
                  res.forEach((key) => {
                    if (key.event === 'property-change' && key.name === 'track-list') {
                      if (key.data !== null) console.log(key.data)
                    }
                  })
                })
                
                }, 1000)
            //reproductor.property("sid",no);
            
        }
        
    },
    controlsHandler:function(){
        var action=$(this).attr('data-action');
        switch(action){
            case 'play-video-r':
                reproductor.play_pause();
                $(this).css('justify-content','center');
                $(this).css('padding-left','0px');
                $(this).attr('data-action','pause-video');
                $(this).find('i').html('pause');
                break;
            case 'pause-video':
                reproductor.play_pause();
                $(this).css('justify-content','unset');
                if(window.innerHeight>800 && window.innerWidth>1600){
                    $(this).css('padding-left','63px');
                }else{
                    $(this).css('padding-left','40px');
                }
                $(this).attr('data-action','play-video-r');
                $(this).find('i').html('play');
                break;
            case 'ff-video':   
                reproductor.play_pause();
                if(reproductor.estado.current_time+10>reproductor.estado.duration){
                    reproductor.estado.current_time=0;
                }else{
                    reproductor.estado.current_time=reproductor.estado.current_time+10;
                }
                reproductor.property("time-pos", reproductor.estado.current_time);
                reproductor.play_pause();
                break;
            case 'rw-video':
                reproductor.play_pause();
                if(reproductor.estado.current_time-10>0){
                    reproductor.estado.current_time=reproductor.estado.current_time-10;
                }else{
                    reproductor.estado.current_time=0;
                }
                reproductor.property("time-pos", reproductor.estado.current_time);
                reproductor.play_pause();
                break;
        }
    },

    _loadListeners:function(){
        $('.big-controls [data-type="boton-c"]').unbind();
        $('#progress-time').unbind();
        $('#pantalla-reproductor').unbind();
        $('#pantalla-reproductor').mousemove(function(){
            if(reproductor.estado.playing){
                reproductor.inactividad.valor=0;
                if(reproductor.estado.controls==0){
                    reproductor.showControls();
                }
            }
        })

        $('#progress-time').click(function(e){
            var x =e.pageX - $(this).offset().left;
            var per=x/$(this).width();
            reproductor.estado.seeking=true;
            reproductor.seek(per);
            reproductor.estado.seeking=false;
        });
        

        $('.big-controls [data-type="boton-c"]').click(reproductor.controlsHandler);


    },

    _destroyListeners:function(){
        $('.big-controls [data-type="boton-c"]').unbind();
        $('#progress-time').unbind();
        $('#pantalla-reproductor').unbind();
    }
  




}

function secondsToHour(s){
    var cadena="";
    var h=Math.trunc(s/3600);
    if(s>=3600){
        var strh=h;
        if(h<10){
            strh="0"+h;
        }
        cadena+=strh+":";
    }
    var rh=s%3600;
    var m=Math.trunc(rh/60);
    if(s>=60){
        var strm=m;
        if(m<10){
            strm="0"+m;
        }
        cadena+=strm+":";
    }
    var sf=Math.trunc(rh%60);
    
    var strsf=sf;
    if(sf<10){
        strsf="0"+sf;
    }
    cadena+=strsf;
    
    return cadena;
}