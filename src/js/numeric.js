//mostly numeric functions.
// functions here are all pure, i.e. 
//doesnot depend on the outside parameter, and solely depend on the given argument







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


function solve(A,x){ // solves a system of linear equations using QR decomposition
    var qr = JSON.parse(JSON.stringify(A))
    var X  = JSON.parse(JSON.stringify(x))

    var m = qr.length
    var n = qr[0].length
    var rdiag = new Array(n);
    var i, j, k, s;
  
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

    //solve the equations
    for (k = 0; k < n; k++) {
        s = 0;
        for (i = k; i < m; i++) {
          s += qr[i][k] * X[i];
        }
        s = -s / qr[k][k];
        for (i = k; i < m; i++) {
          X[i] += s * qr[i][k];
        }
    }
    for (k = n - 1; k >= 0; k--) {
      X[k] /= rdiag[k];
      for (i = 0; i < k; i++) {
          X[i] -= X[k] * qr[i][k];
        }
    }
    return X.slice(0,n)
  }


class Regression{
    constructor(xs,ys,n){
        //fit x,y with a polynomial of order n 
        var x=xs.slice(0), y = ys.slice(0);
        this.n=n;
        var aa = [];// generate the augmented matrix
        for(let xx of x){
            let c = new Array(n+1)
            for(let i=0; i<=n;i++){
                c[i] = xx**i
            }
            aa.push(c)
        }
        this.cf =solve(aa,y)
    }
    determinant(a,b,c,d,e,f,g,h,i){
        return a*(e*i - f*h) - b*(d*i - g*f) + c*(d*h - e*g)
    }
    val(x) {
        var s=0
        for(let i=0;i<=this.n;i++){
            s+=this.cf[i]*x**i
        }
        return s
    }
}




// x = [6.230825,6.248279,6.265732]
// y = [0.312949,0.309886,0.306639472]

// tt = new Regression(x,y,2)
// console.log(tt.cf)
// console.log(tt.val(x[0]), tt.val(x[0])-y[0])




class Spline{
    constructor(xs, ys){
        var n=xs.length
        var diff = new Array(n).fill(0) 
        var u = new Array(n).fill(0)
        let sig,p;
        for(let i=1; i<n-1;i++){
            sig=(xs[i]-xs[i-1])/(xs[i+1]-xs[i-1])
            p=sig*diff[i-1]+2.0
            diff[i]=(sig-1.0)/p
            u[i]=(6.0*((ys[i+1]-ys[i])/(xs[i+1]-xs[i])-(ys[i]-ys[i-1])/(xs[i]-xs[i-1]))/(xs[i+1]-xs[i-1])-sig*u[i-1])/p
        }
        for (let i=n-2;i>-1;i=i-1){
            diff[i]=diff[i]*diff[i+1]+u[i]
        }
        this.xs = xs
        this.ys = ys 
        this.diff = diff
    }
    getVal(x){
        let i = 0,h,a,b;
        while(x>this.xs[i]) i++; i--;
        h=this.xs[i+1]-this.xs[i]
        a=(this.xs[i+1]-x)/h
        b=(x-this.xs[i])/h
        return a*this.ys[i]+b*this.ys[i+1]+ ((a**3-a)*this.diff[i]+(b**3-b)*this.diff[i+1])*(h**2)/6.0
    }
}



// functions for lmfit

// returns the inverse of A using QR decomposition
function inverse(A){
    var qr = JSON.parse(JSON.stringify(A))
    var m = qr.length
    var n = qr[0].length
    var rdiag = new Array(n);
    var i, j, k, s;
    var X = new Array(m).fill(0).map(_ => new Array(m).fill(0))
    for(let i =0; i<m;i++) X[i][i] = 1.0

    for (k = 0; k < n; k++) {
        var nrm = 0;
        for (i = k; i < m; i++) nrm =hypotenuse(nrm, qr[i][k])
        if (nrm !== 0) {
            if (qr[k][k] < 0) nrm = -nrm
            for (i = k; i < m; i++) qr[i][k] /= nrm;
            qr[k][k] +=1  
            for (j = k + 1; j < n; j++) {
                s = 0;
                for (i = k; i < m; i++) s += qr[i][k] * qr[i][j];
                s = -s / qr[k][k];
                for (i = k; i < m; i++) qr[i][j] += s * qr[i][k] ;
            }
        }
        rdiag[k] = -nrm;
    }

    let count = X[0].length;

    for (k = 0; k < n; k++) {
        for (j = 0; j < count; j++) {
            s = 0;
            for (i = k; i < m; i++) s += qr[i][k] * X[i][j];
            s = -s / qr[k][k];
            for (i = k; i < m; i++) X[i][j] += s*qr[i][k]
        }
    }
    for (k = n - 1; k >= 0; k--) {
        for (j = 0; j < count; j++)  X[k][j] /= rdiag[k] 
        for (i = 0; i < k; i++) {
            for (j = 0; j < count; j++) X[i][j] -=X[k][j]*qr[i][k]
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


function gradientFunction(xs, evDat, params, gradDiff, paramFunction ) {
    const n = params.length;
    const m = xs.length;
    var ans = new Array(n);

    for (var param = 0; param < n; param++) {
        ans[param] = new Array(m);
        var auxParams = params.concat();
        auxParams[param] += gradDiff;
        var funcParam = paramFunction(auxParams);
        for (var point = 0; point < m; point++) {
            ans[param][point] = evDat[point] - funcParam(xs[point]);
        }
    }
    return ans;
}




function matrixFunction(ys, evDat) {
    const m = ys.length;
    var ans = new Array(m);
    for (var point = 0; point < m; point++) ans[point] = [ys[point] - evDat[point]]
    return ans;
}


function stepAhed( xs, ys, parameters, damping, gradDiff, myfunc ) {
    var value    = damping * gradDiff * gradDiff;
    var identity = eyemat(parameters.length, value);
    var evDat    = xs.map((e) => myfunc(parameters)(e));
    var gradientFunc = gradientFunction( xs, evDat, parameters, gradDiff, myfunc);

    var matrixFunc    = matrixFunction(ys, evDat);
    var inverseMatrix = inverse( matadd(identity, matmul(gradientFunc, transpose(gradientFunc))))

    var minp = transpose(
        matmulscalar(
            matmul(
            matmul(inverseMatrix, gradientFunc),
                matrixFunc), 
        gradDiff)
    )[0]

    var mnp = parameters.length
    var parms2 =  new Array(mnp)
    for(let i=0; i<mnp; i++){
        parms2[i] = parameters[i]-minp[i]
    }
    return parms2
}




module.exports ={
    Regression,
    Spline,
    stepAhed
}