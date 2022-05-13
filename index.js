const { io } = require('socket.io-client');
const {disconnectDevice} = require("./index");

// let inScan = false;
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

exports.socketDisconnect = async function(callback) {
    socket.disconnect();
}


// callback to listen for device connection
exports.deviceConnectListener = async function(callback) {
    socket.on("device_connected", (response) => {
        console.log("module: ", response)
        callback(response)
    })
}

//callback to get the tag read by the reader
exports.addTagListener = async function(callback) {
    socket.on("receive_addTag", (response) => {
        console.log("module:",response)
        callback(response);
    })
}

// callback to listen when the scan is getting started
exports.scanStarted = async function(callback) {
    socket.on("receive_scanStarted", (response) => {
        console.log("module:", response)
        callback(response);
    })
}

// callback when the scan completed
exports.scanCompleted = async function(callback) {
    socket.on("receive_scanCompleted", (response) => {
        console.log("module:",response)
        if (response.status) {
            // inScan = false
        }
        callback(response)
    })
}


// callback when led turned on
exports.ledTurnedOnListener = async function(callback) {
    socket.on("event_lighting_started", (response) => {
        console.log("module: ", response);
        callback(response)
    })
}

// callback when led turned off
exports.ledTurnedOffListener = async function(callback) {
    socket.on("event_lighting_stopped", (response) => {
        console.log("module: ", response)
        callback(response)
    })
}

// call this to get register with spacecode devices
exports.connection = async function(callback) {
    socket.emit("connection", {"deviceType": "client"}, (response) => {
        console.log("module:",response);
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
            }
        })
    })
}

// call this to connect the device where deviceId can be the serial number of the device or the ipAddress
exports.connectDevice = async function(deviceId, callback) {
    socket.emit("send_connectDevice", {
        "socketId": selectedSocketId,
        deviceId
    }, (response) => {
        console.log("module:",response);
        if (response.status) {
            deviceConnected = true;
            connectDeviceSerialNumber = response.deviceSerialNumber;
            deviceMode = deviceId.includes(":") ? "ethMode" : "usbMode"
        }
        callback({
            "status": response.status,
            "message": response.message
        })
    })
}

// call this to disconnect the device
exports.disconnectDevice = async function(callback) {
    socket.emit("generic", {
        "eventName": "disconnectDevice",
        "socketId": selectedSocketId,
        "deviceId": connectDeviceSerialNumber
    }, (response) => {
        console.log("module:",response)
        if (response.status) {
            deviceConnected = false;
            connectDeviceSerialNumber = null;
        }
        callback(response);
    })
}

// function to start scan
let iteration = 0
exports.startScan = async function(mode, callback) {
    socket.emit("generic", {
        "eventName": "startScan",
        "socketId": selectedSocketId,
        "deviceId": connectDeviceSerialNumber,
        "scanMode": mode
    }, (response) => {
        iteration++
        console.log(iteration)
        console.log("module 1 :",response)
        callback(response)
    })
}

// function to stop scan
exports.stopScan = async function(callback) {
    socket.emit("generic", {
        "eventName": "stopScan",
        "socketId": selectedSocketId,
        "deviceId": connectDeviceSerialNumber
    }, (response) => {
        console.log("module:",response)
        callback(response)
    })
}

// function to turn the led on
exports.ledOn = async function(tags, callback) {
    console.log("selectedSocketId", selectedSocketId)
    console.log("deviceId", connectDeviceSerialNumber)
    console.log("deviceMode", deviceMode)
    console.log("tags", tags)
    socket.emit("generic", {
        "eventName": "ledOn",
        "socketId": selectedSocketId,
        "deviceId": connectDeviceSerialNumber,
        "list": tags,
        "mode": deviceMode
    }, (response) => {
        console.log("module:",response)
        callback(response)
    })
}

// function to turn the led off
exports.ledOff = async function(callback) {
    socket.emit("generic", {
        "eventName": "ledOff",
        "socketId": selectedSocketId,
        "deviceId": connectDeviceSerialNumber
    }, (response) => {
        callback(response);
    })
}

// function to refresh the tag while having continues mode scanning
exports.refreshTags = async function(callback) {
    socket.emit("generic", {
        "eventName": "refreshTags",
        "socketId": selectedSocketId,
        "deviceId": connectDeviceSerialNumber,
    }, (response) => {
        console.log("module:",response)
        callback(response)
    })
}


