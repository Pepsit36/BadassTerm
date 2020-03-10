import {Terminal as xterm} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';
import {WebLinksAddon} from 'xterm-addon-web-links';

export default class Terminal {
    private readonly xterm: xterm;
    private readonly fitAddon: FitAddon;

    private resizeTimeout;

    constructor(xtermContainer: HTMLElement) {
        this.xterm = new xterm();

        this.fitAddon = new FitAddon();
        this.xterm.loadAddon(this.fitAddon);
        this.xterm.loadAddon(new WebLinksAddon());
        this.xterm.open(xtermContainer);

        this.xterm.onData((data) => {
            console.log(data);
            this.onData(data);
        });
        this.xterm.onBinary((data) => {
            console.log(data);
            this.onData(data);
        });


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

    }

    public write(data: string) {
        this.xterm.write(data);
    }

    public onData: (data: string) => void;

    public onBinary: (data: string) => void;

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
        this.onData('ESCAPED|-- RESIZE:' + cols + ';' + rows);
    };
}
