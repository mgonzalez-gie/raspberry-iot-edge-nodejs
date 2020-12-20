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