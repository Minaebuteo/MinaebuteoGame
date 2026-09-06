'use strict';

// canvas size
const width = 1080;
const height = 1920;
const letterbox = 420;
const levelScreenSize = 960;
const levelScreenMargin = (width - levelScreenSize) / 2;

// level address
const levelAdressStartPoint = 100;
const bonusLevelAdressStartPoint = 200;

// top text
const gameNameKorean = '민애부터 게임';
const gameNameEnglish = 'Minaebuteo Game';

// menu
const bonusLevelButtonIndex = 4;
const mainLevelLength = 100;
const bonusLevelLength = 5;
const menuLength = 5;

// menu button
const menuButtonCharacter = '<>RC壹貳參肆伍一二三四五六七八九十';
const menuButtonCharacterSize = 90; // px
const menuButtonShrink = 0.8;

// loading
const loadingString = 'LOADING';
let isAssetLoaded = false;
let needName = false;

// level size ratio
const ringSizePerTileSize = 2.5;
const ringBorderThicknessPerRingSize = 0.1;
const ringBorderThicknessPerTileSize = ringSizePerTileSize * ringBorderThicknessPerRingSize;
const insideTileSizePerOutsideTileSize = 0.75;
const ballSizePerTileSize = 0.25;

// animation
const bottomKeyShrink = 0.8;
const animationSpeed = 100; // ms
let animationID = null; // number type null

// external tool
let isPowered = false;
let isRecorded = false;
let videoName = null; // string type null

// useful data
let levelData = null; // object type null
const color = {
  white: '#FFF',
  magenta: '#F0F',
  black: '#000',
  cyan: '#0FF',
  topBackground: '#999',
  levelBackground: '#333',
  menuBackground: '#000',
  bottomBackground: '#666',
  topString: '#000',
  loadingString: '#FFF'
};
const player = {
  before: { x: 0, y: 0 },
  now: { x: 0, y: 0 },
  departure: -animationSpeed,
  address: 0
};
const lastSpace = { x: 4, y: 4 };
const drawAll = { bottom: true, middle: true, top: true };
const menu = {
  startMiddle: { x: 120, y: 120 },
  end: { x: 4, y: 4 },
  space: { x: 210, y: 210 },
  buttonSize: { x: 180, y: 180 }
};
const menuButton = [
  0, 1, 2, 3, 4,
  9, 10, 11, 12, 13,
  14, 15, 16, 17, 18,
  9, 10, 11, 12, 13,
  14, 15, 16, 17, 18
].map((singleButton, index) => ({
  location: { x: index % (menu.end.x + 1), y: Math.floor(index / (menu.end.x + 1)) },
  character: singleButton,
  characterColor: index < 5 ? 'black' : index < 15 ? 'cyan' : 'magenta',
  assetName: index < 5 ? 'white' : index < 15 ? 'magenta' : 'cyan',
  isSelected: index === player.now.y * (menu.end.x + 1) + player.now.x
}));
const key = {
  'KeyW': {
    isDrawn: true,
    assetName: 'up',
    middle: { x: 540, y: 70 },
    size: { x: 160, y: 80 },
    isKeydowned: { before: false, now: false },
    departure: -animationSpeed
  },
  'KeyD': {
    isDrawn: true,
    assetName: 'right',
    middle: { x: 680, y: 210 },
    size: { x: 80, y: 160 },
    isKeydowned: { before: false, now: false },
    departure: -animationSpeed
  },
  'KeyS': {
    isDrawn: true,
    assetName: 'down',
    middle: { x: 540, y: 350 },
    size: { x: 160, y: 80 },
    isKeydowned: { before: false, now: false },
    departure: -animationSpeed
  },
  'KeyA': {
    isDrawn: true,
    assetName: 'left',
    middle: { x: 400, y: 210 },
    size: { x: 80, y: 160 },
    isKeydowned: { before: false, now: false },
    departure: -animationSpeed
  },
  'KeyK': {
    isDrawn: true,
    assetName: 'symbol',
    middle: { x: 540, y: 210 },
    size: { x: 160, y: 160 },
    isKeydowned: { before: false, now: false },
    departure: -animationSpeed
  },
  'KeyL': {
    isDrawn: true,
    assetName: 'next',
    middle: { x: 900, y: 210 },
    size: { x: 160, y: 160 },
    isKeydowned: { before: false, now: false },
    departure: -animationSpeed
  },
  'KeyQ': {
    isDrawn: true,
    assetName: 'quit',
    middle: { x: 80, y: 80 },
    size: { x: 80, y: 80 },
    isKeydowned: { before: false, now: false },
    departure: -animationSpeed
  },
  'KeyI': {
    isDrawn: false,
    isKeydowned: { now: false }
  },
  'KeyO': {
    isDrawn: false,
    isKeydowned: { now: false }
  },
  'KeyP': {
    isDrawn: false,
    isKeydowned: { now: false }
  }
};

