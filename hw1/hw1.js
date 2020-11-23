// AUTHOR: Jesse McCarville-Schueths
// DATE: Sept 12 2020
// FILE: hw1.js
// DESCRIPTION: javascript file to creates random triangle with 
//    random colors in webGL2




var VSHADER_SOURCE = `#version 300 es
  in vec4 a_Position; // per-vertex position
  in vec4 a_Color; // per-vertex color
  out vec4 v_Color; // varying variable
   
  void main() {
    gl_Position = a_Position;
    v_Color = a_Color; // pass color to fragment shader
}`;

var FSHADER_SOURCE = `#version 300 es
  precision mediump float;
  in vec4 v_Color; // per-fragment color (linearly interpolated)
  out vec4 cg_FragColor;

  void main() {
    cg_FragColor = v_Color;
}`;

//***************************************
//********** GLOBAL VARIABLES ***********
//***************************************

let t_points = []; //array of triangle vertices
let t_colors = []; //array of points colors



//***************************************
//************** MAIN *******************
//***************************************
function main() {
  
  var canvas = document.getElementById('canvas'); // Retrieve <canvas> element
  var gl = canvas.getContext("webgl2"); // Get the rendering context for WebGL
  
  initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE); // Initialize shaders
  initVertexBuffers(gl);
  
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Specify the color for clearing <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT); // Clear <canvas>
  gl.drawArrays(gl.TRIANGLES, 0, 3); // Draw triangle
}


//***************************************
//******** INIT VERTEX BUFFERS **********
//***************************************
function initVertexBuffers(gl) { 

//creates rand colors and pushes them to t_colors
for(let i = 0; i < 3; i++){
    let r = Math.random();
    let g = Math.random();
    let b = Math.random();
    t_colors.push([r,g,b]);
}

//creates rand x,y cords and pushes them to t_points
for(let i = 0; i < 3; i++){
    let x = Math.random() * 2 - 1;
    let y = Math.random() * 2 - 1;
    t_points.push([x,y]);
}

 
  var verticesColors = new Float32Array([
    // Vertex coordinates and colors
    t_points[0][0],  t_points[0][1],  t_colors[0][0],  t_colors[0][1],  t_colors[0][2], // x, y, r, g, b
    t_points[1][0],  t_points[1][1],  t_colors[1][0],  t_colors[1][1],  t_colors[1][2], // x, y, r, g, b 
    t_points[2][0],  t_points[2][1],  t_colors[2][0],  t_colors[2][1],  t_colors[2][2], // x, y, r, g, b
  ]);

  
  var vertexColorBuffer = gl.createBuffer(); // Create VBO
  
  // Bind VBO to ARRAY_BUFFER
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = Float32Array.BYTES_PER_ELEMENT;
  
  // Get storage location of a_Position, assign VBO and enable
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of VBO

  // Get storage location of a_Color, assign VBO and enable
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
  gl.enableVertexAttribArray(a_Color);  // Enable assignment of VBO

  gl.bindBuffer(gl.ARRAY_BUFFER, null); // Unbind VBO
}
