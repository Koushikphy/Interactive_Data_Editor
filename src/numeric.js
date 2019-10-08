//mostly numeric functions.
// functions here are all pure, i.e. 
//doesnot depend on the outside parameter, and solely depend on the given argument



function parseData(strDps) {
    var newdat = [],
        blocks = [];
    strDps = strDps.trim().split(/\r?\n\s*\r?\n/);
    try{
        for (let i of strDps) {
            blocks = i.trim().split("\n");
            for (var j = 0; j < blocks.length; j++) {
                blocks[j] = blocks[j].trim().split(/[\s\t]+/);
                blocks[j] = blocks[j].map(x => {
                    y = parseFloat(x)
                    if(isNaN(y)){
                        throw "badData"
                    } else{
                        return y
                    }
                });
            };
            newdat.push(transpose(blocks));
        }
    } catch(err){
        if(err='badData'){
            alert("Bad data found !!!\nCheck the file before openning.")
        }
        return
    }
    return newdat;
};


function expRotate(tmpData, i, j) {
    //Bunch up on i-th column and sort along j-th column
    tmpData = tmpData.map(x => transpose(x));
    if (!issame) {
        issame = true;
        var b = tmpData[0].length;
        for (let a of tmpData) {
            if (a.length != b) {
                issame = false;
                break;
            };
        };
    }
    if (issame) {
        tmpData = transpose(tmpData);
        tmpData = tmpData.map(x => transpose(x));
        return tmpData;
    };

    tmpData = [].concat(...tmpData).filter(x => x !== undefined);

    var tmp = new Set();
    for (let a of tmpData) {
        tmp.add(a[i]);
    };
    tmp = [...tmp].sort((a, b) => a - b);
    var newdat = [];
    for (let x of tmp) {
        var tmpdat = [];
        for (let line of tmpData) {
            if (x == line[i]) {
                tmpdat.push(line)
            };
        };
        tmpdat = tmpdat.sort((m, n) => m[j] - n[j]);
        newdat.push(transpose(tmpdat));
    };
    return newdat;
};





