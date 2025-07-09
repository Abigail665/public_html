console.log("hello world")

let element = document.getElementById("tswcontainer")
let input = document.getElementById("my-input")
let angle = 0;
let shouldrainbow = true;


function onframe(){
    angle += 1
    let string = "hsl(" + angle + "deg, 100%,50%)";
   if (shouldrainbow){
    element.style.backgroundColor = string
   }
    // console.log(string)
    requestAnimationFrame(onframe)

}
onframe()

function start_rainbow(){
    shouldrainbow = true;
}

function onlmbclick(event){
    console.log(input.value)
    shouldrainbow = false;
    element.style.backgroundColor = input.value;
    setTimeout(start_rainbow,1000)
}
