import { Transform } from 'node:stream'
import OpenAI from 'openai'
import { TextCorrection } from './TextCorrection.type.js'

export class OpenAiSender extends Transform {
    private readonly openAiClient: OpenAI
    private model: string
    private pendingPromiseCounter: number
    private pendingPromises: any[]

    constructor(model: string, openAiKey: string, options = {}) {
        super({ objectMode: true, ...options });

        this.model = model
        this.openAiClient = new OpenAI({
            apiKey: openAiKey,
        })
        this.pendingPromiseCounter = 0
        this.pendingPromises = []
    }

    public _transform(sentence: string, encoding: string, callback: Function) {
        const messages = this.getMessages(sentence)
        this.pendingPromiseCounter++
        const chatCompletionPromise = this.openAiClient.chat.completions.create({
            messages: messages,
            model: this.model,
            temperature: 0,
        }).then((completion) => {
            this.pendingPromiseCounter--

            const reply = completion.choices[0].message.content
            const textCorrection = reply.length > 0 && JSON.parse(reply)
            this.push(textCorrection)
        }).catch((err) => console.log(err))
        this.pendingPromises.push(chatCompletionPromise)
        callback()
    }

    public _final(done: Function) {
        this.checkIfDone(done)
    }

    private checkIfDone(done: Function) {
        if (this.pendingPromiseCounter === 0) {
            done()
        } else {
            setTimeout(() => this.checkIfDone(done), 30_000)
        }
    }

    private getMessages(text: string): OpenAI.ChatCompletionMessageParam[] {
        const systemMessage = `Du bist ein Experte in deutscher Rechtschreibung und Grammatik.`
        const userMessage = `Deine Aufgabe ist es den Nutzertext auf Grammatik und Rechtschreibung zu prüfen. `
            + `Deine Aufgabe ist es nicht stiliestische Verbesserungen vorzunehmen.`
            + 'Deine Antwort muss im JSON format sein, wobei folgende Felder vorhanden sein müssen: '
            + '"originalSentence" und "correctedSentence".\n\n'
            + `Nutzertext: """${text}"""`

        return [{
            role: 'system',
            content: systemMessage,
        },{
            role: 'user',
            content: userMessage,
        }]
    }
}
