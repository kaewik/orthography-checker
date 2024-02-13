import { Transform } from 'node:stream'
import { diffChars } from 'diff'
import 'colors'

import { TextCorrection } from './TextCorrection.type.js'

export class DiffGenerator extends Transform {

    constructor(options = {}) {
        super({ objectMode: true, ...options });
    }

    public _transform(textCorrection: TextCorrection, encoding: string, callback: Function): void {
        if (textCorrection.originalSentence === textCorrection.correctedSentence) {
            callback()
            return
        }
        const diff = diffChars(textCorrection.originalSentence, textCorrection.correctedSentence)
        this.push(diff)
        callback()
    }
}
