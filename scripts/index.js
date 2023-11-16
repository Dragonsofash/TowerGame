const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1280;
canvas.height = 768;

c.fillStyle = "white";
c.fillRect(0, 0, canvas.width, canvas.height);

const image = new Image();
image.onload = () => {
  animate();
};
image.src = "images/gameMap.png";

const placementTilesData2D = [];

for (let i = 0; i < placementTilesData.length; i += 20) {
  placementTilesData2D.push(placementTilesData.slice(i, i + 20));
}

const placementTiles = [];

placementTilesData2D.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 14) {
      // add building placement tile here
      placementTiles.push(
        new PlacementTile({
          position: {
            x: x * 64,
            y: y * 64,
          },
        })
      );
    }
  });
});

// console.log(placementTiles);

const enemies = [];

function spawnEnemies(spawnCount) {
  for (let i = 1; i < spawnCount + 1; i++) {
    const xOffset = i * 150;
    enemies.push(
      new Enemy({
        position: { x: waypoints[0].x - xOffset, y: waypoints[0].y },
      })
    );
  }
}

const buildings = [];
let activeTile = undefined;
let enemyCount = 3;
let hearts = 10;
let coins = 100;
spawnEnemies(3);

function animate() {
  const animationId = requestAnimationFrame(animate);
  c.drawImage(image, 0, 0);
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.update();

    if (enemy.position.y + enemy.height < 0) {
      hearts -= 1;
      enemies.splice(i, 1);
      document.querySelector("#heartCounter").innerHTML = hearts;

      if (hearts === 0) {
        cancelAnimationFrame(animationId);
        document.querySelector("#gameOver").style.display = "flex";
      }
    }
  }

  if (enemies.length === 0) {
    enemyCount += 2;
    spawnEnemies(enemyCount);
  }

  placementTiles.forEach((tile) => {
    tile.update(mouse);
  });

  buildings.forEach((building) => {
    building.update();
    building.target = null;
    const validEnemies = enemies.filter((enemy) => {
      const xDiff = enemy.center.x - building.center.x;
      const yDiff = enemy.center.y - building.center.y;

      const distance = Math.hypot(xDiff, yDiff);
      return distance < enemy.radius + building.radius;
    });
    building.target = validEnemies[0];
    // console.log(validEnemies);

    for (let i = building.projectiles.length - 1; i >= 0; i--) {
      const projectile = building.projectiles[i];

      projectile.update();

      const xDiff = projectile.enemy.center.x - projectile.position.x;
      const yDiff = projectile.enemy.center.y - projectile.position.y;

      const distance = Math.hypot(xDiff, yDiff);

      // When projectile hits enemy
      if (distance < projectile.enemy.radius + projectile.radius) {
        //enemy health and removavla
        projectile.enemy.health -= 20;
        if (projectile.enemy.health <= 0) {
          const enemyIndex = enemies.findIndex((enemy) => {
            return projectile.enemy === enemy;
          });
          if (enemyIndex > -1) {
            enemies.splice(enemyIndex, 1);
            coins += 25;
            document.querySelector("#coinCounter").innerHTML = coins;
          }
        }
        console.log(projectile.enemy.health);
        building.projectiles.splice(i, 1);
      }
      // console.log(distance);
    }
  });
}

const mouse = {
  x: undefined,
  y: undefined,
};

canvas.addEventListener("click", (event) => {
  if (activeTile && !activeTile.isOccupied && coins - 50 >= 0) {
    coins -= 50;
    document.querySelector("#coinCounter").innerHTML = coins;
    buildings.push(
      new Building({
        position: {
          x: activeTile.position.x,
          y: activeTile.position.y,
        },
      })
    );
    activeTile.isOccupied = true;
  }
  // console.log(buildings);
});

window.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;

  activeTile = null;
  for (let i = 0; i < placementTiles.length; i++) {
    const tile = placementTiles[i];
    if (
      mouse.x > tile.position.x &&
      mouse.x < tile.position.x + tile.size &&
      mouse.y > tile.position.y &&
      mouse.y < tile.position.y + tile.size
    ) {
      activeTile = tile;
      break;
    }
  }
});
