var newy = dpsx.slice()
var tmp = newy.slice()
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





function rep(dat){
    for(let i of cols_wo_y){
        var tmp = dat[i].slice()
        tmp.splice(0,1)
        dat[i].push(...tmp)
    }
    dat[col.y] = newy;
    return dat 
}


//times
function mir(dat){
    for(let i of cols_wo_y){
        var new_dat = dat[i].slice(0,61)
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





for (var i = data.length - 1; i >= 0; i--) {
    data[i] = rep(data[i])
}