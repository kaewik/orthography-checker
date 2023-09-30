import meowParseArgs from 'meow'
import { open } from 'node:fs/promises'
import { Transform } from 'stream'
import { pipeline } from 'node:stream/promises'
import tiktoken from 'tiktoken-node'

const GPT_MODEL = 'gpt-3.5-turbo'

type CommandLineArguments = {
    textFile: string
}

function validateCommandLineArguments(args: CommandLineArguments): Promise<void> {
    const validationErrors = []
    if (args.textFile === '') {
        validationErrors.push(`Expected --text-file to be non empty, got "${args.textFile}"`)
    }
    if (validationErrors.length > 0) {
        const errorMessage = 'Validation of command line arguments failed!' + validationErrors.reduce(
            (coalescedMessage, validationError) => coalescedMessage + '\r\n\t' + validationError,
            ''
        )
        return Promise.reject(new Error(errorMessage))
    }
}

async function parseArgs(): Promise<CommandLineArguments> {
    const parseResults = await meowParseArgs({
        importMeta: import.meta,
        flags: {
            textFile: {
                type: 'string',
                shortFlag: 'f',
                aliases: ['file'],
                isRequired: true,
            },
        },
        allowUnknownFlags: false,
    })
    const flags = parseResults.flags
    await validateCommandLineArguments(flags)
    return flags
}

class TokenLimiter extends Transform {
    private data: string
    private overflowData: string
    private tokenEncoder: tiktoken.Encoding

    constructor(options) {
        super(options)
        this.tokenEncoder = tiktoken.encodingForModel(GPT_MODEL)
    }

    public _transform(chunk, encoding, callback) {
        this.data += chunk
        const tokenCount = this.getNumberOfTokens(this.data)
        if (tokenCount > 2500) {
            this.pushDataInChunks(this.data)
            this.data = ''
        }
        callback()
    }

    public _flush(callback) {
        this.pushDataInChunks(this.data)
        this.data = ''
        callback()
    }

    private pushDataInChunks(data: string): void {
        const words = this.words(data)
        const middleIdx = Math.ceil(words.length / 2)
        const leftPart = words.slice(0, middleIdx).join(' ')
        const rightPart = words.slice(middleIdx).join(' ')
        this.pushData(leftPart)
        this.pushData(rightPart)
    }

    private words(data: string, maxWordLength = 100): string[] {
        const words = []
        let word = ''
        for (const char of data) {
            if (char === ' ') {
                words.push(word)
                word = ''
            } else if (word.length > maxWordLength) {
                words.push(word)
                word = ''
            } else {
                word += char
            }
        }
        return words
    }

    private pushData(data: string) {
        const tokenCount = this.getNumberOfTokens(data)
        if (tokenCount < 2500)  {
            this.push(data)
        } else {
            this.pushDataInChunks(data)
        }
    }

    private getNumberOfTokens(text: string): number {
        return this.tokenEncoder.encode(text).length
    }
}

class OpenAiSender extends Transform {
    constructor(options) {
        super(options);
    }

    public _transform(chunk, encoding, callback) {
        callback()
    }
}

async function main(): Promise<void> {
    const args = await parseArgs()
    const fileHandle = await open(args.textFile)
    const fileStream = fileHandle.createReadStream({
        encoding: 'utf-8'
    })
    const tokenLimiter = new TokenLimiter({})
    const openAiSender = new OpenAiSender({})
    await pipeline(
        fileStream,
        tokenLimiter,
        openAiSender
    )
    return
}

main()
