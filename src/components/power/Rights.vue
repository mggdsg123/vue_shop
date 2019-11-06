<template>
    <div>
        <!-- 面包屑导航模块 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 数据展示 -->
        <el-card>
            <el-table stripe :data="rightsList" style="width: 100%" border>
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="authName" label="权限名称" >
                </el-table-column>
                <el-table-column prop="path" label="路径">
                </el-table-column>
                <el-table-column prop="level" label="权限等级">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.level==0">一级</el-tag>
                        <el-tag type="success" v-if="scope.row.level==1">二级</el-tag>
                        <el-tag type="warning" v-if="scope.row.level==2">三级</el-tag>
                    </template>                  
                </el-table-column>
            </el-table>
        </el-card>   
    </div>       
</template>
<script>
    export default {
        data(){
            return {
                rightsList:[]
            }
        },
        created(){
           this.getRightsList()       
        },
        methods:{
            async getRightsList(){
              const {data:res}=await this.$http.get('rights/list')
              console.log(res);
              if(res.meta.status!==200) {
                  return this.$message.error('获取权限列表数据失败')
              }
            //   this.$message.success('获取权限列表数据成功')
            this.rightsList=res.data
            console.log(this.rightsList);
            
            }
        }
    }
</script>
<style lang="less" scoped>

</style>