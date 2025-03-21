import express from 'express';
import { PulseFunctions } from '../controllers';
import { Auths } from '../../utils';
import http from 'axios';

const routes = express.Router();
const pulse = new PulseFunctions();

// Auths Helper Function
const authsHelper = new Auths();

// -| Authentication |-

// Verify the token
routes.use(authsHelper.verifyToken);

// Checks whether the current user is loggedIn or not
routes.use(authsHelper.isLoggedIn);

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

// GET - Get count of undone tasks which were due this week
routes.get('/undone-tasks', pulse.getTasksUndoneLastWeek);

// GET - Get list of groups present in the workspace
routes.get('/global-performance', pulse.getGlobalPerformanceGroups);

// GET - Get list of groups present in the workspace
routes.get('/global-performance-tasks', pulse.getGlobalPerformanceTasks);

// GET - Get list of tasks present in a project
routes.get('/kpi-performance-tasks', pulse.getKpiPerformanceTasks);

// GET - Get count of pulse in a period
routes.get('/count', pulse.getPulseCount);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as pulseRoutes }