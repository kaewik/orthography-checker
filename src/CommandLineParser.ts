import meowParseArgs from 'meow'

type CommandLineArguments = {
    textFile: string
}

function validateCommandLineArguments(args: CommandLineArguments): Promise<void> {
    const validationErrors = []
    if (args.textFile === '') {
        validationErrors.push(`Expected --text-file to be non empty, got "${args.textFile}"`)
    }
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
