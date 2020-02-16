import {Terminal as xterm} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';
import {AttachAddon} from 'xterm-addon-attach';
import {WebLinksAddon} from 'xterm-addon-web-links';

export default class Terminal {
    private readonly xterm: xterm;
    private readonly wsClient: WebSocket;
    private readonly fitAddon: FitAddon;

    private resizeTimeout;

    constructor(xtermContainer: HTMLElement) {
        this.wsClient = new WebSocket(window.location.href.replace('http', 'ws'));

        this.xterm = new xterm();

        this.fitAddon = new FitAddon();
        this.xterm.loadAddon(this.fitAddon);
        this.xterm.loadAddon(new WebLinksAddon());
        this.xterm.open(xtermContainer);

        this.wsClient.onopen = () => {
            this.xterm.loadAddon(new AttachAddon(this.wsClient));
            this.fit();

            window.addEventListener('resize', () => {
                if (this.resizeTimeout) {
                    clearTimeout(this.resizeTimeout);
                }

                this.resizeTimeout = setTimeout(() => {
                    this.resizeTimeout = null;

                    this.fit();
                }, 500);
            });
        };

        this.wsClient.onerror = (e) => {
            throw e;
        };
    }

    private fit() {
        this.fitAddon.fit();

        setTimeout(() => {
            this.sendSizeToServer();
        }, 50);
    };

    private sendSizeToServer() {
        let cols = this.xterm.cols.toString();
        let rows = this.xterm.rows.toString();
        while (cols.length < 3) {
            cols = '0' + cols;
        }
        while (rows.length < 3) {
            rows = '0' + rows;
        }
        this.wsClient.send('ESCAPED|-- RESIZE:' + cols + ';' + rows);
    };
}