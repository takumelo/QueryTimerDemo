let cnvs;
let gl;
const enableDebug = true;

let sceneRender;
let laplacianRender;

let WINDOW_WIDTH = 600;
let WINDOW_HEIGHT = 600;

let info;
let post_process_info;
let ext;
let queryPool = [];
let then = 0;

function init(){
    cnvs = document.getElementById("canvas");
    cnvs.width = WINDOW_WIDTH;
    cnvs.height = WINDOW_HEIGHT;
    if(enableDebug){
        gl = WebGLDebugUtils.makeDebugContext(cnvs.getContext('webgl2'));
        info = document.getElementById("info");
        post_process_info = document.getElementById("post_process_info");
        ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
    }else{
        gl = cnvs.getContext('webgl2');
    }

    gl.enable(gl.DEPTH_TEST);

    sceneRender = new SceneRender();
    nothingRender = new ScreenRender(postVs, passFs);
    laplacianRender = new ScreenRender(postVs, laplacianFs);
    gaussianRender = new ScreenRender(postVs, gaussianFs);
    mozaicRender = new ScreenRender(postVs, mozaicFs);
}

function getQueryResult(){
    let elapsedMSList = [];
    let hit_ind = [];
    let cnt = 0;
    while(true){
        let available = gl.getQueryParameter(queryPool[cnt], gl.QUERY_RESULT_AVAILABLE);
        if(available){
            let elapsedMS = gl.getQueryParameter(queryPool[cnt], gl.QUERY_RESULT) * 0.000001;
            elapsedMSList.push(elapsedMS);
            hit_ind.push(cnt);
        }else{
            break;
        }
        cnt++;
    }
    queryPool = queryPool.map((e,i) => hit_ind.includes(i) ? undefined : e).filter(x => x);
    return elapsedMSList;
}

function drawLoop(now){
    if(enableDebug){
        now *= 0.001;
        const deltaTime = now - then;
        then = now;
        const fps = 1 / deltaTime;
        info.textContent = "FPS: " + fps;
    }

    sceneRender.drawScene();
    let tex = sceneRender.getTex();
    let choice = document.querySelector('input[name="choice"]:checked').value;
    if(choice == "doNothing"){
        nothingRender.setTex(tex);
    }else if(choice == "gaussian"){
        gaussianRender.setTex(tex);
    }else if(choice == "laplacian"){
        laplacianRender.setTex(tex);
    }else if(choice == "mozaic"){
        mozaicRender.setTex(tex);
    }
    
    if(enableDebug){
        queryPool.push(gl.createQuery());
        gl.beginQuery(ext.TIME_ELAPSED_EXT, queryPool.slice(-1)[0]);
    }
    if(choice == "doNothing"){
        nothingRender.drawScene();
    }else if(choice == "gaussian"){
        gaussianRender.drawScene();
    }else if(choice == "laplacian"){
        laplacianRender.drawScene();
    }else if(choice == "mozaic"){
        mozaicRender.drawScene();
    }

    if(enableDebug){
        gl.endQuery(ext.TIME_ELAPSED_EXT);
        let timeList = getQueryResult(queryPool)
        timeList.forEach(i => post_process_info.textContent = "post process draw time:" + i + "ms");
    }

    requestAnimationFrame(drawLoop);
}

function main(){
    console.log("start");
    init();
    drawLoop();
}

onload = function(){
    main();    
}