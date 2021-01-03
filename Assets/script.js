var searchInput = "";
var terms;
var population;
var pop;
var usedFacts = [];
var onLanding = true;

//Array which contains search parameters for yelp api call
terms = [
  "Starbucks",
  "resturant",
  "museum",
  "bowling alley",
  "park",
  "McDonalds",
];

//an array of objects that holds the funny fact description and the number accosiated with it.
var funFacts = [
  {
    description: "Kim's Convenience Stores",
    amount: 0.000000645677865,
  },
  {
    description: "Friendly neighborhood Spider men",
    amount: 0.000000532345,
  },
  {
    description: "'IT' clowns hiding in storm drains",
    amount: 0.0000002,
  },
  {
    description: "Rodents Of Unusal Size",
    amount: 0.234567,
  },
  {
    description: "Dudes in long jackets selling fake watches",
    amount: 0.00003499,
  },
  {
    description: "Sketchy street meat carts",
    amount: 0.00088334,
  },
  {
    description: "Portals to Narnia",
    amount: 0.000001445,
  },
  {
    description: "Autobots in disguise",
    amount: 0.00000087234,
  },
  {
    description: "Mutant Ninja Turtles in Sewers",
    amount: 0.00000493,
  },
  {
    description: "Channing Tatems pretentending to be in high shool",
    amount: 0.0000007839,
  },
];

//Creates searchBox elemetn and appends it to the landing page
var inputBox = $("<input>")
  .attr("id", "pac-input")
  .attr("type", "text")
  .attr("placeholder", "Find a City!")
  .addClass("pac-input controls landingSearchBox rounded center");

$("#landingPage").append(inputBox);

//Random number genorator to get random number for funny facts
//function also checks if random number has already been generated in current sequence
function getrando() {
  var match = true;
  while (match) {
    match = false;
    var rando = Math.floor(Math.random() * 10);
    if (usedFacts[0] === null) {
      //If used fact array is empty push random number to array
      usedFacts.push(rando);
      match = false;
    } else {
      for (var x = 0; x < usedFacts.length; x++) {
        if (usedFacts[x] === rando) {
          match = true;
        }
      }
    }
  }
  usedFacts.push(rando);
  return rando;
}

