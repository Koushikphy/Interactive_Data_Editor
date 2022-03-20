function test(y){
    return new Promise((resolve, reject) => {
        var x = 89+y
        resolve(x);
        reject('hi')
    });
}


test(55).then((x)=>{
    console.log(x)
})