import { createRouter, createWebHistory } from "vue-router";
import { isAuthenticated } from "../services/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/admin",
    },
    {
      path: "/admin/login",
      name: "admin-login",
      component: () => import("../views/AdminLoginView.vue"),
      meta: { guestOnly: true },
    },
    {
      path: "/admin",
      name: "admin",
      component: () => import("../views/AdminDashboardView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/admin",
    },
  ],
});

router.beforeEach((to) => {
  const authenticated = isAuthenticated();

  if (to.meta.requiresAuth && !authenticated) {
    return {
      name: "admin-login",
      query: { redirect: to.fullPath },
    };
  }

  if (to.meta.guestOnly && authenticated) {
    return { name: "admin" };
  }

  return true;
});

export default router;
