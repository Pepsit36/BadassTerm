import * as pty from 'node-pty';
import {IPty} from 'node-pty';
import Config from './Config';

export default class Terminal {
    private initCMD: string = Config.getString('INIT_CMD');
    private tty: IPty;

    constructor() {
        this.connectTTY();

        this.tty.onData((data: string) => {
            this.onData(data);
        });

        this.tty.onExit((data: { exitCode: number, signal?: number }) => {
            this.onExit(data);
        });
    }

    public onData: (data: string) => void;

    public onExit: (data: { exitCode: number, signal?: number }) => void;

    public write(message) {
        if (typeof message === 'string' && message.startsWith('ESCAPED|-- ')) {
            if (message.startsWith('ESCAPED|-- RESIZE:')) {
                message = message.substr(18);
                let cols = message.slice(0, -4);
                let rows = message.substr(4);
                this.tty.resize(Number(cols), Number(rows));
            }
        } else {
            this.tty.write(message);
        }
    }

    private connectTTY() {
        this.tty = pty.spawn('bash', [], {
            name: 'xterm-color',
            cols: 80,
            rows: 24,
            cwd: process.env.PWD,
            env: process.env
        });

        this.tty.write(`${this.initCMD}\n`);
    }
}
