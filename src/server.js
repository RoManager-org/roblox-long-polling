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

		const checkAuthentication = options.checkAuthentication;

		// Connect
		server.get('/connect', checkAuthentication, (req, res) => {
			const connection = new Connection();
			connection.req = req;
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
