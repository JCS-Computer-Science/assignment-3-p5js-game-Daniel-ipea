let playerHero;
let activeEnemies = [];
let flyingAxes = [];
let axesOnGround = [];
let collectibleCoins = [];
let isTheGameOver = false;

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    rectMode(CENTER);
    resetEntireGame();
}

function windowResized() {
    resizeCanvas(window.innerWidth, window.innerHeight);
}

function resetEntireGame() {
    playerHero = {
        positionX: width / 2,
        movementSpeed: 4,
        currentLevel: 1,
        experiencePoints: 0,
        maximumAxeCapacity: 1,
        currentlyHeldAxes: 1
    };
    activeEnemies = [];
    flyingAxes = [];
    axesOnGround = [];
    collectibleCoins = [];
    isTheGameOver = false;

    for (let i = 0; i < 5; i++) {
        createNewEnemy();
    }
}

function createNewEnemy() {
    activeEnemies.push({
        positionX: random(width),
        positionY: random(height),
        hitboxRadius: 25,
        movementSpeed: random(1, 2)
    });
}

function draw() {
    background(25, 35, 50);

    if (isTheGameOver) {
        showGameOverScreen();
        return;
    }

    processGameLogic();
    renderGameGraphics();
}

function processGameLogic() {
    if (keyIsDown(87)) playerHero.positionY -= playerHero.movementSpeed;
    if (keyIsDown(83)) playerHero.positionY += playerHero.movementSpeed;
    if (keyIsDown(65)) playerHero.positionX -= playerHero.movementSpeed;
    if (keyIsDown(68)) playerHero.positionX += playerHero.movementSpeed;

    for (let i = activeEnemies.length - 1; i >= 0; i--) {
        let enemy = activeEnemies[i];
        let distanceToPlayer = dist(playerHero.positionX, playerHero.positionY, enemy.positionX, enemy.positionY);

        if (distanceToPlayer > 0) {
            enemy.positionX += (playerHero.positionX - enemy.positionX) / distanceToPlayer * enemy.movementSpeed;
            enemy.positionY += (playerHero.positionY - enemy.positionY) / distanceToPlayer * enemy.movementSpeed;
        }

        if (distanceToPlayer < playerHero.hitboxRadius + enemy.hitboxRadius) {
            isTheGameOver = true;
        }
    }

    for (let i = flyingAxes.length - 1; i >= 0; i--) {
        let axe = flyingAxes[i];

        axe.positionX += axe.velocityX;
        axe.positionY += axe.velocityY;
        axe.remainingLifeSpan--;

        for (let j = activeEnemies.length - 1; j >= 0; j--) {
            let enemy = activeEnemies[j];
            let distanceToEnemy = dist(axe.positionX, axe.positionY, enemy.positionX, enemy.positionY);

            if (distanceToEnemy < 10) {
                collectibleCoins.push({ positionX: enemy.positionX, positionY: enemy.positionY });
                activeEnemies.splice(j, 1);
                createNewEnemy();
                axe.remainingLifeSpan = 0;
            }
        }

        if (axe.remainingLifeSpan <= 0) {
            axesOnGround.push({ positionX: axe.positionX, positionY: axe.positionY });
            flyingAxes.splice(i, 1);
        }
    }

    for (let i = collectibleCoins.length - 1; i >= 0; i--) {
        let coin = collectibleCoins[i];
        let distanceToCoin = dist(playerHero.positionX, playerHero.positionY, coin.positionX, coin.positionY);

        if (distanceToCoin < 20) {
            collectibleCoins.splice(i, 1);
            playerHero.experiencePoints += 25;

            if (playerHero.experiencePoints >= 100) {
                playerHero.currentLevel++;
                playerHero.experiencePoints = 0;
                playerHero.maximumAxeCapacity++;
                playerHero.currentlyHeldAxes++;
            }
        }
    }

    for (let i = axesOnGround.length - 1; i >= 0; i--) {
        let groundAxe = axesOnGround[i];
        let distanceToGroundAxe = dist(playerHero.positionX, playerHero.positionY, groundAxe.positionX, groundAxe.positionY);

        if (distanceToGroundAxe < 25) {
            if (playerHero.currentlyHeldAxes < playerHero.maximumAxeCapacity) {
                axesOnGround.splice(i, 1);
                playerHero.currentlyHeldAxes++;
            }
        }
    }
}

function renderGameGraphics() {
    fill(255, 215, 0);
    for (let coin of collectibleCoins) {
        circle(coin.positionX, coin.positionY, 10);
    }

    fill(150);
    for (let groundAxe of axesOnGround) {
        rect(groundAxe.positionX, groundAxe.positionY, 12, 12);
    }

    fill(255);
    rect(playerHero.positionX, playerHero.positionY, 25, 25);

    fill(255, 80, 80);
    for (let enemy of activeEnemies) {
        rect(enemy.positionX, enemy.positionY, 25, 25);
    }

    fill(0, 255, 255);
    for (let axe of flyingAxes) {
        push();
        translate(axe.positionX, axe.positionY);
        rotate(frameCount * 0.3);
        rect(0, 0, 15, 5);
        pop();
    }

    fill(255);
    textAlign(LEFT);
    textSize(18);
    text("Level: " + playerHero.currentLevel + " | Axes: " + playerHero.currentlyHeldAxes + "/" + playerHero.maximumAxeCapacity, 20, 40);

    fill(50);
    rect(width / 3, 40, 200, 15);

    fill(0, 255, 100);
    let barWidth = playerHero.experiencePoints * 2;
    rect(width / 3 - 100 + barWidth / 3, 40, barWidth, 15);
}

function mousePressed() {
    if (isTheGameOver) {
        resetEntireGame();
        return;
    }

    if (playerHero.currentlyHeldAxes > 0) {
        let differenceX = mouseX - playerHero.positionX;
        let differenceY = mouseY - playerHero.positionY;
        let totalDistance = dist(playerHero.positionX, playerHero.positionY, mouseX, mouseY);

        if (totalDistance > 0) {
            flyingAxes.push({
                positionX: playerHero.positionX,
                positionY: playerHero.positionY,
                velocityX: (differenceX / totalDistance) * 10,
                velocityY: (differenceY / totalDistance) * 10,
                remainingLifeSpan: 60
            });

            playerHero.currentlyHeldAxes--;
        }
    }
}

function showGameOverScreen() {
    fill(255);
    textAlign(CENTER);
    textSize(60);
    text("WASTED", width / 2, height / 2);
    textSize(25);
    text("Click to Resurrect", width / 2, height / 2 + 50);
}