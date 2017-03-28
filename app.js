const fs = require('fs')
const createTextVersion = require("textversionjs")

let readable = fs.createReadStream('./03.warc')
let tmpData = '' //上一次剩下的渣渣
const SEARCH = 'WARC/0.18' //用來定位的字串，WARC中每個網頁資料都會以這個開頭(大概w)

let i = 0 //拿來計算網頁數量
let j = 0

readable.on('data', (chunk) => { //不全部讀取到記憶體而是一部分一部分
    let nowData = tmpData + chunk.toString('utf8') //渣渣+這次讀取的部分
    if(nowData.indexOf(SEARCH) > -1) { 
        while(nowData.indexOf(SEARCH) > -1) {
            i++ //找到就++
            //這裡加入parse html的東西，想法是先利用<html>與</html>定位，再用cheerio套件處理

            //因為加上了上次的渣渣，所以nowData開頭一定是'WARC/0.18'下一個字元，然後到下一個找到的'WARC/0.18'一定就是一個entry
            processHtml(nowData.substring(0, nowData.indexOf(SEARCH)))
            //切掉上一個找到的目標，再找一次，因為一個部份可能包含很多個網頁
            nowData = nowData.substring(nowData.indexOf(SEARCH) + SEARCH.length, nowData.length)
        }
        //如果這個chunk中有找到目標字，就存渣渣就好了
        tmpData = nowData
    } else {
        //如果這個chunk中有找到目標字，因為一個網頁可能跨好幾個chunk，所以一直++
        tmpData += nowData
    }
});

readable.on('close', () => console.log(i + '  ' + j)) //顯示總數

let processHtml = (data) => {
    //對chunks處理
    const TARGET = 'Content-Length:'
    //切字啦
    if(data.indexOf(TARGET) > -1) {
        let whee = data.substring(data.indexOf(TARGET) + TARGET.length, data.length)
        if(whee.indexOf(TARGET) > -1) {
            let actualHTML = whee.substring(whee.indexOf(TARGET) + TARGET.length, whee.length) //其實還有點瑕疵
            let text = createTextVersion(actualHTML) //聽說是能將html轉成文字的套件
            fs.writeFile('./wat/' + i + '.txt', text.split(' ').join('\n'), (err) => { //用空白分開再換行
                if (err) throw err;
                console.log('It\'s saved!');
            });
            j++
        }
    }
    if(j > 50) process.exit() //先輸出50個，全部會爆炸
}

/*
格式大概是這樣:
WARC/0.18
...
不重要的拉基
...
<html>
實際網頁內容
</html>

WARC/0.18
....(上面loop)
*/