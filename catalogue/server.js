const instana = require('@instana/collector');
// init tracing
// MUST be done before loading anything else!
instana({
    tracing: {
        enabled: true
    }
});

const mongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const express = require('express');
const pino = require('pino');
const expPino = require('express-pino-logger');
const client = require('prom-client'); // Import Prometheus client library

const logger = pino({
    level: 'info',
    prettyPrint: false,
    useLevelLabels: true
});
const expLogger = expPino({
    logger: logger
});

// Prometheus metrics
const register = new client.Registry(); // Create a Prometheus registry
const requestCount = new client.Counter({
    name: 'catalogue_requests_total',
    help: 'Total number of requests to the Catalogue service'
});
const mongoConnectionStatus = new client.Gauge({
    name: 'catalogue_mongo_connected',
    help: 'MongoDB connection status (1 for connected, 0 for disconnected)'
});

// Register metrics
register.registerMetric(requestCount);
register.registerMetric(mongoConnectionStatus);

var db;
var collection;
var mongoConnected = false;

const app = express();

app.use(expLogger);

// Middleware to update metrics
app.use((req, res, next) => {
    requestCount.inc(); // Increment the request counter
    next();
});

app.use((req, res, next) => {
    res.set('Timing-Allow-Origin', '*');
    res.set('Access-Control-Allow-Origin', '*');
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
    var stat = {
        app: 'OK',
        mongo: mongoConnected
    };
    res.json(stat);
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
    mongoConnectionStatus.set(mongoConnected ? 1 : 0); // Update MongoDB connection status
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// All products
app.get('/products', (req, res) => {
    if (mongoConnected) {
        collection.find({}).toArray().then((products) => {
            res.json(products);
        }).catch((e) => {
            req.log.error('ERROR', e);
            res.status(500).send(e);
        });
    } else {
        req.log.error('database not available');
        res.status(500).send('database not available');
    }
});

// Product by SKU
app.get('/product/:sku', (req, res) => {
    if (mongoConnected) {
        const delay = process.env.GO_SLOW || 0;
        setTimeout(() => {
            collection.findOne({ sku: req.params.sku }).then((product) => {
                if (product) {
                    res.json(product);
                } else {
                    res.status(404).send('SKU not found');
                }
            }).catch((e) => {
                req.log.error('ERROR', e);
                res.status(500).send(e);
            });
        }, delay);
    } else {
        req.log.error('database not available');
        res.status(500).send('database not available');
    }
});

// MongoDB connection setup
function mongoConnect() {
    return new Promise((resolve, reject) => {
        const mongoURL = process.env.MONGO_URL || 'mongodb://mongodb:27017/catalogue';
        mongoClient.connect(mongoURL, (error, client) => {
            if (error) {
                reject(error);
            } else {
                db = client.db('catalogue');
                collection = db.collection('products');
                resolve('connected');
            }
        });
    });
}

// MongoDB connection retry loop
function mongoLoop() {
    mongoConnect().then(() => {
        mongoConnected = true;
        logger.info('MongoDB connected');
    }).catch((e) => {
        mongoConnected = false;
        logger.error('ERROR', e);
        setTimeout(mongoLoop, 2000);
    });
}

mongoLoop();

// Start the server
const port = process.env.CATALOGUE_SERVER_PORT || '8080';
app.listen(port, () => {
    logger.info(`Catalogue service started on port ${port}`);
});
