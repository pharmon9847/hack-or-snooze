"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
  $storiesContainer.hide();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

// * create several functions to handle events on the nav bar
// we need one for clicking on favorites
// we need one for clicking on 'my stories'
// we need one for clicking on user profile
// we need one for submitting a story

// Clicking on the favorites button
function navbarClickOnFavorite(event) {
  hidePageComponents();
  putFavoritesListOnPage();
}

$body.on("click", "#nav-favorites", navbarClickOnFavorite);

// clicking on the 'my stories' button
function navbarClickOnMyStories(event) {
  hidePageComponents();
  putUserStoriesOnPage();
  $ownStories.show();
}

$body.on("click", "nav-my-stories".navbarClickOnMyStories);

// clicking on profile button
function navbarClickOnProfile(event) {
  hidePageComponents();
  $userProfile.show();
}

$navUserProfile.on("click", navbarClickOnProfile);

// clicking the submit story button
function navbarSubmitStoryClick(event) {
  hidePageComponents();
  $allStoriesList.show();
  $submitForm.show();
}

$navSubmitStory.on("click", navbarSubmitStoryClick);
