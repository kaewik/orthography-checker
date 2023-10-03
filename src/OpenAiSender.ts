import { Transform } from 'stream'
import OpenAI from 'openai'
import { TextCorrection } from './TextCorrection.type.js'

export class OpenAiSender extends Transform {
    private readonly openAiClient: OpenAI
    private model: string

    constructor(model: string, openAiKey: string, options = {}) {
        super({ objectMode: true, ...options });

        this.model = model
        this.openAiClient = new OpenAI({
            apiKey: openAiKey,
        })
    }

    public async _transform(chunk: Buffer, encoding: string, callback: Function): Promise<void> {
        const textChunk = `${chunk}`
        const messages = this.getMessages(textChunk)
        const chatCompletion = await this.openAiClient.chat.completions.create({
            messages: messages,
            model: this.model,
            temperature: 0,
        });

        // TODO: RateLimitation with CompletionUsage
        const textCorrections: TextCorrection[] = JSON.parse(chatCompletion.choices[0].message.content)

        for (const textCorrection of textCorrections) {
            this.push(textCorrection)
        }
        callback()
    }

    private getMessages(text: string): OpenAI.Chat.ChatCompletionMessage[] {
        // TODO: make sure system content doesn't exceed token limit
        return [{
            role: 'system',
            content: `You are an expert in german orthography.
                Your task is to correct the spelling and grammar of the user input.
                Only provide the corrected sentences.
                Do not include any explanations.
                Only provide a  RFC8259 compliant JSON response following this format without deviation.
                [{
                    "incorrectSentence": "Ich bin so kluk.",
                    "correctedSentence": "Ich bin so klug."
                }]`
        },{
            role: 'user',
            content: `${text}`,
        }]
    }
}
