<template>
<el-container class="home-container"> 
    <!-- 头部区域 -->
  <el-header >
      <div>
          <img src="../assets/heima.png" alt="">
          <span>电商后台管理系统 </span>
      </div>
      <div> <el-button type=info @click="logout">退出</el-button></div>
  </el-header>
  <el-container>
    <el-aside :width="isCollapse?'64px':'200px'" >
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏 -->
      <el-menu background-color="#333744" text-color="#fff"  active-text-color="#409EFF" :collapse="isCollapse" :collapse-transition="false" :unique-opened="true" :router="true" :default-active="activePath">  
          <!-- 一级菜单    -->
      <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
          <!-- 一级菜单魔板区 -->
        <template slot="title">
          <i :class="iconObj[item.id]"></i>
          <span>{{item.authName}}</span>
        </template>
        <!-- 二级菜单 -->
         <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/'+subItem.path)">
            <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
            </template>
         </el-menu-item> 
      </el-submenu>
    </el-menu>
    </el-aside>
    <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
    </el-main>
  </el-container>
</el-container>
</template>
<script>
import { log } from 'util'
export default {
    data(){
        return {
            menuList:[],
            iconObj:{
                '125':'iconfont icon-user',
                '103':'iconfont icon-tijikongjian',
                '101':'iconfont icon-shangpin',
                '102':'iconfont icon-danju',
                '145':'iconfont icon-baobiao',
            },
            // 是否折叠
            isCollapse:false,   
            activePath:'',
        }
    },
    created(){
        this.getMenuList()
        this.activePath=window.sessionStorage.getItem('activePath')
    },
    methods:{
        // 退出登录
        logout(){
            window.sessionStorage.clear()
            this.$router.push('/login')
        },
        // 获取用户数据
        async getMenuList(){
            const {data:res}=await this.$http.get('menus')
            if(res.meta.status!==200) return this.$message.error(res.meta.msg)
            this.menuList=res.data       
            // console.log(res);   
        },
        toggleCollapse(){
            this.isCollapse=!this.isCollapse
        },
        // 获取当前所选项的path属性
        saveNavState(active){
            // 保存激活状态的地址
            window.sessionStorage.setItem('activePath',active)
             this.activePath=active
        }
    }
}
</script>
<style lang="less" scoped>
    .home-container {
        height: 100%;
        
    }
    .el-header {
        background-color:#373D41;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #fff;
        font-size: 20px;
        padding-left: 0;
        div {
            display: flex;
            align-items:center;
            span {
                margin-left: 15px;
            }
        } 
    }
    .el-aside {
        background-color: #333744;
        .el-menu {
            border-right: none
        }
    }
    .el-main {
        background-color: #eaedf1;
    }
    .iconfont {
        margin-right: 10px;
    }
    .toggle-button {
        color: #fff;
        text-align: center;
        font-size: 10px;
        line-height: 24px;
        background-color: #4A5064;
        letter-spacing: 0.2em;
        cursor:pointer;
    }
</style>