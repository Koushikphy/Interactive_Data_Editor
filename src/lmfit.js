function hypotenuse(a, b) {
  var r = 0;
  if (Math.abs(a) > Math.abs(b)) {
    r = b / a;
    return Math.abs(a) * Math.sqrt(1 + r * r);
  }
  if (b !== 0) {
    r = a / b;
    return Math.abs(b) * Math.sqrt(1 + r * r);
  }
  return 0;
}



// inverse of a 
function inverse(A){// solves a system of linear equations using QR decomposition
  var qr = JSON.parse(JSON.stringify(A))
  var m = qr.length
  var n = qr[0].length
  var rdiag = new Array(n);
  var i, j, k, s;
  var X = new Array(m).fill(0).map(_ => new Array(m).fill(0))
  for(let i =0; i<m;i++) X[i][i] = 1.0

  for (k = 0; k < n; k++) {
    var nrm = 0;
    for (i = k; i < m; i++) {
      nrm =hypotenuse(nrm, qr[i][k]);
    }
    if (nrm !== 0) {
      if (qr[k][k] < 0) {
        nrm = -nrm;
      }
      for (i = k; i < m; i++) {
        qr[i][k] /= nrm
      }
      qr[k][k] +=1  
      for (j = k + 1; j < n; j++) {
        s = 0;
        for (i = k; i < m; i++) {
          s += qr[i][k] * qr[i][j]
        }
        s = -s / qr[k][k];
        for (i = k; i < m; i++) {
          qr[i][j] += s * qr[i][k] 
        }
      }
    }
    rdiag[k] = -nrm;
  }

  let count = X[0].length;

  for (k = 0; k < n; k++) {
    for (j = 0; j < count; j++) {
      s = 0;
      for (i = k; i < m; i++) {
        s += qr[i][k] * X[i][j];
      }
      s = -s / qr[k][k];
      for (i = k; i < m; i++) {
          X[i][j] += s*qr[i][k]
      }
    }
  }
  for (k = n - 1; k >= 0; k--) {
    for (j = 0; j < count; j++) {
        X[k][j] /= rdiag[k] 
    }
    for (i = 0; i < k; i++) {
      for (j = 0; j < count; j++) {
          X[i][j] -=X[k][j]*qr[i][k]
      }
    }
  }
  return X
}


function eyemat(m,v){
  var X = new Array(m).fill(0).map(_ => new Array(m).fill(0))
  for(let i =0; i<m;i++) X[i][i] = v
  return X
}


function matmul(a,b){
  // column and row length
  if (a[0].length != b.length) return
  // a is of length nxm,,, b is of mxp so  res is of the length nxp
  var n = a.length, p = b[0].length, m = b.length
  res = new Array(n).fill(0).map(_ => new Array(p).fill(0))
  for(let k=0; k<m; k++){
      for (let i=0; i<n; i++){
          for(let j =0; j<p ; j++){
              res[i][j] += a[i][k]* b[k][j]
          }
      }
  }
  return res
}



function transpose(m) {
  return m[0].map((_, i) => m.map(x => x[i]));
};


function matadd(a,b){
  var m = a.length, n = a[0].length;
  var res = new Array(m).fill(0).map(_ => new Array(n).fill(0))
  for(let i=0;i<m;i++){
    for(let j=0;j<n;j++){
      res[i][j] = a[i][j] + b[i][j]
    }
  }
  return res
}


function matmulscalar(a,b){
  var m = a.length, n = a[0].length;
  var res = new Array(m).fill(0).map(_ => new Array(n).fill(0))
  for(let i=0;i<m;i++){
    for(let j=0;j<n;j++){
      res[i][j] = a[i][j]*b
    }
  }
  return res
}



function errorCalculation( data, parameters, myfunc) {
    var error = 0;
    const func = myfunc(parameters);
    for (var i = 0; i < data.x.length; i++) {
      error += Math.abs(data.y[i] - func(data.x[i]));
    }
    return error;
  }


  function gradientFunction(data, evaluatedData,params, gradientDifference, paramFunction ) {
    const n = params.length;
    const m = data.x.length;

    var ans = new Array(n);
  
    for (var param = 0; param < n; param++) {
      ans[param] = new Array(m);
      var auxParams = params.concat();
      auxParams[param] += gradientDifference;
      var funcParam = paramFunction(auxParams);
      for (var point = 0; point < m; point++) {
        ans[param][point] = evaluatedData[point] - funcParam(data.x[point]);
      }
    }
    return ans;
  }




