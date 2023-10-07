import { Transform } from 'node:stream'

export class SentenceGenerator extends Transform {

    constructor(options = {}) {
        super({ objectMode: true, ...options });
    }

    public _transform(chunk: Buffer, encoding: string, callback: Function): void {
        const textChunk = chunk.toString()
        const regexToMatchSentences = /(?<=[.!?])\s*(?=[A-ZÄÖÜ])/g
        const sentencesInText = textChunk.split(regexToMatchSentences)
        if (sentencesInText) {
            for (const sentence of sentencesInText) {
                this.push(sentence)
            }
        }
        callback()
    }
}
