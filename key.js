addEventListener('keydown', eventObject => {
  if(key[eventObject.code] && !key[eventObject.code].isKeydowned.now) {
    key[eventObject.code].isKeydowned.now = true;
    const doingLevel = player.address >= levelAdressStartPoint;
    const playingLevel = doingLevel && levelData !== null;
    if(doingLevel && levelData !== null && levelData.playCount.departure === null)
      levelData.playCount.departure = performance.now();
    switch(eventObject.code) {
      case 'KeyW':
      case 'KeyD':
      case 'KeyS':
      case 'KeyA':
        move(eventObject.code, playingLevel);
        break;
      case 'KeyK':
        if(playingLevel)
          rotate();
        else if(!doingLevel)
          enter();
        break;
      case 'KeyL':
        if(playingLevel)
          next();
        break;
      case 'KeyQ':
        if(doingLevel)
          quit();
        break;
      case 'KeyI':
        powerButton.click();
        break;
      case 'KeyO':
        recordButton.click();
        break;
      case 'KeyP':
        downloadButton.click();
        break;
    }
  }
});
addEventListener('keyup', eventObject => {
  if(key[eventObject.code]) {
    key[eventObject.code].isKeydowned.now = false;
    if(key[eventObject.code].isDrawn)
      key[eventObject.code].departure = performance.now();
  }
});

function enter() {
  switch((menu.end.x + 1) * player.now.y + player.now.x) {
    case 0:
      if(player.address !== 0) {
        player.address--;
        menuButton[bonusLevelButtonIndex].character = player.address + 4;
      }
      break;
    case 1:
      if(player.address !== menuLength - 1) {
        player.address++;
        menuButton[bonusLevelButtonIndex].character = player.address + 4;
      }
      break;
    case 2:
    case 3:
      return;
    case bonusLevelButtonIndex:
      player.address += bonusLevelAdressStartPoint;
      getOfficialLevelData(player.address);
      break;
    default:
      player.address = levelAdressStartPoint + player.address * (mainLevelLength / menuLength) + (player.now.y - 1) * (menu.end.x + 1) + player.now.x;
      getOfficialLevelData(player.address);
  }
  drawAll.top = drawAll.middle = true;
}

function quit() {
  if(player.address >= bonusLevelAdressStartPoint) {
    player.now.x = 4;
    player.now.y = 0;
    player.address -= bonusLevelAdressStartPoint;
  } else {
    player.now.x = player.address % (menu.end.x + 1);
    player.now.y = Math.floor(player.address / (menu.end.x + 1)) % menu.end.y + 1; // menu.end.y === menu.end.y + 1 - 1
    player.address = Math.floor((player.address - levelAdressStartPoint) / (mainLevelLength / menuLength));
  }
  lastSpace.x = menu.end.x;
  lastSpace.y = menu.end.y;
  drawAll.top = drawAll.middle = true;
}

function next() {
  if(levelData.playCount.finish !== null)
    return;
  if(levelData.liveBallData.some(ball => !(ball.type === levelData.tileData[levelData.shape.now][ball.now.y * levelData.levelSize + ball.now.x]))) {
    levelData.playCount.incorrect++;
    return;
  }
  if(levelData.shape.now + 1 === levelData.tileData.length) {
    levelData.playCount.finish = performance.now();
    drawAll.top = true;
    return;
  }
  levelData.shape.now++;
}

function rotate() {
  const rotateShortlist = levelData.liveBallData.filter(ball => player.now.x <= ball.now.x && player.now.y <= ball.now.y && player.now.x + 1 >= ball.now.x && player.now.y + 1 >= ball.now.y);
  if(rotateShortlist.length < 4)
    return;
  rotateShortlist.sort((ball1, ball2) => ball1.now.y - ball2.now.y || ball1.now.x - ball2.now.x);
  for(let i = 0; i < rotateShortlist.length; i++) {
    rotateShortlist[i].before.x = rotateShortlist[i].now.x;
    rotateShortlist[i].before.y = rotateShortlist[i].now.y;
    rotateShortlist[i].departure = performance.now();
  }
  rotateShortlist[0].now.x++;
  rotateShortlist[1].now.y++;
  rotateShortlist[3].now.x--;
  rotateShortlist[2].now.y--;
  player.before.x = player.now.x;
  player.before.y = player.now.y;
  levelData.playCount.rotated++;
}

function move(code, playingLevel) {
  switch(code) {
    case 'KeyW':
      if(player.now.y === 0)
        return;
      player.before.x = player.now.x;
      player.before.y = player.now.y;
      player.now.y--;
      break;
    case 'KeyD':
      if(player.now.x === lastSpace.x)
        return;
      player.before.x = player.now.x;
      player.before.y = player.now.y;
      player.now.x++;
      break;
    case 'KeyS':
      if(player.now.y === lastSpace.y)
        return;
      player.before.x = player.now.x;
      player.before.y = player.now.y;
      player.now.y++;
      break;
    case 'KeyA':
      if(player.now.x === 0)
        return;
      player.before.x = player.now.x;
      player.before.y = player.now.y;
      player.now.x--;
      break;
  }
  if(playingLevel)
    levelData.playCount.moved++;
  player.departure = performance.now();
}