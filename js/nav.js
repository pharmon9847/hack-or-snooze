"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(event) {
  console.debug("navAllStories", event);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

// TODO
// * create several functions to handle events on the nav bar
// we need one for clicking on favorites
// we need one for clicking on 'my stories'
// we need one for clicking on user profile
// we need one for submitting a story

// TODO create a function that shows form to submit a story

/** Show story submit form on clicking story "submit" */
function navSubmitStoryClick(event) {
  console.debug("navSubmitStoryClick", event);
  hidePageComponents();
  $allStoriesList.show();
  // $allStoriesList.hide();
  $submitForm.show();
}

// create event listener for the submit story button
$navSubmitStory.on("click", navSubmitStoryClick);

// TODO create a function for clicking on favorites

// Clicking on the favorites button
function navFavoritesClick(event) {
  console.debug("navFavoritesClick", event);
  hidePageComponents();
  putFavoritesListOnPage();
}

// create event listener for clicking the favorites star
$body.on("click", "#nav-favorites", navFavoritesClick);

// TODO create a function for clicking on my stories

// clicking on the 'my stories' button
function navMyStories(event) {
  console.debug("navMyStories", event);
  hidePageComponents();
  putUserStoriesOnPage();
  $ownStories.show();
}

// create event listenenr for clicking on my stoies button
$body.on("click", "#nav-my-stories", navMyStories);

/** Show login/signup on click on "login" */

function navLoginClick(event) {
  console.debug("navLoginClick", event);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
  $storiesContainer.hide();
}

// creat event listener for clicking on login button
$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").css("display", "flex");
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/** Hide everything but profile on click on "profile" */

// TODO create function for showing user's profile

// clicking on profile button
function navProfileClick(event) {
  console.debug("navProfileClick", event);
  hidePageComponents();
  $userProfile.show();
}

// create event listener for clicking on the profile button (user name)
$navUserProfile.on("click", navProfileClick);
