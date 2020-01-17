'use strict'

const cheerio = require('cheerio')
const rp = require('request-promise')
const fs = require('fs').promises

const testQuery = '/wiki/McMaken'
const testURL = 'https://en.wikipedia.org'



const dynamicSearchQuery = (testQuery) => {
    return {
        uri: `${testURL}${testQuery}`,
        transform: async (body) => {
            return await cheerio.load(body)
        }
    }
}

const getRawHTMLBody = async (testQuery) => {
    console.log(testQuery)
    const options = await dynamicSearchQuery(testQuery)
    try {
        const $ = await rp(options)
        return $
    }
    catch (err) {
        console.log('getRawHTML', err.message)
    }
}


const extractLinks = async ($) => {
    const setOfLinks = new Set()
    const content = $('#mw-content-text')
    const linksFoundOnPage = content.find('a')
    
    $(linksFoundOnPage).each((i, element) => {
        if(setOfLinks.size <= 3) {
            let link = $(element).attr('href')
            if(link !== undefined && link.includes('/wiki/') && !link.includes(':')) {
                setOfLinks.add(link)
            }
        }
    })
    return setOfLinks
}


// FUN: Randomize 200 ?
const scrapeRawContentFromEachLink = async (setOfLinks, isHTML) => {
    let htmls = ''
    let count = 0
    setOfLinks.forEach(async (query) => {
        try {
            const options = dynamicSearchQuery(query)
            const $ = await rp(options)

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
    // TODO: skicka med strängar till wiki Searchquery
    try {
        console.log(searchQuery)
        let body = await getRawHTMLBody(searchQuery)

        let setOfLinks = await extractLinks(body)
        let nextlink = await otherFunction(setOfLinks)

        // // await fs.writeFile(`r${count++}.txt`, againLinks)
        // await scrapeRawContentFromEachLink(setOfLinks, true)

    } catch(err) {
        console.log('startScraper: ', err.message)
    }
}
startScrape(testQuery)


const otherFunction = async (setOfLinksInLinks) => {
    try {
        console.log(setOfLinksInLinks)
        
        const arr = []
        setOfLinksInLinks.forEach(async (query) => {
            console.log
            let body = await getRawHTMLBody(query)
    
            let againLinks = await extractLinks(body)
            console.log(againLinks)
        })
        console.log(arr)
        return arr
    } catch (error) {
        console.log('OTHERRRRRRRRRRRRRRRRRRRRRR', error.message)
    }
}


exports.getRawHTMLBody = getRawHTMLBody
exports.extractLinks = extractLinks
exports.scrapeRawContentFromEachLink = scrapeRawContentFromEachLink
exports.startScrape = startScrape