const ffmpeg = require('fluent-ffmpeg')
const uuid = require('node-uuid')
const http = require('http');
const child_process = require('child_process');

/**
 * 混音处理
 */
exports.main = function ({ recordUrl, bgUrlId, startTime, durationTime }) {
    return new Promise((resolve, reject) => {
        const _uuid = uuid.v1().replace(/-/g, '') // 去掉
        const webAudioRoot = './web/public/audio/'
        const outputRoot = 'output'
        const outputFile = webAudioRoot + _uuid + '.mp3'

        http.get('http://111.230.161.3:3000/song/url?id=' + bgUrlId, function (res) {
            res.setEncoding('utf8');
            let data = ''
            res.on('data', function (chun) {
                data += chun
            })
            res.on('end', function () {
                const bgUrl = JSON.parse(data).data[0].url
                const bgMusicSpleeterFile = webAudioRoot + outputRoot + '/' + _uuid + '/accompaniment.mp3'

                //处理背景音乐，分理出伴奏

                handleBgUrl(bgUrl, outputFile, startTime, durationTime)
                    .then(
                        () => {
                            execSpleeter(_uuid + '.mp3', 'output')
                                .then(() => {
                                    ffmpegMix(bgMusicSpleeterFile, recordUrl, outputFile)
                                        .then(() => resolve(_uuid))
                                        .catch(reject)
                                })
                                .catch(reject)
                        })
                    .catch(reject)
            })
        })


    })
}

// 处理背景音乐---裁剪
function handleBgUrl(bgUrl, bgFile, startTime, durationTime) {
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(bgUrl)
            .seekInput(startTime)
            .duration(durationTime)
            .on('start', function (commandLine) {
                console.log('Spawned Ffmpeg with command: ' + commandLine);
            })
            .on('error', function (err, stdout, stderr) {
                console.log(err)
                reject(err)
            })
            .on('end', function (stdout, stderr) {
                resolve()
            })
            .save(bgFile)
    })
}

// 处理背景音乐--- 分离伴奏
function execSpleeter(file, outputFileRoot) {
    return new Promise((resolve, reject) => {
        const execPath = 'python -m spleeter separate -c mp3 -i ' + file + ' -p spleeter:2stems -o ' + outputFileRoot
        console.log(execPath)
        const t = child_process.exec(
            execPath,
            { cwd: './web/public/audio', encoding: "utf-8" },
            function (error, stdout, stderr) {
                resolve()
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
            }
        )




    })

}


function ffmpegMix(bgUrl, recordUrl, outputFile) {
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(bgUrl)
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
            .on('error', function (err, stdout, stderr) {
                console.log(err)
                reject(err)
            })
            .on('end', function (stdout, stderr) {
                resolve()
            })
            .output(outputFile)
            .outputOption('-y')
            .run()
    })
}
