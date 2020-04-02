const ffmpeg = require('fluent-ffmpeg')
const uuid = require('node-uuid')
const http = require('http');
const child_process = require('child_process');
const fs = require('fs')
/**
 * 混音处理
 */
exports.main = function ({ recordUrl, bgUrlId, startTime, durationTime }) {
    return new Promise((resolve, reject) => {
        const _uuid = uuid.v1().replace(/-/g, '') // 去掉
        const webAudioRoot = './web/public/audio/'
        const outputRoot = 'output'
        const outputFile = webAudioRoot + _uuid + '.mp3'

        http.get('http://localhost:3000/song/url?id=' + bgUrlId, function (res) {
            res.setEncoding('utf8');
            let data = ''
            res.on('data', function (chun) {
                data += chun
            })
            res.on('end', function () {
                const bgUrl = JSON.parse(data).data[0].url
                const bgMusicSpleeterFile = webAudioRoot + outputRoot + '/' + _uuid + '/accompaniment.wav'

                //处理背景音乐，分理出伴奏

                handleBgUrl(bgUrl, outputFile, startTime, durationTime)
                    .then(
                        () => {
                            execSpleeter(_uuid + '.mp3', outputRoot, _uuid)
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
            .seek(startTime)
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
function execSpleeter(file, outputFileRoot, uuid) {
    return new Promise((resolve, reject) => {
        const dir = './web/public/audio/' + outputFileRoot + '/' + uuid
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        const execPath = 'python -m spleeter separate  -i ' + file + ' -p spleeter:2stems -o ' + outputFileRoot
        console.log(execPath)
        const t = child_process.exec(
            execPath,
            { cwd: './web/public/audio', encoding: "utf-8" },
            function (error, stdout, stderr) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if(!error){
                    resolve()
                }else{
                    reject()
                }
               
            }
        )
    })

}


function ffmpegMix(bgUrl, recordUrl, outputFile) {
    return new Promise((resolve, reject) => {
        const execPath = 'ffmpeg -i '+recordUrl+' -i ' +bgUrl+ ' -filter_complex "[0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,volume=0.8[a0]; [1:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,volume=1.2[a1]; [a0][a1]amerge,pan=stereo|FL=FC+0.30*FL+0.30*BL|FR=FC+0.30*FR+0.30*BR [aout]" -map "[aout]" -ac 2 -y '+outputFile;
        console.log(execPath)
        const t = child_process.exec(
            execPath,
            {  encoding: "utf-8" },
            function (error, stdout, stderr) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if(!error){
                    resolve()
                }else{
                    reject()
                }
               
            }
        )

        // const execPath = 'python -m spleeter separate  -i ' + file + ' -p spleeter:2stems -o ' + outputFileRoot
        // console.log(execPath)
        // const t = child_process.exec(
        //     execPath,
        //     { cwd: './web/public/audio', encoding: "utf-8" },
        //     function (error, stdout, stderr) {
        //         resolve()
        //         console.log('stdout: ' + stdout);
        //         console.log('stderr: ' + stderr);
        //     }
        // )

    })
}
