import express from 'express';
import { PulseFunctions } from '../controllers';

const routes = express.Router();
const pulse = new PulseFunctions();

// GET - Get pulse description based on the groupId
routes.get('/', pulse.get);

// PUT - Updates the group pulse data(only pulse_description)
routes.put('/', pulse.edit);

// GET - Get list of first 10 groups present in the workspace
routes.get('/list', pulse.getPulseGroups);

// GET - Get list of next 5 groups present in the workspace based on the lastGroupId from fetched from the list of first 10 groups
routes.get('/list/next', pulse.getNextPulseGroups);

// GET - Get count of tasks due this week
routes.get('/tasks', pulse.getPulseTasks);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as pulseRoutes }