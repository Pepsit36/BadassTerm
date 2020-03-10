export default class WebSocketMessage {
    private readonly channel: string;
    private readonly action: WebSocketMessageTypes;
    private readonly message: string;

    constructor(message: any, action: WebSocketMessageTypes = null, channel: string = null) {
        this.channel = channel;
        this.action = action;
        this.message = message;
    }

    public getChannel(): string {
        return this.channel;
    }

    public getAction(): WebSocketMessageTypes {
        return this.action;
    }

    public getMessage(): any {
        return this.message;
    }

    public static serialize(webSocketMessage: WebSocketMessage): string {
        return JSON.stringify(webSocketMessage);
    }

    public static unserialize(string: string): WebSocketMessage {
        const stringParsed = JSON.parse(string);
        return new WebSocketMessage(
            stringParsed.message,
            stringParsed.action,
            stringParsed.channel
        );
    }
}

export enum WebSocketMessageTypes {
    CHANNEL,
    TERMINAL,

}
