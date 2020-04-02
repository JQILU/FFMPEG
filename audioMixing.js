const ffmpeg = require('fluent-ffmpeg')
const uuid = require('node-uuid')
const http = require('http');
const child_process = require('child_process');
const fs = require('fs')
const request = require('request');

/**
 * 混音处理
 */
exports.mixAudio = function ({ recordUrl, bgUrlId, startTime, durationTime }) {
    return new Promise((resolve, reject) => {
        const _uuid = uuid.v1().replace(/-/g, '') // 去掉
        const webAudioRoot = './web/public/audio/'
        const outputFile = webAudioRoot + _uuid + '.mp3'
        const accompanyFile = webAudioRoot + bgUrlId + '/accompany.mp3'

        const execPath = 'ffmpeg -i ' + recordUrl + ' -i ' + accompanyFile + ' -ss ' + startTime + ' -t '+ durationTime  + ' -filter_complex "[0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,volume=0.8[a0]; [1:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,volume=1.2[a1]; [a0][a1]amerge,pan=stereo|FL=FC+0.30*FL+0.30*BL|FR=FC+0.30*FR+0.30*BR [aout]" -map "[aout]" -ac 2 -y '+ outputFile;

        console.log(execPath)
        const t = child_process.exec(
            execPath,
            {  encoding: "utf-8" },
            function (error, stdout, stderr) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if(!error){
                    resolve(_uuid)
                }else{
                    reject()
                }
               
            }
        )
    })
}





/**
 * 在服务器生成音乐原声文件和伴奏文件
 * @param {} musicId mp3 文件的唯一id
 * 
 */
exports.generateMusic = function ({musicId}){
    // 音乐文件夹在服务器的地址
    const musicFileDir = './web/public/audio/' + musicId ;
    const musicFile = musicFileDir + '/music.mp3';
    const accompanyFile = musicFileDir +'/accompany.mp3';

    return new Promise((resolve,reject) => {
        fs.exists(musicFileDir, function(exists){
            if(exists){
                // 服务器已经生成过了，直接返回
                resolve()
            }else{
                // 从网易云服务器下载文件
                http.get('http://localhost:3000/song/url?id=' + musicId, function (res) {
                    res.setEncoding('utf8');
                    let data = ''
                    res.on('data', function (chun) {
                        data += chun
                    })
                    res.on('end', function () {
                        const musicUri = JSON.parse(data).data[0].url
                        // 下载原音乐文件
                        downloadFile(musicUri,musicFile).then(function(){
                            // 生成伴奏文件
                            const execPath = 'ffmpeg -i '+ musicFile +' -af pan="stereo|c0=c0|c1=-1*c1" -ac '+ accompanyFile;
                            console.log(execPath)
                            const t = child_process.exec(
                                execPath,
                                {  encoding: "utf-8" },
                                function (error, stdout, stderr) {
                                    console.log('stdout: ' + stdout);
                                    console.log('stderr: ' + stderr);
                                    if(!error){
                                        resolve(musicId)
                                    }else{
                                        reject(musicId)
                                    }
                                }
                            )
                        })        
                    })
                })
                //创建文件夹
            }
        })
    })
}

function downloadFile(uri,filename){
    return new Promise((resolve,reject) => {
        const stream = fs.createWriteStream(filename)
        request(uri)
            .pipe(stream)
            .on('close',resolve)
    })
}
