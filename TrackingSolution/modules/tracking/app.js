'use strict';

var Transport = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').ModuleClient;
var Message = require('azure-iot-device').Message;

var sendMessageIntervalId;

var telemetryData = {
  timestamp: null,
  latitude: 0,
  longitude: 0,
  beacons: []
};

var eventData = {
  timestamp: null,
  message: "",
  data: {}
};

var properties = {
  telemetryPeriod : 0,
  fixedCoordinates : {
    latitude : 0,
    longitude : 0
  }
}

Client.fromEnvironment(Transport, function (err, client) {
  if (err) {
    throw err;
  } else {
    client.on('error', function (err) {
      throw err;
    });

    // connect to the Edge instance
    client.open(function (err) {
      if (err) {
        throw err;
      } else {
        console.log('IoT Hub module client initialized');
        // Envia mensaje de inicio
        sendStartEventMessage(client);
        // Obtiene el gemelo
        client.getTwin(function(err, twin) {
          if (err) {
            console.error('Could not get twin');
          } else {
            console.log('Twin created');

            // Cambio Propiedades deseadas TelemetryPeriod (en segundos)
            twin.on('properties.desired', function(delta) {
              console.log('Propiedades deseadas recibidas');
              if(delta.telemetryPeriod) {
                if(sendMessageIntervalId) // Detiene el timer si se esta ejecutando
                  clearInterval(sendMessageIntervalId);
                // TODO: Validar el TelemetryPeriod recibido 
                properties.telemetryPeriod = twin.properties.desired.telemetryPeriod;
                console.log('TelemetryPeriod = ' + properties.telemetryPeriod + ' min.');
                // Arranca el timer de envio de mensajes
                sendMessageIntervalId = setInterval(function() { sendTelemetryMessage(client); }, properties.telemetryPeriod * 60 * 1000);
              }
              if(delta.fixedCoordinates) {
                if(delta.fixedCoordinates.latitude) 
                  properties.fixedCoordinates.latitude = twin.properties.desired.fixedCoordinates.latitude;
                if(delta.fixedCoordinates.longitude) 
                  properties.fixedCoordinates.longitude = twin.properties.desired.fixedCoordinates.longitude;
                console.log('FixedCoordinates = ' + properties.fixedCoordinates.latitude + '° / ' + properties.fixedCoordinates.longitude + '°');
              }
              twin.properties.reported.update(properties, function(err) {
                if (err) throw err;
                console.log('Propiedades reportadas enviadas');
              });
            });

          }
        });

        // Act on input messages to the module.
        client.on('inputMessage', function (inputName, msg) {
          pipeMessage(client, inputName, msg);
        });
      }
    });
  }
});

// Envia mensajes de telemetria
function sendTelemetryMessage(client) {
  telemetryData.timestamp = new Date(Date.now());
  telemetryData.latitude = properties.fixedCoordinates.latitude;
  telemetryData.longitude = properties.fixedCoordinates.longitude;
  var outputMsg = new Message(JSON.stringify(telemetryData));
  outputMsg.properties.add('deviceType', 'beacon-gateway');
  outputMsg.properties.add('messageType', 'data');
  client.sendOutputEvent('output1', outputMsg, printResultFor('Sending telemetry message'));
  console.log(telemetryData);
}

// Envia mensajes de eventos
function sendStartEventMessage(client) {
  eventData.timestamp = new Date(Date.now());
  eventData.message = "Beacon Gateway iniciado";
  eventData.data = {};
  var outputMsg = new Message(JSON.stringify(eventData));
  outputMsg.properties.add('deviceType', 'beacon-gateway');
  outputMsg.properties.add('messageType', 'event');
  client.sendOutputEvent('output1', outputMsg, printResultFor('Sending start event message'));
  console.log(eventData);
}

// This function just pipes the messages without any change.
function pipeMessage(client, inputName, msg) {
  client.complete(msg, printResultFor('Receiving message'));

  if (inputName === 'input1') {
    var message = msg.getBytes().toString('utf8');
    if (message) {
      var outputMsg = new Message(message);
      client.sendOutputEvent('output1', outputMsg, printResultFor('Sending received message'));
    }
  }
}

// Helper function to print results in the console
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) {
      console.log(op + ' error: ' + err.toString());
    }
    if (res) {
      console.log(op + ' status: ' + res.constructor.name);
    }
  };
}
