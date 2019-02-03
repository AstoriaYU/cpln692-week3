(function () {

  var map = L.map('map', {
    center: [39.9522, -75.1639],
    zoom: 14
  });
  var Stamen_TonerLite = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
  }).addTo(map);

  /* =====================

  # Lab 2, Part 4 — (Optional, stretch goal)

  ## Introduction

    You've already seen this file organized and refactored. In this lab, you will
    try to refactor this code to be cleaner and clearer - you should use the
    utilities and functions provided by underscore.js. Eliminate loops where possible.

  ===================== */

  // Mock user input
  // Filter out according to these zip codes:
  var acceptedZipcodes = [19106, 19107, 19124, 19111, 19118];
  // Filter according to enrollment that is greater than this variable:
  var minEnrollment = 300;

  // refactored codes of clean data
  schools = _.each(schools, function(s) {
    if (_.isString(s.ZIPCODE)) {
      split = s.ZIPCODE.split(' ');
      normalized_zip = parseInt(split[0]);
      s.ZIPCODE = normalized_zip;
    }
  });

  schools = _.each(schools, function(g) {
    if (_.isNumber(g.GRADE_ORG)) {
      g.HAS_KINDERGARTEN = g.GRADE_LEVEL < 1;
      g.HAS_ELEMENTARY = 1 < g.GRADE_LEVEL < 6;
      g.HAS_MIDDLE_SCHOOL = 5 < g.GRADE_LEVEL < 9;
      g.HAS_HIGH_SCHOOL = 8 < g.GRADE_LEVEL < 13;
    }
    else if (!_.isNumber(g.GRADE_ORG)) {
      g.HAS_KINDERGARTEN = g.GRADE_LEVEL.toUpperCase().indexOf('K') >= 0;
      g.HAS_ELEMENTARY = g.GRADE_LEVEL.toUpperCase().indexOf('ELEM') >= 0;
      g.HAS_MIDDLE_SCHOOL = g.GRADE_LEVEL.toUpperCase().indexOf('MID') >= 0;
      g.HAS_HIGH_SCHOOL = g.GRADE_LEVEL.toUpperCase().indexOf('HIGH') >= 0;
    }
  });

  // refactored codes of filter data
    var filtered_data = _.filter(schools, function(f) {
      isOpen = f.ACTIVE.toUpperCase() == 'OPEN';
      isPublic = (f.TYPE.toUpperCase() !== 'CHARTER' ||
                  f.TYPE.toUpperCase() !== 'PRIVATE');
      isSchool = (f.HAS_KINDERGARTEN ||
                  f.HAS_ELEMENTARY ||
                  f.HAS_MIDDLE_SCHOOL ||
                  f.HAS_HIGH_SCHOOL);
      meetsMinimumEnrollment = f.ENROLLMENT > minEnrollment;
      meetsZipCondition = acceptedZipcodes.indexOf(f.ZIPCODE) >= 0;
      filter_condition = (isOpen &&
                          isSchool &&
                          meetsMinimumEnrollment &&
                          !meetsZipCondition);
                          return filter_condition;
    });
    var filtered_out = _.difference(schools, filtered_data);

  console.log('Included:', filtered_data.length);
  console.log('Excluded:', filtered_out.length);

  // refactored codes of main loop
  _.each(filtered_data, function(c) {
    isOpen = c.ACTIVE.toUpperCase() == 'OPEN';
    isPublic = (c.TYPE.toUpperCase() !== 'CHARTER' ||
                c.TYPE.toUpperCase() !== 'PRIVATE');
    meetsMinimumEnrollment = c.ENROLLMENT > minEnrollment;
    if (c.HAS_HIGH_SCHOOL) {
      color = '#0000FF';
    }
    else if (c.HAS_MIDDLE_SCHOOL) {
      color = '#00FF00';
    }
    else {
      color = '##FF0000';
    }
    pathOpts = {'radius': c.ENROLLMENT / 30,
                    'fillColor': color};
    L.circleMarker([c.Y, c.X], pathOpts)
      .bindPopup(c.FACILNAME_LABEL)
      .addTo(map);
  });
  
  // clean data
  /*for (var i = 0; i < schools.length - 1; i++) {
    // If we have '19104 - 1234', splitting and taking the first (0th) element
    // as an integer should yield a zip in the format above
    if (typeof schools[i].ZIPCODE === 'string') {
      split = schools[i].ZIPCODE.split(' ');
      normalized_zip = parseInt(split[0]);
      schools[i].ZIPCODE = normalized_zip;
    }

    // Check out the use of typeof here — this was not a contrived example.
    // Someone actually messed up the data entry
    if (typeof schools[i].GRADE_ORG === 'number') {  // if number
      schools[i].HAS_KINDERGARTEN = schools[i].GRADE_LEVEL < 1;
      schools[i].HAS_ELEMENTARY = 1 < schools[i].GRADE_LEVEL < 6;
      schools[i].HAS_MIDDLE_SCHOOL = 5 < schools[i].GRADE_LEVEL < 9;
      schools[i].HAS_HIGH_SCHOOL = 8 < schools[i].GRADE_LEVEL < 13;
    } else {  // otherwise (in case of string)
      schools[i].HAS_KINDERGARTEN = schools[i].GRADE_LEVEL.toUpperCase().indexOf('K') >= 0;
      schools[i].HAS_ELEMENTARY = schools[i].GRADE_LEVEL.toUpperCase().indexOf('ELEM') >= 0;
      schools[i].HAS_MIDDLE_SCHOOL = schools[i].GRADE_LEVEL.toUpperCase().indexOf('MID') >= 0;
      schools[i].HAS_HIGH_SCHOOL = schools[i].GRADE_LEVEL.toUpperCase().indexOf('HIGH') >= 0;
    }
  }

  // filter data
  var filtered_data = [];
  var filtered_out = [];
  for (var i = 0; i < schools.length - 1; i++) {
    isOpen = schools[i].ACTIVE.toUpperCase() == 'OPEN';
    isPublic = (schools[i].TYPE.toUpperCase() !== 'CHARTER' ||
                schools[i].TYPE.toUpperCase() !== 'PRIVATE');
    isSchool = (schools[i].HAS_KINDERGARTEN ||
                schools[i].HAS_ELEMENTARY ||
                schools[i].HAS_MIDDLE_SCHOOL ||
                schools[i].HAS_HIGH_SCHOOL);
    meetsMinimumEnrollment = schools[i].ENROLLMENT > minEnrollment;
    meetsZipCondition = acceptedZipcodes.indexOf(schools[i].ZIPCODE) >= 0;
    filter_condition = (isOpen &&
                        isSchool &&
                        meetsMinimumEnrollment &&
                        !meetsZipCondition);

    if (filter_condition) {
      filtered_data.push(schools[i]);
    } else {
      filtered_out.push(schools[i]);
    }
  }
  console.log('Included:', filtered_data.length);
  console.log('Excluded:', filtered_out.length);

  // main loop
  var color;
  for (var i = 0; i < filtered_data.length - 1; i++) {
    isOpen = filtered_data[i].ACTIVE.toUpperCase() == 'OPEN';
    isPublic = (filtered_data[i].TYPE.toUpperCase() !== 'CHARTER' ||
                filtered_data[i].TYPE.toUpperCase() !== 'PRIVATE');
    meetsMinimumEnrollment = filtered_data[i].ENROLLMENT > minEnrollment;

    // Constructing the styling  options for our map
    if (filtered_data[i].HAS_HIGH_SCHOOL){
      color = '#0000FF';
    } else if (filtered_data[i].HAS_MIDDLE_SCHOOL) {
      color = '#00FF00';
    } else {
      color = '##FF0000'
    }
    // The style options
    var pathOpts = {'radius': filtered_data[i].ENROLLMENT / 30,
                    'fillColor': color};
    L.circleMarker([filtered_data[i].Y, filtered_data[i].X], pathOpts)
      .bindPopup(filtered_data[i].FACILNAME_LABEL)
      .addTo(map);
  }*/

})();
