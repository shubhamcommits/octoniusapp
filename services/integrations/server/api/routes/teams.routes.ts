import express from 'express';
import { TeamsController } from '../controllers'

const routes = express.Router();

const teamsFunctions = new TeamsController();

routes.post('/teams-auth',teamsFunctions.authTeam);

routes.post('/is-teams-auth-user',teamsFunctions.isAuthTeamUser);

routes.post('/team-card-required-data',teamsFunctions.getCardData);

routes.post('/team-create-task',teamsFunctions.teamTaskCreation);

routes.get('/disconnect-team',teamsFunctions.disconnectTeam);


export { routes as teamsRoutes };