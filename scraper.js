const cheerio = require('cheerio')
const request = require('request')


const getHTML = () => {
    const siteLinks = []
    request('https://en.wikipedia.org/wiki/Art', (err, res, html) => {
        if(err) console.log('Error:: ', err.message)
        if(res.statusCode == 200) {
            const $ = cheerio.load(html)

            const content = $('#content')
            console.log(content.html())
            // console.log(content.text())
        }
    })

}

getHTML()