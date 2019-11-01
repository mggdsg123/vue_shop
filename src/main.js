import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 全局样式
import './assets/css/global.css'
// 字体图标
import './assets/fonts/iconfont.css'
// 导入axios
import axios from 'axios'
// 设置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
    // 添加拦截器，加请求头
axios.interceptors.request.use(function(config) {
        // console.log(config);
        config.headers.Authorization = window.sessionStorage.getItem('token')
        return config;
    })
    // 挂载到原型上
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')