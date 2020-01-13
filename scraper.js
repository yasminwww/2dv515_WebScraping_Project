'use strict'

const cheerio = require('cheerio')
const rp = require('request-promise')
const fs = require('fs').promises

const initialURL = 'https://en.wikipedia.org/wiki/Art'
const testURL = 'https://en.wikipedia.org'



const getRawHTML = async () => {
    const options = {
            uri: initialURL,
            transform: (body) => {
            return cheerio.load(body)
        }
    }
    try {
        const $ = await rp(options)
        extractLinks($)
        // scrapeRawHTMLFromEachLink($)
        return $
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
        if(setOfLinks.size <= 200) {
            let link = $(element).attr('href')
            if(link !== undefined && link.includes('/wiki/') && !link.includes(':')) {
                setOfLinks.add(link) 
            }
        }
    })
    scrapeRawHTMLFromEachLink(setOfLinks)
    return setOfLinks
}


// FUN: Randomize 200 ?
const scrapeRawHTMLFromEachLink = async (setOfLinks) => {
    let htmls = ''
    let count = 0
    setOfLinks.forEach(async (fragment) => {
        try {
            const options = {
                uri: `${testURL}${fragment}`,
                transform: (body) => {
                    return cheerio.load(body)
                }
            }
            const $ = await rp(options)
            htmls = $('#mw-content-text').html()
        } catch (err) {
            console.log('ScrapeRawHTMLFROMEACH', err.message)
        }
        await fs.writeFile(`rawHTML${count++}.html`, htmls)

    })
}

getRawHTML()
