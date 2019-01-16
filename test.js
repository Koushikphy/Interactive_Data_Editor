    var cols_wo_y = []
    var tmp = data[0].length

    for (let i=0; i<tmp; i++){
        if(i!=col.y) cols_wo_y.push(i)
    }

    var fullArr = []
    for (let i=start; i<=stop; i=i+step){
        fullArr.push(i)
    }


    data = data.map(dat=>{
        if(fullArr.length==dat[0].length) return dat;
        var xs = dat[col.y].slice()
        dat[col.y] = fullArr;
        for(let col of cols_wo_y){
            var newArr = []
            var ys = dat[col].slice()
            ks = getNaturalKs(xs, ys);

            function spline(x) {
                var i = 1;
                while(xs[i]<x) i++;
                var t = (x - xs[i-1]) / (xs[i] - xs[i-1]);
                var a =  ks[i-1]*(xs[i]-xs[i-1]) - (ys[i]-ys[i-1]);
                var b = -ks[i]*(xs[i]-xs[i-1]) + (ys[i]-ys[i-1]);
                var q = (1-t)*ys[i-1] + t*ys[i] + t*(1-t)*(a*(1-t)+b*t);
                return q;
            };

            for(let val of fullArr){
                ind = dat[col].indexOf(val)
                if(ind!=-1){
                    newArr.push(dat[col][ind])
                } else{
                    newArr.push(spline(val))
                }
            dat[col] = newArr;
            }
        }
        return dat;
    })


