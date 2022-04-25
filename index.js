const { io } = require('socket.io-client');

let selectedSocketId = null;

const socket = io("https://license.spacecode.in/", {
    reconnectionDelayMax: 10000,
    auth: {
        token: "v3"
    }
});
exports.connection = async function() {
    let output = null;
    await socket.emit("connection", {"deviceType": "client"}, (response) => {
        console.log(response);
        let sockets = response.sockets;
        let connectionSuccess = false;
        sockets.forEach((socketItem) => {
            if (!connectionSuccess) {
                socket.emit("generic", {
                    "eventName": "getDevices",
                    "socketId": socketItem.socketId
                }, (response1) => {
                    selectedSocketId = socketItem.socketId
                    connectionSuccess = true;
                    console.log(response1)
                    output = response1.message;
                })
            } else {
                output = "No services connected";
            }
        })
        return output;
    })
}

exports.connectDevice = async function(deviceId) {
    socket.emit("send_connectDevice", {
        "socketId": selectedSocketId,
        deviceId
    }, (response) => {
        console.log(response);
    })
}

exports.disconnectDevice = async function(deviceId) {

}


