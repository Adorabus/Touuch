import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('./views/Profile'),
      meta: {
        title: 'Profile',
        forUsers: true
      }
    },
    /*
    {
      path: '/login',
      name: 'login',
      component: () => import('./views/Login'),
      meta: {
        title: 'Login',
        forGuests: true
      }
    },
    */
    {
      path: '/files',
      name: 'files',
      component: () => import('./views/Files'),
      meta: {
        title: 'Files',
        forUsers: true
      }
    },
    {
      path: '/patch-notes',
      name: 'patch-notes',
      component: () => import('./views/PatchNotes'),
      meta: {
        title: 'Patch Notes',
        forUsers: true
      }
    },
    {
      path: '/administration',
      redirect: '/administration/users'
    },
    {
      path: '/administration',
      name: 'administration',
      component: () => import('./views/Administration'),
      meta: {
        title: 'Administration',
        forAdministrators: true
      },
      children: [
        {
          path: 'users',
          component: () => import('./views/admin/Users')
        },
        {
          path: 'maintenance',
          component: () => import('./views/admin/Maintenance')
        },
        {
          path: 'secret',
          component: () => import('./views/admin/Secret')
        }
      ]
    }
  ]
})
