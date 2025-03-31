import {createRouter, createWebHistory} from 'vue-router'
import Home from "@/views/Home.vue";
import RoomView from "@/views/RoomView.vue";

import TwoNewView from "@/views/TwoNewView.vue";
import ClassRoom from "@/views/ClassRoom.vue";
import FloorDetail from "@/views/FloorDetail.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'base',
            component: Home,
        },
        {
            path: '/classroom',
            name: 'classroom',
            component: ClassRoom,          // 一级父组件

        },
        {
            path: '/frontier',
            name: 'frontier',
            component: () => import('../views/TopBar.vue')
        }
    ]
})

export default router
