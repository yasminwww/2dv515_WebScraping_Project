const express = require('express')
const {startScraping: startScraping} = require('./scraper.js')

const app = express()

app.get('/:query', async (req, res) => {
    const searchQuery = req.params.query

    const result = await startScraping(searchQuery)
    res.send(result)
  })


app.listen(3000, () =>
    console.log('Example app listening on port 3000!'),
)
