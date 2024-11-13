// setup
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

console.log(ctx);
const gradient = ctx.createLinearGradient(0,0,canvas.width, canvas.height);
gradient.addColorStop(0, 'darkblue');
gradient.addColorStop(0.5, 'white');
gradient.addColorStop(1, 'orangered');
ctx.fillStyle = gradient;
ctx.strokeStyle = 'white';

class Particle {
    constructor(effect){
        this.effect = effect;
        this.radius = Math.floor(Math.random() * 7 + 3);
        this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
        this.y = - Math.random() * this.effect.height * 0.5;
        this.vx = Math.random() * 1 - 0.5;
        this.vy = 0;
        this.gravity = this.radius * 0.001;
        this.friction = 0.95;
        this.width = this.radius * 2;
        this.height = this.radius * 2;
        this.color = 'white';
    }

    draw(context){
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fill();
        if (this.effect.debug){
            context.strokeRect(this.x - this.radius, this.y - this.radius, 
                this.width, this.height)
        }
    }
    
    update(){
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        if (this.y > this.effect.height + this.radius + this.effect.maxDistance
            || this.x < -this.radius - this.effect.maxDistance
            || this.x > this.effect.width + this.radius + this.effect.maxDistance
        ){
            this.reset();
        }
        //collision detection
        if (
            this.x - this.radius < this.effect.element.x + this.effect.element.width &&
            this.x - this.radius + this.width > this.effect.element.x &&
            this.y - this.radius < this.effect.element.y + 5 &&
            this.y - this.radius + this.height > this.effect.element.y
          ) {
            // Collision detected!
            this.vy *= -0.5;
            this.y = this.effect.element.y - this.radius;
            this.vx *= 1;
          }
    }

    reset(){
        this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
        this.y = -this.radius - this.effect.maxDistance - Math.random() * this.effect.height * 0.5;
        this.vy = 0;
        this.vx = Math.random() * 1 - 0.5;
    }
}

class Effect {
    constructor(canvas, context){
        this.canvas = canvas;
        this.context = context;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.particles = [];
        this.numberOfParticles = 300;
        this.maxDistance;
        this.createParticles();
        this.debug = true;
        this.element = document.getElementById("caption").getBoundingClientRect();
        console.log(this.element);

        this.mouse = {
            x: 0,
            y: 0,
            pressed: false,
            radius: 200
        }
        window.addEventListener('keydown', e=> {
            if (e.key === 'd'){
                this.debug = !this.debug;
            }
        })
        window.addEventListener('resize', e => {
            this.resize(e.target.window.innerWidth, e.target.window.innerHeight);
        });
        window.addEventListener('mousemove', e => {
            if (this.mouse.pressed){
                this.mouse.x = e.x;
                this.mouse.y = e.y;
            }
        });
        window.addEventListener('mousedown', e => {
            this.mouse.pressed = true;
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
        window.addEventListener('mouseup', e => {
            this.mouse.pressed = false;
        });
    }
    createParticles(){
        for (let i = 0; i < this.numberOfParticles; i++){
            this.particles.push(new Particle(this));
        }
    }
    handleParticles(context){
        this.connectParticles(context);
        this.particles.forEach(particle => {
            particle.draw(context);
            particle.update();
        });
        if (this.debug){
            // context.strokeRect(this.element.x, this.element.y, this.element.width, this.element.height)
        }
    }
    connectParticles(context){
        this.maxDistance = 100;
        for (let a = 0; a < this.particles.length; a++){
            for (let b = a; b < this.particles.length; b++){
                const dx = this.particles[a].x - this.particles[b].x;
                const dy = this.particles[a].y - this.particles[b].y;
                const distance = Math.hypot(dx, dy);
                if (distance < this.maxDistance){
                    context.save();
                    const opacity = 1 - (distance/ this.maxDistance);
                    context.globalAlpha = opacity;
                    context.beginPath();
                    context.moveTo(this.particles[a].x, this.particles[a].y);
                    context.lineTo(this.particles[b].x, this.particles[b].y);
                    context.stroke();
                    context.restore();
                }
            }
        }
    }
    resize(width, height){
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
        this.element = document.getElementById("caption").getBoundingClientRect();
        const gradient = this.context.createLinearGradient(0,0, width, height);
        gradient.addColorStop(0, 'darkblue');
        gradient.addColorStop(0.5, 'white');
        gradient.addColorStop(1, 'orangered');
        this.context.fillStyle = gradient;
        this.context.strokeStyle = 'white';
        this.particles.forEach(particle => {
            particle.reset();
        });
    }
}
const effect = new Effect(canvas, ctx);

function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effect.handleParticles(ctx);
    requestAnimationFrame(animate);
}
animate();