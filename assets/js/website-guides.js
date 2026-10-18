// A user starts every recording explicitly; keep concurrent recordings apart.
document.addEventListener('play',function(event){
  if(!event.target.matches?.('audio,video'))return;
  var selector=event.target.closest('[data-website-guide]')?'audio,video':'[data-website-guide] audio,[data-website-guide] video';
  document.querySelectorAll(selector).forEach(function(media){if(media!==event.target&&!media.paused)media.pause();});
},true);
