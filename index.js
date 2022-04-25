const { io } = require('socket.io-client');

let deviceConnected = false;
let selectedSocketId = null;
let connectDeviceSerialNumber = null;

const socket = io("https://license.spacecode.in/", {
    reconnectionDelayMax: 10000,
    auth: {
        token: "v3"
    }
});
exports.connection = async function(callback) {
    socket.emit("connection", {"deviceType": "client"}, (response) => {
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
                    callback(response1)
                })
            } else {
                callback({
                    "status": false,
                    "message": "No Services Connected"
                })
            }
        })
    })
}

exports.connectDevice = async function(deviceId, callback) {
    socket.emit("send_connectDevice", {
        "socketId": selectedSocketId,
        deviceId
    }, (response) => {
        console.log(response);
        if (response.status) {
            deviceConnected = true;
            connectDeviceSerialNumber = response.deviceSerialNumber;
        }
        callback({
            "status": response.status,
            "message": response.message
        })
    })
}

exports.disconnectDevice = async function(deviceId, callback) {
    socket.emit("generic", {
        "eventName": "disconnectDevice",
        "socketId": selectedSocketId,
        "deviceId": deviceId
    }, (response) => {
        console.log(response)
        if (response.status) {
            deviceConnected = false;
            connectDeviceSerialNumber = null;
        }
        callback(response);
    })
}


