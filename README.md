Autor: Martín González - 2020

# Azure IoT Device - Raspberry

## Instalación y configuración del sistema operativo en Raspberry

### Instalar el sistema operativo

Descargar e instalar [Raspberry Pi Imager](https://www.raspberrypi.org/software/)

Ejecutarlo y seleccionar el sistema operativo RASPBERRY PI OS LITE (32-BIT) y la SD donde copiarlo.

<p align="center">
    <img src="./doc/img001.png" width="400">
</p>

### Habilitar SSH

Una vez copiado el sistema operativo, abrir la unidad de la sd (boot) y crear un archivo de texto vacio en la raiz con nombre *ssh* y sin extension

<p align="center">
    <img src="./doc/img002.png" width="600">
</p>

### Configurar WiFi

Crear un archivo en la raiz de la sd (boot) llamado *wpa_supplicant.conf* con el siguiente contenido (reemplazar el SSID y el password con los datos de la red wifi a conectar)

```
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={ 
ssid="MySSID" 
psk="MyPassword" 
}
```
<p align="center">
    <img src="./doc/img003.png" width="600">
</p>

### Conectar por ssh y actualizar

Descargar e instalar [puTTY](https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html)

Conectar a la raspberry
```
Host Name: raspberrypi
Port: 22
```

<p align="center">
    <img src="./doc/img004.png" width="400">
</p>

Luego
```
login as: pi
password: raspberry
```

Finalmente, actualizar.
```
sudo apt-get update
sudo apt-get upgrade
```
## Instalación del runtime Azure IoT Edge

### Prerrequisitos

Instalar la configuración de repositorios

```
curl https://packages.microsoft.com/config/debian/stretch/multiarch/prod.list > ./microsoft-prod.list
```

Copiar lla lista generada al directorio sources.list.d

```
sudo cp ./microsoft-prod.list /etc/apt/sources.list.d/
```

Instalar la clave publica GPG de Microsoft

```
curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
sudo cp ./microsoft.gpg /etc/apt/trusted.gpg.d/
```

### Instalar el engine Moby

Actualizar las listas de paquetes
```
sudo apt-get update
```

Instalar el engine Moby
```
sudo apt-get install moby-engine
```

### Instalar el runtime Azure IoT Edge

Actualizar las listas de paquetes
```
sudo apt-get update
```

Instalar OpenSSL versión 1.0.2 (Requerido para Buster)
```
sudo apt-get install libssl1.0.2
```

Instalar IoT Edge
```
sudo apt-get install iotedge
```

## Crear un dispositivo edge en el Hub

Ingresar al IoT Hub *tracking-gie* a través del [portal Azure](https://portal.azure.com/). Seleccionar IoT Edge en la barra lateral y la opción paraagregar un nuevo dispositivo.
<p align="center">
    <img src="./doc/img005.png" width="600">
</p>

Asignar un id al dispositivo, mantener como método de autenticación las claves simétricas autogeneradas y guardar.
<p align="center">
    <img src="./doc/img006.png" width="600">
</p>

Ingresar al dispositivo recién creado y tomar nota de la cadena de conexión
<p align="center">
    <img src="./doc/img007.png" width="600">
</p>

## Aprovisionar el dispositivo IoT Edge

### Configuración

Ingresar por ssh a la raspberry y editar el archivo *config.yaml* mediante
```
sudo nano /etc/iotedge/config.yaml
```

Identificar la entrada de la configuración para aprovisionamiento manual y agregar la cadena de conexión copiada del dispositivo en el IoT Hub.

```
# Manual provisioning configuration using a connection string
provisioning:
  source: "manual"
  device_connection_string: "<ADD DEVICE CONNECTION STRING HERE>"
  dynamic_reprovisioning: false
```
Guardar y cerrar el archivo con CTRL + X, Y, Enter

Reiniciar el servicio iotedge
```
sudo systemctl restart iotedge
```

### Verificaciones

Verificar el estado del servicio
```
sudo systemctl status iotedge
```
<p align="center">
    <img src="./doc/img008.png" width="700">
</p>

Realizar un chequeo
```
sudo iotedge check
```
<p align="center">
    <img src="./doc/img009.png" width="700">
</p>

Se obtendrán algunos warnings respecto a configuraciones que deben realizarse para desplegar el dispositivo en producción y un error respecto al módulo IoT Hub. Este módulo recién es instalado en el dispositivo cuando se crea un módulo custom.

Finalmente, listar los módulos que se encuentran corriendo
```
sudo iotedge list
```
<p align="center">
    <img src="./doc/img010.png" width="700">
</p>

