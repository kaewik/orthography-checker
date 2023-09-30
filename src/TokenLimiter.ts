import { Transform } from 'stream'
import tiktoken from 'tiktoken-node'

export class TokenLimiter extends Transform {
    private data: string
    private overflowData: string
    private tokenEncoder: tiktoken.Encoding

    constructor(model: string, options = {}) {
        super(options)
        this.tokenEncoder = tiktoken.encodingForModel(model)
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

