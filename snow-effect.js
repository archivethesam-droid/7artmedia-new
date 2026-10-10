(function(){
  const layer = document.createElement('div');
  layer.className = 'snow-layer';
  document.body.appendChild(layer);

  const count = 35; // light snow, not dense
  for(let i=0;i<count;i++){
    const flake = document.createElement('span');
    flake.className = 'snowflake';
    flake.textContent = Math.random() > .5 ? '❄' : '•';
    flake.style.left = Math.random()*100 + 'vw';
    flake.style.fontSize = (6 + Math.random()*10) + 'px';
    flake.style.animationDuration = (8 + Math.random()*12) + 's';
    flake.style.animationDelay = (-Math.random()*15) + 's';
    flake.style.opacity = (.25 + Math.random()*.55).toFixed(2);
    layer.appendChild(flake);
  }
})();
