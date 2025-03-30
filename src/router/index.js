import {createRouter, createWebHistory} from 'vue-router'
import NewFind from "@/views/Home.vue";
import OneView from "@/views/OneView.vue";
import TwoView from "@/views/TwoView.vue";
import FourView from "@/views/FourView.vue";
import ThreeView from "@/views/ThreeView.vue";
import FiveView from "@/views/FiveView.vue";
import TwoNewView from "@/views/TwoNewView.vue";
import NewView from "@/views/NewView.vue";
import FloorDetail from "@/views/FloorDetail.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'new',
            component: NewFind,
        },
        {
            path: '/newworld',
            component: NewView,          // 一级父组件
            children: [
                {
                    path: '',
                    component: TwoNewView,   // 二级子组件
                    children: [              // 三级子路由
                        {
                            path: 'one',
                            component: OneView,
                            meta: {
                                keepAlive: true,
                                parentPath: '/newworld',
                                refreshCounter: 0
                            }, children: [{
                                path: '',
                                component: FloorDetail,
                                meta: {
                                    keepAlive: true,
                                    cacheKey: 'floor-one' // 唯一缓存标识
                                }
                            }]
                        },
                        {
                            path: 'two',
                            component: TwoView,
                            meta: {
                                keepAlive: true,
                                parentPath: '/newworld',
                                refreshCounter: 0
                            }, children: [{
                                path: '',
                                component: FloorDetail,
                                meta: {
                                    keepAlive: true,
                                    cacheKey: 'floor-two' // 唯一缓存标识
                                }
                            }]
                        },
                        {
                            path: 'three',
                            component: ThreeView,
                            meta: {
                                keepAlive: true,
                                parentPath: '/newworld',
                                refreshCounter: 0
                            }, children: [{
                                path: '',
                                component: FloorDetail,
                                meta: {
                                    keepAlive: true,
                                    cacheKey: 'floor-three' // 唯一缓存标识
                                }
                            }]
                        },
                        {
                            path: 'four',
                            component: FourView,
                            meta: {
                                keepAlive: true,
                                parentPath: '/newworld',
                                refreshCounter: 0
                            }, children: [{
                                path: '',
                                component: FloorDetail,
                                meta: {
                                    keepAlive: true,
                                    cacheKey: 'floor-four' // 唯一缓存标识
                                }
                            }]
                        },
                        {
                            path: 'five',
                            component: FiveView,
                            meta: {
                                keepAlive: true,
                                parentPath: '/newworld',
                                refreshCounter: 0
                            }, children: [{
                                path: '',
                                component: FloorDetail,
                                meta: {
                                    keepAlive: true,
                                    cacheKey: 'floor-five' // 唯一缓存标识
                                }
                            }]
                        },
                        {
                            path: '/redirect/:path(.*)',
                            component: () => import('@/views/RedirectView.vue')
                        },

                    ]
                }
            ]
        },
        {
            path: '/frontier',
            name: 'frontier',
            component: () => import('../views/FrontView.vue')
        }
    ]
})

export default router
