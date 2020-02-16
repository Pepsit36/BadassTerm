import * as pty from 'node-pty';
import {IPty} from 'node-pty';
import {Server} from 'http';
import {Server as WsServer} from 'ws';

export default class Terminal {
    private wsServer: WsServer;

    constructor(server: Server) {
        this.wsServer = new WsServer({
            server: server
        });


        this.wsServer.on('connection', (ws) => {
            const tty = this.onConnected();

            ws.on('message', (msg) => {
                if (msg.startsWith('ESCAPED|-- ')) {
                    if (msg.startsWith('ESCAPED|-- RESIZE:')) {
                        msg = msg.substr(18);
                        let cols = msg.slice(0, -4);
                        let rows = msg.substr(4);
                        tty.resize(Number(cols), Number(rows));
                        this.onResized(cols, rows);
                    }
                } else {
                    tty.write(msg);
                }
            });

            tty.onData((data) => {
                try {
                    ws.send(data);
                } catch (e) {
                    // Websocket closed
                }
            });

            tty.onExit((data) => {
                ws.send('Session Closed - Refresh to start a new Session.');
            });

            ws.on('close', () => {
                this.onDisconnected();
            });
        });
    }

    private onConnected(): IPty {
        const tty = pty.spawn('bash', [], {
            name: 'xterm-color',
            cols: 80,
            rows: 24,
            cwd: process.env.PWD,
            env: process.env
        });

        tty.write('cd ~\n');
        tty.write('clear\n');

        return tty;
    }

    private onResized(cols, rows) {
    }

    private onDisconnected() {
    }
}