const ffmpeg = require('fluent-ffmpeg')
const uuid = require('node-uuid')
/**
 * 混音处理
 */
exports.main = function ({ recordUrl, bgUrl, startTime, durationTime }) {
    const _uuid = uuid.v1()
    const audioMixinngFile = './audioMixing/' + _uuid + '.mp3'

    console.log(recordUrl, bgUrl, startTime, durationTime)
    ffmpeg()
        .input(bgUrl)
        .seekInput(startTime)
        .duration(durationTime)
        .input(recordUrl)
        .complexFilter([{
            filter: 'amix',
            options: {
                duration: 'shortest',
                inputs: 2
            },
        }])
        .on('start', function (commandLine) {
            console.log('Spawned Ffmpeg with command: ' + commandLine);
        })
        .on('codecData', function (data) {
            console.log('Input is ' + data.audio + ' audio ');
        })
        .on('progress', function (progress) {
            console.log('Processing: ' + progress.percent + '% done');
        })
        .on('error', function (err, stdout, stderr) {
            console.log('Cannot process video: ' + err.message);
        })
        .on('end', function (stdout, stderr) {
            console.log('Transcoding succeeded!');
        })
        .save(audioMixinngFile)


    return _uuid



}