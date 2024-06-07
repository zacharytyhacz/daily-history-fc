import { CronJob } from 'cron'
import * as path from 'path'
import Jimp from 'jimp'
import axios from 'axios'
import util from 'util'
import config from './config'

// put on daily cronjob
// come up with cool template image, square.
// figure out how to cast to farcaster on my account
//
export const startDailyHistoryPost = (): CronJob => new CronJob(
    '0 0 14 * * *',
    async () => {
        const { NEYNAR_API_KEY, SIGNER_UUID } = config()

        const today = new Date();
        const month = today.getMonth() + 1
        const day = today.getDate()

        let tries = 0;
        let onThisDayResponse: {
            events: Array<{
                text: string
                year: number
            }>
        }|null = null

        while (!onThisDayResponse) {
            try {
                const wikipediaUrl = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/${month}/${day}`;
                const res = await axios.get(wikipediaUrl)

                if (res.data && res.data.events) {
                    onThisDayResponse = res.data
                    break
                }
            } catch (err) {
                tries += 1
                console.error(`Attempt #1 - Wikipedia request failed, trying again in 3 seconds....`)
                await new Promise((resolve) => setTimeout(resolve, 3000))
            }
        }

        if (!onThisDayResponse) {
            return
        }

        const randomEvent: { text: string, year: number } = onThisDayResponse.events[Math.floor(Math.random() * onThisDayResponse.events.length)];

        const jacquard70 = await Jimp.loadFont(
            path.join(
                process.cwd(),
                'fonts/jacquard70.fnt'
            )
        )

        const jacquard24 = await Jimp.loadFont(
            path.join(
                process.cwd(),
                'fonts/jacquard24.fnt'
            )
        )

        // create image
        const image = await Jimp.read(
            path.join(
                process.cwd(),
                'template.png'
            )
        )

        // get month name
        const monthName = today.toLocaleString('default', { month: 'long' });
        image.print(
            jacquard70,
            28,
            28,
            {
                text: `${monthName} ${day}`,
                alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
                alignmentY: Jimp.VERTICAL_ALIGN_TOP
            },
            435,
            106
        )

        image.print(
            jacquard24,
            28,
            162,
            {
                text: `On this day in ${randomEvent.year}, ${randomEvent.text}`,
                alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
                alignmentY: Jimp.VERTICAL_ALIGN_TOP
            },
            435,
            212
        )

        const formattedMonth = month.toString().padStart(2,'0');
        const formattedDay = day.toString().padStart(2,'0');
        const date = `${formattedMonth}-${formattedDay}`
        const imageName = `${date}.png`;
        image.write(
            path.join(
                process.cwd(),
                'public/',
                imageName
            )
        )

        const postCastUrl = 'https://api.neynar.com/v2/farcaster/cast';
        const options = {
          headers: {
            api_key: NEYNAR_API_KEY
          },
        }

        await axios.post(
            postCastUrl,
            {
                signer_uuid: SIGNER_UUID,
                embeds: [
                    {
                         url: `https://wiki-fc.tyhacz.com/frame/${date}`
                    }
                ]
            },
            options
        )

        console.log(randomEvent.year, util.inspect(randomEvent.text, false, null, true))
    },
    null,
    true
)
