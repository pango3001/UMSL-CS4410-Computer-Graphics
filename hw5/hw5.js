var VSHADER_SOURCE = `#version 300 es
  in vec4 a_Position;   
  uniform mat4 u_MvpMatrix;

  void main() {
    gl_Position = u_MvpMatrix * a_Position;     
  }
`;

var FSHADER_SOURCE =  `#version 300 es
  precision mediump float;

  out vec4 cg_FragColor;
  
  void main() {
    cg_FragColor = vec4(0.7, 0.0, 0.7, 1.0);
  }
`;

function main() {
  var canvas = document.getElementById('canvas');

  var gl = canvas.getContext('webgl2');

  initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);

  // Set the vertex coordinates and color
  var n = initVertexBuffers(gl);
  
  // Set clear color 
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
  // Get the storage location of u_MvpMatrix
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  
  // Set the eye point and the viewing volume
  var mvpMatrix = new Matrix4();
  mvpMatrix.setPerspective(30, 1, 1, 100);
  mvpMatrix.lookAt(4, 5, 10, 0, 0, 0, 0, 1, 0);


  function update() {
    mvpMatrix.rotate(0.1, 0, .5, 0); // 0.5 degree y-roll
    mvpMatrix.rotate(.5, .5, 0, 0); // 1 degree x-roll

    // Pass the model view projection matrix to u_MvpMatrix
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    // Clear color buffer
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawElements(gl.LINE_STRIP, n, gl.UNSIGNED_SHORT, 0); 

    requestAnimationFrame(update);
  }
  update();
 
}

function initVertexBuffers(gl) {
  const RES = 30; // n in n-gon 
  let height = 4; // height of cone
  let radius = 1.5; // radius of base circle

  let vertices = [];
  let indices = [];



  // top circle      
 for (let i = 0; i <= RES; ++i) { 
    let theta = i * ((2*Math.PI) / RES); // horizontal angle [0, 360]
    let cosTheta = Math.cos(theta); // rotating from z to x axis
    let sinTheta = Math.sin(theta); // rotating from z to x axis 

    let x = radius * sinTheta; // sinPhi: radius of circle at that latitude
    let y = height/2; // base circle's y coord
    let z = radius * cosTheta;  // sinPhi: radius of circle at that latitude

    vertices.push(x);
    vertices.push(y);
    vertices.push(z);
 }


// bottom circle       
 for (let i = 0; i <= RES; ++i) { 
    let theta = i * ((2*Math.PI) / RES); // horizontal angle [0, 360]
    let cosTheta = Math.cos(theta); // rotating from z to x axis
    let sinTheta = Math.sin(theta); // rotating from z to x axis 

    x = radius * sinTheta; // sinPhi: radius of circle at that latitude
    y = -height/2; // base circle's y coord
    z = radius * cosTheta;  // sinPhi: radius of circle at that latitude

    vertices.push(x);
    vertices.push(y);
    vertices.push(z);
 }


   // top vertex      
  vertices.push(0); // x
  vertices.push(height/2); // y
  vertices.push(0); // z

  // bottom vertex          
  vertices.push(0); // x
  vertices.push(-height/2); // y
  vertices.push(0); // z


//   // Calculate cyl indices
  for (let i = 0; i < RES ; ++i) {
    // top circle 
    indices.push(i);
    indices.push(i+1);
    indices.push((RES * 2) + 2); // top vertex

  }

for (let i = 0; i < RES ; ++i) {
    // side triangle 
    indices.push(i);
    indices.push(RES+ i  +1);
    indices.push(i +1); // just making them walls lol 
 }

for (let i = 0; i < RES ; ++i) {
//     //bottom triangle 
    indices.push(RES + i +1);
    indices.push(RES + i + 2);
    indices.push(RES + RES + 3); // top vertex
}





  vertexData = new Float32Array(vertices);
  indexData = new Uint16Array(indices); // indices may be more than 256
    
  // Write the vertex coordinates and color to the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
  
  // Assign the buffer object to a_Position and enable the assignment
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  
  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);

  return indices.length;
}
