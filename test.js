var newy = dpsx.slice()
var tmp  = newy.slice()
var last = newy[newy.length-1]
tmp.splice(0,1)

for(let time=0; time<times; time++){
    for(let i=0; i<tmp.length;i++){
        newy.push(tmp[i]+last*(1+time));
    }
}

var ind = newy.indexOf(180)


var cols_wo_y = []
var tmp = data[0].length

for (let i=0; i<tmp; i++){
    if(i!=col.y) cols_wo_y.push(i)
}






//times

function mir(dat){
    ind = dat[col.y].indexOf(last)
    var newy = dat[col.y].slice(0,ind)
    var tmp  = newy.slice()
    tmp.splice(0,1)

    for(let time=0; time<times; time++){
        for(let i=0; i<tmp.length;i++){
            newy.push(tmp[i]+last*(1+time));
        }
    }

    for(let i of cols_wo_y){
        var new_dat = dat[i].slice(0,ind)
        var tmp = new_dat.slice()
        tmp.splice(0,1)
        for(let time=0; time<times; time++){
            tmp.reverse()
            new_dat.push(...tmp)
        }
        dat[i] = new_dat;
    }
    dat[col.y] = newy;
    return dat 
}




var cols_wo_y = []
var tmp = data[0].length

for (let i=0; i<tmp; i++){
    if(i!=col.y) cols_wo_y.push(i)
}
//input last and mirror and times




   //









function rep(dat){

            var ind = dat[col.y].indexOf(last)+1
            var newy = dat[col.y].slice(0,ind)
            var tmp  = newy.slice()
            tmp.splice(0,1)

            for(let time=0; time<times-1; time++){
                for(let i=0; i<tmp.length;i++){
                    newy.push(tmp[i]+last*(1+time));
                }
            }

            for(let i of cols_wo_y){
                var new_dat = dat[i].slice(0,ind)
                var tmp = new_dat.slice()
                tmp.splice(0,1)
                for(let time=0; time<times-1; time++){
                    if(mirror) tmp.reverse()
                    new_dat.push(...tmp)
                }
                dat[i] = new_dat;
            }
            dat[col.y] = newy;
            return dat 
}