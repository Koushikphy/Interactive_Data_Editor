
const { Matrix, inverse } = require('ml-matrix');

function gradientFunction(
    data,
    evaluatedData,
    params,
    gradientDifference,
    paramFunction
  ) {
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
    return new Matrix(ans);
  }

  function matrixFunction(data, evaluatedData) {
    const m = data.x.length;
  
    var ans = new Array(m);
  
    for (var point = 0; point < m; point++) {
      ans[point] = [data.y[point] - evaluatedData[point]];
    }
  
    return new Matrix(ans);
  }

  function step(
    data,
    params,
    damping,
    gradientDifference,
    parameterizedFunction
  ) {
    var value = damping * gradientDifference * gradientDifference;
    var identity = Matrix.eye(params.length, params.length, value);
  
    const func = parameterizedFunction(params);
    var evaluatedData = data.x.map((e) => func(e));
  
    var gradientFunc = gradientFunction(
      data,
      evaluatedData,
      params,
      gradientDifference,
      parameterizedFunction
    );
    var matrixFunc = matrixFunction(data, evaluatedData);
    var inverseMatrix = inverse(
      identity.add(gradientFunc.mmul(gradientFunc.transpose()))
    );

    params = new Matrix([params]);
    params = params.sub(
      inverseMatrix
        .mmul(gradientFunc)
        .mmul(matrixFunc)
        .mul(gradientDifference)
        .transpose()
    );
  
    return params.to1DArray();
  }

  function errorCalculation(
    data,
    parameters,
    parameterizedFunction
  ) {
    var error = 0;
    const func = parameterizedFunction(parameters);
  
    for (var i = 0; i < data.x.length; i++) {
      error += Math.abs(data.y[i] - func(data.x[i]));
    }
  
    return error;
  }

  x = [95.00001207	,95.99999531	,96.99997855	,98.00001908	,99.00000232	,99.99998556	,101.00002610,102.00000934,102.99999258,103.99997582,105.00001635,105.99999959,106.99998283,108.00002337,109.00000661,109.99998985,110.99997309,112.00001362,112.99999686,113.99998010,115.00002064,116.00000388,116.99998712,118.00002765,119.00001089,119.99999413,120.99997737,122.00001791,123.00000115,123.99998439,125.00002492,126.00000816,126.99999140,127.99997464,129.00001518,129.99999842,130.99998166,132.00002219,133.00000543,133.99998867,134.99997191,136.00001245,136.99999569,137.99997893,139.00001947,140.00000270,140.99998594,142.00002648,143.00000972,143.99999296,144.99997620,146.00001674,146.99999998,147.99998322,149.00002375,150.00000699,150.99999023,151.99997347,153.00001401,153.99999725,154.99998049,156.00002102,157.00000426,157.99998750,159.00002804,160.00001128,160.99999452,161.99997776,163.00001829,164.00000153,164.99998477,166.00002531,167.00000855,167.99999179,168.99997503,170.00001556,170.99999880,171.99998204,173.00002258,174.00000582,174.99998906,175.99997230,177.00001283,177.99999607,178.99997931,180.00001985,181.00000309,181.99998633,183.00002686,184.00001010,184.99999334,185.99997658,187.00001712,188.00000036,188.99998360,190.00002413,191.00000737,191.99999061,192.99997385,194.00001439,194.99999763,195.99998087,197.00002140,198.00000464,198.99998788,200.00002842,201.00001166,201.99999490,202.99997814,204.00001867,205.00000191,205.99998515,207.00002569,208.00000893,208.99999217,209.99997541,211.00001595,211.99999918,212.99998242,214.00002296]
  y = [-1.51892500,-1.51937200,-1.51982300,-1.52027500,-1.52072700,-1.52117800,	-1.52162800,	-1.52207600,	-1.52252200,	-1.52296600,	-1.52340800,	-1.52384700,	-1.52428400,	-1.52471800,	-1.52514900,	-1.52557700,	-1.52600100,	-1.52642300,	-1.52684100,	-1.52725500,	-1.52766600,	-1.52807300,	-1.52847500,	-1.52887400,	-1.52926800,	-1.52965800,	-1.53004300,	-1.53042300,	-1.53079800,	-1.53116800,	-1.53153300,	-1.53189200,	-1.53224500,	-1.53259300,	-1.53293400,	-1.53326900,	-1.53359800,	-1.53391900,	-1.53423400,	-1.53454200,	-1.53484300,	-1.53513600,	-1.53542100,	-1.53569800,	-1.53596700,	-1.53622700,	-1.53647900,	-1.53672200,	-1.53695600,	-1.53718000,	-1.53739400,	-1.53759900,	-1.53779400,	-1.53797800,	-1.53815200,	-1.53831400,	-1.53846600,	-1.53860700,	-1.53873500,	-1.53885200,	-1.53895700,	-1.53905000,	-1.53913000,	-1.53919800,	-1.53925200,	-1.53929400,	-1.53932100,	-1.53933600,	-1.53933600,	-1.53932300,	-1.53929500,	-1.53925300,	-1.53919600,	-1.53912500,	-1.53903800,	-1.53893700,	-1.53882000,	-1.53868800,	-1.53854100,	-1.53837800,	-1.53819900,	-1.53800400,	-1.53779400,	-1.53756700,	-1.53732400,	-1.53706600,	-1.53679100,	-1.53650000,	-1.53619300,	-1.53586900,	-1.53553000,	-1.53517400,	-1.53480200,	-1.53441500,	-1.53401100,	-1.53359100,	-1.53315600,	-1.53270500,	-1.53223900,	-1.53175800,	-1.53126100,	-1.53074900,	-1.53022300,	-1.52968200,	-1.52912700,	-1.52855800,	-1.52797500,	-1.52737900,	-1.52677000,	-1.52614800,	-1.52551300,	-1.52486700,	-1.52420800,	-1.52353800,	-1.52285800,	-1.52216700,	-1.52146500,	-1.52075400,	-1.52003400,	-1.51930500]
  
parameters = [0,0,0,0]
  const option1 = {
damping: 1.5,
initialValues: parameters,
gradientDifference: 10e-2,
maxIterations: 10000,
errorTolerance: 10e-3
};

var error = errorCalculation(data, parameters, parameterizedFunction);

var converged = error <= errorTolerance;
var parLen = parameters.length;
maxValues =  new Array(parLen).fill(Number.MAX_SAFE_INTEGER);



minValues =  new Array(parLen).fill(Number.MIN_SAFE_INTEGER);



function myfunc([q, a, b,c]) {
  return (x) => q*x**3 + a*x**2+ b*x + c// Math.sin(b * t);
}

// parameters = step(
//     data,
//     parameters,
//     damping,
//     gradientDifference,
//     parameterizedFunction
//   );



//     for (let k = 0; k < parLen; k++) {
//       parameters[k] = Math.min(
//         Math.max(minValues[k], parameters[k]),
//         maxValues[k]
//       );
//     }
//     error = errorCalculation(data, parameters, parameterizedFunction);
//     // if (isNaN(error)) break;
//     converged = error <= errorTolerance;