// external tool button
const powerButton = document.getElementById('power');
const recordButton = document.getElementById('record');
const downloadButton = document.getElementById('download');

// canvas data
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const osCanvas = new OffscreenCanvas(width, height);
const osCtx = osCanvas.getContext('2d');
const osLevelCanvas = new OffscreenCanvas(levelScreenSize, levelScreenSize);
const osLevelCtx = osLevelCanvas.getContext('2d');

// canvas text
osCtx.textAlign = 'center';
osCtx.textBaseline = 'middle';

// video
const stream = canvas.captureStream();
const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
const chunks = []; // variable array

// video function
recorder.ondataavailable = eventObject => chunks.push(eventObject.data);

// external tool function
powerButton.addEventListener('click', () => {
  isPowered = !isPowered;
  if(isPowered) {
    animationID = requestAnimationFrame(main);
    powerButton.classList.add('activated-button');
  } else {
    cancelAnimationFrame(animationID);
    powerButton.classList.remove('activated-button');
  }
});
recordButton.addEventListener('click', () => {
  isRecorded = !isRecorded;
  if(isRecorded) {
    chunks.length = 0;
    videoName = `MABT-${new Date().toISOString()}.webm`;
    recorder.start();
    recordButton.classList.add('activated-button');
  } else {
    recorder.stop();
    recordButton.classList.remove('activated-button');
  }
});
downloadButton.addEventListener('click', () => {
  if(isRecorded || chunks.length === 0)
    return;
  const blob = new Blob(chunks, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = videoName;
  a.click();
  URL.revokeObjectURL(url);
});

// get data function
const getAssetObject = (() => {
  let assetObject = null; // object type null
  (async () => {
    const [
      up, right, down, left, symbol, next, quit,
      white, magenta, cyan,
      barrier,
      ring
    ] = await ((async assetLinkArray => await Promise.all((assetLinkArray.map(async assetLink => {
      const assetImage = new Image();
      assetImage.src = `./asset/${assetLink}`;
      await assetImage.decode();
      return assetImage;
    }))))([
      'key/upButton.svg',
      'key/rightButton.svg',
      'key/downButton.svg',
      'key/leftButton.svg',
      'key/symbolButton.svg',
      'key/nextButton.svg',
      'key/quitButton.svg',
      'button/white.svg',
      'button/magenta.svg',
      'button/cyan.svg',
      'tile/barrier.svg',
      'player/ring.svg'
    ]));
    assetObject = {
      key: { up, right, down, left, symbol, next, quit },
      button: { white, magenta, cyan },
      tile: { barrier },
      player: { ring }
    };
    if(assetObject.player.ring) {
      isAssetLoaded = true;
      powerButton.click();
    }
  })();
  return () => assetObject; // You probably can't see null
})();
function getOfficialLevelData(levelAddress) {
  if(levelData?.levelAddress !== levelAddress) {
    levelData = null;
    fetch(`./level/${levelAddress}.json`).then(response => response.json()).then(downloadedLevelData => {
      levelData = downloadedLevelData;
      levelData.shape = { before: -1, now: 0 };
      levelData.tileSize = levelScreenSize / levelData.levelSize;
      levelData.playCount = { moved: 0, rotated: 0, incorrect: 0, departure: null, finish: null };
      levelData.liveBallData = levelData.ballData.split('').flatMap((ball, index) => ball !== '$' ? [{
        type: ball,
        before: { x: index % levelData.levelSize, y: Math.floor(index / levelData.levelSize) },
        now: { x: index % levelData.levelSize, y: Math.floor(index / levelData.levelSize) },
        departure: -animationSpeed
      }] : []);
      lastSpace.x = lastSpace.y = levelData.levelSize - 2;
      player.before.x = player.before.y = player.now.x = player.now.y = Math.floor(levelData.levelSize / 2) - 1;
      drawAll.middle = true;
    }).catch(() => {});
  }
}