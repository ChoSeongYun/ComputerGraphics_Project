var gl;
var points = [];
var normals = [];
var texCoords = [];

var program0, program1, program2;     // [program1] Phong shading, [program2] Texture Mapping
var modelViewMatrixLoc0, modelViewMatrixLoc1, modelViewMatrixLoc2;

var eye = vec3(3.5, 0.5, 3.5);
var at = vec3(0, 0, 0);
const up = vec3(0, 1, 0);
var cameraVec = vec3(0, -0.3, -0.7071); // 1.0/Math.sqrt(2.0)

var theta = 0;
var trballMatrix = mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
var vertCubeStart, vertCubeEnd, vertPotalStart, vertPotalEnd, vertGroundStart, vertGroundEnd;

var setMaze = [
            //exit  
            [1,0,1,1,1,1,1,1,1,1],
            [1,0,0,1,0,0,0,0,0,1],
            [1,1,0,1,0,1,1,1,0,1],
            [1,1,0,1,0,1,0,1,0,1],
            [1,0,0,0,0,1,0,1,0,1],
            [1,0,1,1,1,1,0,1,0,1],
            [1,0,0,0,0,1,0,0,0,1],
            [1,1,1,1,0,1,0,1,0,1],
            [1,0,0,0,0,0,0,0,0,1],  
            [1,1,1,1,1,1,1,1,0,1]
                          //start
];

var cnt = 0;
var posObjects = [];

var endObject = [
    vec2(-3.5,-4.5)
];




