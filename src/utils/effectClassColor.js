import 'babel-polyfill'; // deal with Promise in IE

window.cancelRequestAnimFrame = (function () {
    return window.cancelAnimationFrame ||
        window.webkitCancelRequestAnimationFrame ||
        window.mozCancelRequestAnimationFrame ||
        window.oCancelRequestAnimationFrame ||
        window.msCancelRequestAnimationFrame ||
        clearTimeout
})();

const SHOW_UP_SPEED = .3;
const Z_DIMENSION = 1.3;
const DEFAULT_POINT_NUMBER = 50000;

/**
 * ===================== export functions =========================
 */
class NoiseEffect {
    constructor(images = []) {

        // initialize images
        this.canvas = null;                     // canvas object to draw
        this.gl = null;                         // webGL object
        this.drawType = 0;                   // current index of picture
        this.g_density = 0.5;        // density of effect
        this.numLines = 0;                   // control how many vertices will print
        this.frameId = 0;                    // used to control animation
        this.imageURLArr = images;           // store array of images information
        this.target = [];                // store array of images object
        this.g_RandomTargetXArr = [];    // store default x and y of vertices (the animation will show it with random deviation)
        this.g_RandomTargetYArr = [];
        this.effectOnLoad = () => null;              // callback
        this.loaded = false;             // a bool to check if initialization done. 
        this.numLinesFade = 0;
        this.g_Vertices = [];
        this.g_colors = [];
        this.coefficient = .1;
        this.targetCoefficient = .01;
        this.blur = 1;
    }

    load(i_canvasId, defaultPicture = 0, color = "#FFFFFF", isShow = true, density = 0.5, blur = 1, i_onLoad) {

        try {
            // 初始化变量
            this.effectOnLoad = i_onLoad;
            this.g_density = density;
            this.drawType = (defaultPicture && defaultPicture >= 0) ? defaultPicture : 0;
            this.canvas = document.getElementById(i_canvasId);
            this.gl = this.canvas.getContext("experimental-webgl");
            this.numLines = this.getNumLines(0);
            this.blur = blur;

            // initVaribles();
            var tempCanvas = document.createElement("canvas");
            var ctx = tempCanvas.getContext('2d', { alpha: false });

            const promisesArray = this.imageURLArr.map((item, number) => {
                
                return new Promise((resolve, reject) => {
                    var image = new Image();
                    image.crossOrigin = "Anonymous";
                    image.src = item.src;
                    image.onload = this.onLoadImageHandler.bind(this, image, tempCanvas, ctx, number, resolve);
                    image.onerror = reject
                })
            })

            Promise.all(promisesArray).then(() => {
                this.loadScene(color, isShow);
            }).catch((error) => {
                console.log("error on loadScene", this.imageURLArr, error);
            })
        } catch (error) {
            console.log("error on load", error);
        }
    }
    unload() {
        if (this.loaded) {
            window.cancelRequestAnimFrame(this.frameId);
            this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
            this.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        }
    }
    resize(w, h) {

        if (this.loaded) {

            if (!(w || h)) {
                w = this.imageURLArr[this.drawType].width;;
                h = this.imageURLArr[this.drawType].height;;
            }

            if (w !== this.canvas.width || h !== this.canvas.height) {

                this.canvas.width = w;
                this.canvas.height = h;
                this.setSize(w, h);
                this.gl.viewport(0, 0, w, h);
            }
        }
    }

    setBlur(blur) {
        this.blur = blur;
    }

    vibe(coefficient) {
        this.coefficient = coefficient;
    }

    /**
     * =====================  =========================
     */


