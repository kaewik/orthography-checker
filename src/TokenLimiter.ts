import { Transform } from 'stream'
import tiktoken from 'tiktoken-node'
import { SentenceData } from './SentenceData.type.js'

export class TokenLimiter extends Transform {
    private sentences: SentenceData[]
    private totalTokenCount: number
    private tokenEncoder: tiktoken.Encoding

    constructor(model: string, options = {}) {
        super({ objectMode: true, ...options });
        this.tokenEncoder = tiktoken.encodingForModel(model)
        this.sentences = []
        this.totalTokenCount = 0
    }

    public _transform(sentence: string, encoding: string, callback: Function): void {
        const tokenCount = this.getTockenCount(sentence)
        if (tokenCount <= 2000) {
            this.sentences.push({
                content: sentence,
                tokenCount,
            })
            this.totalTokenCount += tokenCount
        } else {
            process.stderr.write(`Can't check the following sentence, since it is too long:\n${sentence}`);
            console.log()
        }
        if (this.totalTokenCount > 2000) {
            this.pushData()
        }
        callback()
    }

    public _flush(callback: Function) {
        this.pushData()
        callback()
    }

    private pushData() {
        const longSentences = this.sentences.filter((sentenceData) => sentenceData.tokenCount > 1000)
        const shortSentences = this.sentences.filter((sentenceData) => sentenceData.tokenCount <= 1000)
        longSentences.forEach((sentenceData) => this.push([sentenceData]))
        this.push(shortSentences)
        this.sentences = []
        this.totalTokenCount = 0
    }

    private getTockenCount(text: string): number {
        return this.tokenEncoder.encode(text).length
    }
}

