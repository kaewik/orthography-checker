import { Writable } from 'node:stream'
import { diffChars } from 'diff'
import 'colors'

import { TextCorrection } from './TextCorrection.type.js'

export class DiffGenerator extends Writable {

    constructor(options = {}) {
        super({ objectMode: true, ...options });
    }

    public _write(textCorrection: TextCorrection, encoding: string, callback: Function): void {
        if (textCorrection.originalSentence === textCorrection.correctedSentence) {
            callback()
            return
        }
        const diff = diffChars(textCorrection.originalSentence, textCorrection.correctedSentence)
        diff.forEach((part) => {
            const color = part.added ? 'green' :
                part.removed ? 'red' : 'grey';
            process.stderr.write(part.value[color]);
        });
        console.log()
        callback()
    }
}
