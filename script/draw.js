function drawTop(timestamp) {
  // background and basic text
  const playingLevel = player.address >= levelAdressStartPoint && levelData !== null;
  osCtx.font = 'bold 120px sans-serif';
  if(drawAll.top) {
    osCtx.fillStyle = color.topBackground;
    osCtx.fillRect(0, 0, width, letterbox);
    if(player.address >= levelAdressStartPoint)
      needName = true;
    else {
      osCtx.fillStyle = color.topString;
      osCtx.fillText(gameNameKorean, width / 2, letterbox / 2);
      osCtx.font = 'bold 60px sans-serif';
      osCtx.fillText(gameNameEnglish, width / 2, letterbox * 3 / 4);
    }
  }

  // real time data
  if(playingLevel && (levelData.playCount.finish === null || drawAll.top)) {
    osCtx.font = 'bold 90px sans-serif';
    if(needName) {
      osCtx.fillStyle = color.topString;
      osCtx.fillText(`${levelData.levelName} - ${levelData.makerName}`, width / 2, letterbox / 6);
      needName = false;
    }
    osCtx.fillStyle = color.topBackground;
    osCtx.fillRect(0, letterbox / 3, width, letterbox * 2 / 3);
    [
      `${levelData.shape.now + 1}/${levelData.tileData.length}`,
      `${levelData.playCount.moved}`,
      `${levelData.playCount.rotated}`,
      `${levelData.playCount.incorrect}`
    ].forEach((text, index) => {
      osCtx.fillStyle = index % 2 ? color.magenta : color.cyan;
      osCtx.fillText(text, width * (2 * index + 1) / 8, letterbox / 2);
    });
    osCtx.fillStyle = color.topString;
    osCtx.fillText(`${Math.floor((levelData.playCount.finish ?? timestamp) - (levelData.playCount.departure ?? timestamp))} ms`, width / 2, letterbox * 5 / 6)
  }
}

function drawLevel(timestamp) {
  // background
  if(drawAll.middle) {
    osCtx.fillStyle = color.levelBackground;
    osCtx.fillRect(0, letterbox, width, height - letterbox * 2);
    if(levelData === null) {
      osCtx.fillStyle = color.loadingString;
      osCtx.fillText(loadingString, width / 2, height / 2);
      return;
    }
  }
  if(levelData === null)
    return;

  // tile
  if(levelData.shape.now !== levelData.shape.before) {
    for(let i = 1; i >= 0; i--) {
      let j = 0;
      let tileDrawRatio = [insideTileSizePerOutsideTileSize, 1][i];
      for(const tile of levelData.tileData[levelData.shape.now + i] ?? levelData.tileData[levelData.shape.now + i - 1]) {
        if(tile === '$') {
          if(drawAll.middle && i === 0) {
            osLevelCtx.drawImage(
              getAssetObject().tile.barrier,
              (j % levelData.levelSize) * levelData.tileSize,
              Math.floor(j / levelData.levelSize) * levelData.tileSize,
              levelData.tileSize,
              levelData.tileSize
            );
          }
        } else {
          osLevelCtx.fillStyle = levelData.colorData[tile];
          osLevelCtx.fillRect(
            ((j % levelData.levelSize) + (1 - tileDrawRatio) / 2) * levelData.tileSize,
            (Math.floor(j / levelData.levelSize) + (1 - tileDrawRatio) / 2) * levelData.tileSize,
            levelData.tileSize * tileDrawRatio,
            levelData.tileSize * tileDrawRatio
          );
        }
        j++;
      }
    }
    levelData.shape.before = levelData.shape.now;
  }
  osCtx.drawImage(osLevelCanvas, levelScreenMargin, levelScreenMargin + letterbox);

  // ball
  for(const ball of levelData.liveBallData) {
    const ballDrawWithDeparture = motionInterpolation(timestamp, ball);
    osCtx.beginPath();
    osCtx.arc(
      (ballDrawWithDeparture.x + 0.5) * levelData.tileSize + levelScreenMargin,
      (ballDrawWithDeparture.y + 0.5) * levelData.tileSize + levelScreenMargin + letterbox,
      levelData.tileSize * ballSizePerTileSize / 2,
      0,
      Math.PI * 2
    );
    osCtx.fillStyle = levelData.colorData[ball.type];
    osCtx.fill();
  }

  // player
  const isPlayerTouchWall = ['x', 'y'].some(axis => ['before', 'now'].some(moment => player[moment][axis] === 0 || player[moment][axis] === lastSpace[axis]));
  if(isPlayerTouchWall) {
    osCtx.save();
    osCtx.beginPath();
    osCtx.rect(
      levelScreenMargin,
      levelScreenMargin + letterbox,
      levelScreenSize,
      levelScreenSize
    ); // letterbox === letterbox * 2 / 2
    osCtx.clip();
  }
  const playerDrawWithDeparture = motionInterpolation(timestamp, player);
  osCtx.drawImage(
    getAssetObject().player.ring,
    (playerDrawWithDeparture.x - ringBorderThicknessPerTileSize) * levelData.tileSize + levelScreenMargin,
    (playerDrawWithDeparture.y - ringBorderThicknessPerTileSize) * levelData.tileSize + levelScreenMargin + letterbox,
    ringSizePerTileSize * levelData.tileSize,
    ringSizePerTileSize * levelData.tileSize
  );
  if(isPlayerTouchWall)
    osCtx.restore();
}

