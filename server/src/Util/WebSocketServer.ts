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
            const channel = this.createNewChannel(ws);

            ws.send(
                WebSocketMessage.serialize(
                    new WebSocketMessage({'uuid': channel}, WebSocketMessageTypes.CHANNEL)
                )
            );

            ws.on('message', (message) => {
                const webSockerMessage: WebSocketMessage = WebSocketMessage.unserialize(message);
                console.log(webSockerMessage)

                if (!webSockerMessage.getChannel()) {
                    //No Channel
                } else {
                    if (webSockerMessage.getAction() === WebSocketMessageTypes.TERMINAL) {
                        const terminal: Terminal = this.channels[webSockerMessage.getChannel()].terminal;
                        terminal.write(webSockerMessage.getMessage());
                    }
                }
            });
        });
    }

    private createNewChannel(ws): string {
        const uuid = uuidV4();
        const terminal: Terminal = new Terminal();
        terminal.onData = (data: string) => {
            ws.send(
                WebSocketMessage.serialize(
                    new WebSocketMessage(
                        data,
                        WebSocketMessageTypes.TERMINAL,
                        uuid
                    )
                )
            );
        };

        terminal.onExit = (data: { exitCode: number, signal?: number }) => {
            ws.send(
                WebSocketMessage.serialize(
                    new WebSocketMessage(
                        'Session Closed - Refresh to start a new Session.',
                        WebSocketMessageTypes.TERMINAL,
                        uuid
                    )
                )
            );
        };

        this.channels[uuid] = {
            terminal: terminal,
            ws: ws
        };

        return uuid;
    }
}