window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if( !gl ) {
        alert("WebGL isn't available!");
    }

    generateTexCube();
    generateTexGround(5);
    generateTexPotal();

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Enable hidden-surface removal
    gl.enable(gl.DEPTH_TEST);

    // Load shaders and initialize attribute buffers
    program0 = initShaders(gl, "colorVS", "colorFS");
    gl.useProgram(program0);

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program0, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var viewMatrix = lookAt(eye, at, up);
    modelViewMatrixLoc0 = gl.getUniformLocation(program0, "modelViewMatrix");
    gl.uniformMatrix4fv(modelViewMatrixLoc0, false, flatten(viewMatrix));

    // 3D perspective viewing
    var aspect = canvas.width / canvas.height;
    projectionMatrix = perspective(90, aspect, 0.1, 1000); 
    var projectionMatrixLoc = gl.getUniformLocation(program0, "projectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    ///////////////////////////////////////////////////////////////////////////
    // program1 : Phong Shading

    program1 = initShaders(gl, "phongVS", "phongFS");
    gl.useProgram(program1);

    // Load the data into the GPU
    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer
    vPosition = gl.getAttribLocation(program1, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Create a buffer object, initialize it, and associate it with 
    // the associated attribute variable in our vertex shader
    var nBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program1, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    modelViewMatrixLoc1 = gl.getUniformLocation(program1, "modelViewMatrix");
    gl.uniformMatrix4fv(modelViewMatrixLoc1, false, flatten(viewMatrix));
    
    // 3D perspective viewing
    projectionMatrixLoc = gl.getUniformLocation(program1, "projectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    setLighting(program1);

    ///////////////////////////////////////////////////////////////////////////
    // program2 : Texture Mapping

    program2 = initShaders(gl, "texMapVS", "texMapFS");
    gl.useProgram(program2);

    // Load the data into the GPU
    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer
    vPosition = gl.getAttribLocation(program2, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Create a buffer object, initialize it, and associate it with 
    // the associated attribute variable in our vertex shader
    nBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    vNormal = gl.getAttribLocation(program2, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    var tBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation(program2, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    modelViewMatrixLoc2 = gl.getUniformLocation(program2, "modelViewMatrix");
    gl.uniformMatrix4fv(modelViewMatrixLoc2, false, flatten(viewMatrix));

    // 3D perspective viewing
    projectionMatrixLoc = gl.getUniformLocation(program2, "projectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    setLighting(program2);
    setTexture();

    // Event listeners for buttons
    var sinTheta = Math.sin(0.3);
    var cosTheta = Math.cos(0.3);

    // 키보드 입력구현
    document.onkeydown = function()
    {
        if(event.keyCode == 37){ //좌
            var newVecX = cosTheta*cameraVec[0] + sinTheta*cameraVec[2];
            var newVecZ = -sinTheta*cameraVec[0] + cosTheta*cameraVec[2];
            cameraVec[0] = newVecX;
            cameraVec[2] = newVecZ;
        }
        else if(event.keyCode == 38){//상
            var newPosX = eye[0] + 0.5 * cameraVec[0];
            var newPosZ = eye[2] + 0.5 * cameraVec[2];
            if (newPosX > -5 && newPosX < 5 && newPosZ > -5 && newPosZ < 5 && !detectCollision(newPosX,newPosZ) ) {
                eye[0] = newPosX;
                eye[2] = newPosZ;
            }
        }
        else if(event.keyCode == 39){//우
            var newVecX = cosTheta*cameraVec[0] - sinTheta*cameraVec[2];
            var newVecZ = sinTheta*cameraVec[0] + cosTheta*cameraVec[2];
            cameraVec[0] = newVecX;
            cameraVec[2] = newVecZ;

        }
        else if(event.keyCode == 40){//하
            var newPosX = eye[0] - 0.5 * cameraVec[0];
            var newPosZ = eye[2] - 0.5 * cameraVec[2];
            if (newPosX > -5 && newPosX < 5 && newPosZ > -5 && newPosZ < 5 && !detectCollision(newPosX,newPosZ) ) {
                eye[0] = newPosX;
                eye[2] = newPosZ;
            }

        }

        if(detectEndportal(newPosX,newPosZ))
        {
            alert("CLEAR!");        // CLEAR 메세지 출력
            location.reload(true);  // 새로고침
        }
         
    };
    render();
};

function setLighting(program) {
    var lightPos = [0.3, 0.3, 0.3, 0.0];
    var lightAmbient = [0.3, 0.3, 0.3, 1.0];
    var lightDiffuse = [0.8, 0.8, 0.8, 0.8];
    var lightSpecular = [1.0, 1.0, 1.0, 1.0];

    var matAmbient = [0.5, 0.5, 0.5, 1.0];
    var matDiffuse = [1.0, 1.0, 1.0, 1.0];
    var matSpecular = [0.5, 0.5, 0.5, 0.0];
    
    var ambientProduct = mult(lightAmbient, matAmbient);
    var diffuseProduct = mult(lightDiffuse, matDiffuse);
    var specularProduct = mult(lightSpecular, matSpecular);

    var lightPosLoc = gl.getUniformLocation(program, "lightPos");
    gl.uniform4fv(lightPosLoc, lightPos);
    var ambientProductLoc = gl.getUniformLocation(program, "ambientProduct")
    gl.uniform4fv(ambientProductLoc, ambientProduct);
    var diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
    gl.uniform4fv(diffuseProductLoc, diffuseProduct);
    var specularProductLoc = gl.getUniformLocation(program, "specularProduct");
    gl.uniform4fv(specularProductLoc, specularProduct);
    
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), 100.0);
}

function setTexture() {
    var image = new Image();
    image.src = "images/round.bmp";
    
    var texture0 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture0);
    
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    
    var image1 = new Image();
    image1.src = "images/crate.bmp"
    
    var texture1 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture1);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image1);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    var image2 = new Image();
    image2.src = "images/logo.bmp"
    
    var texture2 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture2);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image2);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    var image3 = new Image();
    image3.src = "images/endPortal.bmp"
    
    var texture3 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, texture3);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image3);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta += 2.0;

    at[0] = eye[0] + cameraVec[0];
    at[1] = eye[1] + cameraVec[1];
    at[2] = eye[2] + cameraVec[2];
    var viewMatrix = lookAt(eye, at, up);


    var diffuseProductLoc = gl.getUniformLocation(program1, "diffusProduct");
    
    // draw the ground

    gl.useProgram(program2);
    gl.uniform1i(gl.getUniformLocation(program2, "texture"), 0);

    modelViewMatrix = mult(viewMatrix, trballMatrix);

    gl.uniformMatrix4fv(modelViewMatrixLoc2, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.TRIANGLES, vertGroundStart, vertGroundEnd);

    for(var i =0; i < setMaze.length; i++)
    {
        for(var j = 0; j < setMaze[i].length; j++)
        {
            if(setMaze[i][j] != 0)
            {
                for (var y=0; y<5; y+=1) {
                    // draw a wall
                    var posX = j - 4.5;
                    var posZ = i - 4.5;
                    gl.useProgram(program2);
                    gl.uniform1i(gl.getUniformLocation(program2, "texture"), 1);
                    
                    var modelMatrix = translate(posX, y-0.5, posZ);
                    modelMatrix = mult(trballMatrix, modelMatrix);
                    modelViewMatrix = mult(viewMatrix, modelMatrix);
                    gl.uniformMatrix4fv(modelViewMatrixLoc2, false, flatten(modelViewMatrix));
                    gl.drawArrays(gl.TRIANGLES, vertCubeStart, vertCubeEnd);
                    posObjects[cnt] = vec2(posX,posZ);
                    cnt++
                }
            }
        }
    }



    