function drawMenu() {
  // background
  if(drawAll.middle) {
    osCtx.fillStyle = color.menuBackground;
    osCtx.fillRect(0, letterbox, width, height - letterbox * 2);
  }

  // button
  for(const singleButton of menuButton) {
    osCtx.fillStyle = color.menuBackground;
    const nowSelect = singleButton.location.x === player.now.x && singleButton.location.y === player.now.y;
    if(singleButton.isSelected === nowSelect && !drawAll.middle)
      continue;
    const realMiddle = {
      x: singleButton.location.x * menu.space.x + menu.startMiddle.x,
      y: singleButton.location.y * menu.space.y + menu.startMiddle.y
    };
    const drawButtonRatio = (nowSelect ? 1 : menuButtonShrink);
    osCtx.fillRect(
      realMiddle.x - menu.buttonSize.x / 2,
      realMiddle.y - menu.buttonSize.y / 2 + letterbox,
      menu.buttonSize.x,
      menu.buttonSize.y
    );
    osCtx.drawImage(
      getAssetObject().button[singleButton.assetName],
      realMiddle.x - drawButtonRatio * menu.buttonSize.x / 2,
      realMiddle.y - drawButtonRatio * menu.buttonSize.y / 2 + letterbox,
      drawButtonRatio * menu.buttonSize.x,
      drawButtonRatio * menu.buttonSize.y
    );
    osCtx.fillStyle = singleButton.characterColor;
    osCtx.font = `bold ${drawButtonRatio * menuButtonCharacterSize}px sans-serif`;
    osCtx.fillText(menuButtonCharacter[singleButton.character], realMiddle.x, realMiddle.y + letterbox);
    singleButton.isSelected = nowSelect;
  }
}

function drawBottom(timestamp) {
  // background
  osCtx.fillStyle = color.bottomBackground;
  if(drawAll.bottom)
    osCtx.fillRect(0, height - letterbox, width, letterbox);

  // key
  for(const code in key) {
    if(!key[code].isDrawn || (key[code].isKeydowned.before && key[code].isKeydowned.now || key[code].departure === null && (key[code].isKeydowned.before || !key[code].isKeydowned.now)) && !drawAll.bottom)
      continue; // AI might be able to understand it
    key[code].isKeydowned.before = key[code].isKeydowned.now;
    const shrinkSize = key[code].isKeydowned.now ? bottomKeyShrink : 1 - (1 - bottomKeyShrink) * (Math.min((timestamp - (key[code].departure ?? timestamp)) / animationSpeed, 1) - 1) ** 2;
    osCtx.fillRect(
      key[code].middle.x - key[code].size.x / 2,
      key[code].middle.y - key[code].size.y / 2 + height - letterbox,
      key[code].size.x,
      key[code].size.y
    );
    osCtx.drawImage(
      getAssetObject().key[key[code].assetName],
      key[code].middle.x - key[code].size.x * shrinkSize / 2,
      key[code].middle.y - key[code].size.y * shrinkSize / 2 + height - letterbox,
      key[code].size.x * shrinkSize,
      key[code].size.y * shrinkSize
    );
    if(shrinkSize === 1)
      key[code].departure = null;
  }
}

function draw(timestamp) {
  drawTop(timestamp);
  drawAll.top = false;
  if(player.address >= levelAdressStartPoint) {
    drawLevel(timestamp);
  } else {
    drawMenu();
  }
  drawAll.middle = false;
  drawBottom(timestamp);
  drawAll.bottom = false;
}

function main(timestamp) {
  animationID = requestAnimationFrame(main);
  if(!isAssetLoaded)
    return;
  draw(timestamp);
  ctx.drawImage(osCanvas, 0, 0);
}

function motionInterpolation(timestamp, object) {
  const calculatedDeparture = 1 - (Math.min((timestamp - object.departure) / animationSpeed, 1) - 1) ** 2;
  return {
    x: calculatedDeparture * object.now.x + (1 - calculatedDeparture) * object.before.x,
    y: calculatedDeparture * object.now.y + (1 - calculatedDeparture) * object.before.y
  };
}