function matvecmul(a,b){
    // b is a vector
    if (a[0].length != b.length) return
    var n = a.length, m = b.length
    res = new Array(n).fill(0)
    for(let k=0; k<m; k++){
        for (let i=0; i<n; i++){
                res[i] += a[i][k]* b[k]
        }
    }
    return res
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




function pythag(a,b)
//prevents overflow but may suffer from underflow
{
   a = Math.abs(a)
   b = Math.abs(b)
   if (a > b) return a*Math.sqrt(1.0+(b/a)**2)
   else if (b == 0.0) return a
   return b*Math.sqrt(1.0+(a/b)**2)
}


function svd(A) {
    var temp;
    //Compute the thin SVD from G. H. Golub and C. Reinsch, Numer. Math. 14, 403-420 (1970)
    var prec= Math.pow(2,-52) // assumes double prec
    var tolerance= 1.e-64/prec;
    var itmax= 50;
    var c=0, i=0, j=0, k=0, l=0;
    
    var u= JSON.parse(JSON.stringify(A));
    var m= u.length, n= u[0].length;
    
    if (m < n) throw "Need more rows than columns"
    
    var e = new Array(n);
    var q = new Array(n);
    for (i=0; i<n; i++) e[i] = q[i] = 0.0;
    var v = new Array(n).fill(0).map(_=> new Array(n).fill(0))


    //Householder's reduction to bidiagonal form
    var f= 0.0, g= 0.0, h= 0.0, x= 0.0, y= 0.0, z= 0.0, s= 0.0;
    
    for (i=0; i < n; i++)
    {
        e[i]= g;
        s= 0.0;
        l= i+1;
        for (j=i; j < m; j++) s += (u[j][i]*u[j][i]);
        if (s <= tolerance) g= 0.0;
        else {
            f= u[i][i];
            g= Math.sqrt(s);
            if (f >= 0.0) g = -g;
            h= f*g-s
            u[i][i]=f-g;
            for (j=l; j < n; j++) {
                s= 0.0
                for (k=i; k < m; k++) s += u[k][i]*u[k][j]
                f= s/h
                for (k=i; k < m; k++) u[k][j]+=f*u[k][i]
            }
        }
        q[i]= g
        s= 0.0
        for (j=l; j < n; j++)  s= s + u[i][j]*u[i][j]
        if (s <= tolerance)  g= 0.0
        else{
            f= u[i][i+1]
            g= Math.sqrt(s)
            if (f >= 0.0) g= -g
            h= f*g - s
            u[i][i+1] = f-g;
            for (j=l; j < n; j++) e[j]= u[i][j]/h
            for (j=l; j < m; j++){
                s=0.0
                for (k=l; k < n; k++) s += (u[j][k]*u[i][k])
                for (k=l; k < n; k++) u[j][k]+=s*e[k]
            }
        }
        y= Math.abs(q[i])+Math.abs(e[i])
        if (y>x) x=y
    }
    
    // accumulation of right hand gtransformations
    for (i=n-1; i != -1; i+= -1) {
        if (g != 0.0) {
             h= g*u[i][i+1]
            for (j=l; j < n; j++) v[j][i]=u[i][j]/h
            for (j=l; j < n; j++) {
                s=0.0
                for (k=l; k < n; k++) s += u[i][k]*v[k][j]
                for (k=l; k < n; k++) v[k][j]+=(s*v[k][i])
            }
        }
        for (j=l; j < n; j++) {
            v[i][j] = 0; v[j][i] = 0;
        }
        v[i][i] = 1;
        g= e[i]
        l= i
    }
    
    // accumulation of left hand transformations
    for (i=n-1; i != -1; i+= -1) {
        l= i+1
        g= q[i]
        for (j=l; j < n; j++) u[i][j] = 0;
        if (g != 0.0) {
            h= u[i][i]*g
            for (j=l; j < n; j++) {
                s=0.0
                for (k=l; k < m; k++) s += u[k][i]*u[k][j];
                f= s/h
                for (k=i; k < m; k++) u[k][j]+=f*u[k][i];
            }
            for (j=i; j < m; j++) u[j][i] = u[j][i]/g;
        }
        else
            for (j=i; j < m; j++) u[j][i] = 0;
        u[i][i] += 1;
    }
    
    // diagonalization of the bidiagonal form
    prec= prec*x
    for (k=n-1; k != -1; k+= -1) {
        for (var iteration=0; iteration < itmax; iteration++) {// test f splitting
            var test_convergence = false
            for (l=k; l != -1; l+= -1) {
                if (Math.abs(e[l]) <= prec) {
                    test_convergence= true
                    break 
                }
                if (Math.abs(q[l-1]) <= prec) break 
            }
            if (!test_convergence) {// cancellation of e[l] if l>0
                c= 0.0
                s= 1.0
                var l1= l-1
                for (i =l; i<k+1; i++) {
                    f= s*e[i]
                    e[i]= c*e[i]
                    if (Math.abs(f) <= prec) break
                    g= q[i]
                    h= pythag(f,g)
                    q[i]= h
                    c= g/h
                    s= -f/h
                    for (j=0; j < m; j++) {
                        y= u[j][l1]
                        z= u[j][i]
                        u[j][l1] =  y*c+(z*s)
                        u[j][i] = -y*s+(z*c)
                    } 
                }
            }
            // test f convergence
            z= q[k]
            if (l== k) {//convergence
                if (z<0.0) {//q[k] is made non-negative
                    q[k]= -z
                    for (j=0; j < n; j++)
                        v[j][k] = -v[j][k]
                }
                break  //break out of iteration loop and move on to next k value
            }
            if (iteration >= itmax-1) throw 'Error: no convergence.'
            // shift from bottom 2x2 minor
            x= q[l]
            y= q[k-1]
            g= e[k-1]
            h= e[k]
            f= ((y-z)*(y+z)+(g-h)*(g+h))/(2.0*h*y)
            g= pythag(f,1.0)
            if (f < 0.0) f= ((x-z)*(x+z)+h*(y/(f-g)-h))/x
            else f= ((x-z)*(x+z)+h*(y/(f+g)-h))/x
            // next QR transformation
            c= 1.0
            s= 1.0
            for (i=l+1; i< k+1; i++) {
                g= e[i]
                y= q[i]
                h= s*g
                g= c*g
                z= pythag(f,h)
                e[i-1]= z
                c= f/z
                s= h/z
                f= x*c+g*s
                g= -x*s+g*c
                h= y*s
                y= y*c
                for (j=0; j < n; j++) {
                    x= v[j][i-1]
                    z= v[j][i]
                    v[j][i-1] = x*c+z*s
                    v[j][i] = -x*s+z*c
                }
                z= pythag(f,h)
                q[i-1]= z
                c= f/z
                s= h/z
                f= c*g+s*y
                x= -s*g+c*y
                for (j=0; j < m; j++) {
                    y= u[j][i-1]
                    z= u[j][i]
                    u[j][i-1] = y*c+z*s
                    u[j][i] = -y*s+z*c
                }
            }
            e[l]= 0.0
            e[k]= f
            q[k]= x
        } 
    }
    for (i=0;i<q.length; i++) if (q[i] < prec) q[i] = 0
    //sort eigenvalues	
    for (i=0; i< n; i++) {
        for (j=i-1; j >= 0; j--){
            if (q[j] < q[i]) {
                c = q[j]
                q[j] = q[i]
                q[i] = c
                for(k=0;k<u.length;k++) { temp = u[k][i]; u[k][i] = u[k][j]; u[k][j] = temp; }
                for(k=0;k<v.length;k++) { temp = v[k][i]; v[k][i] = v[k][j]; v[k][j] = temp; }
            //	   u.swapCols(i,j)
            //	   v.swapCols(i,j)
                i = j
            }
        }
    }
    return {U:u,S:q,V:v}
};


function transpose(m) {
    return m[0].map((_, i) => m.map(x => x[i]));
};




class Regression{
    constructor(xs,ys,n, mp=false){
        //fit x,y with a polynomial of order n 
        var x=xs.slice(0), y = ys.slice(0);
        this.n=n;
        // normalize the x array
        var ss =0;
        for(let xx of x) ss+=xx;
        this.me = ss/x.length;
        for(let i=0; i<x.length;i++) x[i] -= this.me

        if ((n==2) & !mp ) { //explicit formula for quadratic
            this.cf = [0,0,0];
            // for quadratic case by default just use explicit formula 
            // as its more timeconsuming to go through the full svd calculation
            var a=x.length,b=0,c=0,d=0,e=0,m=0,o=0,p=0,det;
            for (let i=0; i<a; i++){
                b += x[i]
                c += x[i]**2
                d += x[i]**3
                e += x[i]**4
                m += y[i]
                o += y[i]*x[i]
                p += y[i]*x[i]**2
            }
            det = this.determinant(a,b,c,b,c,d,c,d,e)
            this.cf[0] = this.determinant(m,b,c,o,c,d,p,d,e)/det
            this.cf[1] = this.determinant(a,m,c,b,o,d,c,p,e)/det
            this.cf[2] = this.determinant(a,b,m,b,c,o,c,d,p)/det
        } else if((n==1) & !mp ){ //explicit formula for linear
            this.cf = [0,0];
            var a=x.length,b=0,c=0,d=0,m=0,o=0;
            for (let i=0; i<a; i++){
                b += x[i]
                c += x[i]**2
                m += y[i]
                o += y[i]*x[i]
            }
            this.cf[1] = (n*o - (b*m))/(n*c - b*b)
            this.cf[0] = (m - this.cf[1]*b)/a
        } else{ //morre-penrose for a general nth order
            var aa = [], USV, u, v,s,sf,pse;// generate the augmented matrix
            for(let xx of x){
                let c = new Array(n+1)
                for(let i=0; i<=n;i++){
                    c[i] = xx**i
                }
                aa.push(c)
            }
            USV = svd(aa)
            u = USV.U
            v = USV.V
            s = USV.S
            sf = new Array(s.length).fill(0).map(_=> new Array(s.length).fill(0))
            // inverse of eigenvalus, check if non zero
            for(let i=0; i<s.length;i++) if (s[i]>Number.EPSILON) sf[i][i] = 1/s[i]
            pse = matmul(matmul(v, sf), transpose(u))
            this.cf = matvecmul(pse, y)
        }
    }
    determinant(a,b,c,d,e,f,g,h,i){
        return a*(e*i - f*h) - b*(d*i - g*f) + c*(d*h - e*g)
    }

    val(x) {
        var s=0
        x-=this.me
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












