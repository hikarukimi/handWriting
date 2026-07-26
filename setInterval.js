function setIntervalBySetTimeout(fn,delay){
    let timer=null
    function loop(){
        timer=setTimeout(()=>{
            fn()
            clearTimeout(timer)
            loop()
        },delay)
    }
    loop()
    return ()=>{
        clearTimeout(timer)
    }
}