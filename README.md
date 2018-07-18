# README #

### localhost run ###
Please follow these steps to run app on your local machine.

1. open cmd and go to our main app directory and run "npm i" command. 
2. go to public directory of the app and run "npm i" command again.
2. go to public directory of the app and run "ng build" command. 
3. go our main app directory and run "nodemon server" command 
4. go to your browser and run localhost:3000 and your are done 

### server run ###

1. Go to home/ubuntu/ and run 'pm2 run ecosystem.config.js'

###### Refereshing variable updates after changing 'ecosystem.config.js' file:

1. Go to home/ubuntu/ and run 'pm2 restart ecosystem.config.js --env production --update-env'

