"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteBtn = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  // TODO show favorite star if user is logged in
  // TODO add buttons/icons to storyMarkup

  // * My code
  // if a user is logged in, show favorite/not-favorite star
  // using the Boolean() constructor here means we are assigning the true value to the variable
  const showFavoriteStar = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
        <div>
        ${showDeleteBtn ? getDeleteBtnHTML() : ""}
        ${showFavoriteStar ? getStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        ${getEditBtnHTML(currentUser, story.storyId)}
        <small class="story-hostname">(${hostName})</small>
        <div class="story-author">by ${story.author}</div>
        <div class="story-user">posted by ${story.username}</div>
        </div>
      </li>
    `);
}

// TODO create a delete button/icon

// * my code for creating a delete button
// create function that makes the HTML for the delete button
function getDeleteBtnHTML() {
  return `
    <span class="trash-can">
      <i class="fas fa-trash-alt"></i>
    </span>`;
}

// TODO create a favorites star/icon

// * my code for the favorites star
// create function that makes the HTML for the star
function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const typeOfStar = isFavorite ? "fas" : "far";
  return `
    <span class="star">
      <i class="${typeOfStar} fa-star"></i>
    </span>`;
}

// TODO create an edit button/icon

// * my code for an edit button
// create function that makes the HTML for the edit button
function getEditBtnHTML(currentUser, storyId) {
  if (
    currentUser &&
    // using the some() method will test to see if at least one element in the array passes
    // the implemented function and if at least one does, it returns true
    currentUser.ownStories.some((s) => s.storyId === storyId)
  ) {
    return `
      <span class="edit-btn">
        <i class="fas fa-edit"></i>
      </span>`;
  } else {
    return "";
  }
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

// TODO create function to handle deleting a story

/** Handle deleting a story. */

// * my code for deleting a story
async function deleteStory(event) {
  console.debug("deleteStory");

  const $closestLi = $(event.target).closest("li");
  const storyId = $closestLi.attr("id");

  await storyList.deleteStory(currentUser, storyId);

  // re-generate story list
  await putUserStoriesOnPage();
}

$ownStories.on("click", ".trash-can", deleteStory);
$allStoriesList.on("click", ".trash-can", deleteStory);
$favoritedStories.on("click", ".trash-can", deleteStory);

// TODO create a function for submitting a story

/** Handle submitting new story form. */

// * my code for submitting a story
async function submitNewStory(event) {
  console.debug("submitNewStory");
  event.preventDefault();

  // get all the information from the form
  const title = $("#create-title").val();
  const url = $("#create-url").val();
  const author = $("#create-author").val();
  const username = currentUser.username;
  const storyData = { title, url, author, username };
  const story = await storyList.addStory(currentUser, storyData);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  // we now want to hide the form and reset it
  $submitForm.slideUp("slow");
  $submitForm.trigger("reset");
}

// create event listener for when user hits the submit button
$submitForm.on("submit", submitNewStory);

// TODO create a function for showing user's stories

// * my code for showing user stories
function putUserStoriesOnPage() {
  $ownStories.empty();

  if (currentUser.ownStories.length === 0) {
    // if there are no stories to show, display this message
    $ownStories.append("<h4>User has not submitted any stories yet</h4>");
  } else {
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true);
      $ownStories.append($story);
    }
  }
  $ownStories.show();
}

// TODO create a function for showing user's favorites

// * my code for showing users favorites
function putFavoritesListOnPage() {
  $favoritedStories.empty();

  if (currentUser.favorites.length === 0) {
    // if there are no favorites, display this message
    $favoritedStories.append(
      "<h4>User has not added any favorite stories yet</h4>"
    );
  } else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  }
  $favoritedStories.show();
}

// TODO create function to handle when a user favorites or un-favorites a story

/** Handle favorite/un-favorite a story */

// * my code making a story a favorite or removing favorite from story
async function addRemoveFavoriteStory(event) {
  console.debug("addRemoveFavoriteStory");

  const $tgt = $(event.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find((s) => s.storyId === storyId);

  // use if/else conditional to see if story is favorite
  // check to see if the star is present to indicate favorite
  if ($tgt.hasClass("fas")) {
    // the story is a favorite, so change the star and remove from favorites list
    await currentUser.removeFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  } else {
    // the story is not a favorite, do opposite of the if statement
    await currentUser.addFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  }
}

// create event listener for when user hits the favorites star
$storiesLists.on("click", ".star", addRemoveFavoriteStory);

// TODO create a function to handle when user edits a story

// create function to handle editing user story
async function submitEditStoryForm(event) {
  console.debug("submitEditStoryForm");
  event.preventDefault();

  // get new values
  const storyId = $("#story-edit-id").val();
  const title = $("#story-edit-title").val();
  const author = $("#story-edit-author").val();
  const url = $("#story-edit-url").val();

  await storyList.editStory(currentUser, {
    storyId,
    title,
    author,
    url,
  });
  // regenerate the story list
  start();
}

// create event listener for when user hits the 'edit story' button
$storyEditForm.on("submit", submitEditStoryForm);

// TODO create a function to handle a user clicking the edit button/icon

// create function to handle click event on edit form
function editStoryFormClick(event) {
  console.debug("editStoryFormClick", event);
  hidePageComponents();
  $storyEditForm.trigger("reset");

  const storyId = $(event.target).closest("li").attr("id");
  const story = storyList.stories.find((s) => s.storyId === storyId);

  $storyEditId.attr("value", storyId);
  $storyEditTitle.attr("value", story.title);
  $storyEditAuthor.attr("value", story.author);
  $storyEditURL.attr("value", story.url);

  $storyEditForm.show();
}

$allStoriesList.on("click", ".edit-btn", editStoryFormClick);
$favoritedStories.on("click", ".edit-btn", editStoryFormClick);
$ownStories.on("click", ".edit-btn", editStoryFormClick);
