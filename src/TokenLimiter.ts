import { Transform } from 'node:stream'
import tiktoken from 'tiktoken-node'
import { SentenceData } from './SentenceData.type.js'

const TOKEN_LIMIT = 500

export class TokenLimiter extends Transform {
    private readonly tokenEncoder: tiktoken.Encoding

    constructor(model: string, options = {}) {
        super({ objectMode: true, ...options });
        this.tokenEncoder = tiktoken.encodingForModel(model)
    }

    public _transform(sentence: string, encoding: string, callback: Function): void {
        const tokenCount = this.getTockenCount(sentence)
        if (tokenCount <= TOKEN_LIMIT) {
            this.push({
                content: sentence,
                tokenCount,
            })
        } else {
            process.stderr.write(`Can't check the following sentence, since it is too long:\n${sentence}`);
            console.log()
        }
        callback()
    }

    private getTockenCount(text: string): number {
        return this.tokenEncoder.encode(text).length
    }
}

