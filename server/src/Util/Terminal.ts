import * as pty from 'node-pty';
import {IPty} from 'node-pty';
import {Server} from 'http';
import {Server as WsServer} from 'ws';
import Config from './Config';

export default class Terminal {
    private wsServer: WsServer;

    private shareTTY: Boolean = Config.getBoolean('SHARE_TTY');
    private initCMD: string = Config.getString('INIT_CMD');

    constructor(server: Server) {
        this.wsServer = new WsServer({
            server: server
        });
        let ttyShared = undefined;
        let buffer = undefined;

        if (this.shareTTY) {
            ttyShared = this.connectTTY();
            buffer = '';

            const connectTTYSharedEvents = () => {
                ttyShared.onData((data: string) => {
                    buffer += data;

                    // When clear signal received
                    if (Buffer.from(data).toString('base64') === 'G1tIG1sySg==') {
                        buffer = '';
                        console.log('Buffer cleared');
                    }
                });

                ttyShared.onExit((data) => {
                    ttyShared = this.connectTTY();
                    buffer = '';
                    connectTTYSharedEvents();
                });
            };

            connectTTYSharedEvents();
        }

        this.wsServer.on('connection', (ws) => {
            if (this.shareTTY) {
                ws.send(buffer);
            }

            const tty = ttyShared || this.connectTTY();

            ws.on('message', (msg) => {
                if (msg.startsWith('ESCAPED|-- ')) {
                    if (msg.startsWith('ESCAPED|-- RESIZE:')) {
                        msg = msg.substr(18);
                        let cols = msg.slice(0, -4);
                        let rows = msg.substr(4);
                        tty.resize(Number(cols), Number(rows));
                    }
                } else {
                    tty.write(msg);
                }
            });

            tty.onData((data: string) => {
                ws.send(data);
            });

            tty.onExit((data) => {
                ws.send('Session Closed - Refresh to start a new Session.');
            });
        });
    }

    private connectTTY(): IPty {
        const tty = pty.spawn('bash', [], {
            name: 'xterm-color',
            cols: 80,
            rows: 24,
            cwd: process.env.PWD,
            env: process.env
        });

        tty.write(`${this.initCMD}\n`);

        return tty;
    }
}
