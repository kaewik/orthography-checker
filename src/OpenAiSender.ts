import { Transform } from 'stream'

export class OpenAiSender extends Transform {
    constructor(options = {}) {
        super(options);
    }

    public _transform(chunk, encoding, callback) {
        callback()
    }
}
