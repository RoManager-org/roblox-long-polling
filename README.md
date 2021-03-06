# rbxwebhook.js
[![DeepScan grade](https://deepscan.io/api/teams/7242/projects/9370/branches/121237/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=7242&pid=9370&bid=121237)

Simple event communication between Roblox servers and Node.js

> Originally created by Reselim but was deprecated.

## Installation

#### Server

```
npm install --save rbxwebhook.js
```

#### Client

Put the contents of [client.lua](https://github.com/uhteddy/rbxwebhook.js/blob/master/client.lua) inside of a ModuleScript.

## Example

### Server

##### Main Script

```js
// MainScript
var express = require("express")

var app = express();

app.use('/rbxwebhook', require(../PATH/TO/ROUTER/FILE))

app.get('/', (req, res) => {
  res.send("Howdy")
});


app.listen(3000);
```

##### Router File

```js
var longPolling = require("rbxwebhook.js");
var server = new longPolling();

server.on("connection", conn => {
  console.log(`New connection (id: ${conn.id})`);

  conn.on("ping", message => {
    console.log(`echo: ${message}`);
    conn.send("pong", message);
  });

  conn.on("broadcast", message => {
    console.log(`broadcast: ${message}`);
    server.broadcast("broadcast", message);
  });

  conn.on("disconnect", () => {
    console.log(`${conn.id} disconnected`);
  });
});

module.exports = server.router;
```

## Client

```lua
local Connection = require(script.Connection)
local client = Connection.new()

client:connect("127.0.0.1:3000/rbxwebhook")

client:on("pong", function(message)
	print("echoed from server: ", message)
end)

client:on("broadcast", function(message)
	print("broadcast: ", message)
end)

client:send("ping", "Hello world!")

game:BindToClose(function()
	client:disconnect()
end)
```

# apiKeys
We now accept apiKeys! It is very simple to implent. All you need to do is add the apiKey option inside of the class you are creatings paremeters.

### Example
Server:

```js
const rbxwebhook = require("rbxwebhook.js");
const server = new rbxwebhook({apiKey: "YOURKEYHERE"});
```

Client:

```lua
local rbxwebhook = require(game:GetService("ServerScriptService"):WaitForChild("rbxwebhook"));
local client = rbxwebhook.new( { apiKey = "YOURKEYHERE" } );
```

