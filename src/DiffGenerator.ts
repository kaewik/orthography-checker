import { Transform } from 'stream'
import { diffChars } from 'diff'
import 'colors'

import { TextCorrection } from './TextCorrection.type.js'

export class DiffGenerator extends Transform {

    constructor(options = {}) {
        super({ objectMode: true, ...options });
    }

    public _transform(textCorrection: TextCorrection, encoding: string, callback: Function): void {
        const diff = diffChars(textCorrection.incorrectSentence, textCorrection.correctedSentence)
        diff.forEach((part) => {
            const color = part.added ? 'green' :
                part.removed ? 'red' : 'grey';
            process.stderr.write(part.value[color]);
        });
        console.log()
        callback()
    }
}
