/*******************************************************************************
* Author: John OBrien
* Website: http://www.soulsolutions.com.au
* Date: 4th March 2012
* 
* Description: 
* This JavaScript file provides any Bing Map application with a shareable anchor url and optionally can persist across user sessions
*
* Requirements:
* This module will replace any other anchor, you need to use the userParameter for custom values instead.

* Usage:
* The Persistence constructor requires:
* - A reference to a map object
* - Do you want the last view saved between sessions? (NOTE: currently uses cookies, if set to false (default) will not create any cookies)
* - Optional call for when the user parameter to store custom object changes, includes first load.
* - Optional user parameter to store custom object, eg what data is shown.
* - Optional to force not loading previous view (Only relivant if saveView = true)
*
*/

var Persistence = function (map, saveView, userParameterChangedCallback, userParameter, force) {

    /* Private Properties */
    var _t = this;
    var _map = map;
    var _saveView = saveView ? true : false;
    var _userParameterChangedCallback = userParameterChangedCallback;
    var _userParameter = userParameter;
    var _force = (_saveView && force) ? true : false;
    var _key = 'MapPersistence=';
    var _storedAnchor = '';


    /* Private Methods */
    function _init() {

        // Get previous setting from storage so long as a setting was not provided on the url.
        if (!_getPersistence() && !_force) {
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(_key) == 0) {
                    document.location.hash = decodeURI(c.substring(_key.length, c.length));
                    i = ca.length;
                }
            }
            _getPersistence();
        }

        // Wire up the event handler to store changes
        Microsoft.Maps.Events.addThrottledHandler(_map, 'viewchangeend', _setPersistence, 300);
        Microsoft.Maps.Events.addHandler(_map, 'imagerychanged', _setPersistence);

        //TODO: need an event that fires when labels are turned on/off.

        //Wire up timer to check if the URL has been updated manually
        setInterval(function () { _t.TimerTick(); }, 300);

        //Do we save on exit?
        if (_saveView) {
            //subscribe to unload
            window.onbeforeunload = function (e) {
                _onexit();
            }
        }

        delete _init;
    }

    function _setPersistence() {
        var latlon = map.getCenter();
        var heading = map.getHeading();
        var newAnchor = latlon.latitude.toFixed(5) + ',' + latlon.longitude.toFixed(5);
        if (heading && heading != 0) {
            newAnchor = newAnchor + ',' + heading.toFixed(0);
        }
        newAnchor = newAnchor + '/' + map.getZoom().toFixed(2) + '/' + map.getImageryId();

        //TODO: replace with documented solution to tell if labels are on/off once known.
        var labelsOn = true;
        var options = map.getOptions();
        if (options && options.labelOverlay && options.labelOverlay == 1) {
            labelsOn = false;
        }

        if (labelsOn) {
            newAnchor = newAnchor + 'Labels';
        }

        if (_userParameter) {
            newAnchor = newAnchor + '/' + _userParameter;
        }
        if (_storedAnchor != newAnchor) {
            _storedAnchor = newAnchor;
            document.location.hash = _storedAnchor;
        }
    }

    function _getPersistence() {
        var currentAnchor = document.location.hash;
        if (currentAnchor && _storedAnchor != currentAnchor.substring(1)) {
            _storedAnchor = currentAnchor.substring(1);
            var splits = currentAnchor.substring(1).split('/');
            if (splits.length > 2) {
                try {
                    var locsplits = splits[0].split(',');
                    var lat = parseFloat(locsplits[0]);
                    var lon = parseFloat(locsplits[1]);
                    var heading = 0;
                    if (locsplits.length > 2) {
                        heading = parseInt(locsplits[2]);
                    }
                    var zoom = parseFloat(splits[1]);
                    var mode = Microsoft.Maps.MapTypeId.auto;
                    var modestring = splits[2].toLowerCase();
                    var labelOverlay = Microsoft.Maps.LabelOverlay.hidden;
                    if (modestring.search('labels') >= 0) {
                        labelOverlay = Microsoft.Maps.LabelOverlay.visible;
                        modestring = modestring.replace('labels', '');
                    }
                    switch (modestring) {
                        case 'automatic':
                            mode = Microsoft.Maps.MapTypeId.auto;
                            break;
                        case 'road':
                            mode = Microsoft.Maps.MapTypeId.road;
                            break;
                        case 'aerial':
                            mode = Microsoft.Maps.MapTypeId.aerial;
                            break;
                        case 'birdseye':
                        case 'enhancedbirdseye':
                        case 'nativebirdseye':
                            mode = Microsoft.Maps.MapTypeId.birdseye;
                            break;
                    }

                    map.setView({ zoom: zoom, center: new Microsoft.Maps.Location(lat, lon), mapTypeId: mode, heading: heading, animate: false, labelOverlay: labelOverlay });
                    if (splits.length > 3) {
                        _userParameter = currentAnchor.substring(4 + splits[0].length + splits[1].length + splits[2].length);
                        // Call the callback function, if specified
                        if (_userParameterChangedCallback) {
                            _userParameterChangedCallback(_userParameter);
                        }
                    }
                    return true;
                } catch (e) {
                    //ignore this, invalid data.
                }
            }
        }
        return false;
    }

    function _onexit() {
        var date = new Date();
        date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
        var expires = '; expires=' + date.toGMTString();
        document.cookie = _key + encodeURI(_storedAnchor) + expires + '; path=/';
    }

    /* Public Methods */

    this.SetUserParameter = function (userParameter) {
        _userParameter = userParameter;
        _setPersistence();
    };

    this.TimerTick = function () {
        _getPersistence();
    };

    // Call the initialisation routine
    _init();
};

// Call the Module Loaded method
Microsoft.Maps.moduleLoaded('PersistenceModule');