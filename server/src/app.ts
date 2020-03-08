import {Server as StaticServer} from 'node-static';
import http, {Server} from 'http';
import fs from 'fs';

import Terminal from './Util/Terminal';
import Config from './Util/Config';

const fileServer = new StaticServer('../client/public/');

if (!fs.existsSync('../client/public/build/manifest.json')) {
    console.error('\x1b[31mPlease build the client.\x1b[0m');
    process.exit(1);
}

const manifest = require('../../client/public/build/manifest.json');

const host = Config.getString('HOST');
const port = Config.getNumber('PORT');

const server: Server = http.createServer((req, res) => {
    req.addListener('end', () => {
        if (req.url.substr(1) in manifest) {
            fileServer.serveFile(manifest[req.url.substr(1)], 200, {}, req, res);
            return;
        }
        fileServer.serve(req, res);
    }).resume();
});

new Terminal(server);

server.listen(port, host);


console.log(`Server started on ${host}:${port}`);