// 시작 포탈
    gl.useProgram(program2);
    gl.uniform1i(gl.getUniformLocation(program2, "texture"), 2);
                    
    var modelMatrix = translate(3.5, 0, 4.5);
    modelMatrix = mult(trballMatrix, modelMatrix);
    modelViewMatrix = mult(viewMatrix, modelMatrix);
    //gl.uniformMatrix4fv(modelViewMatrixLoc0, false, flatten(modelViewMatrix));
    //gl.uniformMatrix4fv(modelViewMatrixLoc1, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(modelViewMatrixLoc2, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.TRIANGLES, vertPotalStart, vertPotalEnd);


// 정답 포탈
    // draw a cube
    gl.useProgram(program2);
    gl.uniform1i(gl.getUniformLocation(program2, "texture"), 3);
                    
    var modelMatrix = translate(-3.5, 0, -4.5);
    modelMatrix = mult(trballMatrix, modelMatrix);
    modelViewMatrix = mult(viewMatrix, modelMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc2, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.TRIANGLES, vertPotalStart, vertPotalEnd);

     


    
    requestAnimationFrame(render);
}

function detectCollision(newPosX, newPosZ)
{
    for(var index = 0; index < posObjects.length; index++)
    {
        if( Math.abs(newPosX - posObjects[index][0]) < 0.6 && Math.abs(newPosZ - posObjects[index][1]) < 0.6)
        {
            return true;
        }
    }
    return false;
}

function detectEndportal(newPosX, newPosZ)
{
    for(var index = 0; index < endObject.length; index++)
    {
        if( Math.abs(newPosX - endObject[index][0]) < 0.6 && Math.abs(newPosZ - endObject[index][1]) < 0.6)
        {
            return true;
        }
    }
    return false;
}

function generateTexCube() {
    vertCubeStart = points.length;
    vertCubeEnd = 0;
    texQuad(1, 0, 3, 2);
    texQuad(2, 3, 7, 6);
    texQuad(3, 0, 4, 7);
    texQuad(4, 5, 6, 7);
    texQuad(5, 4, 0, 1);
    texQuad(6, 5, 1, 2);
}

function texQuad(a, b, c, d) {
    const vertexPos = [
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4( 0.5, -0.5, -0.5, 1.0),
        vec4( 0.5,  0.5, -0.5, 1.0),
        vec4(-0.5,  0.5, -0.5, 1.0),
        vec4(-0.5, -0.5,  0.5, 1.0),
        vec4( 0.5, -0.5,  0.5, 1.0),
        vec4( 0.5,  0.5,  0.5, 1.0),
        vec4(-0.5,  0.5,  0.5, 1.0)
    ];

    const vertexNormals = [
        vec4(-0.57735, -0.57735, -0.57735, 0.0),
        vec4( 0.57735, -0.57735, -0.57735, 0.0),
        vec4( 0.57735,  0.57735, -0.57735, 0.0),
        vec4(-0.57735,  0.57735, -0.57735, 0.0),
        vec4(-0.57735, -0.57735,  0.57735, 0.0),
        vec4( 0.57735, -0.57735,  0.57735, 0.0),
        vec4( 0.57735,  0.57735,  0.57735, 0.0),
        vec4(-0.57735,  0.57735,  0.57735, 0.0)
    ];

    const texCoord = [
        vec2(0, 0),
        vec2(0, 1),
        vec2(1, 1),
        vec2(1, 0)
    ];

    // two triangles: (a, b, c) and (a, c, d)
    // solid colored faces
    points.push(vertexPos[a]);
    normals.push(vertexNormals[a]);
    texCoords.push(texCoord[0]);
    vertCubeEnd++;

    points.push(vertexPos[b]);
    normals.push(vertexNormals[b]);
    texCoords.push(texCoord[1]);
    vertCubeEnd++;

    points.push(vertexPos[c]);
    normals.push(vertexNormals[c]);
    texCoords.push(texCoord[2]);
    vertCubeEnd++;

    points.push(vertexPos[a]);
    normals.push(vertexNormals[a]);
    texCoords.push(texCoord[0]);
    vertCubeEnd++;

    points.push(vertexPos[c]);
    normals.push(vertexNormals[c]);
    texCoords.push(texCoord[2]);
    vertCubeEnd++;

    points.push(vertexPos[d]);
    normals.push(vertexNormals[d]);
    texCoords.push(texCoord[3]);
    vertCubeEnd++;
}

