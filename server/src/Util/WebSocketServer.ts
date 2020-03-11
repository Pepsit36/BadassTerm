import {Server} from 'http';
import {Server as WsServer} from 'ws';
import {v4 as uuidV4} from 'uuid';
import WebSocketMessage, {WebSocketMessageTypes} from '../Entity/WebSocketMessage';
import Terminal from './Terminal';

export default class WebSocketServer {
    private wsServer: WsServer;
    private channels: object = {};

    constructor(server: Server) {
        this.wsServer = new WsServer({
            server: server
        });

        this.wsServer.on('connection', (ws) => {
            ws.on('message', (message) => {
                const webSocketMessage: WebSocketMessage = WebSocketMessage.unserialize(message);

                if (!webSocketMessage.getChannel()) {
                    if (webSocketMessage.getAction() === WebSocketMessageTypes.CHANNEL) {
                        const channel = this.connectChannel(ws, webSocketMessage.getMessage().channelId);

                        ws.send(
                            WebSocketMessage.serialize(
                                new WebSocketMessage({'channelId': channel}, WebSocketMessageTypes.CHANNEL)
                            )
                        );
                    }
                } else {
                    if (webSocketMessage.getAction() === WebSocketMessageTypes.TERMINAL) {
                        const terminal: Terminal = this.channels[webSocketMessage.getChannel()].terminal;
                        terminal.write(webSocketMessage.getMessage());
                    }
                }
            });
        });
    }

    private connectChannel(ws, channelId?: string): string {
        channelId = channelId || uuidV4();

        if (this.channels[channelId]) {
            console.log(`Client has joinned channel "${channelId}"`);
            const channel = this.channels[channelId];

            ws.send(
                WebSocketMessage.serialize(
                    new WebSocketMessage(
                        channel.terminalBuffer,
                        WebSocketMessageTypes.TERMINAL,
                        channelId
                    )
                )
            );
            channel.clients.push(ws);
        } else {
            console.log(`Client has created channel "${channelId}"`);

            const terminal: Terminal = new Terminal();

            terminal.onData = (data: string) => {
                const channel = this.channels[channelId];

                // When clear signal received
                if (Buffer.from(data).toString('base64') === 'G1tIG1sySg==') {
                    channel.terminalBuffer = '';
                } else {
                    channel.terminalBuffer += data;
                }
                for (const clientWs of channel.clients) {
                    clientWs.send(
                        WebSocketMessage.serialize(
                            new WebSocketMessage(
                                data,
                                WebSocketMessageTypes.TERMINAL,
                                channelId
                            )
                        )
                    );
                }
            };

            terminal.onExit = (data: { exitCode: number, signal?: number }) => {
                const exitText = 'Session Closed - Refresh to start a new Session.';
                const channel = this.channels[channelId];

                channel.terminalBuffer += exitText;
                for (const clientWs of channel.clients) {
                    clientWs.send(
                        WebSocketMessage.serialize(
                            new WebSocketMessage(
                                exitText,
                                WebSocketMessageTypes.TERMINAL,
                                channelId
                            )
                        )
                    );
                    clientWs.close();
                }

                delete this.channels[channelId];
                console.log(`Client has closed channel "${channelId}"`);
            };

            this.channels[channelId] = {
                terminal: terminal,
                terminalBuffer: '',
                clients: [ws]
            };
        }

        return channelId;
    }
}
