const scoreElements = document.querySelectorAll(".score-num");
const startGame = document.querySelector(".start-game-btn");
const result = document.querySelector(".result");
const soundPlay = document.querySelector(".sound-btn");
const soundmuted = document.querySelector(".muted-btn");

const canvas = document.querySelector(".canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const midX = canvas.width / 2;
const midY = canvas.height / 2;
context = canvas.getContext("2d");

const backgroundSound = createAudio("audio/backgroundSound.mp3");
const shoot = createAudio("audio/shot-and-reload.mp3");
const killingZombie = createAudio("audio/killed_zombie.mp3");
const boomSound = createAudio("audio/boom.mp3");
let muted = false;

class Player {
    constructor() {
        this.width = 100;
        this.height = 100;
        this.position = {
            x: midX - this.width / 2,
            y: midY - this.height / 2,
        }
        this.sprite = {
            stand: {
                spriteNum: 1,
                image: createImage("img/playerSpriteIdle.png"),
                cropWidth: 313,
                height: 207,
            },
            move: {
                spriteNum: 2,
                image: createImage("img/playerSpriteMove.png"),
                cropWidth: 313,
                height: 206,
            },
            reload: {
                spriteNum: 3,
                image: createImage("img/playerSpriteReload.png"),
                cropWidth: 322,
                height: 217,
            },
            shoot: {
                spriteNum: 4,
                image: createImage("img/playerSpriteShoot.png"),
                cropWidth: 312,
                height: 206,
            }
        }
        this.currentSpriteNum = 1;
        this.currentSprite = this.sprite.stand.image;
        this.currentCropWidth = this.sprite.stand.cropWidth;
        this.currentHeight = this.sprite.stand.height;
        this.frame = 0;
        this.rotation = 0;
    }

    draw() {
        context.beginPath();
        context.save();
        /// Gun Position {x : midX+40 , y: midY+24}
        context.translate(midX-15, midY);
        context.rotate(this.rotation);
        context.translate(-midX + 15, -midY);
        context.drawImage(
            this.currentSprite,
            this.currentCropWidth * this.frame,
            0,
            this.currentCropWidth,
            this.currentHeight,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
        // context.strokeStyle = "red";
        // context.arc(midX - 10, midY + 10, 30, 0, 2 * Math.PI);
        // context.stroke();
        context.restore();
        context.closePath();
    }

    update() {
        if (this.frame >= 0 && this.currentSpriteNum === this.sprite.shoot.spriteNum) {
            /// After Shoot => Player Reload
            this.currentSpriteNum = this.sprite.reload.spriteNum;
            this.currentSprite = this.sprite.reload.image;
            this.currentCropWidth = this.sprite.reload.cropWidth;
            this.currentHeight = this.sprite.reload.height;
            this.frame = 0;
        } else if (this.frame >= 19) {
            if (this.currentSpriteNum === this.sprite.reload.spriteNum) {
                /// After Reload => Player Stand
                this.currentSpriteNum = this.sprite.stand.spriteNum;
                this.currentSprite = this.sprite.stand.image;
                this.currentCropWidth = this.sprite.stand.cropWidth;
                this.currentHeight = this.sprite.stand.height;
            }
            this.frame = 0;
        } else {
            this.frame++;
        }
        this.draw();
    }
}

class Projectiles{
    constructor(position , velocity , rotation) {
        this.width = 12;
        this.height = 3;
        this.image = createImage("img/projectile.png");
        this.position = position;
        this.velocity = velocity;
        this.rotation = rotation;
    }
    
    draw() {
        context.beginPath();
        context.save();
        context.translate(this.position.x, this.position.y);
        context.rotate(this.rotation);
        context.translate(-this.position.x, -this.position.y);
        context.drawImage(
            this.image,
            0,
            0,
            30,
            8,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
        context.restore();
        context.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Enemy{
    constructor(position, velocity , rotation) {
        this.image = createImage("img/zombieSpritewalk.png");
        this.width = 85; // 85
        this.height = 50; // 50
        this.position = position
        this.velocity = velocity;
        this.rotation = rotation;
        this.frame = 0;
    }
    
    draw() {
        this.radius = 15;
        this.cirX = this.position.x + (this.width - this.height);
        this.cirY = this.position.y + this.height / 2;

        context.beginPath();
        context.save();
        context.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
        context.rotate(this.rotation);
        context.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2);
        // After I See Image  => i crop image from x = 95 & from y = 100
        context.drawImage(
            this.image,
            (this.frame * 256) + 95,
            100,
            this.width,
            this.height,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
        // context.strokeStyle = "red";
        // context.arc(this.cirX, this.cirY, this.radius, 0, 2 * Math.PI);
        // context.stroke();
        context.restore();
        context.closePath();
    }

    update() {
        if (this.frame >= 31) {
            this.frame = 0;
        } else {
            setTimeout(() => {
                this.frame++;
            }, 100);
        }
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

const friction = 0.98;
class Particle{
    constructor(x , y, radius, color, velocity) {
        this.position = {
            x: x,
            y: y,
        }
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }
    
    draw() {
        context.beginPath();
        context.save();
        context.globalAlpha = this.alpha;
        context.fillStyle = this.color;
        context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        context.fill();
        context.restore();
        context.closePath();
    }

    update() {
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.alpha -= 0.01;
    }
}


// Start Game
let player = new Player();
let projectiles = [];
let enemies = [];
let particles = [];


function createImage(path) {
    const img = new Image();
    img.src = path;
    return img;
}

function createAudio(path) {
    const audio = new Audio();
    audio.src = path;
    return audio;
}

/// Enemy Part
function spawnEnemies() {
    /// Width of Zombie = 85   ,   Height of Zombie = 50
    setInterval(() => {
        const position = { x: 0, y: 0 };
        // Random Position
        if (Math.random() < 0.5) {
            position.x = Math.random() < 0.5 ? 0 - 256 : canvas.width + 85;
            position.y = Math.random() * canvas.height;
        } else {
            position.x = Math.random() * canvas.width;
            position.y = Math.random() < 0.5 ? 0 - 256 : canvas.height + 50;
        }

        // Angle of " Start Point (Random Position) to End Point (Player Position) "
        const angle = Math.atan2((player.position.y) - position.y, (player.position.x) - position.x);
        const velocity = {
            x: Math.cos(angle) * 0.5,
            y: Math.sin(angle) * 0.5,
        }

        enemies.push(
            new Enemy(position, velocity, angle)
        );


    } , 1000);
}

function initGame() {
    player = new Player();
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreElements.forEach(scoreEl => {
        scoreEl.innerHTML = score;
    });
    backgroundSound.play();
    backgroundSound.volume = muted ? 0 : 0.1;
    animate();
    spawnEnemies();
}


// Animation Part
let animateID;
let score = 0;
function animate() {
    animateID = requestAnimationFrame(animate);
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);

    backgroundSound.volume = muted ? 0 : 0.1;
    player.update();

    particles.forEach((particle , index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        } else {
            particle.update();
        }
    });

    projectiles.forEach((projectile , index) => {
        projectile.update();

        // remove from edges from screen
        if (projectile.position.x > canvas.width || 
            projectile.position.y > canvas.height ||
            projectile.position.x + projectile.width < 0 ||
            projectile.position.y + projectile.height < 0 ) {
            setTimeout(() => {
                projectiles.splice(index, 1);
            });
        }
    });

    enemies.forEach(enemy => {
        enemy.update();
    });

    enemies.forEach((enemy, enemyIndex) => {
        // Distance Between Player and Enemy (Game Over)
        const dis = Math.hypot((midX - 10 )- enemy.cirX,
            (midY + 10) - enemy.cirY);
        if (dis - enemy.radius - 20 < 1) {
            if (!muted) {
                const zombieEat = createAudio("audio/zombieEat.mp3");
                zombieEat.play();
                backgroundSound.pause();
            }
            cancelAnimationFrame(animateID);
            scoreElements[1].innerHTML = score;
            canvas.style.display = "none";
            result.style.display = "block";
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dis = Math.hypot(projectile.position.x + 2 - enemy.cirX,
                projectile.position.y + 2 - enemy.cirY);
            // When Projectile Touch Enemy (Kill Enemy)
            if (dis - enemy.radius - 6 < 1) {
                
                if (!muted) {
                    shoot.pause();
                    killingZombie.play();
                }
                
                // Create Explosions
                for (let i = 0; i < 15 ; i++){
                    particles.push(new Particle(
                        enemy.position.x + enemy.width / 2,
                        enemy.position.y + enemy.height / 2,
                        Math.random() * 3, "red",
                        {
                            x: (Math.random() - 0.5) * 2,
                            y: (Math.random() - 0.5) * 2,
                        }
                    ));
                }

                setTimeout(() => {
                    enemies.splice(enemyIndex, 1);
                    projectiles.splice(projectileIndex, 1);
                });
                // Score
                score += 100
                scoreElements[0].innerHTML = score;
            }
        });
    });
}

canvas.addEventListener("click", (event) => {
    // Angle of " Start Point (Gun Position) to End Point (Click Position) "
    /// Gun Position {x : midX+40 , y: midY+25}
    const angle = Math.atan2(event.clientY - (midY), event.clientX - (midX - 15));
    const angle2 = Math.atan2(event.clientY - (midY + 24), event.clientX - (midX + 40));
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5,
    }
    let position = {
        x: (midX - 15),
        y: (midY),
    }
    /// Position Gun from Player position is (40 , 20)
    /// Rotate Coordinate Point 
    position.x += (40 * Math.cos(angle) - 20 * Math.sin(angle));
    position.y += (40 * Math.sin(angle) + 20 * Math.cos(angle));
    projectiles.push(
        new Projectiles(position, velocity, angle)
    );

    player.currentSpriteNum = player.sprite.shoot.spriteNum;
    player.currentSprite = player.sprite.shoot.image;
    player.currentCropWidth = player.sprite.shoot.cropWidth;
    player.currentHeight = player.sprite.shoot.height;

    if (!muted) {
        shoot.playbackRate = 2;
        shoot.volume = 0.5;
        shoot.play();
    }
});

document.addEventListener('contextmenu', (e) => {
    e.preventDefault();

    if(score >= 5000){
        // Score
        score += enemies.length * 100 - 5000;
        scoreElements[0].innerHTML = score;

        // Kill each enemies
        enemies.forEach((enemy) => {
            // Create Explosions
            for (let i = 0; i < 15 ; i++){
                particles.push(new Particle(
                    enemy.position.x + enemy.width / 2,
                    enemy.position.y + enemy.height / 2,
                    Math.random() * 3, "red",
                    {
                        x: (Math.random() - 0.5) * 2,
                        y: (Math.random() - 0.5) * 2,
                    }
                ));
            }
        });

        enemies = [];
        boomSound.play();
        boomSound.volume = 0.2;
    }
});

window.addEventListener("mousemove", (event) => {
    // Angle of " Start Point (Gun Position) to End Point (Mouse Direct) "
    /// Gun Position {x : midX+40 , y: midY+25}
    const angle = Math.atan2(event.clientY - (midY), event.clientX - (midX - 15));
    player.rotation = angle;
});

startGame.addEventListener("click", () => {
    result.style.display = "none";
    canvas.style.display = "block";
    initGame();
});

soundPlay.addEventListener("click", () => {
    muted = true;
    soundPlay.style.display = "none";
    soundmuted.style.display = "block";
});

soundmuted.addEventListener("click", () => {
    muted = false;
    soundmuted.style.display = "none";
    soundPlay.style.display = "block";
});

