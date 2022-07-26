<template>
  <div>
    <base-dialog
      :show="!!error"
      title="An error occurred"
      @closed="handleError"
    ></base-dialog>
    <base-dialog :show="isLoading" title="Authenticating..." fixed>
      <base-spinner></base-spinner>
    </base-dialog>
    <div class="row">
      <base-card mode="shadow" color="color">
        <form @submit.prevent="submitForm">
          <div class="form-control">
            <transition name="title" mode="out-in">
              <h2 v-if="mode === 'login'">登录</h2>
              <h2 v-else>注册</h2>
            </transition>
          </div>
          <div class="form-control">
            <label for="email">电子邮箱</label>
            <input type="email" id="email" v-model.trim="email" />
          </div>
          <div class="form-control">
            <label for="password">密码</label>
            <input type="password" id="password" v-model.trim="password" />
          </div>
          <div v-if="mode === 'signup'" class="form-control">
            <label for="username">用户名</label>
            <input
              type="text"
              id="username"
              v-model.trim="username"
              placeholder="姓与名之间用空格分开，如（林郑 月娥）"
            />
          </div>
          <p v-if="!formIsValid">
            请您输入合法的电子邮箱、密码和用户名 (密码最少为6位)
          </p>
          <div class="action">
            <transition name="btn" mode="out-in">
              <base-button v-if="mode === 'login'">登录</base-button>
              <base-button v-else mode="flat" @click="switchAuthMode">
                转至登录
              </base-button>
            </transition>
            <transition name="btn" mode="out-in">
              <base-button v-if="mode === 'signup'">注册</base-button>
              <base-button v-else mode="flat" @click="switchAuthMode">
                转至注册
              </base-button>
            </transition>
          </div>
        </form>
      </base-card>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      username: '',
      formIsValid: true,
      mode: 'login',
      isLoading: false,
      error: null,
    };
  },
  methods: {
    async submitForm() {
      this.formIsValid = true;
      if (
        !this.validateEmail(this.email) ||
        !this.validatePassword(this.password)
      ) {
        this.formIsValid = false;
        return;
      }

      if (this.mode === 'signup' && this.isEmpty(this.username)) {
        this.formIsValid = false;
        return;
      }

      const actionPayload = {
        email: this.email,
        password: this.password,
        username: this.username,
      };

      this.isLoading = true;

      try {
        await this.$store.dispatch(this.mode, actionPayload);

        const redirectUrl = `/${this.$route.query.redirect ?? 'coaches'}`;

        this.$router.replace(redirectUrl);
      } catch (err) {
        console.log(err);

        if (err.message === 'EMAIL_EXISTS') {
          this.error = 'Email already in use.';
        } else if (err.message === 'TOO_MANY_ATTEMPTS_TRY_LATER') {
          this.error =
            'We have blocked all requests from this device due to unusual activity. Try again later.';
        } else if (err.message === 'EMAIL_NOT_FOUND') {
          this.error = 'Email not found.';
        } else if (err.message === 'INVALID_PASSWORD') {
          this.error = 'Invalid password.';
        } else if (err.message === 'USER_DISABLED') {
          this.error = 'Account has been disabled by an administrator.';
        } else {
          this.error = 'Failed to authenticate, try again later.';
        }
      }

      this.isLoading = false;
    },
    switchAuthMode() {
      this.mode = this.mode === 'login' ? 'signup' : 'login';
    },
    validateEmail(email) {
      const regex = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
      return regex.test(email);
    },
    validatePassword() {
      if (this.isEmpty(this.password) || this.password.length < 6) {
        return false;
      } else {
        return true;
      }
    },
    isEmpty(value) {
      return value === '';
    },
    handleError() {
      this.error = null;
    },
  },
};
</script>

<style scoped>
.row {
  margin-top: 6.4rem;
}
.card {
  margin-top: 5rem;
}

.form-control {
  margin: 1.6rem 0;
}

h2 {
  font-family: var(--font-display);
  font-weight: normal;
  text-align: center;
  font-size: 2.4rem;
}

label {
  font-weight: bold;
  display: block;
  margin-bottom: 0.5rem;
  font-size: 1.4rem;
}

input,
textarea {
  display: block;
  width: 100%;
  border: 0.2rem solid #ccc;
  font: inherit;
  padding: 0.2em 0.4em;
  border-radius: 0.8rem;
}

input:focus,
textarea:focus {
  background-color: var(--pink-2);
  outline: none;
  border-color: var(--purple-3);
}

input[type='checkbox'] {
  display: inline-block;
  width: auto;
  border: none;
  transform: scale(1.2);
}

h3 {
  margin: 0.5rem 0;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

button[type='button'] {
  order: -1;
}

.actions {
  margin-top: 2.4rem;
  display: flex;
  gap: 1.6rem;
  justify-content: flex-end;
}

p {
  margin-top: 0.2em;
  margin-bottom: 1.6rem;
  font-size: 1.4rem;
}

.title-fade-enter-from {
  opacity: 0;
  transform: translateX(-40px);
}

.title-leave-to {
  opacity: 0;
  transform: translateX(40px);
}

.title-enter-active {
  transition: all 300ms ease-out 100ms;
}

.title-leave-active {
  transition: all 300ms ease-in;
}

.btn-enter-from {
  opacity: 0;
  transform: translateX(-40px);
}

.btn-leave-to {
  opacity: 0;
}

.btn-enter-active {
  transition: all 300ms ease-out;
}

.btn-fade-leave-active {
  transition: all 300ms ease-in;
}
</style>
