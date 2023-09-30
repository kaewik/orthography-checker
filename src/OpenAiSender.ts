import { Transform } from 'stream'

export class OpenAiSender extends Transform {
    constructor(model: string, openAiKey: string, options = {}) {
        super(options);
    }

    public _transform(chunk, encoding, callback) {
        callback()
    }
}
