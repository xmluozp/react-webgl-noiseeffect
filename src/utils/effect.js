window.cancelRequestAnimFrame = (function () {
    return window.cancelAnimationFrame ||
        window.webkitCancelRequestAnimationFrame ||
        window.mozCancelRequestAnimationFrame ||
        window.oCancelRequestAnimationFrame ||
        window.msCancelRequestAnimationFrame ||
        clearTimeout
})();

/**
 * ===================== export functions =========================
 */
class NoiseEffect {

    constructor(images) {
        // initialize images
        imageURLArr = images;
    }
    load(...attr) {
        load(...attr);
    }
    unload() {
        unload();
    }
    imgSwitch(...attr) {
        imgSwitch(...attr);
    }
    resize(...attr) {
        resize(...attr);
    }
    fadeOut(...attr) {
        fadeOut(...attr);
    }
    fadeIn(...attr) {
        fadeIn(...attr);
    }
}

const SHOW_UP_SPEED = .3;
const Z_DIMENSION = 1.3;
const DEFAULT_POINT_NUMBER = 50000;

var canvas, gl,
    drawType,
    g_density,
    numLines;
var target;
var frameId;

var imageURLArr = [];

var perspectiveMatrix;
var g_RandomTargetXArr = [], g_RandomTargetYArr = [];
var effectOnLoad;
var loaded;
var canvasId;


function initVaribles() {
    loaded = false;

    //-------blow are to calculate new pixcel number when switching
    numLines = getNumLines(0);

    target = [];

    g_RandomTargetXArr = [];
    g_RandomTargetYArr = [];

    gl = canvas.getContext("experimental-webgl");
}


/**
 * loading all. pass images in the future
 * @param {} i_canvasId 
 * @param {*} defaultPicture 
 */
const load = function (i_canvasId, defaultPicture=0, color="#FFFFFF", isShow=true, density = 0.5, i_onLoad) {

    effectOnLoad = i_onLoad;
    g_density = density;

    canvasId = i_canvasId;
    drawType = (defaultPicture && defaultPicture >= 0) ? defaultPicture : 0;
    canvas = document.getElementById(canvasId);

    // 初始化变量
    initVaribles();
    var tempCanvas = document.createElement("canvas");
    var ctx = tempCanvas.getContext('2d', { alpha: false });

    const promisesArray = imageURLArr.map((item, number) => {

        return new Promise((resolve, reject) => {
            var image = new Image();
            image.crossOrigin = "Anonymous";
            image.src = item.src;
            image.onload = onLoadImageHandler.bind(this, image, tempCanvas, ctx, number, resolve);
            image.onerror = reject
        })
    })

    Promise.all(promisesArray).then(() => {
        loadScene(color, isShow);
    }).catch(() => {
        console.log(imageURLArr, "error");
    })
};

/**
 * clear
 */
const unload = function () {
    
    if(loaded){
        window.cancelRequestAnimFrame(frameId);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
}

/**
 * process all images passed in
 * @param {} image 
 * @param {*} tempCanvas 
 * @param {*} ctx 
 * @param {*} number 
 */
function onLoadImageHandler(image, tempCanvas, ctx, number, resolve) {

    tempCanvas.width = image.width;
    tempCanvas.height = image.height;

    ctx.drawImage(image, 0, 0)
    var imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

    var data = imageData.data;

    // 之前遍历的图片，number就是第几张图
    target[number] = [];

    imageURLArr[number].width = imageURLArr[number].width ? imageURLArr[number].width : image.width;
    imageURLArr[number].height = imageURLArr[number].height ? imageURLArr[number].height : image.height;

    var density = 1;

    // 这是个Mask，搜索图片里所有的白点，后面只打印白点
    for (let index = 0; index < data.length; index += 4) {

        if (data[index] !== 0) {
            var currentI = index / 4
            var currentX = currentI % tempCanvas.width;
            var currentY = parseInt(currentI / tempCanvas.height);

            if (currentX % density === 0 || currentY % density === 0) {
                var pos = { x: currentX / tempCanvas.width - .5, y: -currentY / tempCanvas.height + 0.5 }
                target[number].push(pos);
            }
        }
    }

    resolve();
}

/**
 * prepare to calculate lines.
 * @param {} w 
 * @param {*} h 
 */
const getNumLines = () => {

    var returnValue = DEFAULT_POINT_NUMBER; // standard number
    // if (imageInfoArr[picNumber]) {
    // 根据图片取精度
    // returnValue = returnValue * imageInfoArr[picNumber].width/ standard_height * g_density;

    // 根据指定的宽高决定精度
    returnValue = parseInt(returnValue * (canvas.width * canvas.height / DEFAULT_POINT_NUMBER) * g_density);
    // }

    return 100000 > returnValue ? returnValue : 100000;
}

/**
 * convert hex to vec4
 * @param {*} hex 
 */
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: Math.round(parseInt(result[1], 16)/255 * 10) / 10,
      g: Math.round(parseInt(result[2], 16)/255 * 10) / 10,
      b: Math.round(parseInt(result[3], 16)/255 * 10) / 10
    } : null;
  }

