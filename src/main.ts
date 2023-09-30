import { open } from 'node:fs/promises'
import { pipeline } from 'node:stream/promises'

import { TokenLimiter } from './TokenLimiter.js'
import { OpenAiSender } from './OpenAiSender.js'
import { parseArgs } from './CommandLineParser.js'

const GPT_MODEL = 'gpt-3.5-turbo'

async function main(): Promise<void> {
    const args = await parseArgs()
    const fileHandle = await open(args.textFile)
    const fileStream = fileHandle.createReadStream({
        encoding: 'utf-8'
    })
    const tokenLimiter = new TokenLimiter(GPT_MODEL)
    const openAiSender = new OpenAiSender(GPT_MODEL, args.openAiKey)
    await pipeline(
        fileStream,
        tokenLimiter,
        openAiSender
    )
    return
}

main()
