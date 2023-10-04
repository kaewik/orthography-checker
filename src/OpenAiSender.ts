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

    public async _transform(sentences: string[], encoding: string, callback: Function): Promise<void> {
        const joinedSentences = sentences.join(' ')
        const messages = this.getMessages(joinedSentences)
        const chatCompletion = await this.openAiClient.chat.completions.create({
            messages: messages,
            model: this.model,
            temperature: 0,
        });

        const textCorrections: TextCorrection[] = JSON.parse(chatCompletion.choices[0].message.content)

        for (const textCorrection of textCorrections) {
            this.push(textCorrection)
        }
        callback()
    }

    private getMessages(text: string): OpenAI.Chat.ChatCompletionMessage[] {
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