    /**
     * process all images passed in
     * @param {} image 
     * @param {*} tempCanvas 
     * @param {*} ctx 
     * @param {*} number 
     */
    onLoadImageHandler(image, tempCanvas, ctx, number, resolve) {
        var target = this.target;
        var imageURLArr = this.imageURLArr;

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

                    // console.log(data[index]);
                    var pos = { 
                        x: currentX / tempCanvas.width - .5, 
                        y: -currentY / tempCanvas.height + 0.5,
                        r: Math.round(data[index] / 255 * 10) / 10,
                        g: Math.round(data[index + 1] / 255 * 10) / 10,
                        b: Math.round(data[index + 2] / 255 * 10) / 10,
                        a: data[index+3],
                    }
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
    getNumLines() {

        var canvas = this.canvas;
        var g_density = this.g_density;

        var returnValue = DEFAULT_POINT_NUMBER;
        var rate = (canvas.width * canvas.height) / (256 * 256);
        // 根据指定的宽高决定精度
        returnValue = parseInt(returnValue * rate * g_density);
        return 100000 > returnValue ? returnValue : 100000;
    }

    /**
     * convert hex to vec4
     * @param {*} hex 
     */
    hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: Math.round(parseInt(result[1], 16) / 255 * 10) / 10,
            g: Math.round(parseInt(result[2], 16) / 255 * 10) / 10,
            b: Math.round(parseInt(result[3], 16) / 255 * 10) / 10
        } : null;
    }

    /**
     * Initialises WebGL and creates the 3D scene.
     */
    loadScene(color, isShow) {

        var gl = this.gl;
        var canvas = this.canvas;
        var imageURLArr = this.imageURLArr;
        var drawType = this.drawType;

        if (!gl) {
            alert("There's no WebGL context available.");
            return;
        }
        canvas.width = imageURLArr[drawType].width;
        canvas.height = imageURLArr[drawType].height;

        gl.viewport(0, 0, canvas.width, canvas.height);

        const shaderfs = `
        varying lowp vec4 vColor;
    
        void main(void) {
        gl_FragColor = vColor;
        }
    `;
        const shadervs = `
        attribute vec3 vertexPosition;
        attribute vec4 vertexColor;

        uniform mat4 modelViewMatrix;
        uniform mat4 perspectiveMatrix;
        varying lowp vec4 vColor;

        void main(void) {
        gl_Position = perspectiveMatrix * modelViewMatrix * vec4(  vertexPosition, 1.0);
        vColor = vertexColor;
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

        // initialize a shader program: tell WebGl how to draw
        gl.program = gl.createProgram();
        // link program with shader
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

        // 建立缓冲区
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());

        // 绑定到shader
        var vertexPosition = gl.getAttribLocation(gl.program, "vertexPosition");
        var vertexColor = gl.getAttribLocation(gl.program, "vertexColor");

        // 第五个属性0，紧密打包。无间隙。
        // 顶点的位置信息
        gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 28, 0);

        // 顶点的颜色信息
        gl.vertexAttribPointer(vertexColor, 4, gl.FLOAT, false, 28, 12);

        gl.enableVertexAttribArray(vertexPosition);
        gl.enableVertexAttribArray( vertexColor);

        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);


        // ------------------

        this.setSize(canvas.width, canvas.height);
        window.cancelRequestAnimFrame(this.frameId);

        this.loaded = true;

        if (typeof (this.effectOnLoad) === "function") {
            this.effectOnLoad();
        }

        // if display, fadeIn
        if (isShow) this.fadeIn();
    }




    setSize(w, h) {
        var gl = this.gl;

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
        var perspectiveMatrix = [
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

        var uModelViewMatrix = gl.getUniformLocation(gl.program, "modelViewMatrix");
        var uPerspectiveMatrix = gl.getUniformLocation(gl.program, "perspectiveMatrix");


        gl.uniformMatrix4fv(uModelViewMatrix, false, new Float32Array(perspectiveMatrix));
        gl.uniformMatrix4fv(uPerspectiveMatrix, false, new Float32Array(modelViewMatrix));
    }

    // js trigger animate
    animate() {
        this.frameId = requestAnimationFrame(this.animate.bind(this));
        this.drawScene();
    }

    /**
     * fade out
     */
    fadeOut() {
        if (this.loaded) {
            // coefficient = .01;
            // reset to itself, otherwise will just fadeout without nice effect
            this.resetVertices(this.drawType);
            window.cancelRequestAnimFrame(this.frameId);
            this.numLinesFade = this.numLines;
            this.fadeOut_play();
        }
    }
    fadeOut_play() {
        this.frameId = requestAnimationFrame(this.fadeOut_play.bind(this));
        this.drawScene_fadeOut_play();

    }
    /**
     * fade in
     */
    fadeIn() {
        if (this.loaded) {
            // coefficient = .01;
            // reset to itself, otherwise will just fadein without nice effect
            this.resetVertices(this.drawType);
            window.cancelRequestAnimFrame(this.frameId);
            this.numLinesFade = 0;
            this.fadeIn_play();
        }
    }
    fadeIn_play() {
        this.frameId = requestAnimationFrame(this.fadeIn_play.bind(this));
        this.drawScene_fadeIn_play();
    }

    drawScene_fadeOut_play() {

        var gl = this.gl;

        if (this.numLinesFade > 0) {
            this.numLinesFade -= SHOW_UP_SPEED * 1000;
            const printLines = this.numLinesFade > 0 ? this.numLinesFade : 0;

            this.draw();
            gl.lineWidth(1);
            gl.bufferData(gl.ARRAY_BUFFER, this.g_Vertices, gl.DYNAMIC_DRAW);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawArrays(gl.LINES, 0, printLines);
            gl.flush();
        }
    }
    drawScene_fadeIn_play() {
        var numLines = this.numLines;
        var gl = this.gl;

        if (this.numLinesFade < numLines) {
            this.numLinesFade += SHOW_UP_SPEED * 1000;
            const printLines = this.numLinesFade < numLines ? this.numLinesFade : numLines;

            this.draw();
            gl.lineWidth(1);
            gl.bufferData(gl.ARRAY_BUFFER, this.g_Vertices, gl.DYNAMIC_DRAW);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawArrays(gl.LINES, 0, printLines);
            gl.flush();
        }
        else {
            window.cancelRequestAnimFrame(this.frameId);
            this.frameId = requestAnimationFrame(this.animate.bind(this));
        }
    }
    drawScene() {

        var numLines = this.numLines;
        var gl = this.gl;

        this.draw();
        gl.lineWidth(1);

        // 这个动作不是绘图，而是重新设定buffer。而绘画是从buffer里面取数据。所以在当前步骤，程序并不关心buffer里面是什么。
        gl.bufferData(gl.ARRAY_BUFFER, this.g_Vertices, gl.DYNAMIC_DRAW);
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



    draw() {

        // cn += .1;
        var g_Vertices = this.g_Vertices;
        var g_RandomTargetXArr = this.g_RandomTargetXArr;
        var g_RandomTargetYArr = this.g_RandomTargetYArr;

        var bp, px, py, num, targetPosX, targetPosY;

        // coefficient 跳荡，无限趋近于targetCoefficient. 幅度取决于：初始值多大
        this.coefficient += (this.targetCoefficient - this.coefficient) * .1;

        const blur = this.coefficient * this.blur;
        const movingSpeed = this.coefficient * 2;

        const t_numOfLines = this.numLines * 2;

        // draw pixels
        for (let i = 0; i < t_numOfLines; i += 2) {

            num = parseInt(i / 2);

            bp = i * 7;

            g_Vertices[bp] = g_Vertices[bp + 7];
            g_Vertices[bp + 1] = g_Vertices[bp + 8];

            //var pos = target[parseInt(target.length * Math.random())];

            // 备份用，在此基础上随机。不记录随机状态，所以每一帧都会重新随机
            targetPosX = g_RandomTargetXArr[num];
            targetPosY = g_RandomTargetYArr[num];

            px = g_Vertices[bp + 7];
            // 前者是速度，后者是散布
            // cof等于tcof之前，都加速，等于的时候就不加速。所以加速度取决于这两个差
            px += (targetPosX - px) * movingSpeed + (Math.random() - .5) * blur;
            g_Vertices[bp + 7] = px;

            py = g_Vertices[bp + 8];
            py += (targetPosY - py) * movingSpeed + (Math.random() - .5) * blur;
            g_Vertices[bp + 8] = py;
        }
    }

    /**
     * switch: set vertices
     */
    resetVertices(index) {

        try {
            var randomTargetXArr = [];
            var randomTargetYArr = [];
            var randomTargetIndex = [];

            // -------------------------------
            const newNumLines = this.getNumLines(index);
            const image = this.target[index];
            const imageLength = image.length;

            const gvLength = this.g_Vertices.length;
            const newVLength = newNumLines * 14;


            for (var ii = 0; ii < newNumLines; ii++) {
                var randomPos = image[parseInt(imageLength * Math.random())];
                randomTargetXArr.push(randomPos.x);
                randomTargetYArr.push(randomPos.y);
                randomTargetIndex.push(randomPos);
            }

            this.g_RandomTargetXArr = new Float32Array(randomTargetXArr);
            this.g_RandomTargetYArr = new Float32Array(randomTargetYArr);

            // 增加或者删除顶点数量。超过了就删掉多余的

            if (newVLength < gvLength) {
                this.g_Vertices = this.g_Vertices.subarray(0, newVLength);
                this.numLines = newNumLines;
            }

            if (newVLength > gvLength) {
                var tempVArray = new Float32Array(newNumLines * 14);

                for (let index = 0; index < gvLength; index++) {
                    tempVArray[index] = this.g_Vertices[index];
                }

                // console.log();
                for (let index = 0; index < newVLength; index += 14) {

                    const targetIndex = index / 14;
                    tempVArray[index] = this.g_RandomTargetXArr[targetIndex];
                    tempVArray[index + 1] = this.g_RandomTargetYArr[targetIndex];
                    tempVArray[index + 2] = Z_DIMENSION;


                    tempVArray[index + 7] = this.g_RandomTargetXArr[targetIndex];
                    tempVArray[index + 8] = this.g_RandomTargetYArr[targetIndex];
                    tempVArray[index + 9] = Z_DIMENSION;

                }
                this.g_Vertices = tempVArray;
            }

            for (let index = 0; index < newVLength; index += 14) {
                const targetIndex = index / 14;
                this.g_Vertices[index + 3] = randomTargetIndex[targetIndex].r;
                this.g_Vertices[index + 4] = randomTargetIndex[targetIndex].g;
                this.g_Vertices[index + 5] = randomTargetIndex[targetIndex].b;
                this.g_Vertices[index + 6] = randomTargetIndex[targetIndex].a;

                this.g_Vertices[index + 10] = randomTargetIndex[targetIndex].r;
                this.g_Vertices[index + 11] = randomTargetIndex[targetIndex].g;
                this.g_Vertices[index + 12] = randomTargetIndex[targetIndex].b;
                this.g_Vertices[index + 13] = randomTargetIndex[targetIndex].a/2;
            }

            this.numLines = newNumLines;
        } catch (error) {
            console.error("error on resetVertices: ", error);
        }
    }

    // -------------------------------
    imgSwitch(picNumber, newCoefficient, w, h) {
        try {

            if(this.imageURLArr[picNumber] === undefined) {
                throw `Image index ${ picNumber} is out of range.`;
            }

            this.coefficient = newCoefficient ? newCoefficient : .2;
            if (this.loaded) {
    
                this.drawType = picNumber;
    
                // resize will cover the changing effect
                this.resize(w, h);
                this.resetVertices(picNumber);
            }           
        } catch (error) {
            console.log("error on image switch: ", error);
        }
    }
}

export default NoiseEffect;
