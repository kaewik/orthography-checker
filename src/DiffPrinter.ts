import { Writable } from 'node:stream'
import { Change } from 'diff'
import 'colors'

import { TextCorrection } from './TextCorrection.type.js'

export class DiffPrinter extends Writable {

    constructor(options = {}) {
        super({ objectMode: true, ...options });
    }

    public _write(diffs: Change[], encoding: string, callback: Function): void {
        diffs.forEach((part) => {
            const color = part.added ? 'green' :
                part.removed ? 'red' : 'grey';
            process.stderr.write(part.value[color]);
        });
        console.log()
        callback()
    }
}
