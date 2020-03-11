import WebSocketMessage, {WebSocketMessageTypes} from '../../../../server/src/Entity/WebSocketMessage';
import Terminal from './Terminal';

export default class WebSocketClient {
    private readonly wsClient: WebSocket;
    private terminal: Terminal;
    private channelId: string;

    constructor($xtermContainer: HTMLElement, websocketUrl: string, channel?: string) {
        this.wsClient = new WebSocket(websocketUrl);

        this.terminal = new Terminal($xtermContainer);

        this.terminal.onData = (data: string) => {
            this.sendToTerminal(data);
        };

        this.terminal.onBinary = (data: string) => {
            const buffer = new Uint8Array(data.length);
            for (let i = 0; i < data.length; ++i) {
                buffer[i] = data.charCodeAt(i) & 255;
            }

            this.sendToTerminal(buffer);
        };

        this.wsClient.onopen = () => {
            this.send(
                new WebSocketMessage(
                    {
                        channelId: channel
                    },
                    WebSocketMessageTypes.CHANNEL
                )
            );
        };

        this.wsClient.onmessage = (messageEvent: MessageEvent) => {
            const webSocketMessage: WebSocketMessage = WebSocketMessage.unserialize(messageEvent.data);

            if (!webSocketMessage.getChannel()) {
                if (webSocketMessage.getAction() === WebSocketMessageTypes.CHANNEL) {
                    this.channelId = webSocketMessage.getMessage().channelId;
                }
                return;
            } else {
                if (webSocketMessage.getAction() === WebSocketMessageTypes.TERMINAL) {
                    this.terminal.write(webSocketMessage.getMessage());
                }
            }
        };

        this.wsClient.onerror = (e) => {
            throw e;
        };
    }

    private sendToTerminal(data) {
        this.send(
            new WebSocketMessage(
                data,
                WebSocketMessageTypes.TERMINAL,
                this.channelId
            )
        );
    }

    private send(webSocketMessage: WebSocketMessage) {
        this.wsClient.send(WebSocketMessage.serialize(webSocketMessage));
    }
}
