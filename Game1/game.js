let shakeDuration=0;
let shakeIntensity=10;
let highScore=localStorage.getItem("neonDodgeHighScore")||0;
document.getElementById("highScore").innerText=`High Score:${highScore}`;
let isPaused=false;
const infoBtn=document.getElementById("infoBtn");
const instructions=document.getElementById("instructions");
const audioCtx =new(window.AudioContext || window.webkitAudioContext)();
const canvas=document.getElementById("gameCanvas")
const ctx=canvas.getContext("2d");
//Mobile controls
canvas.addEventListener("touchstart",handleTouch);
canvas.addEventListener("touchmove",handleTouch);
function handleTouch(e){
    const touchX=e.touches[0].clientX;
    const canvasRect=canvas.getBoundingClientRect();
    const x=touchX-canvasRect.left;
    if(x<canvas.width/2)
    {
        player.x-=player.speed*2;
    }
    else{
        player.x+=player.speed *2;
    }
    e.preventDefault();
}
function playSound(type){
    const oscillator=audioCtx.createOscillator();
    const gainNode= audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    if(type=="start"){
        oscillator.frequency.value=600;
        gainNode.gain.value=0.2;
    }
    if(type=="hit"){
        oscillator.type="square";
        oscillator.frequency.value=150;
        gainNode.gain.value=0.3;
    }
    oscillator.start();
    oscillator.stop(audioCtx.currentTime+0.15);
}
let isRunning=false;
let score=0;
let animationId=null;
const player={
    x:canvas.width/2-15,
    y:canvas.height-60,
    width:30,
    height:30,
    speed:5
};
let obstacles=[];
let obstacleTimer=0;
let obstacleInterval=100;
const keys={};
window.addEventListener("keydown",(e)=>{
    keys[e.key]=true;
});
window.addEventListener("keyup",(e)=>{
    keys[e.key]=false;
});
window.addEventListener("keydown",(e)=>{
    if(e.key==="p" || e.key==="P")
    {
        if(!isRunning) return;
        isPaused=!isPaused;
    }
});
infoBtn.addEventListener("click",()=>{
    instructions.classList.toggle("hidden");
});
function gameLoop(){
    if(isRunning && !isPaused){
    update();
    }
    draw();
    animationId=requestAnimationFrame(gameLoop);
}
function update(){
    score++;
    document.getElementById("score").innerText=`Score:${score}`;
    if(keys["ArrowLeft"] && player.x>0){
        player.x-=player.speed;
    }
    if(keys["ArrowRight"] && player.x+player.width<canvas.width){
        player.x+=player.speed;
    }
    player.x=Math.max(0,Math.min(player.x,canvas.width-player.width));
    obstacleTimer++;
    if(obstacleTimer>obstacleInterval){
        obstacles.push({
            x:Math.random()*(canvas.width-30),
            y:-30,
            width:30,
            height:30,
            speed:4
        });
        obstacleTimer=0;
    }
    obstacles.forEach(obstacle => {
        obstacle.y+=obstacle.speed;
    });
    obstacles.forEach(obstacle =>{
        if(iscolliding(player,obstacle))
        {
            gameOver();
        }
    });
    if(score%300===0 && obstacleInterval>30){
        obstacleInterval-=5;
    }
}
function iscolliding(a,b){
    return(
        a.x<b.x+b.width &&
        a.x+a.width>b.x &&
        a.y<b.y+b.height &&
        a.y+a.height>b.y
    );
}
function gameOver(){
    playSound("hit");
    shakeDuration=15;
    isRunning=false;
    pauseBtn.innerText="Pause";
    isPaused=false;
    if(score>highScore){
        highScore=score;
        localStorage.setItem("neonDodgeHighScore",highScore);
        document.getElementById("highScore").innerText=`High Score:${highScore}`;
    }
    document.getElementById("startBtn").innerText="Restart Game";
}
function draw(){
    let offsetX=0;
    let offsetY=0;
    if(shakeDuration>0){
        offsetX=(Math.random()-0.5)*shakeIntensity;
        offsetY=(Math.random()-0.5)*shakeIntensity;
        shakeDuration--;
    }
    ctx.save();
    ctx.translate(offsetX,offsetY);
    ctx.fillStyle="rgba(0,0,0,0.25)";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.shadowColor="#00ffff";
    ctx.shadowBlur=15;
    ctx.fillStyle="#00ffff";
    ctx.fillRect(player.x,player.y,player.width,player.height);
    ctx.shadowBlur=0;
    ctx.fillStyle="red";
    obstacles.forEach(obstacle=>{
        ctx.fillRect(obstacle.x,obstacle.y,obstacle.width,obstacle.height);
    });
    ctx.restore();
}
document.getElementById("startBtn").addEventListener("click",()=>{
    resetGame();
});
const pauseBtn=document.getElementById("pauseBtn");
pauseBtn.addEventListener("click",()=>{
    if(!isRunning) return;
    isPaused=!isPaused;
    pauseBtn.innerText=isPaused? "Resume":"Pause";
});
function resetGame(){
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    playSound("start");
    isRunning=true;
    score=0;
    obstacles=[];
    obstacleTimer=0;
    obstacleInterval=100;
    player.x=canvas.width/2-player.width/2;
    gameLoop();
    isPaused=false;
    pauseBtn.innerText="Pause";
}
