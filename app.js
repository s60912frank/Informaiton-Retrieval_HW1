const fs = require('fs')
let readable = fs.createReadStream('./03.warc')
let tmpData = '' //上一次剩下的渣渣
const SEARCH = 'WARC/0.18' //用來定位的字串，WARC中每個網頁資料都會以這個開頭(大概w)

let i = 0 //拿來計算網頁數量

readable.on('data', (chunk) => { //不全部讀取到記憶體而是一部分一部分
    let nowData = tmpData + chunk.toString('utf8') //渣渣+這次讀取的部分
    while(nowData.indexOf(SEARCH) > -1) {
        i++ //找到就++
        //這裡加入parse html的東西，想法是先利用<html>與</html>定位，再用cheerio套件處理

        //切掉上一個找到的目標，再找一次，因為一個部份可能包含很多個網頁
        nowData = nowData.substring(nowData.indexOf(SEARCH) + SEARCH.length, nowData.length)
    }
    
    //剩下的渣渣存起來，因為有可能目標字會被截斷，沒這麼做會少算
    tmpData = nowData
});

readable.on('close', () => console.log(i)) //顯示總數

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