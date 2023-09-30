import { Transform } from 'stream'
import OpenAI from 'openai'

export class OpenAiSender extends Transform {
    private readonly openAiClient: OpenAI
    private model: string

    constructor(model: string, openAiKey: string, options = {}) {
        super(options);

        this.model = model
        this.openAiClient = new OpenAI({
            apiKey: openAiKey,
        })
    }

    public async _transform(chunk: Buffer, encoding: string, callback: Function) {
        console.log(`${chunk}`)
        const messages = this.getMessages(`${chunk}`)
        const chatCompletion = await this.openAiClient.chat.completions.create({
            messages: messages,
            model: this.model,
        });

        // TODO: RateLimitation with CompletionUsage

        console.log(chatCompletion.choices[0].message.content)
        callback()
    }

    private getMessages(text: string): OpenAI.Chat.ChatCompletionMessage[] {
        return [{
            role: 'system',
            content: `You are an expert in german orthography.
                Your task is to correct the spelling and grammar of the user input.
                Only print the corrected sentences and seperate them by newlines.`
        },{
            role: 'user',
            content: `${text}`,
        }]
    }
}
