import { Transform } from 'node:stream'
import { SentenceData } from './SentenceData.type.js'

const TOKEN_PER_MINUTE = 90_000
const ONE_MINUTE = 60_000

export class RateLimiter extends Transform {
    private tokensUsed: number

    constructor(options = {}) {
        super({ objectMode: true, ...options });
        this.tokensUsed = 0
    }

    public _transform(sentenceData: SentenceData, encoding: string, callback: Function): void {
        const count = this.tokensUsed + sentenceData.tokenCount
        if (count >= TOKEN_PER_MINUTE) {
            this.tokensUsed = 0
            setTimeout(() => this.continue(sentenceData, callback), ONE_MINUTE)
        } else {
            this.tokensUsed = count
            this.continue(sentenceData, callback)
        }
    }

    private continue(sentenceData: SentenceData, callback: Function): void {
        this.push(sentenceData.content)
        callback()
    }
}
