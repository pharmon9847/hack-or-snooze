"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {
  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    // UNIMPLEMENTED: complete this function!
    // TODO
    // * My Code **
    // gives the URL of the site the user submitted
    return new URL(this.url).host;
    // return "hostname.com";
  }
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map((story) => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, { title, author, url }) {
    // TODO write addStory() function

    // * My code **
    // UNIMPLEMENTED: complete this function!
    const token = user.loginToken;
    const response = await axios({
      method: "POST",
      url: `${BASE_URL}/stories`,
      data: { token, story: { title, author, url } },
    });

    const story = new Story(response.data.story);
    // using the unshift() method will add new story to the beginning of the stories array
    this.stories.unshift(story);
    // using the unshift() method will add new story to users stories array
    user.ownStories.unshift(story);

    return story;
  }

  // TODO create function for editing user story

  // * my code **
  // function to edit the user's story
  async editStory(user, { storyId, title, author, url }) {
    const token = user.loginToken;
    const response = await axios({
      // the patch method makes a partial change, i.e. editing the story
      method: "PATCH",
      url: `${BASE_URL}/stories/${storyId}`,
      data: { token, story: { title, author, url } },
    });
  }

  // TODO create function for deleting story

  // * My Code **
  //  create function to delete story
  // remove the story from the list of stories

  async deleteStory(user, storyId) {
    const token = user.loginToken;
    await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "DELETE",
      data: { token: user.loginToken },
    });

    // use the filter() method to find the storyId we want to delete
    // the strict inequality operator checks if the two are not equal and returns a boolean value
    this.stories = this.stories.filter((story) => story.storyId !== storyId);

    // use the filter() method to find the story we want to delete from users stories
    // the strict inequality operator checks if the two are not equal and returns a boolean value
    user.ownStories = user.ownStories.filter((s) => s.storyId !== storyId);
    // use the filter() method to find the story we want to delete from favorites
    // the strict inequality operator checks if the two are not equal and returns a boolean value
    user.favorites = user.favorites.filter((s) => s.storyId !== storyId);
  }
}

/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor(
    { username, name, createdAt, favorites = [], ownStories = [] },
    token
  ) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    // the map() method creates a new array with the results of calling a function on every element in the calling array
    this.favorites = favorites.map((s) => new Story(s));
    this.ownStories = ownStories.map((s) => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  /** Add a story to the list of user favorites and update the API
   * - story: a Story instance to add to favorites
   */

  // TODO create function for adding a story to favorites

  // * My code for addFavorite()
  // create function to add a particular story to the favorites list
  async addFavorite(story) {
    // use the push() method to add story to favorites array
    this.favorites.push(story);
    await this._addOrRemoveFavorite("add", story);
  }
  // ***

  // TODO create function for removing favorite from favorites list

  // * my code for removeFavorite()
  // create function to remove a particular story from the favorites list
  async removeFavorite(story) {
    this.favorites = this.favorites.filter((s) => s.storyId !== story.storyId);
    await this._addOrRemoveFavorite("remove", story);
  }

  /** Update API with favorite/not-favorite.
   *   - newState: "add" or "remove"
   *   - story: Story instance to make favorite / not favorite
   * */

  // TODO create function for updating api with favorite or not favorite

  // * my code for _addOrRemoveFavorite()
  // create function that handles both the adding and deleting of a story to favorites list
  async _addOrRemoveFavorite(newState, story) {
    // use ternary operator to differentiate behavior of either adding or deleting story
    // assign that behavior to the 'method' variable
    const method = newState === "add" ? "POST" : "DELETE";
    const token = this.loginToken;
    // this api call will use the result of the ternary operator to determine which api method to use
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      // now we can use the 'method' variable which has two behaviors
      method: method,
      data: { token },
    });
  }

  // TODO  determine whether given story instance is a user's favorite

  /** Return true/false if given Story instance is a favorite of this user. */
  // * my code for isFavorite()
  // create a boolean value for whether the particular story is a favorite or not
  isFavorite(story) {
    return this.favorites.some((s) => s.storyId === story.storyId);
  }
}
