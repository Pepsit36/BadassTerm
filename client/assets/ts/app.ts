import '../scss/app.scss';

import WebSocketClient from './Util/WebSocketClient';

new WebSocketClient(
    document.getElementById('xterm-container'),
    window.location.href.replace('http', 'ws'),
    get('channelId'));

function get(name) {
    if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search)) {
        return decodeURIComponent(name[1]);
    }
    return undefined;
}
