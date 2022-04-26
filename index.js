const { io } = require('socket.io-client');

let inScan = false;
let deviceConnected = false;
let selectedSocketId = null;
let connectDeviceSerialNumber = null;
let deviceMode = null;

// const socket = io("https://license.spacecode.in/", {
const socket = io("http://localhost:5454/", {
    reconnectionDelayMax: 10000,
    auth: {
        token: "v3"
    }
});

exports.addTagListener = async function(callback) {
    socket.on("receive_addTag", (response) => {
        console.log(response)
        callback(response);
    })
}

exports.scanStarted = async function(callback) {
    socket.on("receive_scanStarted", (response) => {
        console.log(response)
        if (response.status) {
            inScan = true
        }
        callback(response);
    })
}

exports.scanStopped = async function(callback) {
    socket.on("receive_stopScan", (response) => {
        console.log(response)
        if (response.status) {
            inScan = false
        }
        callback(response)
    })
}

exports.scanCompleted = async function(callback) {
    socket.on("receive_scanCompleted", (response) => {
        console.log(response)
        if (response.status) {
            inScan = false
        }
        callback(response)
    })
}

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
            deviceMode = deviceId.includes(":") ? "usbMode" : "ethMode"
        }
        callback({
            "status": response.status,
            "message": response.message
        })
    })
}

exports.disconnectDevice = async function(callback) {
    socket.emit("generic", {
        "eventName": "disconnectDevice",
        "socketId": selectedSocketId,
        "deviceId": connectDeviceSerialNumber
    }, (response) => {
        console.log(response)
        if (response.status) {
            deviceConnected = false;
            connectDeviceSerialNumber = null;
        }
        callback(response);
    })
}

exports.startScan = async function(mode, callback) {
    if (!inScan) {
        socket.emit("generic", {
            "eventName": "startScan",
            "socketId": selectedSocketId,
            "deviceId": connectDeviceSerialNumber,
            "scanMode": mode
        }, (response) => {
            console.log(response)
            callback(response)
        })
    } else {
        callback({
            "status": false,
            "message": "Already in scan"
        })
    }
}

exports.stopScan = async function(callback) {
    socket.emit("generic", {
        "eventName": "stopScan",
        "socketId": selectedSocketId,
        "deviceId": connectDeviceSerialNumber
    }, (response) => {
        console.log(response)
        callback(response)
    })
}

exports.ledOn = async function(tags, callback) {
    socket.emit("generic", {
        "eventName": "ledOn",
        "socketId": selectedSocketId,
        "deviceId": connectDeviceSerialNumber,
        "tags": tags,
        "mode": deviceMode
    }, (response) => {
        console.log(response)
        callback(response)
    })
}

exports.ledOff = async function(callback) {
    socket.emit("generic", {
        "eventName": "ledOff",
        "socketId": selectedSocketId,
        "deviceId": connectDeviceSerialNumber
    })
}

exports.refreshTags = async function(callback) {
    socket.emit("generic", {
        "eventName": "refreshTags",
        "socketId": selectedSocketId,
        "deviceId": connectDeviceSerialNumber,
    }, (response) => {
        console.log(response)
        callback(response)
    })
}