/**
 * Initialises WebGL and creates the 3D scene.
 */
function loadScene(color, isShow) {

    if (!gl) {
        alert("There's no WebGL context available.");
        return;
    }
    canvas.width = imageURLArr[drawType].width;
    canvas.height = imageURLArr[drawType].height;

    gl.viewport(0, 0, canvas.width, canvas.height);

    const RGBA = `${hexToRgb(color).r}, ${hexToRgb(color).g}, ${hexToRgb(color).b}, 1.0`;    
    const shaderfs = `
        precision highp float;
    
        void main(void) {
        gl_FragColor = vec4(${RGBA});
        }
    `;
    const shadervs = `
        attribute vec3 vertexPosition;
        
        uniform mat4 modelViewMatrix;
        uniform mat4 perspectiveMatrix;
    
        void main(void) {
        gl_Position = perspectiveMatrix * modelViewMatrix * vec4(  vertexPosition, 1.0);
        }
    `;

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, shadervs);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        alert("Couldn't compile the vertex shader");
        gl.deleteShader(vertexShader);
        return;
    }


    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, shaderfs);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        alert("Couldn't compile the fragment shader");
        gl.deleteShader(fragmentShader);
        return;
    }

    gl.program = gl.createProgram();
    gl.attachShader(gl.program, vertexShader);
    gl.attachShader(gl.program, fragmentShader);
    gl.linkProgram(gl.program);
    if (!gl.getProgramParameter(gl.program, gl.LINK_STATUS)) {
        alert("Unable to initialise shaders");
        gl.deleteProgram(gl.program);
        gl.deleteProgram(vertexShader);
        gl.deleteProgram(fragmentShader);
        return;
    }
    gl.useProgram(gl.program);
    var vertexPosition = gl.getAttribLocation(gl.program, "vertexPosition");
    gl.enableVertexAttribArray(vertexPosition);
    // gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // gl.clearDepth(1.0);

    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // ------------------

    initilizeVertices();

    // ------------------

    setSize(canvas.width, canvas.height);
    window.cancelRequestAnimFrame(frameId);


    loaded = true;

    if (typeof (effectOnLoad) === "function") {
        effectOnLoad();
    }

    // if display, fadeIn
    if (isShow) fadeIn();
}

function setSize(w, h) {

    var fieldOfView = 30.0;
    var aspectRatio = w / h;
    var nearPlane = 1.0;
    var farPlane = 10000.0;
    var top = nearPlane * Math.tan(fieldOfView * Math.PI / 360.0);
    var bottom = -top;
    var right = top * aspectRatio;
    var left = -right;

    var a = (right + left) / (right - left);
    var b = (top + bottom) / (top - bottom);
    var c = (farPlane + nearPlane) / (farPlane - nearPlane);
    var d = (2 * farPlane * nearPlane) / (farPlane - nearPlane);
    var x = (2 * nearPlane) / (right - left);
    var y = (2 * nearPlane) / (top - bottom);
    perspectiveMatrix = [
        x, 0, a, 0,
        0, y, b, 0,
        0, 0, c, d,
        0, 0, -1, 0
    ];

    var modelViewMatrix = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
    var vertexPosAttribLocation = gl.getAttribLocation(gl.program, "vertexPosition");
    gl.vertexAttribPointer(vertexPosAttribLocation, 3.0, gl.FLOAT, false, 0, 0);

    var uModelViewMatrix = gl.getUniformLocation(gl.program, "modelViewMatrix");
    var uPerspectiveMatrix = gl.getUniformLocation(gl.program, "perspectiveMatrix");
    gl.uniformMatrix4fv(uModelViewMatrix, false, new Float32Array(perspectiveMatrix));
    gl.uniformMatrix4fv(uPerspectiveMatrix, false, new Float32Array(modelViewMatrix));
}

