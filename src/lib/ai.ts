import {IState} from "../types.dt";
import Anthropic from '@anthropic-ai/sdk';
import { logToMarkdown } from "./agent";
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

/*
 * BASIC Anthropic Completion function
 */
export const completion = async <CompletionType = string>(state: IState): Promise<CompletionType> => {

    const thePrompt = "System Prompt:\n" + state.systemPrompt + "\n\nMessages:\n" + state.messages.map(m => `${m.role}: ${m.content}`).join('\n');
    logToMarkdown('prompt', 'Sending Prompt:', thePrompt);
    try  {
        const response = await anthropic.messages.create({
            max_tokens: 4096,
            messages: state.messages,
            system: state.systemPrompt,
            model: 'claude-3-5-sonnet-20240620',
        });

        if (response.content[0].type === 'text') {
            try {
                return JSON.parse(response.content[0].text) as CompletionType;
            } catch (error) {
                return response.content[0].text as CompletionType;
            }
        }
    } catch (err: unknown) {
        throw new Error(`Error: ${err}`);
    }

    throw new Error('No text response');
}