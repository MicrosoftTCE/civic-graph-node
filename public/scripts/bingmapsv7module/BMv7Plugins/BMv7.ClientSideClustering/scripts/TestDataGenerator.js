var TestDataGenerator = new function () {

    /*
    * Example data model that may be returned from a custom web service.
    */
    var ExampleDataModel = function (name, latitude, longitude) {
        this.Name = name;
        this.Latitude = latitude;
        this.Longitude = longitude;
    };


    /*
    * This function generates a bunch of random random data with 
    * coordinate information and returns it to a callback function 
    * similar to what happens when calling a web service.
    */
    this.GenerateData = function (numPoints, callback) {
        var data = [], randomLatitude, randomLongitude;

        for (var i = 0; i < numPoints; i++) {
            randomLatitude = Math.random() * 181 - 90;
            randomLongitude = Math.random() * 361 - 180;
            data.push(new ExampleDataModel("Point: " + i, randomLatitude, randomLongitude));
        }

        if (callback) {
            callback(data);
        }
    };
};