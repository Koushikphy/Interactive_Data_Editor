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

  function myfunc([a,b,c,d,e]) {
    return (x) => (a+b*x**2 +c*x**3)*Math.exp(-d*x) +e // Math.sin(b * t);
  }



  x = [95.00001207	,95.99999531	,96.99997855	,98.00001908	,99.00000232	,99.99998556	,101.00002610,102.00000934,102.99999258,103.99997582,105.00001635,105.99999959,106.99998283,108.00002337,109.00000661,109.99998985,110.99997309,112.00001362,112.99999686,113.99998010,115.00002064,116.00000388,116.99998712,118.00002765,119.00001089,119.99999413,120.99997737,122.00001791,123.00000115,123.99998439,125.00002492,126.00000816,126.99999140,127.99997464,129.00001518,129.99999842,130.99998166,132.00002219,133.00000543,133.99998867,134.99997191,136.00001245,136.99999569,137.99997893,139.00001947,140.00000270,140.99998594,142.00002648,143.00000972,143.99999296,144.99997620,146.00001674,146.99999998,147.99998322,149.00002375,150.00000699,150.99999023,151.99997347,153.00001401,153.99999725,154.99998049,156.00002102,157.00000426,157.99998750,159.00002804,160.00001128,160.99999452,161.99997776,163.00001829,164.00000153,164.99998477,166.00002531,167.00000855,167.99999179,168.99997503,170.00001556,170.99999880,171.99998204,173.00002258,174.00000582,174.99998906,175.99997230,177.00001283,177.99999607,178.99997931,180.00001985,181.00000309,181.99998633,183.00002686,184.00001010,184.99999334,185.99997658,187.00001712,188.00000036,188.99998360,190.00002413,191.00000737,191.99999061,192.99997385,194.00001439,194.99999763,195.99998087,197.00002140,198.00000464,198.99998788,200.00002842,201.00001166,201.99999490,202.99997814,204.00001867,205.00000191,205.99998515,207.00002569,208.00000893,208.99999217,209.99997541,211.00001595,211.99999918,212.99998242,214.00002296]
  y = [-1.51892500,-1.51937200,-1.51982300,-1.52027500,-1.52072700,-1.52117800,	-1.52162800,	-1.52207600,	-1.52252200,	-1.52296600,	-1.52340800,	-1.52384700,	-1.52428400,	-1.52471800,	-1.52514900,	-1.52557700,	-1.52600100,	-1.52642300,	-1.52684100,	-1.52725500,	-1.52766600,	-1.52807300,	-1.52847500,	-1.52887400,	-1.52926800,	-1.52965800,	-1.53004300,	-1.53042300,	-1.53079800,	-1.53116800,	-1.53153300,	-1.53189200,	-1.53224500,	-1.53259300,	-1.53293400,	-1.53326900,	-1.53359800,	-1.53391900,	-1.53423400,	-1.53454200,	-1.53484300,	-1.53513600,	-1.53542100,	-1.53569800,	-1.53596700,	-1.53622700,	-1.53647900,	-1.53672200,	-1.53695600,	-1.53718000,	-1.53739400,	-1.53759900,	-1.53779400,	-1.53797800,	-1.53815200,	-1.53831400,	-1.53846600,	-1.53860700,	-1.53873500,	-1.53885200,	-1.53895700,	-1.53905000,	-1.53913000,	-1.53919800,	-1.53925200,	-1.53929400,	-1.53932100,	-1.53933600,	-1.53933600,	-1.53932300,	-1.53929500,	-1.53925300,	-1.53919600,	-1.53912500,	-1.53903800,	-1.53893700,	-1.53882000,	-1.53868800,	-1.53854100,	-1.53837800,	-1.53819900,	-1.53800400,	-1.53779400,	-1.53756700,	-1.53732400,	-1.53706600,	-1.53679100,	-1.53650000,	-1.53619300,	-1.53586900,	-1.53553000,	-1.53517400,	-1.53480200,	-1.53441500,	-1.53401100,	-1.53359100,	-1.53315600,	-1.53270500,	-1.53223900,	-1.53175800,	-1.53126100,	-1.53074900,	-1.53022300,	-1.52968200,	-1.52912700,	-1.52855800,	-1.52797500,	-1.52737900,	-1.52677000,	-1.52614800,	-1.52551300,	-1.52486700,	-1.52420800,	-1.52353800,	-1.52285800,	-1.52216700,	-1.52146500,	-1.52075400,	-1.52003400,	-1.51930500]
  

var dat = {x:dpsx, y:dpsy}
maxIterations = 100
gradientDifference = 10e-2
errorTolerance = 10e-3
damping = 1.5
errorGrad = 10e-5
var parameters =[0,0,0,0,0]//initialValues || new Array(myfunc.length).fill(1);
var parLen = parameters.length;
maxValues = new Array(parLen).fill(Number.MAX_SAFE_INTEGER);
minValues = new Array(parLen).fill(Number.MIN_SAFE_INTEGER);
var error = errorCalculation(dat, parameters, myfunc);
var converged = error <= errorTolerance;


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
  Plotly.restyle(figurecontainer,{x:[dpsx],y:[tmpy]},1)
  var error = 0;
  for (var i = 0; i < dat.x.length; i++) {
    error += Math.abs(dat.y[i] - tmpy[i])
  }
  converged = Math.abs(error- olderror) <= errorGrad;
  if(converged) clearInterval(looper)
  olderror = error
  iteration+=1
  console.log(iteration)
}




for (let iteration = 0; iteration < maxIterations && !converged; iteration++ ) {
    parameters = step( dat, parameters, damping, gradientDifference, myfunc);

    for (let k = 0; k < parLen; k++) {
      parameters[k] = Math.min( Math.max(minValues[k], parameters[k]),  maxValues[k]);
    }

    error = errorCalculation(dat, parameters, myfunc);
    // if (isNaN(error)) break;
    converged = Math.abs(error- olderror) <= errorGrad;
    olderror = error
    // console.log(iteration)
  }
  var tmpfunc = myfunc(parameters), tmpy = [];
  for (var i = 0; i < dat.x.length; i++) {
    tmpy.push(tmpfunc(dat.x[i]))
  }
  Plotly.restyle(figurecontainer,{x:[dpsx],y:[tmpy]},1)
//   return {parameterValues: parameters, parameterError: error,iterations: iteration};
