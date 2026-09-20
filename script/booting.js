function booting(delay) {
  if(isPowered)
    return;
  if(isAssetLoaded)
    powerButton.click();
  else {
    delay += delayConstant;
    setTimeout(booting, delay, delay);
  }
}

booting(0);