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

Running Application
--------------------

1. Install MAMP (for MACOSX), WAMP (for Windows) or XAMPP (multi-platform).
2. For Macs, the "MAMP" folder can be found under Applications. For Windows, the "wamp" folder can be found under C:
3. Clone the Github repo to htdocs under the "MAMP" folder if on a Mac machine, or clone the Github repo to www under the "wamp" folder if on a Windows machine.
4. Execute the MAMP or WAMP application and turn on the localhost server.
5. Inside a terminal or command prompt, navigate to the cloned repo and enter the following commands:

			npm install
			node app (or npm start)

6. Depending on the port, you should be able to access Athena on your local machine using the following links.
	
Running on localhost
--------------------

|Machine | URL
|------- | ---
|`Windows`| `localhost:3000`
|`Mac`| `localhost:port_number/athena-civic`
