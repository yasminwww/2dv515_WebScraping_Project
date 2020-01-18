const cheerio = require('cheerio')
const rp = require('request-promise')
const fs = require('fs').promises

const testURL = 'https://en.wikipedia.org'
const testQuery = '/wiki/Programming'

const numberOfLinks = 200


/** 
 *  E
        Scrape and store raw HTML for at least 200 pages   - V
*  C-D	
        Parse the raw HTML files to generate a dataset similar to the Wikipedia dataset from Assignment 3   - V
        For each article, the dataset shall contain a file with all words in the article and another file with all outgoing links in the article
*  A-B	
        Use the dataset with your search engine from Assignment 3
        Use both content-based ranking and PageRank to rank search results
 
 */


const dynamicSearchQuery = (testQuery) => {
    return {
        uri: `${testURL}${testQuery}`,
        transform: (body) => {
            return cheerio.load(body)
        }
    }
}


const requestHTMLBody = async (testQuery) => {
    const options =     await dynamicSearchQuery(testQuery)
    try {
        return await rp(options)
    }
    catch (err) {
        console.log('getRawHTML', err.message)
    }
}



const extractLinks = ($) => {
    const setOfLinks = new Set()
    const content = $('#mw-content-text')
    const linksFoundOnPage = content.find('a')

    $(linksFoundOnPage).each((i, element) => {
        if(setOfLinks.size <= numberOfLinks) {
            let link = $(element).attr('href')
            if(link !== undefined && link.includes('/wiki/') && !link.includes(':')) {
                setOfLinks.add(link)
            }
        }
    })
    return [...setOfLinks] 
}



const startScraping = async (searchQuery) => {
    try {
        let body =          await requestHTMLBody(searchQuery)
        let setOfLinks =    await extractLinks(body)

        setOfLinks.forEach(async (query, i) => {
            let modifiedQuery =     await query.substring(6, query.length)
            let body =              await requestHTMLBody(query)
            let cleanContent =      body.text().replace(/[^0-9a-z-A-Z ]/g, '')
            let linksInsideLinks =  await extractLinks(body)

            await fs.writeFile(`./files/Links/${modifiedQuery}.txt`, linksInsideLinks.join(', \n'))
            await fs.writeFile(`./files/Content/${modifiedQuery}.txt`, cleanContent)
        })

    } catch(err) {
        console.log('startScraper: ', err.message)
    }
}

startScraping(testQuery)


exports.getRawHTMLBody = requestHTMLBody
exports.extractLinks = extractLinks
exports.startScraping = startScraping
