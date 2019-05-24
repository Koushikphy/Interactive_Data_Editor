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

function determinant(a,b,c,d,e,f,g,h,i){
    return a*e*i - a*f*h - b*d*i + b*g*f + c*d*h - c*e*g
}

function regression(xs ,ys){
    // fit with a quadratic polynomial
    var a = b = c = d = e = m = n = p = 0
    a = xs.length
    for (let i=0; i<a; i++){
        b += xs[i]
        c += xs[i]**2
        d += xs[i]**3
        e += xs[i]**4
        m += ys[i]
        n += ys[i]*xs[i]
        p += ys[i]*xs[i]**2
    }

    det = determinant(a,b,c,b,c,d,c,d,e)
    c0 = determinant(m,b,c,n,c,d,p,d,e)/det
    c1 = determinant(a,m,c,b,n,d,c,p,e)/det
    c2 = determinant(a,b,m,b,c,n,c,d,p)/det
    return function(x){ return c0 + c1*x + c2*x**2 }
}

xs = [0,1,2,3,4,5,6,7,8,9]
ys = [0,1,4,9,16,25,36,49,64,81]

testSpline = new Spline(xs, ys)
tmp = testSpline.getVal
console.log(testSpline.getVal(1.5))
console.log(xs,ys)

tmp = regression(xs, ys)
console.log(tmp(1.5))