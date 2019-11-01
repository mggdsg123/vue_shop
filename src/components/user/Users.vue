<template>
    <div>
        <!-- 面包屑导航模块 -->
       <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>   
        <!-- 卡片模块 -->
        <el-card>
            <!-- 添加模块 -->
            <el-row :gutter="20">
                <!-- 添加用户输入框 -->
              <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
              </el-col>
              <!-- 添加用户按钮 -->
              <el-col :span="6">
                  <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
              </el-col>
            </el-row>
           
            <!-- 用户信息展示 -->
            <el-table  stripe  border :data="userList">
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="username" label="姓名" ></el-table-column>
                <el-table-column prop="email" label="邮箱" ></el-table-column>
                <el-table-column prop="mobile" label="电话"></el-table-column>
                <el-table-column prop="role_name" label="角色" ></el-table-column>
                <!-- 状态栏按钮 -->
                <el-table-column label="状态" >
                      <template slot-scope="scope">
                        <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
                      </template>                     
                  </el-table-column>
                  <!-- 操作栏 -->
                  <el-table-column prop="date" label="操作" >
                      <template slot-scope="scope">
                          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
                          <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                          <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
                          </el-tooltip>
                      </template>
                  </el-table-column>
            </el-table>
            <!-- 分页模块 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 8]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>
         <!-- 添加用户对话框 -->
            <el-dialog title="添加用户" :visible.sync="addDialogVisible"
                width="50%" @close="addDialogClosed">
                <!-- 对话框的主题内容区域 -->
                <span>
                    <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
                    <el-form-item label="用户名" prop="username">
                        <el-input v-model="addForm.username"></el-input>
                    </el-form-item>
                     <el-form-item label="密码" prop="password">
                        <el-input v-model="addForm.password"></el-input>
                    </el-form-item>
                     <el-form-item label="邮箱" prop="email">
                        <el-input v-model="addForm.email"></el-input>
                    </el-form-item>
                     <el-form-item label="手机" prop="mobile">
                        <el-input v-model="addForm.mobile"></el-input>
                    </el-form-item>
                    </el-form>
                </span>
                <!-- 底部按钮区域 -->
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addUser">确 定</el-button>
                </span>
        </el-dialog>
        <!-- 修改用户对话框 -->
        <el-dialog title="修改用户" :visible.sync="editDialogVisible"
            width="30%" @close="editDialogClosed">
            <!-- 修改用户对话框主体内容 -->
            <span>
                <el-form  :model="editForm" label-width="70px" :rules="editFormRules"  ref="editFormRef">
                    <el-form-item label="用户名">
                    <el-input v-model="editForm.username" :disabled="true"></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                    </el-form-item>
                    <el-form-item label="手机" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                    </el-form-item>
                </el-form>
            </span>
            <!-- 修改用户对话框底部内容 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUser">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data(){
        // 自定义邮箱验证规则
        var checkEamil=(rule, value, cb)=>{
            const regEamil=/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
            if(regEamil.test(value)) return cb()
            cb(new Error('邮箱格式错误'))
        }
        // 自定义电话验证规则
        var checkMobile=(rule, value, cb)=>{
            const regMobile= /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
            if(regMobile.test(value)) return cb()
            cb(new Error('电话格式错误'))
        }
        
        return {
            // 获取用户列表参数
            queryInfo:{
                query:'',
                // 当前页数
                pagenum:1,
                // 每页显示多少条数据
                pagesize:2
            },
            userList:[],
            total:0,
            // 添加修改用户是否展示参数
            addDialogVisible:false,
            editDialogVisible:false,
            // 添加用户对话框数据
            addForm:{
                username:'',
                password:'',
                email:'',
                mobile:''
            },
            // 添加用户对话框表单验证
            addFormRules: {
                username:[
                    {required: true, message: '请输入用户名', trigger: 'blur'},
                    { min: 2, max: 15, message: '长度在 2 到 15 个字符', trigger: 'blur' }       
                ], password:[
                    {required: true, message: '请输入密码', trigger: 'blur'},
                    { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }       
                ], email:[
                    {required: true, message: '请输入邮箱', trigger: 'blur'},
                    { validator: checkEamil, trigger: 'blur' }       
                ], mobile:[
                    {required: true, message: '请输入电话', trigger: 'blur'},
                    { validator: checkMobile, trigger: 'blur' }       
                ]
            },
            // 修改用户信息对话框查询到的数据
            editForm:{
                
            },
            // 修改用户对话框表单验证
            editFormRules: {
                 email:[
                    {required: true, message: '请输入邮箱', trigger: 'blur'},
                    { validator: checkEamil, trigger: 'blur' }       
                ], mobile:[
                    {required: true, message: '请输入电话', trigger: 'blur'},
                    { validator: checkMobile, trigger: 'blur' }       
                ]
            }
        }   
    },
    created(){
        this.getUserList()
    },
    methods:{
     async getUserList(){
        const {data:res}= await this.$http.get('users',{params:this.queryInfo})
        // console.log(res);
        if(res.meta.status!==200) return this.$message.error('获取用户信息失败')
        this.userList=res.data.users
        this.total=res.data.total
        },
        //   监听每页多少条数据的菜单
      handleSizeChange(newSize){
          this.queryInfo.pagesize=newSize
          this.getUserList()
        },
        //   监听页码值改变事件
        handleCurrentChange(newPage){
        this.queryInfo.pagenum=newPage
        this.getUserList()
        }, 
        // 改变用户状态请求
        async userStateChange(userInfo){
        // console.log(userInfo);       
       const {data:res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        //    console.log(res);
       if(res.meta.status!==200) {
        //  请求失败 将页面上按钮状态还原
           userInfo.mg_state=!userInfo.mg_state
           return this.$message.error('用户状态修改失败')
       }
       this.$message.success('修改用户状态成功')   },
        // 监听添加用户对话框的关闭事件
        addDialogClosed(){
            this.$refs.addFormRef.resetFields()
        },
        //表单预验证
        addUser(){
            this.$refs.addFormRef.validate(async valid=>{
            if(!valid) return
            //通过发送添加用户请求
            const {data:res}= await this.$http.post('users',this.addForm)
            if(res.meta.status!=201) {
               return this.$message.error('添加用户失败')
            }
            this.$message.success('用户创建成功')
            // 关闭添加对话框
            this.addDialogVisible=false
            //刷新列表
             this.getUserList()           
            })
        },    
        // 为修改按钮添加显示对话框事件
        async showEditDialog(id){
            // 参数为点击修改按钮的用户的id
            console.log(id);
            // 根据id发送ajax请求获取用户数据
            const {data:res}=await this.$http.get('users//'+id)
            // console.log(res);
            if(res.meta.status!==200) {
               return this.$message.error('获取用户信息失败')
            }
            this.editForm=res.data
            this.editDialogVisible=true    
        }, 
        // 监听修改用户信息对话框的关闭事件
        editDialogClosed(){
            // 重置修改对话框的表单
            this.$refs.editFormRef.resetFields()
        },
        // 将修改信息进行预验证并重新提交
        editUser(){
            this.$refs.editFormRef.validate(async valid=>{
                // console.log(valid);
                if(!valid) return
               const {data:res}= await this.$http.put('users/'+this.editForm.id,{email:this.editForm.email,mobile:this.editForm.mobile}) 
               console.log(res);  
               if(res.meta.status!==200) {
                   return this.$message.error('修改用户信息失败')
               }   
               this.$message.success('修改用户信息成功')
               this.getUserList()
               this. editDialogVisible=false                       
            })
        },
        // 监听删除用户信息的点击事件
        async removeUserById(id){
            const result= await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).catch(err=>err)
        console.log(result);
        // 点击取消返回cancel，点击确认返回confirm
        if(result!=='confirm'){
            return this.$message.info('已取消删除')
        }
        const {data:res}=await this.$http.delete('users/'+id)
        //  console.log(res);
        if(res.meta.status!==200){
            return this.$message.error('删除失败')
        }
        this.$message.success('删除用户成功')
        this.getUserList()
        }  
    }
}
</script>
<style lang="less" scoped>

</style>