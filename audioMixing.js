
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
        const outputFile = webAudioRoot + _uuid + '.mp3'
        const accompanyFile = webAudioRoot + _uuid + 'accompany.mp3'
        const tempFile = webAudioRoot + _uuid + 'temp.mp3'
        // 从网易云服务器下载文件
        http.get('http://localhost:3000/song/url?id=' + bgUrlId, function (res) {
            res.setEncoding('utf8');
            let data = ''
            res.on('data', function (chun) {
                data += chun
            })
            res.on('end', function () {
                const musicUri = JSON.parse(data).data[0].url
                // 处理伴奏
                const command_1 = 'ffmpeg -i '+ musicUri +' -ss '+startTime + ' -t ' + durationTime + ' -af pan="stereo|c0=c0|c1=-1*c1" -ac 1 -y ' + accompanyFile;
                const command_2 = 'ffmpeg -i ' + recordUrl + ' -i ' + accompanyFile  + ' -filter_complex "[0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=mono,volume=2.0[a0],aecho=0.8:0.88:60:0.4; [1:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,volume=1.5[a1]; [a0][a1]amerge=inputs=2[aout] " -map "[aout]" -ac 2  -y ' + tempFile
                const command_3 = 'ffmpeg -i ' + tempFile + ' -filter_complex "aecho=0.8:0.88:60:0.4" ' + outputFile;
                const execCommand = command_1 + ' && ' + command_2 + ' && ' + command_3
                process(execCommand).then(()=>{
                    // 混音合成
                    resolve(_uuid)
                }).catch(()=>{reject()})
            })
        })

    })
}



function process(execPath){
 
    return new Promise((resolve,reject) => {
           console.log(execPath)
        child_process.exec(
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
    })
}
