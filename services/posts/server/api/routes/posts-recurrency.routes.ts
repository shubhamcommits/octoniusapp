import express from "express";
import {
    CalendarController,
    FilesControllers,
    PostController,
    RecurrencyController,
} from "../controllers";
import { Auths, postFileUploader } from "../utils";

const routes = express.Router();

/**
 * Posts Recurrency Controller Class Object
 */
const recurrencyController = new RecurrencyController();

// Define auths helper controllers
const auths = new Auths();

// -| AUTHENTICATION |-

// Verify the token
routes.use(auths.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(auths.isLoggedIn);

// This route is used to add a post
routes.post("/:postId", recurrencyController.saveRecurrency);

export { routes as postRecurrencyRoutes };
