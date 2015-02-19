Athena Civic
============

[Athena](civicinsight.azurewebsites.net) is a web application for visualizing the civic technology space through an intuitive and interactive graphical network. Nodes represent the entities, which would consist of people and organizations, involved within this space, and the links represent the type of relationship/connection these entities share. 

Filtering options provide a unique method for visualizing certain aspects of the civic technology space.

|Type of Entities | Color Representation
|----------------|-----------------
|`For-Profit`|`Green`
|`Non-Profit`|`Blue`
|`Government`|`Red`
|`Individuals`|`Orange` 

|Type of Connections | Color Representation
|----------------|-----------------
|`Investing`|`Dark Green` 
|`Funding`|`Purple`
|`Collaboration`|`Yellow`
|`Data`|`Pink`

Cloning the Repository
----------------------

		git clone https://github.com/microsoftny/athena-civic.git

Setting Up MySQL Database Locally
---------------------------------

1. Install MAMP (for MACOSX), WAMP (for Windows), LAMP (Linux) or XAMPP (multi-platform) stack.
2. Turn on the stack's server.
3. Inside a browser, type into the address bar "localhost/phpmyadmin" to access the database's dashboard.
4. Establish local credentials via the "Users" tab and editing privileges:

![Alt text](https://raw.githubusercontent.com/microsoftny/athena-civic/master/screenshots/mysql_localhost_1.PNG "Screenshot 1")
![Alt text](https://raw.githubusercontent.com/microsoftny/athena-civic/master/screenshots/mysql_localhost_2.PNG "Screenshot 2")
![Alt text](https://raw.githubusercontent.com/microsoftny/athena-civic/master/screenshots/mysql_localhost_3.PNG "Screenshot 3")
![Alt text](https://raw.githubusercontent.com/microsoftny/athena-civic/master/screenshots/mysql_localhost_4.PNG "Screenshot 4")

5. Navigate to the config.inc file to retrieve your local database's credentials.

6. Edit the following piece of code in the app.js file:

    app.use(myConnection(mysql, {
    host: localhost,
    user: root,
    password: your_password,
    port: 3306,
    database: 'athena'
    }, 'request'));

7. Execute the mysqllocal.js script to parse the database:

    node mysqllocal

Running Application
--------------------

1. Clone the repository to the current directory. 
2. Change the working directory to the directoy of the repository.
3. Execute one of the two commands shown in the table below, depending on the machine's OS.

Running on localhost
--------------------

|Machine | Command
|------- | ---
|`Windows`| `DEBUG=app ./bin/www`
|`Mac`| `npm start`

4. Inside a browser, type into the address bar "http://localhost:3000" to launch the application.
