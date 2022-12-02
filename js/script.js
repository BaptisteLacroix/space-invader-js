const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight

class Player {
    constructor() {
        this.velocity = {x: 0, y: 0};

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
        // ctx.fillStyle = "red";
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        ctx.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height);
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
        // ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        // ctx.fillStyle = "red";
        // ctx.fill();
        ctx.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
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
        // ctx.fillStyle = "red";
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

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
        invaderProjectiles.push(new InvaderProjectile({
            position: {
                x: this.position.x + this.width / 2,
                y: this.position.y + this.height
            }, velocity: {x: 0, y: 5}
        }));
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
        this.velocity = {x: 10, y: 0};
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
const grids = [new Grid()];
const invaderProjectiles = [];
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


// Animation
function animate() {
    // Loop the animation
    requestAnimationFrame(animate);
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.update();
    invaderProjectiles.forEach(invaderProjectile => {
        if (invaderProjectile.position.y + invaderProjectile.height >= canvas.height) {
            setTimeout(() => {
                invaderProjectiles.splice(invaderProjectiles.indexOf(invaderProjectile), 1);
            }, 0);
        } else {
            invaderProjectile.update();
        }

        if (invaderProjectile.position.y + invaderProjectile.height >= player.position.y
        && invaderProjectile.position.x + invaderProjectile.width >= player.position.x
            && invaderProjectile.position.x <= player.position.x + player.width) {
            setTimeout(() => {
                invaderProjectiles.splice(invaderProjectiles.indexOf(invaderProjectile), 1);
            }, 0);
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
                        if (invaderFound && projectileFound) {
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
        player.velocity.x = -5;
    } else if (keys.d.pressed && player.position.x < window.innerWidth) {
        player.velocity.x = 5;
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
    console.log(key);
    switch (key) {
        case "q":
            keys.q.pressed = true;
            break;
        case "d":
            player.velocity.x = 5;
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