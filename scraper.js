
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

const cheerio = require('cheerio')
const rp = require('request-promise')
const fs = require('fs').promises

const testURL = 'https://en.wikipedia.org'
const testQuery = '/wiki/Programming'

const numberOfLinks = 200

// TODO TODAY:

// 1. Write LinkInception to file !
// 2. Trim the SPACES !
// 3. Fix client, search-field
// 

const dynamicSearchQuery = (testQuery) => {
    return {
        uri: `${testURL}${testQuery}`,
        transform: (body) => {
            return cheerio.load(body)
        }
    }
}



const getRawHTMLBody = async (testQuery) => {
    // console.log(testQuery)
    const options =     await dynamicSearchQuery(testQuery)
    try {
        const $ =       await rp(options)
        return $
    }
    catch (err) {
        console.log('getRawHTML', err.message)
    }
}


const extractLinks = ($) => {
    const setOfLinks = new Set()
    // const content = $('#mw-content-text')
    const content = $('.mw-parser-output')
    
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



const scrapeRawContentFromEachLink = async (setOfLinks, isHTML) => {
    let htmls = ''
    let count = 0
    setOfLinks.forEach(async (query) => {
        try {
            const options = dynamicSearchQuery(query)
            const $ =   await rp(options)

            if(isHTML) {
                htmls = $('#mw-content-text').html()
                await fs.writeFile(`rawHTML${count++}.html`, htmls)
            }
                htmls = $('#mw-content-text').text()
                await fs.writeFile(`rawTEXT${count++}.txt`, htmls)
        } catch (err) {
            console.log('ScrapeRawHTMLFROMEACH', err.message)
        }
    })
}



const startScrape = async (searchQuery) => {
    try {
        let body =          await getRawHTMLBody(searchQuery)
        let setOfLinks =    await extractLinks(body)

        setOfLinks.forEach(async (query, i) => {
            let modifiedQuery =    await query.substring(6, query.length)
            let body =      await getRawHTMLBody(query)

            let cleanContent = body.text().replace(/[^0-9a-z-A-Z ]/g, '')
            // .replace(/\s{2,}/g, ' ')

            let againLinks =    await extractLinks(body)

            await fs.writeFile(`./files/Links/${modifiedQuery}.txt`, againLinks.join(', \n'))
            await fs.writeFile(`./files/Content/${modifiedQuery}.txt`, cleanContent)
        })


        // await fs.writeFile(`r${count++}.txt`, againLinks)
        // await scrapeRawContentFromEachLink(setOfLinks, true)

    } catch(err) {
        console.log('startScraper: ', err.message)
    }
}

startScrape(testQuery)



exports.getRawHTMLBody = getRawHTMLBody
exports.extractLinks = extractLinks
exports.startScrape = startScrape
exports.scrapeRawContentFromEachLink = scrapeRawContentFromEachLink