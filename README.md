Athena - Civic Insight
======================

[Athena](http://civicinsight.azurewebsites.net) is a web application for better understanding the field of civic technology through an intuitive and interactive graphical network view. Nodes represent entities, which could consist of people or organizations involved in the field of civic technology. The links among the entities represent the types of relationships or connections these entities share.

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
	 (For MACOSX type "localhost:8888/phpmyadmin")
4. Establish local credentials via the "Users" tab and editing privileges:

	 (For Windows:)

  ![Alt text](https://raw.githubusercontent.com/microsoftny/athena-civic/master/screenshots/mysql_localhost_1.PNG "Screenshot 1")
  ![Alt text](https://raw.githubusercontent.com/microsoftny/athena-civic/master/screenshots/mysql_localhost_2.PNG "Screenshot 2")
  ![Alt text](https://raw.githubusercontent.com/microsoftny/athena-civic/master/screenshots/mysql_localhost_3.PNG "Screenshot 3")
  ![Alt text](https://raw.githubusercontent.com/microsoftny/athena-civic/master/screenshots/mysql_localhost_4.PNG "Screenshot 4")

	(For MACOSX:)

	![Alt text](https://raw.githubusercontent.com/microsoftny/athena-civic/master/screenshots/mySQLMAC1.png "Mac Screenshot 1")
	![Alt text](https://raw.githubusercontent.com/microsoftny/athena-civic/master/screenshots/mySQLMAC2.png "Mac Screenshot 2")
	![Alt text](https://raw.githubusercontent.com/microsoftny/athena-civic/master/screenshots/mySQLMAC3.png "Mac Screenshot 3")
	![Alt text](https://raw.githubusercontent.com/microsoftny/athena-civic/master/screenshots/mySQLMAC4.png "Mac Screenshot 4")


5. Navigate to the config.inc.php file to retrieve your local database's credentials.
	 (For MACOSX the config.inc.php file is in applications/mamp/bin/phpMyAdmin/)

 	(For Windows:)
  ![Alt text](https://raw.githubusercontent.com/microsoftny/athena-civic/master/screenshots/mysql_localhost_5.PNG "Screenshot 5")
  ![Alt text](https://raw.githubusercontent.com/microsoftny/athena-civic/master/screenshots/mysql_localhost_6.PNG "Screenshot 6")

	(For MACOSX:)
	![Alt text](https://raw.githubusercontent.com/microsoftny/athena-civic/master/screenshots/mySQLMAC5.png "Mac Screenshot 5")


6. Edit the following piece of code in the app.js file based on the configurations found:

	(For Windows:)

  ```
  app.use(myConnection(mysql, {
    host: localhost,
    user: root,
    password: your_password,
    port: 3306,
    database: 'athena'
    }, 'request'));
  ```

	For MACOSX:
	 	Your app.js file changes will look like this (replace root with your set password)
	![Alt text](https://raw.githubusercontent.com/microsoftny/athena-civic/master/screenshots/mySQLMAC6.png "Mac Screenshot 6")
		You also need to update mysqllocal.js with the new password
	![Alt text](https://raw.githubusercontent.com/microsoftny/athena-civic/master/screenshots/mySQLMAC7.png "Mac Screenshot 7")


7. Execute the mysqllocal.js script to parse the database:

  ```
    node mysqllocal
  ```

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
