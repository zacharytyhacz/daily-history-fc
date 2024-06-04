import Express from 'express'
import config from './config'
import { startDailyHistoryPost } from './wiki'

const startServer = async () => {
    const app = Express()

    const { PORT } = config()

    app.use('/images', Express.static('public'))

    app.use('/frame/:date', (req, res) => {
        const { date } = req.params
        const imageUrl = `https://wiki-fc.tyhacz.com/images/${date}.png`
        // serve date image from public folder
        res.contentType('text/html')
        res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charSet="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>On this day...</title>
    <meta name="description" content="On this day...">
    <meta property="og:title" content="Intori">
    <meta property="og:image" content="${imageUrl}">
    <meta property="fc:frame" content="vNext">
    <meta property="fc:frame:image" content="${imageUrl}">
    <meta property="fc:frame:image:aspect_ratio" content="1:1">
    <meta name="fc:frame:button:1" content="View Github">
    <meta name="fc:frame:button:1:action" content="link">
    <meta name="fc:frame:button:1:target" content="https://github.com/zacharytyhacz/daily-history-fc">
</head>
<body>
bruh
</body>
</html>
`)
    })

    app.listen(PORT, () => {
        console.log(`History Farcaster app listening on http://localhost:${PORT}`)
        startDailyHistoryPost()
    })
}

startServer()
