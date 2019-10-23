

const { inverse, Matrix } =  require('ml-matrix')

function errorCalculation( data, parameters, parameterizedFunction) {
    var error = 0;
    const func = parameterizedFunction(parameters);
  
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


  function step( data, params, damping, gradientDifference, parameterizedFunction ) {
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


  var data // x, y dict
  parameterizedFunction // function that takes the parameters and returns the function that fits the functions
  options =  {
    maxIterations = 100,
    gradientDifference = 10e-2,
    damping = 0,
    errorTolerance = 10e-3,
    minValues,
    maxValues,
    initialValues
  }
  



var parameters =initialValues || new Array(parameterizedFunction.length).fill(1);
let parLen = parameters.length;
maxValues = maxValues || new Array(parLen).fill(Number.MAX_SAFE_INTEGER);
minValues = minValues || new Array(parLen).fill(Number.MIN_SAFE_INTEGER);


var error = errorCalculation(data, parameters, parameterizedFunction);

var converged = error <= errorTolerance;



for (let iteration = 0; iteration < maxIterations && !converged; iteration++ ) {
    parameters = step( data, parameters, damping, gradientDifference, parameterizedFunction);

    for (let k = 0; k < parLen; k++) {
      parameters[k] = Math.min( Math.max(minValues[k], parameters[k]),  maxValues[k]);
    }

    error = errorCalculation(data, parameters, parameterizedFunction);
    if (isNaN(error)) break;
    converged = error <= errorTolerance;
  }

//   return {parameterValues: parameters, parameterError: error,iterations: iteration};