// js trigger animate
function animate() {
    frameId = requestAnimationFrame(animate);
    if (frameId % 2 === 0) {
        drawScene();
    }
}

let numLinesFade = 0;
/**
 * fade out
 */
const fadeOut = function () {
    if (loaded) {
        // coefficient = .01;
        // reset to itself, otherwise will just fadeout without nice effect
        resetVertices(drawType);
        window.cancelRequestAnimFrame(frameId);
        numLinesFade = numLines;
        fadeOut_play();
    }
}
function fadeOut_play() {
    frameId = requestAnimationFrame(fadeOut_play);
    if (frameId % 2 === 0) {
        drawScene_fadeOut_play();
    }
}
/**
 * fade in
 */
const fadeIn = function () {
    if (loaded) {
        // coefficient = .01;
        // reset to itself, otherwise will just fadein without nice effect
        resetVertices(drawType);
        window.cancelRequestAnimFrame(frameId);
        numLinesFade = 0;
        fadeIn_play();
    }
}
function fadeIn_play() {

    frameId = requestAnimationFrame(fadeIn_play);
    if (frameId % 2 === 0) {
        drawScene_fadeIn_play();
    }
}

function drawScene_fadeOut_play() {

    if (numLinesFade > 0) {
        numLinesFade -= SHOW_UP_SPEED * 1000;
        const printLines = numLinesFade > 0 ? numLinesFade : 0;

        draw();
        gl.lineWidth(1);
        gl.bufferData(gl.ARRAY_BUFFER, g_Vertices, gl.DYNAMIC_DRAW);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.LINES, 0, printLines);
        gl.flush();

    }
}
function drawScene_fadeIn_play() {

    if (numLinesFade < numLines) {
        numLinesFade += SHOW_UP_SPEED * 1000;
        const printLines = numLinesFade < numLines ? numLinesFade : numLines;

        draw();
        gl.lineWidth(1);
        gl.bufferData(gl.ARRAY_BUFFER, g_Vertices, gl.DYNAMIC_DRAW);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.LINES, 0, printLines);
        gl.flush();
    }
    else {
        window.cancelRequestAnimFrame(frameId);
        frameId = requestAnimationFrame(animate);
    }
}
function drawScene() {

    draw();
    gl.lineWidth(1);
    gl.bufferData(gl.ARRAY_BUFFER, g_Vertices, gl.DYNAMIC_DRAW);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.LINES, 0, numLines);
    gl.flush();
}
// -------------------------------
// =================================================================================
// =================================================================================
// ==========================       main rendering    ==============================
// =================================================================================
// =================================================================================

var coefficient = .1;
var targetCoefficient = .01;

function draw() {
    // cn += .1;

    var bp, px, py, num, targetPosX, targetPosY;

    // coefficient 跳荡，无限趋近于targetCoefficient. 幅度取决于：初始值多大
    coefficient += (targetCoefficient - coefficient) * .1;

    const blur = coefficient / 2;
    const movingSpeed = coefficient * 2;

    const t_numOfLines = numLines * 2;

    // draw pixels

    for (let i = 0; i < t_numOfLines; i += 2) {

        num = parseInt(i / 2);
        bp = i * 3;

        g_Vertices[bp] = g_Vertices[bp + 3];
        g_Vertices[bp + 1] = g_Vertices[bp + 4];

        //var pos = target[parseInt(target.length * Math.random())];

        // 备份用，在此基础上随机。不记录随机状态，所以每一帧都会重新随机
        targetPosX = g_RandomTargetXArr[num];
        targetPosY = g_RandomTargetYArr[num];

        px = g_Vertices[bp + 3];
        // 前者是速度，后者是散布
        // cof等于tcof之前，都加速，等于的时候就不加速。所以加速度取决于这两个差
        px += (targetPosX - px) * movingSpeed + (Math.random() - .5) * blur;
        g_Vertices[bp + 3] = px;

        py = g_Vertices[bp + 4];
        py += (targetPosY - py) * movingSpeed + (Math.random() - .5) * blur;
        g_Vertices[bp + 4] = py;
    }
}

