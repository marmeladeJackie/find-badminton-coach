import axios from 'axios';

let timer;

export default {
  async login(context, payload) {
    return context.dispatch('auth', {
      ...payload,
      mode: 'login',
    });
  },
  async signup(context, payload) {
    // return so our component still know if the promise is resolved.
    return context.dispatch('auth', {
      ...payload,
      mode: 'signup',
    });
  },
  async auth(context, payload) {
    const authUrl = context.getters.authUrl;
    const apiKey = context.getters.apiKey;
    const mode = payload.mode;

    let url = `${authUrl}/signInWithPassword?key=${apiKey}`;
    if (mode === 'signup') {
      url = `${authUrl}/signUp?key=${apiKey}`;
    }

    try {
      const { data: responseData } = await axios.post(url, {
        email: payload.email,
        password: payload.password,
        username: payload.username,
        returnSecureToken: true,
      });

      const expiresIn = +responseData.expiresIn.slice(0, -1) * 1000; // '600s' -> 600 * 1000
      const expirationDate = Date.now() + expiresIn;

      localStorage.setItem('token', responseData.idToken);
      localStorage.setItem('userID', responseData.localId);
      localStorage.setItem(
        'username',
        `${responseData.firstName} ${responseData.lastName}`
      );
      localStorage.setItem('tokenExpiration', expirationDate);

      timer = setTimeout(() => {
        context.dispatch('autoLogout');
      }, expiresIn);

      context.commit('setUser', {
        token: responseData.idToken,
        userID: responseData.localId,
        username: `${responseData.firstName} ${responseData.lastName}`,
      });
    } catch (err) {
      const error = new Error(
        err.response.data.error.message || 'Failed to authenticate'
      );
      throw error;
    }
  },
  // check if user is already in local storage.
  tryLogin(context) {
    const token = localStorage.getItem('token');
    const userID = localStorage.getItem('userID');
    const username = localStorage.getItem('username');
    const tokenExpiration = localStorage.getItem('tokenExpiration');

    // how much time is left till expiring
    const expiresIn = +tokenExpiration - Date.now();

    // if timer expired in 10s, don't login in
    if (expiresIn < 10000) return;

    setTimeout(() => {
      context.dispatch('autoLogout');
    }, expiresIn);

    if (token && userID) {
      // login user automatically
      context.commit('setUser', {
        token,
        userID,
        username,
      });
    }
  },
  logout(context) {
    localStorage.removeItem('token');
    localStorage.removeItem('userID');
    localStorage.removeItem('username');
    localStorage.removeItem('tokenExpiration');

    clearTimeout(timer);

    context.commit('setUser', {
      token: null,
      userID: null,
    });
  },
  autoLogout(context) {
    context.dispatch('logout');
    context.commit('setAutoLogout');
  },
};
