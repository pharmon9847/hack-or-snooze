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

  // * My code ***
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

// * my code for creating a delete button
function getDeleteBtnHTML() {
  return `
    <span class="trash-can">
      <i class="fas fa-trash-alt"></i>
    </span>`;
}

// * my code for the favorites star
function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const typeOfStar = isFavorite ? "fas" : "far";
  return `
    <span class="star">
      <i class="${typeOfStar} fa-star"></i>
    </span>`;
}
// *****

// * my code for an edit button
function getEditBtnHTML(currentUser, storyId) {
  if (
    currentUser &&
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

// * my code for deleting a story
async function deleteStory(event) {
  console.debug("deleteStory");
  const $closestLi = $(event.target).closest("li");
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId);

  await putUserStoriesOnPage();
}

$ownStories.on("click", ".trash-can", deleteStory);
$allStoriesList.on("click", ".trash-can", deleteStory);
$favoritedStories.on("click", ".trash-can", deleteStory);

// * my code for submitting a story
async function submitNewStory(event) {
  event.preventDefault();

  const title = $("#create-title").val();
  const url = $("#create-url").val();
  const author = $("#create-author").val();
  const username = currentUser.username;
  const storyData = { title, url, author, username };
  const story = await storyList.addStory(currentUser, storyData);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  $submitForm.slideUp("slow");
  $submitForm.trigger("reset");
}

$submitForm.on("submit", submitNewStory);

// * my code for showing user stories
function putUserStoriesOnPage() {
  $ownStories.empty();

  if (currentUser.ownStories.length === 0) {
    $ownStories.append("<h4>User has not submitted any stories yet</h4>");
  } else {
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true);
      $ownStories.append($story);
    }
  }
  $ownStories.show();
}

// * my code for showing users favorites
function putFavoritesListOnPage() {
  $favoritedStories.empty();

  if (currentUser.favorites.length === 0) {
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

// * my code making a story a favorite or removing favorite from story
async function addRemoveFavoriteStory(event) {
  const $tgt = $(event.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find((s) => s.storyId === storyId);

  if ($tgt.hasClass("fas")) {
    await currentUser.removeFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  } else {
    await currentUser.addFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  }
}

$storiesLists.on("click", ".star", addRemoveFavoriteStory);

async function submitEditStoryForm(event) {
  console.debug("submitEditStoryForm");
  event.preventDefault();

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
  start();
}

$storyEditForm.on("submit", submitEditStoryForm);

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
