<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { loginAdmin } from "../services/auth";

const route = useRoute();
const router = useRouter();

const email = ref("admin@easecommerce.com");
const password = ref("admin123");
const loading = ref(false);
const errorMessage = ref("");

async function handleSubmit(): Promise<void> {
  if (loading.value) {
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  try {
    await loginAdmin({
      email: email.value.trim(),
      password: password.value,
    });

    const redirectTarget =
      typeof route.query.redirect === "string"
        ? route.query.redirect
        : "/admin";
    await router.push(redirectTarget);
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Unable to login";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="auth-layout">
    <section class="auth-card">
      <p class="eyebrow">Boutique Admin</p>
      <h1>Admin Access</h1>
      <p class="subtext">Sign in to manage inventory and product operations.</p>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <label>
          <span>Email</span>
          <input
            v-model="email"
            type="email"
            autocomplete="username"
            required
          />
        </label>

        <label>
          <span>Password</span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
          />
        </label>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <button type="submit" :disabled="loading">
          {{ loading ? "Signing in..." : "Sign in" }}
        </button>
      </form>
    </section>
  </main>
</template>
