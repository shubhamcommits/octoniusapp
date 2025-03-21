import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cors from "cors";
import morgan from "morgan";
import compression, { CompressionOptions } from "compression";
import { developmentConfig, productionConfig } from "../configs";
import {
    domainRoutes,
    loungesRoutes,
    memberRoutes,
    mgmtRoutes,
    workspaceRoutes,
    storiesRoutes,
    hrRoutes,
    crmRoutes,
} from "./routes";
import fileUpload from "express-fileupload";
import { fileHandler } from "../utils";

// Defining new Express application
const app = express();

// Load configuration based on the environment states
if (process.env.NODE_ENV !== "production") {
    developmentConfig();
} else {
    productionConfig();
}

// Initiliazing Database Connection
require("../db");

// cors middleware for origin and Headers
app.use(cors());

// Compressing the Application
app.use(compression() as unknown as express.RequestHandler);

// Adding The 'express.json' middleware only handles JSON and urlencoded data
app.use(express.json({ limit: "60mb" }));
app.use(
    express.urlencoded({
        limit: "60mb",
        parameterLimit: 100000,
        extended: true,
    })
);

// Use Morgan middleware for logging every request status on console
app.use(morgan("dev"));

// Allow any method from any host and log requests
app.use((req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header(
        "Access-Control-Allow-Methods",
        "OPTIONS, GET, POST, PUT, DELETE"
    );
    if ("OPTIONS" === req.method) {
        res.sendStatus(200);
    } else {
        console.log(`${req.ip} ${req.method} ${req.url}`);
        next();
    }
});

// Handling GZIPPED ROUTES
const encodeResToGzip = (contentType: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        req.url = req.url + ".gz";
        res.set("Content-Encoding", "gzip");
        res.set("Content-Type", contentType);
        next();
    };
};

// Converting static files to Gzipped Extensions
app.get("*.js", encodeResToGzip("text/javascript"));
app.get("*.css", encodeResToGzip("text/css"));

// Set file upload middleware
app.use(
    fileUpload({
        limits: {
            fileSize: 1024 * 1024 * 1024 * 1024,
        },
        abortOnLimit: true,
    }) as unknown as express.RequestHandler
);

// Availing the static uploads folder to access from server
app.use("/uploads", fileHandler);

// Routes which should handle request
app.get("/", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "./views/index.html"));
});

// Correct REST naming
app.use("/api/domains", domainRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/management", mgmtRoutes);
app.use("/api/lounges", loungesRoutes);
app.use("/api/stories", storiesRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/crm", crmRoutes);
app.use("/api", workspaceRoutes);

// Invalid routes handling middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    const error = new Error("404 not found");
    next(error);
});

// Error handling middleware
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        },
    });
});

export { app };
