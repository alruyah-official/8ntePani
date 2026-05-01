// This is a plain JS bridge between Axios interceptors
// and React AuthContext. Since Axios lives outside React,
// it can't call hooks directly — so we store the logout
// function here and call it from the interceptor on 401.

const authStore = {
  logout: null,       // set by AuthContext on mount
  navigate: null,     // set by AuthContext on mount
};

export default authStore;