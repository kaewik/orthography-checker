import { open } from 'node:fs/promises'
import { pipeline } from 'node:stream/promises'

import { SentenceGenerator } from './SentenceGenerator.js'
import { TokenLimiter } from './TokenLimiter.js'
import { RateLimiter } from './RateLimiter.js'
import { OpenAiSender } from './OpenAiSender.js'
import { DiffGenerator } from './DiffGenerator.js'
import { DiffPrinter } from './DiffPrinter.js'
import { parseArgs } from './CommandLineParser.js'

const GPT_MODEL = 'gpt-3.5-turbo'

async function main(): Promise<void> {
    const args = await parseArgs()
    const fileHandle = await open(args.textFile)
    const fileStream = fileHandle.createReadStream({
        encoding: 'utf-8'
    })
    const sentenceGenerator = new SentenceGenerator()
    const tokenLimiter = new TokenLimiter(GPT_MODEL)
    const rateLimiter = new RateLimiter()
    const openAiSender = new OpenAiSender(GPT_MODEL, args.openAiKey)
    const diffGenerator = new DiffGenerator()
    const diffPrinter = new DiffPrinter()
    await pipeline(
        fileStream,
        sentenceGenerator,
        tokenLimiter,
        rateLimiter,
        openAiSender,
        diffGenerator,
        diffPrinter
    )
    return
}

main()
