const uuid = require('node-uuid')
const http = require('http');
const child_process = require('child_process');

/**
 * 混音处理
 */
exports.main = function ({ chorusUrl }) {
    return new Promise((resolve, reject) => {
        const _uuid = uuid.v1().replace(/-/g, '') // 去掉
        const webChorusRoot = './web/public/chorus/'
        const outputFile = webChorusRoot + _uuid + '.mp3'
        // 处理合唱
        const execPath = 'ffmpeg -i ' + chorusUrl   + ' -filter_complex "chorus=0.5:0.9:50|60|40:0.4|0.32|0.3:0.25|0.4|0.3:2|2.3|1.3" ' + outputFile
        process(execPath).then(() => {resolve(_uuid)}).catch(() => {reject()})

    })
}



function process(execPath){
    return new Promise((resolve,reject) => {
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