function matrixFunction(data, evaluatedData) {
    const m = data.x.length;
    var ans = new Array(m);
    for (var point = 0; point < m; point++) ans[point] = [data.y[point] - evaluatedData[point]]
    return ans;
  }


  function step( dat, parameters, damping, gradientDifference, myfunc ) {
    var value = damping * gradientDifference * gradientDifference;
    var identity =eyemat(parameters.length, value)

    var evaluatedData = dat.x.map((e) => myfunc(parameters)(e));

    var gradientFunc = gradientFunction(
      dat,
      evaluatedData,
      parameters,
      gradientDifference,
      myfunc
    );

    var matrixFunc = matrixFunction(dat, evaluatedData);

    var inverseMatrix = inverse(
       matadd(identity, matmul(gradientFunc, transpose(gradientFunc)))
    );

    var minp = transpose(
      matmulscalar(
        matmul(
          matmul(inverseMatrix, gradientFunc),
        matrixFunc), 
      gradientDifference)
    )
    var mnp = parameters.length
    var parms2 =  new Array(mnp)
    for(let i=0; i<mnp; i++){
      parms2[i] = parameters[i]-minp[0][i]
    }
    return parms2
  }

  // function myfunc([q, a, b,c]) {
  //   return (x) => q*x**3 + a*x**2+ b*x + c// Math.sin(b * t);
  // }

  function myfunc([f,a,b,c,d,e]) {
    return (x) => f*(1+a*x+b*x**2 +c*x**3)*Math.exp(-d*x) +e // Math.sin(b * t);
  }


  var dpsx = [-1.03623000,-1.01053000,-0.98483700,-0.95914100,-0.72208400,-0.68331800,-0.64455200,-0.60578600,-0.56702000,-0.38293700,-0.33112700,-0.27931700,-0.22750600,-0.17569600,-0.04471300,0.02010600,0.08492500,0.14974400,0.21456200,0.29235700,0.37014000,0.44792300,0.52570600,0.60348900,0.62804000,0.71873400,0.80942800,0.90012200,0.96210700,0.99081500,1.06565000,1.16919000,1.27273000,1.37628000,1.41065000,1.52697000,1.64329000,1.75961000,1.88252000,2.01153000,2.14055000,2.51884000,3.0     	,4.0     	,5.0     	,6.0     	,7.0     	,8.0     	,9.0     	,10.0     	]
  var dpsy = [2.41115000,2.17944000,1.97250000,1.78737000,0.76178300,0.67076600,0.59290400,0.52627500,0.46925000,0.29020600,0.25843000,0.23218700,0.21037700,0.19205800,0.15658600,0.14297700,0.13094500,0.12005900,0.11002700,0.09888300,0.08871100,0.07935700,0.07078600,0.06295000,0.06060100,0.05265800,0.04457000,0.04390400,0.03127600,0.03274400,0.02770300,0.02547200,0.02337700,0.01636200,0.01447100,0.01297800,0.01025300,0.00847500,0.00657900,0.00515400,0.00320700,0.00000000,0.00000000,0.00000000,0.00000000,0.00000000,0.00000000,0.00000000,0.00000000,0.00000000]
  
  
var dat = {x:dpsx, y:dpsy}
maxIterations = 100
gradientDifference = 10e-2
errorTolerance = 10e-3
damping = 1.5
errorGrad = 10e-9
var parameters =[0,0,0,0,0,0]//initialValues || new Array(myfunc.length).fill(1);
var parLen = parameters.length;
maxValues = new Array(parLen).fill(Number.MAX_SAFE_INTEGER);
minValues = new Array(parLen).fill(Number.MIN_SAFE_INTEGER);
var error = errorCalculation(dat, parameters, myfunc);
var converged = error <= errorTolerance;

var parameters =[0,0,0,0,0,0]
var looper
var olderror = Number.MIN_SAFE_INTEGER
var iteration = 0
function stepAhed(){
  parameters = step( dat, parameters, damping, gradientDifference, myfunc);
  for (let k = 0; k < parLen; k++) {
    parameters[k] = Math.min( Math.max(minValues[k], parameters[k]),  maxValues[k]);
  }
  var tmpfunc = myfunc(parameters), tmpy = [];
  for (var i = 0; i < dat.x.length; i++) {
    tmpy.push(tmpfunc(dat.x[i]))
  }
  // Plotly.restyle(figurecontainer,{x:[dpsx],y:[tmpy]},1)
  var error = 0;
  for (var i = 0; i < dat.x.length; i++) {
    error += Math.abs(dat.y[i] - tmpy[i])
  }
  converged = Math.abs(error- olderror) <= errorGrad;
  if(converged) {console.log('here'); clearInterval(looper)}
  olderror = error
  iteration+=1
  console.log(iteration, error)
}
// looper = setInterval(stepAhed, 1)


for (;!converged;) {
    parameters = step( dat, parameters, damping, gradientDifference, myfunc);
    for (let k = 0; k < parLen; k++) {
      parameters[k] = Math.min( Math.max(minValues[k], parameters[k]),  maxValues[k]);
    }
    error = errorCalculation(dat, parameters, myfunc);
    converged = Math.abs(error- olderror) <= errorGrad;
    olderror = error
    iteration+=1
    // console.log(iteration,error)
  }
  console.log(parameters)
//   var tmpfunc = myfunc(parameters), tmpy = [];
//   for (var i = 0; i < dat.x.length; i++) {
//     tmpy.push(tmpfunc(dat.x[i]))
//   }
//   Plotly.restyle(figurecontainer,{x:[dpsx],y:[tmpy]},1)
// //   return {parameterValues: parameters, parameterError: error,iterations: iteration};
