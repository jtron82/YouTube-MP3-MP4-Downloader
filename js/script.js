var convertMP4 = document.querySelector('.convert-mp4');
var convertMP3 = document.querySelector('.convert-mp3');
var ytURL = document.querySelector('.yt-url');

convertMP4.addEventListener('click', () => {
    window.location.href = `http://localhost:3000/downloadmp4?URL=${ytURL.value}`;
});

convertMP3.addEventListener('click', () => {
    window.location.href = `http://localhost:3000/downloadmp3?URL=${ytURL.value}`;
});