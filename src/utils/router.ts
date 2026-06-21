import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router"

import AppLayout from "@/components/layouts/appLayout.vue"
import CenteredLayout from "@/components/layouts/centredLayout.vue"

const Home = () => import("@/pages/home.vue")
const Write = () => import("@/pages/write.vue")
const Entry = () => import("@/pages/entry.vue")
const Settings = () => import("@/pages/settings.vue")

const NotFound = () => import("@/pages/not-found.vue")

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        component: AppLayout,
        children: [
            {
                path: "",
                redirect: "/home",
            },
            {
                path: "home",
                component: Home,
                meta: { title: "Дневник" },
            },
            {
                path: "add",
                component: Write,
                meta: { title: "Новая запись" },
            },
            {
                path: "entry/:id",
                component: Entry,
                meta: { title: "Запись" },
            },
            {
                path: "settings",
                component: Settings,
                meta: { title: "Настройки" },
            },
        ],
    },
    {
        path: "/:pathMatch(.*)*",
        component: CenteredLayout,
        children: [
            {
                path: "",
                component: NotFound,
                meta: { title: "Not Found" },
            },
        ],
    },
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})