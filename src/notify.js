var TOAST={
    toast:null,
    _id:0,
    time:null,
    init:function(data={}){
        // Create TOAST
        this.toast = document.createElement("div");
        this.toast.id = "__TOAST";

        this.decoration =  "#8393c0";
        this.background =  "rgb(52, 53, 73)";
        this.color =  "white";
        this.time =  4000;

        Object.assign(this.toast.style, {
            position:"absolute",
            top:"0",
            right:"0",
            width:"100%",
            height:"100%",
            zIndex:"99999",
            pointerEvents:"none",
            paddingRight: "3px",
            paddingBottom:"3px",
            paddingTop:"3px",
            borderRadius: "3px",
            padding: "3px",
            overflow:"hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems : 'flex-end'
        })
        var body = document.querySelector("body");
        body.insertBefore(this.toast,body.firstChild);
    },
    close:function(el){   
        el.classList.add("toastOut");
        setTimeout(function(){
            el.remove();
        },250);
    },
    add:function(text,time){
        if(!time) time=this.time;
        var self=this;
        // var width = text.length * 8 +100
        var toast = document.createElement("div");
        Object.assign(toast.style,{
            // width:`${width}`,
            padding:"10px",
            minHeight: "10px",
            backgroundColor:this.background,
            color:"white",
            float : "right",
            borderRadius:"3px",
            boxShadow:"0 1px 19px 0px rgba(0, 0, 0, 0.45)",
            paddingRight:"50px",
            position:"relative",
            marginBottom:"3px",
            display:"flex",
            alignItems:"center",
            color:this.color,
            transition:"all 250ms ease",
            opacity:"0",
            transform:"scale(0.7)",
            fontFamily: "sans-serif"
        })
        toast.innerHTML=`
            <p style="margin:0;">${text}</p>
            <div onclick="TOAST.close(this.parentNode);" style="
                position:absolute;
                right:0;
                top:0;
                width:50px;
                height:100%;
                padding-top:3px;
                padding-bottom:3px;
                pointer-events: all;
                cursor: pointer;
            ">
                <div style="
                    display:flex;
                    justify-content:center;
                    align-items:center;
                    width:100%;
                    height:100%;
                    border-left-style: solid;
                    border-width: 1px;
                    font-family: monospace;
                    font-size: 1em;
                    border-color: ${this.decoration};
                    color: ${this.decoration};
                ">
                    X
                </div>
            </div>
        `;
        this.toast.appendChild(toast);
        setTimeout(function(){
            self.close(toast);
        },time)
        return toast;
    }
}

TOAST.init();

function showStatus(a){
    var t = TOAST.add(a,4321);
    setTimeout(function(){
        t.classList.add("toastIn");
    },50)
    $(t).width(a.length*8+5)
}
