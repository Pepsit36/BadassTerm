import WebSocketMessage, {WebSocketMessageTypes} from '../../../../server/src/Entity/WebSocketMessage';
import Terminal from './Terminal';

export default class WebSocketClient {
    private readonly wsClient: WebSocket;

    private readonly channels: object = {};

    private $xtermContainer: HTMLElement = null;

    constructor($xtermContainer: HTMLElement) {
        this.$xtermContainer = $xtermContainer;

        this.wsClient = new WebSocket(window.location.href.replace('http', 'ws'));

        this.wsClient.onopen = () => {
        };

        this.wsClient.onmessage = (message: MessageEvent) => {
            const webSocketMessage: WebSocketMessage = WebSocketMessage.unserialize(message.data);

            if (!webSocketMessage.getChannel()) {
                if (webSocketMessage.getAction() === WebSocketMessageTypes.CHANNEL) {
                    if (!this.$xtermContainer) {
                        console.error('No $xtermContainer sent.');
                        return;
                    }
                    const channel = webSocketMessage.getMessage().uuid;
                    const terminal: Terminal = new Terminal(this.$xtermContainer);
                    terminal.onData = (data: string) => {
                        this.wsClient.send(
                            WebSocketMessage.serialize(
                                new WebSocketMessage(
                                    data,
                                    WebSocketMessageTypes.TERMINAL,
                                    channel
                                )
                            )
                        );
                    };

                    terminal.onBinary = (data: string) => {
                        const buffer = new Uint8Array(data.length);
                        for (let i = 0; i < data.length; ++i) {
                            buffer[i] = data.charCodeAt(i) & 255;
                        }

                        this.wsClient.send(
                            WebSocketMessage.serialize(
                                new WebSocketMessage(
                                    buffer,
                                    WebSocketMessageTypes.TERMINAL,
                                    channel
                                )
                            )
                        );
                    };

                    this.channels[channel] = terminal;
                    this.$xtermContainer = null;

                    this.wsClient.send(
                        WebSocketMessage.serialize(
                            new WebSocketMessage(
                                'ls\n',
                                WebSocketMessageTypes.TERMINAL,
                                webSocketMessage.getMessage().uuid
                            )
                        )
                    );
                }
                return;
            } else {
                if (webSocketMessage.getAction() === WebSocketMessageTypes.TERMINAL) {
                    const terminal: Terminal = this.channels[webSocketMessage.getChannel()];
                    terminal.write(webSocketMessage.getMessage());
                }
            }
        };

        this.wsClient.onerror = (e) => {
            throw e;
        };
    }
}
