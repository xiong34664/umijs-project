import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "index" },
    { path: "/docs", component: "docs" },
    { path: '/capturVideo', component: 'capturVideo'}
  ],
  npmClient: 'pnpm',
});
