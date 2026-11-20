/* ST-X: a closed shell with matching front and back curves. */
window.mountStx = canvas => {
  const gl = canvas.getContext('webgl', {alpha: true, antialias: true});
  if (!gl) return null;

  const program = gl.createProgram();
  const shaders = [
    [gl.VERTEX_SHADER, `
      attribute vec3 position;
      attribute vec3 normal;
      uniform vec2 angle;
      uniform vec2 scale;
      uniform float lift;
      varying vec3 surfaceNormal;
      vec3 rotate(vec3 p) {
        float cx = cos(angle.x), sx = sin(angle.x);
        float cy = cos(angle.y), sy = sin(angle.y);
        p = vec3(p.x, cx*p.y - sx*p.z, sx*p.y + cx*p.z);
        return vec3(cy*p.x + sy*p.z, p.y, -sy*p.x + cy*p.z);
      }
      void main() {
        vec3 p = rotate(position);
        gl_Position = vec4(p.x*scale.x, p.y*scale.y + lift, -p.z*.4, 1.);
        surfaceNormal = rotate(normal);
      }`],
    [gl.FRAGMENT_SHADER, `
      precision mediump float;
      uniform vec3 colour;
      varying vec3 surfaceNormal;
      void main() {
        vec3 n = normalize(surfaceNormal);
        vec3 light = normalize(vec3(-.55,.75,1.));
        float diffuse = .5 + .5*dot(n,light);
        float sheen = pow(max(dot(n,normalize(light + vec3(0.,0.,1.))),0.),28.);
        gl_FragColor = vec4(colour*(.63 + .43*diffuse) + sheen*.10,1.);
      }`]
  ];
  for (const [type, source] of shaders) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  gl.enable(gl.DEPTH_TEST);

  // Cubic paths from mascot.eps. The back uses the same outline, translated on the artboard.
  const outline = [
    [[144.327,0.0431673],[173.443,1.81146],[193.491,19.8321],[200.381,47.8508]],
    [[200.381,47.8508],[201.522,51.4824],[205.054,52.6376],[208.507,53.007]],
    [[208.507,53.007],[212.504,53.51],[217.918,54.096],[221.529,54.5224]],
    [[221.529,54.5224],[250.898,58.2698],[280.893,61.0514],[309.764,67.8611]],
    [[309.764,67.8611],[314.18,69.0001],[320.829,71.24],[315.685,76.3845]],
    [[315.685,76.3845],[302.728,88.0682],[289.701,100.12],[277.852,112.999]],
    [[277.852,112.999],[255.774,137.083],[235.594,163.558],[226.072,195.144]],
    [[226.072,195.144],[218.626,221.404],[200.241,202.233],[184.121,197.823]],
    [[184.121,197.823],[162.987,190.944],[139.452,193.044],[119.84,203.3]],
    [[119.84,203.3],[107.401,210.228],[94.9142,219.413],[81.5521,222.337]],
    [[81.5521,222.337],[70.6467,225.153],[58.8224,226.587],[47.8072,224.517]],
    [[47.8072,224.517],[25.9932,221.271],[6.66075,204.275],[1.63419,182.642]],
    [[1.63419,182.642],[-0.0165781,175.692],[-0.103852,168.447],[0.0556516,161.351]],
    [[0.0556516,161.351],[0.829379,127.788],[18.9378,97.434],[36.5549,69.8911]],
    [[36.5549,69.8911],[60.7988,34.072],[98.1427,-1.08746],[144.073,0.0257537]],
    [[144.073,0.0257537],[144.15766666666667,0.03155823333333333],[144.24233333333333,0.037362766666666665],[144.327,0.0431673]]
  ];
  const eyePaths = [
    [
      [[64.4751,154.823],[63.6191,146.442],[66.3582,137.351],[68.9408,129.482]],
      [[68.9408,129.482],[69.606,127.445],[70.3201,125.263],[71.1076,123.047]],
      [[71.1076,123.047],[68.4076,121.239],[66.6713,118.139],[66.8131,114.657]],
      [[66.8131,114.657],[67.0332,109.334],[71.5283,105.196],[76.8499,105.415]],
      [[76.8499,105.415],[78.0287,105.464],[79.1341,105.751],[80.1613,106.18]],
      [[80.1613,106.18],[80.2151,106.12],[80.264,106.049],[80.3227,105.99]],
      [[80.3227,105.99],[87.6449,98.3383],[77.2412,85.3423],[69.8701,93.0441]],
      [[69.8701,93.0441],[55.1817,108.386],[45.9031,136.385],[48.0601,157.521]],
      [[48.0601,157.521],[49.146,168.197],[65.5561,165.439],[64.4751,154.823]]
    ],
    [
      [[133.466,154.919],[132.61,146.539],[135.349,137.447],[137.932,129.577]],
      [[137.932,129.577],[138.597,127.541],[139.311,125.36],[140.098,123.143]],
      [[140.098,123.143],[137.399,121.335],[135.662,118.235],[135.804,114.753]],
      [[135.804,114.753],[136.024,109.43],[140.519,105.292],[145.841,105.511]],
      [[145.841,105.511],[147.02,105.56],[148.125,105.848],[149.152,106.277]],
      [[149.152,106.277],[149.211,106.217],[149.255,106.145],[149.314,106.086]],
      [[149.314,106.086],[156.636,98.4337],[146.232,85.4383],[138.861,93.1401]],
      [[138.861,93.1401],[124.173,108.483],[114.894,136.481],[117.051,157.617]],
      [[117.051,157.617],[118.137,168.293],[134.547,165.535],[133.466,154.919]]
    ]
  ];
  // Match the tangents on either side of each EPS anchor, retaining its position.
  outline.forEach((curve,i) => {
    const next = outline[(i+1)%outline.length];
    const [x,y] = curve[3];
    const incoming = [x-curve[2][0],y-curve[2][1]];
    const outgoing = [next[1][0]-x,next[1][1]-y];
    const a = Math.hypot(...incoming), b = Math.hypot(...outgoing);
    const tx = incoming[0]/a + outgoing[0]/b;
    const ty = incoming[1]/a + outgoing[1]/b;
    const length = Math.hypot(tx,ty);
    curve[2] = [x-a*tx/length,y-a*ty/length];
    next[1] = [x+b*tx/length,y+b*ty/length];
  });
  const segments = outline.length*32;
  const rings = 96;
  const center = [128,153];
  const cubic = (points, t) => points[0].map((_, i) =>
    (1-t)**3*points[0][i] + 3*(1-t)**2*t*points[1][i] +
    3*(1-t)*t*t*points[2][i] + t**3*points[3][i]);
  const point = (x,y,z) => [(x-158.8)/159,(112.75-y)/159,z];
  const boundary = Array.from({length:segments},(_,i) => {
    const step = i*outline.length/segments;
    return cubic(outline[Math.floor(step)],step%1);
  });

  // Solve the height potential of a uniformly loaded membrane pinned to the EPS contour.
  const spacing = 3, left = -9, top = -9, width = 114, height = 82;
  const potential = new Float64Array(width*height);
  const interior = [];
  for (let row=1; row<height-1; row++) {
    const y = top+row*spacing;
    const crossings = boundary.flatMap(([ax,ay],i) => {
      const [bx,by] = boundary[(i+1)%segments];
      return (ay>y) === (by>y) ? [] : [ax+(bx-ax)*(y-ay)/(by-ay)];
    }).sort((a,b) => a-b);
    for (let i=0; i<crossings.length; i+=2) {
      for (let col=Math.floor((crossings[i]-left)/spacing)+1;
        left+col*spacing<crossings[i+1]; col++) interior.push(row*width+col);
    }
  }
  for (let pass=0; pass<450; pass++) {
    for (const i of interior) {
      const average = (potential[i-1]+potential[i+1]+potential[i-width]+potential[i+width]+spacing**2)/4;
      potential[i] += 1.85*(average-potential[i]);
    }
  }
  const peak = Math.max(...potential);

  function weights(t) {
    return [(1-t)**3,(3*t**3-6*t*t+4),(-3*t**3+3*t*t+3*t+1),t**3].map(w => w/6);
  }

  function fieldAt(x,y) {
    const gx = (x-left)/spacing, gy = (y-top)/spacing;
    const col = Math.floor(gx), row = Math.floor(gy);
    const wx = weights(gx-col), wy = weights(gy-row);
    let value = 0;
    for (let j=0; j<4; j++) {
      for (let i=0; i<4; i++) value += wx[i]*wy[j]*potential[(row+j-1)*width+col+i-1];
    }
    return value;
  }

  const rimField = boundary.map(([x,y]) => fieldAt(x,y));
  function inflatedDepth(x,y,r,rim) {
    // Taper the field to the exact vector edge, then round the join between both halves.
    const value = fieldAt(x,y)-rim*r**8;
    return .61*Math.sqrt(Math.max(.008*(1-r*r),value/peak));
  }

  const body = [];
  const faces = [];
  for (let j=0; j<=rings; j++) {
    const latitude = Math.PI*j/rings;
    const r = Math.sin(latitude);
    const face = Math.sign(rings/2-j);
    for (let i=0; i<segments; i++) {
      const [bx,by] = boundary[i];
      const x = center[0]+(bx-center[0])*r;
      const y = center[1]+(by-center[1])*r;
      const z = face ? face*inflatedDepth(x,y,r,rimField[i]) : 0;
      body.push(point(x,y,z));
      if (j === rings) continue;
      const a = j*segments+i;
      const b = j*segments+(i+1)%segments;
      if (j > 0) faces.push(a,b,j === rings-1 ? rings*segments : a+segments);
      if (j < rings-1) faces.push(j === 0 ? 0 : b,b+segments,a+segments);
    }
  }

  function mesh(vertices, indices) {
    const normals = vertices.map(() => [0,0,0]);
    for (let i = 0; i < indices.length; i += 3) {
      const [a,b,c] = indices.slice(i,i+3);
      const u = vertices[b].map((v,k) => v-vertices[a][k]);
      const v = vertices[c].map((v,k) => v-vertices[a][k]);
      const n = [u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
      for (const index of [a,b,c]) n.forEach((value,k) => normals[index][k] += value);
    }
    const data = vertices.flatMap((p,i) => [...p,...normals[i].map(v => v/(Math.hypot(...normals[i]) || 1))]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
    return {vertexBuffer,indexBuffer,count:indices.length};
  }

  function frontDepth(x,y) {
    const dx = x-center[0], dy = y-center[1];
    for (let i = 0; i < segments; i++) {
      const a = boundary[i], b = boundary[(i+1)%segments];
      const ax = a[0]-center[0], ay = a[1]-center[1];
      const bx = b[0]-center[0], by = b[1]-center[1];
      const det = ax*by-ay*bx;
      if (Math.abs(det) < 1e-8) continue;
      const u = (dx*by-dy*bx)/det, v = (ax*dy-ay*dx)/det;
      const r = u+v;
      if (u >= 0 && v >= 0 && r < 1) {
        const rim = r ? (u*rimField[i]+v*rimField[(i+1)%segments])/r : 0;
        return inflatedDepth(x,y,r,rim);
      }
    }
    return 0;
  }

  const cross = (a,b,c) => (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);

  // Triangulate the concave eye paths so their small notches remain visible.
  function triangulate(path) {
    const remaining = path.map((_,i) => i);
    const triangles = [];
    while (remaining.length > 3) {
      const ear = remaining.findIndex((b,i) => {
        const a = remaining.at(i-1);
        const c = remaining[(i+1)%remaining.length];
        if (cross(path[a],path[b],path[c]) <= 0) return false;
        return remaining.every(k => k === a || k === b || k === c ||
          cross(path[a],path[b],path[k]) < 0 ||
          cross(path[b],path[c],path[k]) < 0 ||
          cross(path[c],path[a],path[k]) < 0);
      });
      if (ear < 0) throw new Error('Unable to triangulate the ST-X eye path');
      const a = remaining.at(ear-1);
      const b = remaining[ear];
      const c = remaining[(ear+1)%remaining.length];
      triangles.push(a,c,b);
      remaining.splice(ear,1);
    }
    triangles.push(remaining[0],remaining[2],remaining[1]);
    return triangles;
  }

  function eye(curves) {
    const path = curves.flatMap(curve => Array.from({length:8},(_,i) => cubic(curve,i/8)));
    const area = path.reduce((sum,a,i) => {
      const b = path[(i+1)%path.length];
      return sum + a[0]*b[1] - a[1]*b[0];
    },0);
    if (area < 0) path.reverse();
    const n = path.length;
    const lower = path.map(([x,y]) => point(x,y,frontDepth(x,y)-.008));
    const upper = path.map(([x,y]) => point(x,y,frontDepth(x,y)+.032));
    const indices = triangulate(path).map(i => i+n);
    for (let i=0; i<n; i++) {
      const next = (i+1)%n;
      indices.push(i,i+n,next,next,i+n,next+n);
    }
    return mesh([...lower,...upper],indices);
  }

  const shell = mesh(body,faces);
  const eyes = eyePaths.map(eye);
  const position = gl.getAttribLocation(program,'position');
  const normal = gl.getAttribLocation(program,'normal');
  const uniforms = Object.fromEntries(['angle','scale','lift','colour'].map(key => [key,gl.getUniformLocation(program,key)]));
  const colours = {pink:[.95,.71,.68],yellow:[.95,.90,.69],blue:[.73,.89,.90],milk:[.90,.88,.84]};

  function draw({vertexBuffer,indexBuffer,count},colour) {
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
    gl.enableVertexAttribArray(position);
    gl.enableVertexAttribArray(normal);
    gl.vertexAttribPointer(position,3,gl.FLOAT,false,24,0);
    gl.vertexAttribPointer(normal,3,gl.FLOAT,false,24,12);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
    gl.uniform3fv(uniforms.colour,colour);
    gl.drawElements(gl.TRIANGLES,count,gl.UNSIGNED_SHORT,0);
  }

  return (x,y,lift,key) => {
    const ratio = Math.min(window.devicePixelRatio || 1,2);
    const width = Math.round(canvas.clientWidth*ratio);
    const height = Math.round(canvas.clientHeight*ratio);
    if (!width || !height || gl.isContextLost()) return false;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0,0,width,height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform2f(uniforms.angle,x,y);
    gl.uniform2f(uniforms.scale,.88,.88*width/height);
    gl.uniform1f(uniforms.lift,2*lift/canvas.clientHeight);
    draw(shell,colours[key]);
    eyes.forEach(eyeMesh => draw(eyeMesh,[.15,.13,.12]));
    return true;
  };
};