//beginning of Google maps API
// <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBIwzALxUPNbatRBj3Xi1Uhp0fFzwWNBkE&libraries=places">
function initAutocomplete() {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 33.973019, lng: -117.328236 }, //sets the location when app is opened
    zoom: 11, //zoom increases as number increases
    mapTypeId: "roadmap",
  });

  /** 
  //Auto complete parameters which limits the search to cities
  var options = {
  types: ['(cities)'],
  componentRestrictions: {country: "us"} //sets the search to a specific country
   };
  //Search box with auto correct
  const searchBox = new google.maps.places.Autocomplete(input, options);
  */

  // Create the search box and link it to the UI element.
  var input = document.querySelector("#pac-input");

  //Search box without auto correct
  var searchBox = new google.maps.places.SearchBox(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });

  let markers = [];

  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener("places_changed", () => {
    // Hide the landing page and reveal the search page
    if (!$("#landingPage").hasClass("hide")) {
      //If landing page is not hidden
      $("#landingPage").addClass("hide"); //Hide landing page
      $("#landingSearchCont").empty();
      $("#searchPage").removeClass("hide"); //Show search page
      $(".progress").removeClass("hide"); //Show Loading Bar
    } //End if

    //Reposition searchBox element and append it to new location on search page
    inputBox
      .css("margin-left", "20px")
      .css("margin-top", "13px")
      .css("text-align", "center")
      .width("75%")
      .addClass("onSearchPage")
      .attr("placeholder", "Find a City!"); //reset the search bar to the placeholder text

    $("#searchBoxPage").append(inputBox);

    //Sets places to search request
    const places = searchBox.getPlaces();

    //if no results are found do nothing
    if (places.length == 0) {
      return;
    }

    // Clear out the old markers from map.
    markers.forEach((marker) => {
      marker.setMap(null);
    });

    markers = []; //Sets the array that contains markers to empty so that new locations can be added
    usedFacts = []; //Sets the array that contains the fun fact indexes that have bveen used to null or empty.

    $("#cityDetails").empty(); //Empties out element that contains the city name and population
    $("#citySummary").empty();

    // For each place, get the icon, name and location.
    const bounds = new google.maps.LatLngBounds();

    //create city name element
    var cityName = $("<h4>")
      .text(places[0].formatted_address)
      .addClass("bold-text mt-1");

    //append city name to name div
    $("#cityDetails").append(cityName);

    //Stores the user input in a variable for later use
    searchInput = places[0].name;
    $(".cityName").text(searchInput);

    places.forEach((place) => {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }

      const icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25),
      };

      // Create a marker for each place.
      markers.push(
        new google.maps.Marker({
          map,
          icon,
          title: place.name,
          position: place.geometry.location,
        })
      );
      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);

    //GeoNames wikipedia api
    const geoSettings = {
      url:
        "http://api.geonames.org/wikipediaSearchJSON?q=" +
        searchInput +
        "&maxRows=10&username=hunter7",
      method: "GET",
    };
    $.ajax(geoSettings).then(function (resp) {
      //create sumamry element
      var summary = $("<p>").text(resp.geonames[0].summary); //font size set to large in css
      $("#citySummary").append(summary);
    });
    //end of wiki api

    //openweatherapi
    var queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${searchInput}&appid=55165c51eb244bc563baf90a2d02b714`;

    //ajax call
    $.ajax({
      url: queryURL,
      method: "GET",
    }).then(function (response) {
      pop = response.city.population;
      population = $("<p>").text(`Population: ${response.city.population}`);
      $("#cityDetails").append(population);

      //Funny facts
      for (var x = 0; x < 4; x++) {
        $(`#funFact${x}`).empty();
        $(`#funAmount${x}`).empty();

        var index = getrando(); //Gets random number that has not been called

        let funFactAmount = pop * funFacts[index].amount;
        if (funFactAmount < 1) {
          funFactAmount = 1;
        }

        var funFactAmounts = Math.round(funFactAmount);
        var funnyFacts = funFacts[index].description; //gets fun fact description from array randomly
        $(`#funFact${x}`).append(funnyFacts);
        $(`#funAmount${x}`).append(funFactAmounts);
      }
      //end of funny facts
    });
    //end os open weather api call

    //For loop that calls the yelp api
    //loop runs for each element in terms array
    for (i = 0; i < terms.length + 1; i++) {
      // yelp api
      const nameOfResponse = terms[i];
      const x = i;
      var herokuApp = "https://cors-anywhere.herokuapp.com/";
      var settings = {
        async: true,
        crossDomain: true,
        url:
          herokuApp +
          "https://api.yelp.com/v3/businesses/search?term=" +
          terms[i] +
          "&location=" +
          searchInput +
          "&limit=50&offset=51",
        method: "GET",
        headers: {
          Authorization:
            "Bearer vvvcCtcJU8SYfZfJOTtjqBoJWMEil9uycqIhOZ29UVDqHxQezCjKDUbSCkeAwmsrX4sRpOZffUZihfpWj08qre6NrhPhTeVzhBOhHjNcjDN2XHLYFvPVcgvDl5TZX3Yx",
          // "Access-Control-Allow-Origin": "*"
        },
      };
      $.ajax(settings).then(function (response) {
        $(`#usefulFactoids${x}`).empty();
        var perCapita = Math.ceil(pop / response.total);
        var items = "A " + nameOfResponse + " every " + perCapita + " people.";
        $(`#usefulFactoids${x}`).append(items);
        $(".progress").addClass("hide"); //Hide Loading Bar
      });
    }
  });
}

$("form").submit(function (e) {
  e.preventDefault();
});

// $("form").keypress(function (event) {
//   if (event.key == "Enter") {
//     $("#searchButton").click();
//   }
// });

//Google places api | Need to look into this to see if we can pull pictures from it
//Currently not in use
// let heroku = "https://cors-anywhere.herokuapp.com/";
// let queryURL =
//   "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=sydney&inputtype=textquery&fields=photos,formatted_address,name,opening_hours,rating&locationbias=circle:2000@47.6918452,-122.2226413&key=AIzaSyBxxikd5sBYySsC4ExQM_Y1plVzBP7Ljbk";
// $.ajax({
//   url: heroku + queryURL,
//   method: "GET",
//   dataType: "json",
// }).then(function (response) {
//   console.log(response);
// });
