const ffmpeg = require('fluent-ffmpeg')
const uuid = require('node-uuid')
var http = require('http');

/**
 * 混音处理
 */
exports.main = function ({ recordUrl, bgUrlId, startTime, durationTime }) {
    return new Promise((resolve, reject) => {
        const _uuid = uuid.v1()

        http.get('http://111.230.161.3:3000/song/url?id=' + bgUrlId, function (res) {
            res.setEncoding('utf8');
            let data = ''
            res.on('data', function (chun) {
                data += chun
            })
            res.on('end', function () {
                const bgUrl = JSON.parse(data).data[0].url
                const audioMixinngFile = './web/public/audio/' + _uuid + '.mp3'
                console.log(bgUrl)
                ffmpeg()
                    .input(bgUrl)
                    .seekInput(startTime)
                    .duration(durationTime)
                    .input(recordUrl)
                    .inputOptions("-af 'volume=0.3'")
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
                        console.log(err)
                        reject(err)
                    })
                    .on('end', function (stdout, stderr) {
                        resolve(_uuid)
                    })
                    .save(audioMixinngFile)

            })
        })


    })
}

