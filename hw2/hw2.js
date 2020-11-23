// AUTHOR: Jesse McCarville-Schueths
// DATE: Sept 26 2020
// FILE: hw2.js
// DESCRIPTION: creates and visualizes random polygons at random positions
//    with random colors that continuously rotate and scale
//

var VSHADER_SOURCE =`#version 300 es
   in vec4 a_Position;
   uniform mat4 u_ModelMatrix;
   void main() {     
     gl_Position = u_ModelMatrix * a_Position;
}`;

var FSHADER_SOURCE =`#version 300 es
   precision mediump float;
   uniform vec4 u_Color;
   out vec4 cg_FragColor;
   void main() {
     cg_FragColor = u_Color;     
}`;


//*******************************************************
function Polygon() {   
  this.vert = 0; // number of vertices for this polygon
  this.color = [0, 0, 0]; // color of this polygon
  this.center = [0, 0]; // center (x, y) of this polygon
  this.offset = 0; // how many vertices before this polygon
  this.s = .5; // scale
  this.sign = 1.0; //keeps track of direction of scale
}


//*******************************************************
let speed = 1; // speed of animation
let polygons = []; // polygons array
var g_last = Date.now();

//*******************************************************
function main() {
   var canvas = document.getElementById('canvas');

  // Get the rendering context for WebGL
  var gl = canvas.getContext('webgl2');
 
  // Initialize shaders
  initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);

  initVertexBuffers(gl);        
  
  let curAngle = 0.0;
  var modelMatrix = new Matrix4();  
  
  // Pass the model matrix to the vertex shader
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');  
  
  // Animate
  (function update() {
    curAngle = updateAngle(curAngle);  // Update rotation angle
    drawpolygons(gl, curAngle, modelMatrix, u_ModelMatrix);   
    requestAnimationFrame(update); // Request that browser call update
  })();    
}


//*******************************************************
function drawpolygons(gl, curAngle, modelMatrix, u_ModelMatrix) {  
  let a_Position = gl.getAttribLocation(gl.program, 'a_Position'); 
  let u_Color = gl.getUniformLocation(gl.program, 'u_Color');  
  const FSIZE = Float32Array.BYTES_PER_ELEMENT; // 4 bytes per float

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);  

  //for (let i = 0; i < polygons.length; i++) {  
  
  for (let i = 0; i < polygons.length; i++) { // draw all polygons    
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 
                            FSIZE*2*polygons[i].offset);
    gl.enableVertexAttribArray(a_Position);

    let cx = polygons[i].center[0]; 
    let cy = polygons[i].center[1];
    

    //modelMatrix.translate(0, .5, 0);
    modelMatrix.setIdentity();  // Set identity matrix
    modelMatrix.translate(cx, cy, 0);
    modelMatrix.scale(polygons[i].s, polygons[i].s, 0); // Move rotation center to polygon
    modelMatrix.rotate(curAngle, 0, 0,1);  // Set rotation matrix
    
    
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    let c = polygons[i].color;
    gl.uniform4f(u_Color, c[0], c[1], c[2], 1.0);
      
    gl.drawArrays(gl.TRIANGLE_FAN, 0, polygons[i].vert); // Draws polygons
  }
}


//*******************************************************
function updateAngle(angle) {
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  let deltaTime = (now - g_last) * 0.001; // how many seconds have elapsed

  g_last = now;
  // Update current rotation angle 
  const ANGLE_STEP = 45;
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  
  //changes scale size
  for (let i = 0; i < polygons.length; i++) {
    polygons[i].s += polygons[i].sign * deltaTime * speed;
    if (Math.abs(polygons[i].s) > 2) { polygons[i].s = polygons[i].sign * 2; polygons[i].sign *= -1; }
  }
  return newAngle %= 360;
}


//*******************************************************
function initVertexBuffers(gl) {
  let g_points = [];
  
  let m = 20; // total number of polygons  

for (let k = 0; k < m; k++) {

    let n = Math.floor(Math.random() * 9) + 3; // number of vertices (3 to 9)
    let angle = 360.0 / n;  
    angle = (Math.PI * angle) / 180.0; // radian
    let radius = 0.07; // radius of polygon 

    let cx = Math.random() * 2 - 1.0; // where the polygon translated x center will be
    let cy = Math.random() * 2 - 1.0; // where the polygon translated y center will be

    g_points.push(0); g_points.push(0); // center

    for (let i = 0; i < n; i++) {    
      g_points.push(Math.cos(angle * i) * radius);  // x
      g_points.push(Math.sin(angle * i) * radius);  // y 
    }

    g_points.push(radius); g_points.push(0); // st_vertex

    polygons.push(new Polygon());     
    polygons[k].vert = n + 2; // add center and last vertex   
    polygons[k].color = [Math.random(), Math.random(), Math.random()];
    polygons[k].center = [cx, cy]; // where the polygon will be translated
    polygons[k].s = Math.random() * 2 - 1;   //random starting scale
    
    if (k > 0) polygons[k].offset = polygons[k-1].offset + polygons[k-1].vert; 
  }

  let vertices = new Float32Array(g_points);

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
 
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
}

