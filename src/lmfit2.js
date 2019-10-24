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
    return new ML.Matrix(ans);
  }

  function matrixFunction(data, evaluatedData) {
    const m = data.x.length;
  
    var ans = new Array(m);
  
    for (var point = 0; point < m; point++) {
      ans[point] = [data.y[point] - evaluatedData[point]];
    }
  
    return new ML.Matrix(ans);
  }

  function step(
    data,
    params,
    damping,
    gradientDifference,
    parameterizedFunction
  ) {
    var value = damping * gradientDifference * gradientDifference;
    var identity = ML.Matrix.eye(params.length, params.length, value);
  
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
    var inverseMatrix = ML.inverse(
      identity.add(gradientFunc.mmul(gradientFunc.transpose()))
    );
  
    params = new ML.Matrix([params]);
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
  