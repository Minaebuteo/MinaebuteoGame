function booting(delay) {
  if(isPowered)
    return;
  if(isAssetLoaded)
    powerButton.click();
  delay += delayConstant;
  setTimeout(booting, delay, delay);
}

booting(0);