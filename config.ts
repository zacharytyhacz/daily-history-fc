import dotenv from 'dotenv-safe'

export default () => {
    dotenv.config({
        example: './.env.example'
    })

    return {
        NODE_ENV: process.env.NODE_ENV,
        PORT: Number(process.env.PORT),
        SIGNER_UUID: process.env.SIGNER_UUID,
        NEYNAR_API_KEY: process.env.NEYNAR_API_KEY
    }
}