// 포탈 생성기!
function generateTexPotal() {
    vertPotalStart = points.length;
    vertPotalEnd = 0;
    texPotal(1, 0, 3, 2);
    texPotal(2, 3, 7, 6);
    texPotal(3, 0, 4, 7);
    texPotal(4, 5, 6, 7);
    texPotal(5, 4, 0, 1);
    texPotal(6, 5, 1, 2);
}

function texPotal(a, b, c, d) {
    const vertexPos = [
        vec4(-0.5, -1.0, -0.5, 1.0),
        vec4( 0.5, -1.0, -0.5, 1.0),
        vec4( 0.5,  1.0, -0.5, 1.0),
        vec4(-0.5,  1.0, -0.5, 1.0),
        vec4(-0.5, -1.0,  0.5, 1.0),
        vec4( 0.5, -1.0,  0.5, 1.0),
        vec4( 0.5,  1.0,  0.5, 1.0),
        vec4(-0.5,  1.0,  0.5, 1.0)
    ];

    const vertexNormals = [
        vec4(-0.57735, -0.57735, -0.57735, 0.0),
        vec4( 0.57735, -0.57735, -0.57735, 0.0),
        vec4( 0.57735,  0.57735, -0.57735, 0.0),
        vec4(-0.57735,  0.57735, -0.57735, 0.0),
        vec4(-0.57735, -0.57735,  0.57735, 0.0),
        vec4( 0.57735, -0.57735,  0.57735, 0.0),
        vec4( 0.57735,  0.57735,  0.57735, 0.0),
        vec4(-0.57735,  0.57735,  0.57735, 0.0)
    ];

    const texCoord = [
        vec2(0, 0),
        vec2(0, 1),
        vec2(1, 1),
        vec2(1, 0)
    ];

    // two triangles: (a, b, c) and (a, c, d)
    // solid colored faces
    points.push(vertexPos[a]);
    normals.push(vertexNormals[a]);
    texCoords.push(texCoord[0]);
    vertPotalEnd++;

    points.push(vertexPos[b]);
    normals.push(vertexNormals[b]);
    texCoords.push(texCoord[1]);
    vertPotalEnd++;

    points.push(vertexPos[c]);
    normals.push(vertexNormals[c]);
    texCoords.push(texCoord[2]);
    vertPotalEnd++;

    points.push(vertexPos[a]);
    normals.push(vertexNormals[a]);
    texCoords.push(texCoord[0]);
    vertPotalEnd++;

    points.push(vertexPos[c]);
    normals.push(vertexNormals[c]);
    texCoords.push(texCoord[2]);
    vertPotalEnd++;

    points.push(vertexPos[d]);
    normals.push(vertexNormals[d]);
    texCoords.push(texCoord[3]);
    vertPotalEnd++;
}

function generateTexGround(scale) {
    vertGroundStart = points.length;
    vertGroundEnd = 0;
    for(var x=-scale; x<scale; x++) {
        for(var z=-scale; z<scale; z++) {
            // two triangles
            points.push(vec4(x, -1.0, z, 1.0));
            normals.push(vec4(0.0, 1.0, 0.0, 0.0));
            texCoords.push(vec2(0, 0));
            vertGroundEnd++;
            
            points.push(vec4(x, -1.0, z+1, 1.0));
            normals.push(vec4(0.0, 1.0, 0.0, 0.0));
            texCoords.push(vec2(0, 1));
            vertGroundEnd++;

            points.push(vec4(x+1, -1.0, z+1, 1.0));
            normals.push(vec4(0.0, 1.0, 0.0, 0.0));
            texCoords.push(vec2(1, 1)); 
            vertGroundEnd++;

            points.push(vec4(x, -1.0, z, 1.0));
            normals.push(vec4(0.0, 1.0, 0.0, 0.0));
            texCoords.push(vec2(0, 0));
            vertGroundEnd++;

            points.push(vec4(x+1, -1.0, z+1, 1.0));
            normals.push(vec4(0.0, 1.0, 0.0, 0.0));
            texCoords.push(vec2(1, 1));
            vertGroundEnd++;

            points.push(vec4(x+1, -1.0, z, 1.0));
            normals.push(vec4(0.0, 1.0, 0.0, 0.0));
            texCoords.push(vec2(1, 0));
            vertGroundEnd++;
        }
    }
}