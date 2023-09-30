import { Transform } from 'stream'
import tiktoken from 'tiktoken-node'

export class TokenLimiter extends Transform {
    private data: string
    private overflowData: string
    private tokenEncoder: tiktoken.Encoding

    constructor(model: string, options = {}) {
        super(options)
        this.tokenEncoder = tiktoken.encodingForModel(model)
        this.data = ''
    }

    public _transform(chunk: Buffer, encoding: string, callback: Function): void {
        this.data += chunk
        const tokenCount = this.getNumberOfTokens(this.data)
        if (tokenCount > 2000) {
            this.pushData(this.data)
            this.data = ''
        }
        callback()
    }

    public _flush(callback: Function) {
        this.pushData(this.data)
        this.data = ''
        callback()
    }

    private pushDataInChunks(data: string): void {
        const middleIdx = Math.ceil(data.length / 2)
        const endOfSentenceIdx = data.indexOf('.', middleIdx)
        const leftPart = data.substring(0, endOfSentenceIdx + 1)
        const rightPart = data.substring(endOfSentenceIdx + 2)
        this.pushData(leftPart)
        this.pushData(rightPart)
    }

    private pushData(data: string) {
        const tokenCount = this.getNumberOfTokens(data)
        if (tokenCount < 2500)  {
            this.push(data)
        } else {
            this.pushDataInChunks(data)
        }
    }

    private getNumberOfTokens(text: string): number {
        return this.tokenEncoder.encode(text).length
    }
}

