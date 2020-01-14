var timestamp=new Date().getTime();


const _IMPORTS_=[
    './static/lib/utils.js',
    './const.js',
    './model/Reproductor.js',
    './services/Peerflix.js',
    './actions.js',
    './main.js',
]



const _CSS_=[
    './static/styles/css/style.css'
]


function importarCSS(url){
    var style=document.createElement('link');
    style.setAttribute('href',url+'?v='+timestamp)
    style.setAttribute('type',"text/css");
    style.setAttribute('rel',"stylesheet");
    document.getElementsByTagName('head')[0].appendChild(style);
}

function importar(url){
    var script=document.createElement('script');
    script.setAttribute('src',url+'?v='+timestamp)
    script.setAttribute('type',"text/javascript");
    script.onload = function(){
        console.log('Done '+url);
    }
    document.getElementsByTagName('head')[0].appendChild(script);
}

for(var i=0;i<_CSS_.length;i++){
    importarCSS(_CSS_);
}

for(var i=0;i<_IMPORTS_.length;i++){
    importar(_IMPORTS_[i]);
}