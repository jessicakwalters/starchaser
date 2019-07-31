# starchaser
A Dark Spot finder for those who love the stars.

# Authors

Eric Huang

Gina Pultrak

Hanna Alemu

Jessica Walters

#Description

Starchaser is a mobile-first web-application designed for people who enjoy star-gazing. It takes in the location of the user as input and searches for dark sky parks near the user, sorted by distance. It also displays the weather  and moon phase information for the following 7 days. It also gives the user a recommendation on whether to go stargazing on that day to that location.

#How it works

1. Starchaser recieves the location name from the user and sends the data to the Google Geocode API. 
2. It then recieves the latitude and longitude for the location from the Geocode API and sends the data to the Wheather API to get the weather and moonphase info for each park.
3. Then, the app sends the user's location, and the latitude and longitude of the parks to a different Google API(Distance Metrix API) to compare the distance of each park to the user. After it gets the distances it sorts them from nearest to farthest and displays the nearest three parks.

