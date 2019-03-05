# MarktServer
The software running on the central market server.

## Running the server

### Installation

The server reqires [Node.js](https://nodejs.org/) to run. You can download it [here](https://nodejs.org/download).

After installing Node.js, use the following commands to install the server

```shell
cd <installation-path>
git clone https://github.com/makeathon2019gh/MarktServer.git
cd MarktServer/
npm install
```

### Starting

Navigate to the installation folder via ```cd <installation-path>```

To (re)start the server use

```shell
node .
```

## Files
**index.js** Node.js main

**httpUtils.js** Some http utils

**tokengen.js** Creates tokens

**config.json** Config (port, folder names, ...)

**cartlist.json** All possibly available carts

**/webcontent** Web pages etc in there