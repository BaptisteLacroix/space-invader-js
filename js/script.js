const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let bestScore = 0;

canvas.width = 1024;
canvas.height = 576;

class Player {
    constructor() {
        this.velocity = {x: 0, y: 0};

        this.opacity = 1;

        // Image of the player
        const image = new Image();
        image.src = "./img/spaceship.png";
        image.onload = () => {
            const scale = 0.25;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - 100
            };
        };
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;

        ctx.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
        ctx.restore();
    }

    update() {
        if (this.image) {
            this.draw();
            this.position.x += this.velocity.x;
        }
    }
}

class Projectile {

    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 5;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Particle {

    constructor({position, velocity, radius, color, fades}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = radius;
        this.color = color;
        this.opacity = 1;
        this.fades = fades
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        if (this.fades)
            this.opacity -= 0.01;
    }
}

class Invader {
    constructor({position}) {
        this.velocity = {x: 0, y: 0};
        // Image of the player
        const image = new Image();
        image.src = "./img/invader.png";
        image.onload = () => {
            const scale = 1;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.position = {
                x: position.x,
                y: position.y
            };
        };
    }

    draw() {
        ctx.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height);
    }

    update({velocity}) {
        if (this.image) {
            this.draw();
            this.position.x += velocity.x;
            this.position.y += velocity.y;
        }
    }

    shoot(invaderProjectiles) {
        invaderProjectiles.push(
            new InvaderProjectile({
                position: {
                    x: this.position.x + this.width / 2,
                    y: this.position.y + this.height
                },
                velocity: {
                    x: 0,
                    y: 3
                }
            })
        );
    }
}

class InvaderProjectile {
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        this.width = 3;
        this.height = 10;
    }

    draw() {
        ctx.fillStyle = "white";
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Grid {
    constructor() {
        this.position = {x: 0, y: 0};
        this.velocity = {x: 3, y: 0};
        this.invaders = [];
        const columns = Math.floor(Math.random() * 10 + 5);
        const rows = Math.floor(Math.random() * 5 + 2);
        this.width = columns * 30;
        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++) {
                this.invaders.push(new Invader(
                    {
                        position: {
                            x: x * 30,
                            y: y * 30
                        }
                    }
                ));
            }
        }
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.y + this.width < 0) {
            // Suppression de la grille
            grids.splice(grids.indexOf(this), 1);
        }

        this.velocity.y = 0;

        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x;
            this.velocity.y = 30;
        }
    }
}

const player = new Player();
const projectiles = [];
const grids = [];
const invaderProjectiles = [];
const particles = [];

const keys = {
    q: {
        pressed: false,
    },
    d: {
        pressed: false,
    },
    space: {
        pressed: false,
    }
};

let frames = 0;
let randomInteral = Math.floor((Math.random() * 500) + 500);
let game = {
    over: false,
    activate: true,
}
let score = 0;

backgroundParticles();

function backgroundParticles() {
    for (let i = 0; i < 100; i++) {
        particles.push(new Particle({
            position: {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height
            },
            velocity: {
                x: 0,
                y: 0.2
            },
            radius: Math.random() * 2,
            color: "white",
        }));
    }
}


function createParticles({object, color, fades}) {
    for (let i = 0; i < 10; i++) {
        particles.push(new Particle({
            position: {
                x: object.position.x + object.width / 2,
                y: object.position.y + object.height / 2
            },
            velocity: {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            },
            radius: Math.random() * 3,
            color: color || "yellow",
            fades
        }));
    }
}


function menu() {
    // requestAnimationFrame(menu);
    // Affichage du menu
    // set hidden #scoreEl when menu is displayed
    document.getElementById("score").style.display = "none";
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Press Space to Start", canvas.width / 2 - 150, canvas.height / 2);
    ctx.fillText("Best Score : " + bestScore, canvas.width / 2 - 125, canvas.height / 2 + 50);

    backgroundParticles();
    forEachParticles();

}

function forEachParticles() {
    particles.forEach(particle => {
        if (particle.position.y - particle.radius >= canvas.height) {
            particle.position.x = Math.random() * canvas.width;
            particle.position.y = particle.radius
        }
        if (particle.opacity <= 0) {
            setTimeout(() => {
                particles.splice(particles.indexOf(particle), 1);
            }, 0);
        } else {
            particle.update();
        }
    });
}

