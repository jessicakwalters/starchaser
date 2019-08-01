$(document).ready();
$('.fa-times').hide();

$('.clear-day').append('<i class="fas fa-sun fa-4x"></i>');
$('.clear-night').append('<i class="fas fa-moon fa-4x"></i>');
$('.rain').append('<i class="fas fa-cloud-rain fa-4x"></i>');
$('.snow').append('<i class="fas fa-snowflake fa-4x"></i>');
$('.sleet').append('<i class="fas fa-cloud-rain fa-4x"></i>');
$('.wind').append('<i class="fas fa-wind fa-4x"></i>');
$('.fog').append('<i class="fas fa-smog fa-4x"></i>');
$('.cloudy').append('<i class="fas fa-cloud fa-4x"></i>');
$('.partly-cloudy-day').append('<i class="fas fa-cloud-sun fa-4x"></i>');
$('.partly-cloudy-night').append('<i class="fas fa-cloud-moon fa-4x"></i>');

$('.new-moon').append('<img src="assets/svg/wi-moon-new.svg">');
$('.test').append('<img src="assets/svg/wi-moon-waning-crescent-3.svg">');
$('.first-quarter').append('<img src="assets/svg/wi-moon-first-quarter.svg">');
$('.full-moon').append('<img src="assets/svg/wi-moon-full.svg">');
$('.last-quarter').append('<img src="assets/svg/wi-moon-third-quarter.svg">');
$('.waxing-gibbous').append('<img src="assets/svg/wi-moon-waxing-gibbous-3.svg">');
$('.waxing-crescent').append('<img src="assets/svg/wi-moon-waxing-crescent-3.svg">');
$('.waning-gibbous').append('<img src="assets/svg/wi-moon-waning-gibbous-3.svg">');
$('.waning-crescent').append('<img src="assets/svg/wi-moon-waning-crescent-3.svg">');

$('.ideal').append('<i class="fas fa-grin-stars fa-4x"></i>');
$('.go').append('<i class="fas fa-smile fa-4x"></i>');
$('.meh').append('<i class="fas fa-meh fa-4x"></i>');
$('.no-go').append('<i class="fas fa-frown fa-4x"></i>');


$('.fa-bars').on('click', event => {
  $('.fa-bars').hide();
  $('#menu').toggleClass('hide');
  $('.fa-times').show();
  $('nav').css('background-color', 'rgb(9,13,13, .9)');
  event.preventDefault();
});

$('.fa-times').on('click', event => {
    $('.fa-times').hide();
    $('#menu').toggleClass('hide');
    $('nav').css('background-color', 'rgb(9,13,13, .35)');
    $('.fa-bars').show();
    event.preventDefault();
  });



