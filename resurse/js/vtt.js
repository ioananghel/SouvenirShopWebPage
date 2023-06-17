var video = document.getElementById('video-vtt');
var playButton = document.getElementById('play-button');

playButton.addEventListener('click', function() {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
     }
});