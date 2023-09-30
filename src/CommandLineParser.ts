import meowParseArgs from 'meow'

type CommandLineArguments = {
    openAiKey: string
    textFile: string
}

function validateTextFile(args: CommandLineArguments) : string[] {
    return args.textFile === '' ? [`Expected --text-file to be non empty!`] : []
}

function validateOpenAiKey(args: CommandLineArguments) : string[] {
    const errors = []
    if (args.openAiKey === '') {
        errors.push(`Expected --open-ai-key or env variable OPEN_AI_KEY to be non empty!`)
    }
    return errors
}

function validateCommandLineArguments(args: CommandLineArguments): Promise<void> {
    const validationErrors = validateTextFile(args).concat(validateOpenAiKey(args))

    if (validationErrors.length > 0) {
        const errorMessage = 'Validation of command line arguments failed!' + validationErrors.reduce(
            (coalescedMessage, validationError) => coalescedMessage + '\r\n\t' + validationError,
            ''
        )
        return Promise.reject(new Error(errorMessage))
    }
}

export async function parseArgs(): Promise<CommandLineArguments> {
    const parseResults = await meowParseArgs({
        importMeta: import.meta,
        flags: {
            openAiKey: {
                type: 'string',
                shortFlag: 'k',
                aliases: ['key'],
                default: process.env.OPEN_AI_KEY ?? '',
            },
            textFile: {
                type: 'string',
                shortFlag: 'f',
                aliases: ['file'],
                isRequired: true,
            },
        },
        allowUnknownFlags: false,
    })
    const flags = parseResults.flags
    await validateCommandLineArguments(flags)
    return flags
}
