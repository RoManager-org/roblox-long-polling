const EventEmitter = require('events');
const Connection = require('./connection');

const express = require('express');
const bodyParser = require('body-parser');

class rbxwebhookserver extends EventEmitter {
	constructor(options) {
		super();

		this.connections = {};
		this.options = options;

		const server = express.Router();

		const checkAuthentication = (req, res, next) => {
			if (options !== undefined) {
				// There are avaliable options to read through.
				if (options['apiKey']) {
					// checks if apiKey exists in the options.
					const setKey = options['apiKey'];
					const checkedKey = req.headers.authorization;
					if (setKey === checkedKey) {
						// Authentication was a success and can continue to connect.
						next();
					} else {
						// Authentication failed.
						res.status(401).json({
							error: 'Authentication failed.',
						});
					}
				} else {
					// if it doesn't we're going to authenticate because there are no protections
					next();
				}
			} else {
				// There are no options so we are just going to authenticate any request.
				next();
			}
		};

		// Connect
		server.get('/connect', checkAuthentication, (req, res) => {
			const connection = new Connection();
			this.connections[connection.id] = connection;
			this.emit('connection', connection);

			res.status(201).json({ id: connection.id });
		});

		server.use((req, res, next) => {
			// Authentication middleware
			const connection = this.connections[req.headers['connection-id']]; // finds connection with cooresponding ID

			if (connection) {
				req.socket = connection;
				next();
			} else {
				res.status(401).json({ error: 'Not connected' });
			}
		});

		server.get('/disconnect', (req, res) => {
			req.socket.emit('disconnect');

			delete this.connections[req.socket.id];
			res.status(200).send('ok');
		});

		// Get/recieve

		server.get('/data', (req, res) => {
			req.socket.onRequest(req, res);
		});

		server.post('/data', bodyParser.json(), (req, res) => {
			if (req.body.t) {
				req.socket.emit(req.body.t, req.body.d);
				res.status(200).send('ok');
			} else {
				res.status(400).send({ error: 'Invalid target' });
			}
		});

		this.router = server;
	}

	broadcast(target, data) {
		// broadcasts the event to every avaliable
		Object.keys(this.connections).forEach((id) => {
			this.connections[id].send(target, data);
		});
	}
}

module.exports = rbxwebhookserver;
