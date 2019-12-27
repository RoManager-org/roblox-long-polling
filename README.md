# rbxwebhook.js

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

#### Server

```js
// MainScript
var express = require("express")

var app = express();

app.use('/rbxwebhook', require(../PATH/TO/JS/FILE))

app.get('/', (req, res) => {
  res.send("Howdy")
});


app.listen(3000);

//JS File
var longPolling = require("rbxwebhook.js");
var server = new longPolling();

server.on("connection", (conn) => {
	console.log(`New connection (id: ${conn.id})`);

	conn.on("ping", (message) => {
		console.log(`echo: ${message}`);
		conn.send("pong", message);
	});

	conn.on("broadcast", (message) => {
		console.log(`broadcast: ${message}`);
		server.broadcast("broadcast", message);
	});

	conn.on("disconnect", () => {
		console.log(`${conn.id} disconnected`);
	});
});

module.exports = server.router;
```

#### Client

```lua
local Connection = require(script.Connection)
local client = Connection.new()

client:connect("127.0.0.1:8080")

client:on("pong", function(message)
	print("echoed from server: ", message)
end)

client:send("ping", "Hello world!")

game:BindToClose(function()
	client:disconnect()
end)
```
