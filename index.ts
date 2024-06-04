import Express from 'express'
import config from './config'
import { startDailyHistoryPost } from './wiki'

const startServer = async () => {
    const app = Express()

    const { PORT } = config()

    app.use('/', Express.static('./public'))

    app.listen(PORT, () => {
        console.log(`History Farcaster app listening on http://localhost:${PORT}`)
        startDailyHistoryPost()
    })
}

startServer()
