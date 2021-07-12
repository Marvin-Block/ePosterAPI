const { exec } = require('child_process');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');


exports.saveVideo = (file, fileInfo) => {
    // noinspection JSIgnoredPromiseFromCall
    return new Promise(resolve => {
        const videoPath = `${__apiRoot + '/videos/' + fileInfo.videoUUID}.mp4`
        const tempPath = `${__apiRoot + '/temp/' + fileInfo.videoUUID}.mp4`
        // file.mv(`${__apiRoot + '/videos/' + fileInfo.videoUUID}.mp4`);
        file.mv(tempPath).then(() => {
            ffmpeg(tempPath)
                .on('error', function(err, stdout, stderr) {
                    // console.log('Cannot process video: ' + err.message);
                    return resolve({status: 500, message: "Fehler beim Konvertieren.", data: err.message});
                })
                .on('end', function(stdout, stderr) {
                    // console.log('Transcoding succeeded !');
                    return resolve({status: 200});
                })
                .save(videoPath);
        });
    });
} 


exports.removeFile = (videoUUID) => {
    const videoPath = `${__apiRoot + '/videos/' + videoUUID}.mp4`
    const thumbnailPath = `${__apiRoot + '/thumbnails/' + videoUUID}.jpg`
    const imagePath = `${__apiRoot + '/images/' + fs.readdirSync(__apiRoot + '/images/').filter(item => item.startsWith(videoUUID))[0]}`
    if(fs.existsSync(videoPath)) fs.rmSync(videoPath)
    if(fs.existsSync(thumbnailPath)) fs.rmSync(thumbnailPath)
    if(fs.existsSync(imagePath)) fs.rmSync(imagePath)
}

exports.saveThumbnail = (fileInfo) => {
    exec(`ffmpeg -itsoffset -1 -i ${__apiRoot + '/videos/' + fileInfo.videoUUID}.mp4 -vf \"scale=${fileInfo.Width > fileInfo.Height ? '320:-1' : '569:-1'}:flags=lanczos\" -vcodec mjpeg -q:v 10 -vframes 1 -an -f rawvideo ${__apiRoot + '/thumbnails/' + fileInfo.videoUUID}.jpg`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
        }
    })
}


exports.imageToVideo = (file, body) => {
    return new Promise(resolve => {
        const imagePath = `${__apiRoot + '/images/' + body.videoUUID + file.name.substr(file.name.length - 4)}`;
        const videoPath = `${__apiRoot + '/videos/' + body.videoUUID}.mp4`
        file.mv(imagePath).then(() => {
            ffmpeg(imagePath)
                .loop(body.length)
                .format('mp4')
                .videoCodec('libx264')
                .outputOptions([
                    '-pix_fmt yuv420p',
                    '-r 25'
                ])
                .on('start', function(commandLine) {
                    // console.log('Spawned Ffmpeg with command: ' + commandLine);
                })
                .on('error', function(err, stdout, stderr) {
                    // console.log('Cannot process video: ' + err.message);
                    return resolve({status: 500, message: "Fehler beim Konvertieren.", data: err.message});
                })
                .on('end', function(stdout, stderr) {
                    // console.log('Transcoding succeeded !');
                    return resolve({status: 200});
                })
                .save(videoPath);
        }).catch((err) => {
            return resolve({status: 500, message: "Das Bild konnte nicht gespeichert werden.",data: err});
        });
    });
}
