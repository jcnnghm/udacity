/* Models */
// Represents a location with a helper that makes it easier to work with maps
var Location = function(name, latitude, longitude) {
    this.name = ko.observable(name);
    this.latitude = ko.observable(latitude);
    this.longitude = ko.observable(longitude);
    // Provides coordinates literal that works well with maps
    this.coordinates = ko.computed(function() {
        return {lat: this.latitude(), lng: this.longitude()};
    }, this);
};

// Represents a business loaded from FourSquare
var Business = function(fourSquareVenue) {
    // Compose the business using location, so it can be extended when necessary
    this.location = new Location(
        fourSquareVenue.name,
        fourSquareVenue.location.lat,
        fourSquareVenue.location.lng
    );
};

// Four Square API Helper
var FourSquare = {
    clientId: 'RJKS3DSU1ZO1V1M24AECTTITWHS1ZKYM2Y1C3LIQC4XZ5UVJ',
    clientSecret: 'ONNLRTXE2WPRC1DTH1KGZ34QGM1HRRMMQJPNYBCUZSTNE2VZ',
    version: '20130815',
    limit: 50,
    radius: 250,  // Meters from the location
    categoryId: '4d4b7105d754a06374d81259',  // Food Category
    // Searches for food businesses near location.  If a searchTerm is supplied
    // that term is used in the search.
    search: function(location, searchTerm) {
        var data = {
            client_id: this.clientId,
            client_secret: this.clientSecret,
            v: this.version,
            ll: location.latitude() + "," + location.longitude(),
            categoryId: this.categoryId,
            limit: this.limit,
            radius: this.radius
        };
        // Only include a search term if there is actually text
        if (searchTerm && searchTerm.trim().length > 0) data.query = searchTerm;
        return $.ajax({
            url: 'https://api.foursquare.com/v2/venues/search',
            data: data
        });
    }
};


/* View Models */
var ViewModel = function() {
    var self = this;

    this.googleMap = new google.maps.Map(document.getElementsByClassName('map')[0]);

    // saving the request is necessary so it can be aborted when we make a new
    // request
    this.fourSquareRequest = null;

    // Only update after searchTerm hasn't changed for at least 500ms
    this.searchTerm = ko.observable().extend(
        {rateLimit: {timeout: 500, method: "notifyWhenChangesStop"}}
    );
    this.searchTerm.subscribe(function(newValue) {
        this.search(newValue);
    }, this);

    this.locations = ko.observableArray([
        new Location('San Carlos', 37.506240, -122.260910),
        new Location('San Francisco', 37.786863, -122.399789)
    ]);

    this.businesses = ko.observableArray([]);
    // Markers need to be stored so they can be removed from the map
    this.mapMarkers = [];

    this.currentLocation = ko.observable();
    this.currentLocation.subscribe(function(newValue) {
        console.log("Switched to city: " + newValue.name());

        // Set the location on the map
        this.googleMap.setCenter(newValue.coordinates());
        this.googleMap.setZoom(18);

        // clear the current search
        $('.searchInput').val('');

        // Update the businesses on the map
        this.search();
    }, this);

    // Performs a search, resetting the businesses in the process
    this.search = function(searchTerm) {
        this.resetBusinesses();
        if (this.fourSquareRequest) this.fourSquareRequest.abort();
        this.fourSquareRequest = FourSquare.search(this.currentLocation(), searchTerm);
        this.fourSquareRequest.done(function(json) {
            json.response.venues.forEach(function(fourSquareVenue) {
                self.addBusiness(new Business(fourSquareVenue));
            });
        }).fail(function() {
            alert("FourSquare data load failed.  Please reload the page.");
        });
    };

    // Reset businesses, removing them from the map and the businesses list
    this.resetBusinesses = function() {
        this.businesses.removeAll();

        // clear map markers
        this.mapMarkers.forEach(function(marker) {
            marker.setMap(null);
        });
        this.mapMarkers = [];
    };

    // Add business to the map and to the businesses list
    this.addBusiness = function(business) {
        var marker = new google.maps.Marker({
            position: business.location.coordinates(),
            map: this.googleMap,
            title: business.location.name()
        });
        // call selectBusiness when the marker is clicked
        google.maps.event.addListener(marker, 'click', function() {
            self.selectBusiness(business);
            // animate for 700ms
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() { marker.setAnimation(null) }, 700);
        });
        this.mapMarkers.push(marker);
        this.businesses.push(business);
    };

    // Load street view when a business is selected
    this.selectBusiness = function(business) {
        console.log("Selected " + business.location.name());

        var panorama = self.googleMap.getStreetView();
        panorama.setPosition(business.location.coordinates());
        panorama.setVisible(true);
    };

    // Setup Initial Location
    this.currentLocation(this.locations()[0]);
};

$(function () {
    // Wait for the dom to be loaded to apply the binding
    ko.applyBindings(new ViewModel());
});