// -------------------------------
const resize = (w, h) => {

    if (loaded) {

        if (!(w || h)) {
            w = imageURLArr[drawType].width;;
            h = imageURLArr[drawType].height;;
        }

        if (w !== canvas.width || h !== canvas.height) {

            canvas.width = w;
            canvas.height = h;
            setSize(w, h);
            gl.viewport(0, 0, w, h);
        }
    }
}
// ===================================


var g_Vertices;

// -------------------------------

/**
 * first: set vertices
 */
function initilizeVertices() {

    var vertices = [];
    var randomTargetXArr = [];
    var randomTargetYArr = [];
    // -------------------------------
    numLines = getNumLines(drawType);

    // 强行循环n次，每次都从图片里任意x,t值上取一个点，处理以后存起来.这个点的信息只有x和y（之前自定义的对象）
    for (var ii = 0; ii < numLines; ii++) {
        vertices.push(0, 0, Z_DIMENSION, 0, 0, Z_DIMENSION);
        var randomPos = target[drawType][parseInt(target[drawType].length * Math.random())];
        randomTargetXArr.push(randomPos.x);
        randomTargetYArr.push(randomPos.y);
    }


    g_Vertices = new Float32Array(vertices);
    g_RandomTargetXArr = new Float32Array(randomTargetXArr);
    g_RandomTargetYArr = new Float32Array(randomTargetYArr);
}

/**
 * switch: set vertices
 */
function resetVertices(index) {

    try {
        var randomTargetXArr = [];
        var randomTargetYArr = [];

        // -------------------------------
        const newNumLines = getNumLines(index);
        const image = target[index];
        const imageLength = image.length;

        const gvLength = g_Vertices.length;
        const newVLength = newNumLines * 6;


        for (var ii = 0; ii < newNumLines; ii++) {
            var randomPos = image[parseInt(imageLength * Math.random())];
            randomTargetXArr.push(randomPos.x);
            randomTargetYArr.push(randomPos.y);
        }

        // vertices = new Float32Array(vertices);
        g_RandomTargetXArr = new Float32Array(randomTargetXArr);
        g_RandomTargetYArr = new Float32Array(randomTargetYArr);


        // 增加或者删除顶点数量。超过了就删掉多余的

        if (newVLength < gvLength) {
            g_Vertices = g_Vertices.subarray(0, newVLength);
            numLines = newNumLines;
        }

        if (newVLength > gvLength) {
            var tempVArray = new Float32Array(newNumLines * 6);

            for (let index = 0; index < gvLength; index++) {
                tempVArray[index] = g_Vertices[index];
            }
            for (let index = 0; index < newVLength; index += 6) {

                const targetIndex = index / 6;
                tempVArray[index] = g_RandomTargetXArr[targetIndex];
                tempVArray[index + 1] = g_RandomTargetYArr[targetIndex];
                tempVArray[index + 2] = Z_DIMENSION;
                tempVArray[index + 3] = g_RandomTargetXArr[targetIndex];
                tempVArray[index + 4] = g_RandomTargetYArr[targetIndex];
                tempVArray[index + 5] = Z_DIMENSION;
            }
            g_Vertices = tempVArray;
        }

        numLines = newNumLines;
    } catch (error) {
        console.error(error);
    }
}


// -------------------------------

const imgSwitch = function (picNumber, newCoefficient, w, h) {

    coefficient = newCoefficient ? newCoefficient : .2;
    if (loaded) {

        drawType = picNumber;

        // resize will cover the changing effect
        resize(w, h);
        resetVertices(drawType);
    }
}

export default NoiseEffect;
