//setup
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
gradient.addColorStop(0, 'pink');
gradient.addColorStop(0.5, 'red');
gradient.addColorStop(1, 'magenta');
ctx.fillStyle = gradient;

class Particle {
    constructor(effect, index){
        this.effect = effect;
        this.index = index;
        this.radius = Math.floor(Math.random() * 8 + 8);
        this.minRadius = this.radius;
        this.maxRadius =  this.radius * 5;
        if (this.index % 10 === 0) {
            this.radius = 30;
        }
        this.x = this.radius + Math.random() * ( this.effect.width - this.radius * 2);
        this.y = this.radius + Math.random() * ( this.effect.height - this.radius * 2);
        this.vx = Math.random() * 0.2 - 0.1;
        this.vy = Math.random() * 0.2 - 0.1;
       
        this.friction = 0.8;
    }
    draw(context){
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fill();
        context.stroke();

        context.fillStyle = 'white';
        context.beginPath();
        context.arc(this.x - this.radius * 0.2, this.y - this.radius * 0.3, this.radius * 0.6, 0, Math.PI * 2);
        context.fill();
    }
    update(){
        if (this.effect.mouse.pressed) {
            const dx = this.x - this.effect.mouse.x;
            const dy = this.y - this.effect.mouse.y;
            const dist = Math.hypot(dx, dy);
            const force = this.effect.mouse.radius / dist;
            if (dist < this.effect.mouse.radius && this.radius < this.maxRadius){
                this.radius += 2;
            }
        }

        if (this.radius > this.minRadius) this.radius -= 0.1;
        
        this.x += this.vx;
        this.y += this.vy

        if (this.x < this.radius){
            this.x = this.radius;
            this.vx *= -1;
        } else if (this.x > this.effect.width - this.radius) {
            this.x = this.effect.width - this.radius;;
            this.vx *= -1;
        }
        if (this.y < this.radius){
            this.y = this.radius;
            this.vy *= -1;
        } else if (this.y > this.effect.height - this.radius) {
            this.y = this.effect.height - this.radius;;
            this.vy *= -1;
        }


    }
    reset(){
        this.x = this.radius + Math.random() * ( this.effect.width - this.radius * 2);
        this.y = this.radius + Math.random() * ( this.effect.height - this.radius * 2);
    }
}

class Effect {
    constructor(canvas, context){
        this.canvas = canvas;
        this.context = context;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.particles = [];
        this.numberOfParticles = 400;
        this.createParticles();

        this.mouse = {
            x: this.width * 0.5,
            y: this.height * 0.5,
            pressed: false,
            radius: 60,
        }
        window.addEventListener('resize', e => {
            this.resize(e.target.window.innerWidth, 
                e.target.window.innerHeight
            )
        })

        window.addEventListener('mousemove', e => {
            if (this.mouse.pressed){
                this.mouse.x = e.x;
                this.mouse.y = e.y
            }
        })
        window.addEventListener('mousedown', e => {
            this.mouse.pressed = true;
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        })
        window.addEventListener('mouseup', e => {
            this.mouse.pressed = false
        })
    }
    createParticles(){
        for (let i = 0; i < this.numberOfParticles; i++){
            this.particles.push(new Particle(this, i))
        }
    }
    handleParticles(context){
        // this.connectParticles(context)
        this.particles.forEach(particle=>{
            particle.draw(context);
            particle.update();
        })
    }
    connectParticles(context){
        const maxDistance = 150;
        for (let a = 0; a < this.particles.length; a++){
            for (let b = a; b < this.particles.length; b++){
                const dist = distance(this.particles[a], this.particles[b]);

                if (dist < maxDistance){
                    context.save();
                    const opacity = 1 - dist/maxDistance
                    context.globalAlpha = opacity;
                    context.beginPath();
                    context.moveTo(this.particles[a].x, this.particles[a].y)
                    context.lineTo(this.particles[b].x, this.particles[b].y)
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
        
        gradient = this.context.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, 'pink');
        gradient.addColorStop(0.5, 'red');
        gradient.addColorStop(1, 'magenta');
        this.context.fillStyle = gradient;

        this.particles.forEach(particle => particle.reset());
    }
}

const effect = new Effect(canvas, ctx);

function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    effect.handleParticles(ctx);
    requestAnimationFrame(animate);
}

animate();

function distance(obj1, obj2){
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;

    return Math.hypot(dx, dy);
}