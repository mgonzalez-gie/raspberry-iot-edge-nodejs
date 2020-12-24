'use strict';

var Transport = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').ModuleClient;
var Message = require('azure-iot-device').Message;

var sendMessageIntervalId;

var TelemetryData = {
  DateTime: null,
  Latitude: "-34.562834",
  Longitude: "-58.704889",
  Beacons: []
};

var Properties = {
  TelemetryPeriod : 0,
  FixedCoordinates : {
    Latitude : 0,
    Longitude : 0
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

        // Obtiene el gemelo
        client.getTwin(function(err, twin) {
          if (err) {
            console.error('Could not get twin');
          } else {
            console.log('Twin created');

            // Cambio Propiedades deseadas TelemetryPeriod (en segundos)
            twin.on('properties.desired', function(delta) {
              console.log('Propiedades deseadas recibidas');
              if(delta.TelemetryPeriod) {
                if(sendMessageIntervalId) // Detiene el timer si se esta ejecutando
                  clearInterval(sendMessageIntervalId);
                // TODO: Validar el TelemetryPeriod recibido 
                Properties.TelemetryPeriod = twin.properties.desired.TelemetryPeriod;
                console.log('TelemetryPeriod = ' + Properties.TelemetryPeriod);
                // Arranca el timer de envio de mensajes
                sendMessageIntervalId = setInterval(function() { sendMessage(client); }, Properties.TelemetryPeriod * 1000);
              }
              if(delta.FixedCoordinates) {
                if(delta.FixedCoordinates.Latitude) 
                  Properties.FixedCoordinates.Latitude = twin.properties.desired.FixedCoordinates.Latitude;
                if(delta.FixedCoordinates.Longitude) 
                  Properties.FixedCoordinates.Longitude = twin.properties.desired.FixedCoordinates.Longitude;
                console.log('FixedCoordinates = ' + Properties.FixedCoordinates.Latitude + '° / ' + Properties.FixedCoordinates.Longitude + '°');
              }
              twin.properties.reported.update(Properties, function(err) {
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
function sendMessage(client) {
  TelemetryData.DateTime = new Date(Date.now());
  TelemetryData.Latitude = Properties.FixedCoordinates.Latitude;
  TelemetryData.Longitude = Properties.FixedCoordinates.Longitude;
  var outputMsg = new Message(JSON.stringify(TelemetryData));
  outputMsg.properties.add('Platform', 'Raspberry');
  client.sendOutputEvent('output1', outputMsg, printResultFor('Sending telemetry message'));
  console.log(TelemetryData);
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
