import Pocketbase from "pocketbase"
import { writable } from "svelte/store"

export const pb = new Pocketbase("https://gld.pockethost.io/")
export const authStore = writable(pb.authStore)

/**
 * Registers a new user with the given email, password, and username.
 *
 * @param {Object} user - An object containing the user's information.
 * @param {string} user.email - The email address of the user.
 * @param {string} user.password - The password of the user.
 * @param {string} user.username - The username of the user.
 * @return {Promise<void>} A promise that resolves when the user is registered successfully.
 */
export const register = async ({email, password, username}: {email: string, password: string, username: string}) => {
    // create user
    const model = {
        username: username.toLowerCase(),
        email: email,
        emailVisibility: true,
        password: password,
        passwordConfirm: password, // sla pra q isso
        displayName: username,
    }
    
    await pb.collection("users").create(model)

    // login
    await pb.collection("users").authWithPassword(email, password)

    //only redirects if not gld
    if (!navigator.userAgent.includes("ProjectGLD")) {
    location.href = "/search"
	}

    authStore.set(pb.authStore)
}

/**
 * Logs in a user with the provided email and password.
 *
 * @param {Object} credentials - The email and password of the user.
 * @param {string} credentials.email - The email of the user.
 * @param {string} credentials.password - The password of the user.
 */
export const login = async ({ email, password }: { email: string; password: string }) => {
  try {
    const response = await pb.collection("users").authWithPassword(email, password);

    authStore.set(pb.authStore);

    //ez fix with dynamic delay
    //await WaitTillPopulate(); //use only if needed

    //only redirects if not gld
	 if (!navigator.userAgent.includes("ProjectGLD")) {
	 location.href = "/search";
	}
  } catch (error) {
    console.error("Error in authentication:", error);
  }
};

async function WaitTillPopulate() {
  return new Promise((resolve) => {
    const CheckRequest = () => {
      const request = GetAuthRequest();
      if (!request ||  request.responseEnd > 0) {
         const DelaytoRedirect = request ? request.duration + 100 : 0;

         setTimeout(() => {
          resolve();
        }, DelaytoRedirect);      } else {
        setTimeout(CheckRequest, 100);
      }
    };
    CheckRequest();
  });
}

 function GetAuthRequest() {
  const requests = Array.from(window.performance.getEntriesByType("resource"))
    .filter(entry => entry.initiatorType === 'fetch' && entry.name.includes('auth-with-password'));

  return requests.length > 0 ? requests[0] : null;
}
/**
 * Logs the user out by clearing the authentication store, setting the updated authentication store,
 * and redirecting to the home page.
 *
 * @return {Promise<void>} This function does not return anything.
 */
export const logout = async () => {
    pb.authStore.clear()
    authStore.set(pb.authStore)
    
    if (navigator.userAgent.includes("ProjectGLD")) {
        location.href = "/fromlogout"
    } else {
        location.href = "/"
    }
}

/**
 * Updates the user settings with the provided information.
 * 
 * @param {Object} settings - An object containing the new settings.
 * @param {string} settings.username - The new username.
 * @param {string} settings.email - The new email.
 * @param {string} settings.desc - The new description.
 * @param {string} settings.pfp - The new profile picture.
 * @return {Promise<void>} - A promise that resolves when the settings are updated.
 */
export const updateSettings = async (
    {username, email, desc, pfp, privateGames, hideOnline, hidePlaying}: 
    {username: string, email: string, desc: string, pfp: string, privateGames: boolean, hideOnline: boolean, hidePlaying: boolean}
) => {
    const data = {
        email: email,
        emailVisibility: true,
        displayName: username,
        description: desc,
        avatar: pfp,
        private_games: privateGames,
        hide_online: hideOnline,
        hide_playing: hidePlaying
    }

    await pb.collection("users").update(pb.authStore.model?.id!, data)
}

/**
 * Retrieves a user from the database based on their username.
 *
 * @param {string} tag - The username of the user to retrieve.
 * @return {Promise<object>} The user object matching the provided username.
 */
export const getUser = async (tag: string) => {
    let data = await pb.collection("users").getList(1, 1, {
        filter: `username = "${tag}"`
    })

    return data.items[0]
}

/**
 * Queries the user collection for a specific user.
 *
 * @param {string} user - The username of the user to query.
 * @return {Promise<any>} - A promise that resolves to the user data.
 */
export const queryUser = async (user: string) => {
    let data = await pb.collection("users").getFullList({
        filter: `username ~ "${user.toLowerCase()}"`
    })

    console.log(data)
    
    return data;
}

/**
 * Follows a user with the specified ID.
 *
 * @param {string} id - The ID of the user to follow.
 * @return {Promise<void>} - A promise that resolves when the user has been followed.
 */
export const followUser = async (id: string) => {
    console.log(pb.authStore.model?.following.includes(id))
    await pb.collection("users").update(pb.authStore.model?.id, {
        following: [...pb.authStore.model?.following, id]
    })

    authStore.set(pb.authStore);
}

/**
 * Unfollows a user.
 *
 * @param {string} id - The ID of the user to unfollow.
 * @return {Promise<void>} - A promise that resolves when the user has been unfollowed successfully.
 */
export const unfollowUser = async (id: string) => {
    await pb.collection("users").update(pb.authStore.model?.id, {
        following: pb.authStore.model?.following.filter((x: string) => x !== id)
    })

    authStore.set(pb.authStore);

}