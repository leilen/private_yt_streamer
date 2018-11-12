const ytdl = require('ytdl-core');
var FFmpeg = require('fluent-ffmpeg');

function play(url) {
    return new Promise(function (resolve, reject) {
        let stream = null;
        let proc = null;
        let trans = null;

        stream = ytdl(url);

        proc = new FFmpeg({
            source: stream
        });
        try {
            proc.setFfmpegPath(require('@ffmpeg-installer/ffmpeg').path);
        } catch (error) {
            proc.setFfmpegPath('/usr/local/bin/ffmpeg');
        }

        trans = proc.withAudioCodec('libmp3lame').toFormat('mp3');
        resolve(trans);
        
        proc.on('error', function (err){
            // console.log("----test 2");
            // console.log(err);
        });
        proc.on('start', function(commandLine) {
            console.log(`Start : ${url} - ${commandLine}`);
        });
        proc.on('end', function(stdout, stderr) {
            console.log(`Fin : ${url}`);
        });

        stream.on('progress', function (chunk, downloaded, total) {})
        stream.on('info', function (vInfo, vFormat) {
            const videoInfo = vInfo['player_response']['videoDetails'];

            console.log(`Playing ${videoInfo['title']} - ${videoInfo['lengthSeconds']}sec`)

            playStartedTime = new Date().getTime();
        })
    })
}



module.exports.play = play;