// Animation
function animate() {
    if (!game.activate || game.over) {
        bestScore = score;
        menu();
        return;
    }
    // Loop the animation
    requestAnimationFrame(animate);
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.update();
    forEachParticles();

    invaderProjectiles.forEach(invaderProjectile => {
        if (invaderProjectile.position.y + invaderProjectile.height >= canvas.height) {
            setTimeout(() => {
                invaderProjectiles.splice(invaderProjectiles.indexOf(invaderProjectile), 1);
            }, 0);
        } else {
            invaderProjectile.update();
        }

        // Collision projectile invader
        if (invaderProjectile.position.y + invaderProjectile.height >= player.position.y
            && invaderProjectile.position.x + invaderProjectile.width >= player.position.x
            && invaderProjectile.position.x <= player.position.x + player.width) {
            setTimeout(() => {
                invaderProjectiles.splice(invaderProjectiles.indexOf(invaderProjectile), 1);
                player.opacity = 0;
                game.over = true;
            }, 0);

            setTimeout(() => {
                game.activate = false;
            }, 500);

            createParticles({
                object: player,
                color: "white",
                fades: true
            });
        }
    });


    projectiles.forEach(projectile => {
        if (projectile.position.y < 0) {
            setTimeout(() => {
                projectiles.splice(projectiles.indexOf(projectile), 1);
            }, 0);
        } else {
            projectile.update();
        }
    });

    grids.forEach(grid => {
        grid.update();
        // Spawn Invaders projectiles
        if (frames % 100 === 0 && grid.invaders.length > 0) {
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles);
        }
        grid.invaders.forEach(invader => {
            invader.update({
                velocity: grid.velocity
            });

            // projectiles hit invader
            projectiles.forEach(projectile => {
                if (projectile.position.y - projectile.radius <=
                    invader.position.y + invader.height &&
                    projectile.position.x + projectile.radius >=
                    invader.position.x &&
                    projectile.position.x - projectile.radius <=
                    invader.position.x + invader.width &&
                    projectile.position.y + projectile.radius >= invader.position.y) {

                    setTimeout(() => {
                        const invaderFound = grid.invaders.find(invader2 => {
                            return invader === invader2;
                        });
                        const projectileFound = projectiles.find(projectile2 => {
                            return projectile === projectile2;
                        });

                        // remove Invader and Projectile
                        if (invaderFound && projectileFound) {
                            score += 100
                            console.log(score)
                            createParticles({
                                object: invader,
                                fades: true
                            });
                            document.getElementById("scoreEl").innerHTML = score;
                            grid.invaders.splice(grid.invaders.indexOf(invader), 1);
                            projectiles.splice(projectiles.indexOf(projectile), 1);

                            if (grid.invaders.length > 0) {
                                const firstInvader = grid.invaders[0];
                                const lastInvader = grid.invaders[grid.invaders.length - 1];

                                grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width;
                                grid.position.x = firstInvader.position.x;
                            } else {
                                grids.splice(grids.indexOf(grid), 1);
                            }
                        }
                    }, 0);
                }
            });
        });
    });

    // TODO : Revoir la position droite
    if (keys.q.pressed && (player.position.x + this.width >= canvas.width || player.position.x > 0)) {
        player.velocity.x = -3;
    } else if (keys.d.pressed && player.position.x < window.innerWidth) {
        player.velocity.x = 3;
    } else {
        player.velocity.x = 0;
    }

    // Spawn Invaders
    if (frames % randomInteral === 0) {
        grids.push(new Grid());
        randomInteral = Math.floor((Math.random() * 500) + 500);
        frames = 0;
    }
    frames++;
}

animate();

addEventListener('keydown', ({key}) => {
    if (game.over && key === "Enter") {
        location.reload();
    } else {
        switch (key) {
            case "q":
                keys.q.pressed = true;
                break;
            case "d":
                keys.d.pressed = true;
                break;
            case " ":
                projectiles.push(
                    new Projectile({
                        position: {
                            x: player.position.x + player.width / 2,
                            y: player.position.y
                        },
                        velocity: {
                            x: 0,
                            y: -10
                        }
                    }));
                break;
        }
    }
});


addEventListener('keyup', ({key}) => {
    switch (key) {
        case "q":
            keys.q.pressed = false;
            break;
        case "d":
            player.velocity.x = 5;
            keys.d.pressed = false;
            break;
        case " ":
            keys.space.pressed = false;
            break;
    }
});