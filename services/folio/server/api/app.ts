import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import compression from 'compression';
import { developmentConfig, productionConfig } from '../configs';
import routes from './routes/folio.routes';

// Defining new Express application
const app = express();

// Load configuration based on the environment states
if (process.env.NODE_ENV !== 'production') {
    developmentConfig();
}
else {
    productionConfig();
}

// Initiliazing Database Connection
require('../db');

// cors middleware for orign and Headers
app.use(cors());

// Adding The 'body-parser' middleware only handles JSON and urlencoded data
app.use(express.json())
// body parsers
app.use(bodyParser.json({limit:'60mb'}));
app.use(bodyParser.urlencoded({limit: '60mb',parameterLimit: 100000, extended: true }));

// Use Morgan middleware for logging every request status on console
app.use(morgan('dev'));

// Allow any method from any host and log requests
app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
    if ('OPTIONS' === req.method) {
        res.sendStatus(200);
    } else {
        console.log(`${req.ip} ${req.method} ${req.url}`);
        next();
    }
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// Handle POST requests that come in formatted as JSON
app.use(express.json());

// Handling GZIPPED ROUTES
const encodeResToGzip = (contentType: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        req.url = req.url + '.gz';
        res.set('Content-Encoding', 'gzip');
        res.set('Content-Type', contentType);
        next();
    };
};

// Converting static files to Gzipped Extensions
app.get("*.js", encodeResToGzip('text/javascript'));
app.get("*.css", encodeResToGzip('text/css'));

// Routes which should handle request
app.all('/', (req: Request, res: Response, next: NextFunction) => {
    res.sendFile(path.join(__dirname, './views/index.html'));
});

app.use('/',routes);
 
// Invalid routes handling middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    const error = new Error('404 not found');
    next(error);
});

// Error handling middleware
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});


// Compressing the Application
app.use(compression());

export { app }
