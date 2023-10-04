import { Transform } from 'stream'
import { SentenceData } from './SentenceData.type.js'

const TOKEN_PER_MINUTE = 90_000
const ONE_MINUTE = 60

export class RateLimiter extends Transform {
    private tokensUsed: number

    constructor(options = {}) {
        super({ objectMode: true, ...options });
    }

    public _transform(sentencesData: SentenceData[], encoding: string, callback: Function): void {
        const totalTokenCount = this.getTotalTokenCount(sentencesData)
        const count = this.tokensUsed + totalTokenCount
        if (count >= TOKEN_PER_MINUTE) {
            this.tokensUsed = 0
            setTimeout(() => this.continue(sentencesData, callback), ONE_MINUTE)
        } else {
            this.tokensUsed += totalTokenCount
            this.continue(sentencesData, callback)
        }
    }

    private getTotalTokenCount(sentencesData: SentenceData[]): number {
        const counting = (total, summand) => total + summand
        const tokenCounts = sentencesData.map((sentenceData) => sentenceData.tokenCount)
        return tokenCounts.reduce(counting, 0)
    }

    private continue(sentencesData: SentenceData[], callback: Function): void {
        const sentences = sentencesData.map((sentenceData) => sentenceData.content)
        this.push(sentences)
        callback()
    }
}
