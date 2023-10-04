import { Transform } from 'stream'

export class SentenceGenerator extends Transform {

    constructor(options = {}) {
        super({ objectMode: true, ...options });
    }

    public _transform(chunk: Buffer, encoding: string, callback: Function): void {
        const textChunk = chunk.toString()
        const regexToMatchSentences = /\p{Lu}[^.!?]*[.!?]/g
        const sentencesInText = textChunk.match(textChunk)
        for (const sentence of sentencesInText) {
            this.push(sentence)
        }
        callback()
    }
}
