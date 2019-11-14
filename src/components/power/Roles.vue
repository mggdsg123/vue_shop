<template>
   <div>
        <!-- 面包屑导航模块 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
    <!-- 卡片区域 -->
        <el-card>
            <!-- 添加用户按钮 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>
            <!-- 数据展示 -->
            <el-table stripe :data="rolesList" style="width: 100%" border>
            <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row v-for="(item,i1) in scope.row.children" :key="item.id" :class="['bdbottom',i1===0?'bdtop':'','vcenter']">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row,item.id)">{{item.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二三级权限 -->
                            <el-col :span="19">
                                <el-row v-for="(item2,i2) in item.children" :key="item2.id" :class="[i2===0?'':'bdtop','vcenter']">
                                    <!-- 二级权限 -->
                                    <el-col :span="6">
                                        <el-tag type='success' closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                                    </el-col>
                                    <!-- 三级权限 -->
                                    <el-col :span="18">
                                        <el-tag type='warning' v-for="(item3) in item2.children " :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="roleName" label="角色名称" >
                </el-table-column>
                <el-table-column prop="roleDesc" label="角色描述">
                </el-table-column>
                <el-table-column  label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRolesById(scope.row.id)">删除</el-button>                       
                        <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>                      
                </el-table-column>
                </el-table>
        </el-card>
        <!-- 添加角色对话框 -->
            <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="30%" @close='addDialogClosed'>
            <!-- 添加用户对话框的主体区域 -->
                <span>
                    <el-form  :model="addForm" label-width="80px"  :rules="addFormRules" ref="addFormRef" >
                        <el-form-item label="角色名称" prop="roleName">
                        <el-input v-model="addForm.roleName" ></el-input>
                        </el-form-item>
                        <el-form-item label="角色描述" prop="roleDesc" > 
                        <el-input v-model="addForm.roleDesc"></el-input>
                        </el-form-item>
                    </el-form>
                </span>
                <!-- 添加用户对话框的底部区域 -->
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addRoles">确 定</el-button>
                </span>
            </el-dialog>
        <!-- 编辑对话框 -->
            <el-dialog title="修改角色信息" :visible.sync="editDialogVisible" width="30%" @close="editDialogClosed">
            <!-- 修改用户对话框的主体区域 -->
                <span>
                    <el-form  :model="editForm" label-width="80px"  :rules="editFormRules" ref="editFormRef">
                        <el-form-item label="角色名称" prop="roleName">
                        <el-input v-model="editForm.roleName" ></el-input>
                        </el-form-item>
                        <el-form-item label="角色描述" prop="roleDesc" > 
                        <el-input v-model="editForm.roleDesc"></el-input>
                        </el-form-item>
                    </el-form>
                </span>
            <!-- 修改用户对话框的底部区域 -->
                <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRoles">确 定</el-button>
                </span>
            </el-dialog>
        <!-- 用户分配权限对话框 -->
            <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="30%" @close="setRightDialogClosed">
            <!-- 权限对话框主题内容 -->
            <span>
                <el-tree :data="getRightsList" :props="defaultProps" show-checkbox default-expand-all node-key="id" :default-checked-keys="defkeys" ref="treeRef"></el-tree>
            </span>
            <!-- 分配权限对话框底部 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
</el-dialog>
   
   </div>
</template>
<script>
    export default {
        data(){
            return {
                // 角色列表数据
                rolesList:[],
                // 添加角色对话框数据
                addForm:{
                    roleName:'',
                    roleDesc:'',
                },
                // 修改角色对话框查询到的数据
                editForm:{

                },
                // 是否显示添加用户对话框
                addDialogVisible:false,
                // 添加用户对话框的表单验证规则
                addFormRules:{
                    roleName:[
                        {required: true, message: '请输入角色名称', trigger: 'blur'},
                        { min: 2, max: 15, message: '长度在 2 到 10 个字符', trigger: 'blur'}
                    ],
                    roleDesc:[
                        { min: 2, max: 15, message: '长度在 2 到 15 个字符', trigger: 'blur'}       
                    ]
                },
                // 是否展示修改对话框
                editDialogVisible:false,
                // 修改对话框表单验证规则
                editFormRules: {
                    roleName:[
                        {required: true, message: '请输入角色名称', trigger: 'blur'},
                        { min: 2, max: 15, message: '长度在 2 到 10 个字符', trigger: 'blur'}
                    ],
                    roleDesc:[
                        { min: 2, max: 15, message: '长度在 2 到 15 个字符', trigger: 'blur'}       
                    ]
                },
                // 控制权限对话框的显示与隐藏
                setRightDialogVisible:false,
                // 树状列表配置项
                defaultProps: {
                    children: 'children',
                    label: 'authName'
                },
                // 获取到的权限列表数据
                getRightsList:[],
                defkeys:[],
                roleId:'',
            }
        },
        created(){
            this.getRolesList()
        },
        methods:{
            async getRolesList(){
               const {data:res} =await this.$http.get('roles')
            // console.log(res);
               if(res.meta.status!==200){
                   return this.$message.error('获取角色列表失败'); 
               }
               this.rolesList=res.data
            //    console.log(this.rolesList);    
            },
            // 对添加角色表单进行预验证并提交
            addRoles(){
                this.$refs.addFormRef.validate(async valid=>{
                    if(!valid) return
                    const{data:res}= await this.$http.post('roles',{
                        roleName:this.addForm.roleName,
                        roleDesc:this.addForm.roleDesc
                    })
                    console.log(res);
                    if(res.meta.status!==201) {
                        return this.$message.error('添加角色失败')
                    }
                    this.$message.success('添加角色成功')
                    this.getRolesList()
                    this.addDialogVisible=false 
                })
            },
            // 表单关闭时重置表单
            addDialogClosed(){
                this.$refs.addFormRef.resetFields()
            },
            // 显示编辑按钮对话框
            async showEditDialog(id){
                const{data:res}=await this.$http.get('roles/'+id)
                // console.log(res);
                // 将获取的值赋给editForm
                this.editForm=res.data
                // 将对话框显示出来
                this.editDialogVisible=true
            },
            // 将修改的信息进行预验证并进行提交
            editRoles(){
                this.$refs.editFormRef.validate(async valid=>{
                    //  console.log(valid);
                    if(!valid) return
                    const {data:res}=await this.$http.put('roles/'+this.editForm.roleId,{
                        roleName:this.editForm.roleName,
                        roleDesc:this.editForm.roleDesc
                    })
                    // console.log(res);
                    if(res.meta.status!==200) {
                        return this.$message.error('修改角色信息失败')
                    }
                    this.$message.success('修改角色信息成功')
                    this.getRolesList()
                    this.editDialogVisible=false       
                })
            },
            // 重置修改对话框的表单
            editDialogClosed(){   
            this.$refs.editFormRef.resetFields()
            },
            // 根据ID删除角色
            
            async removeRolesById(id){
                const result= await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err=>err)
                    console.log(result);
                    if(result!=='confirm'){
                        return this.$message.info('已取消删除')
                    }
                const {data:res}= await this.$http.delete('roles/'+id)
                // console.log(res);
                if(res.meta.status!==200) {
                    return this.$message.error('删除失败')
                }
                this.$message.success('删除成功')
                this.getRolesList()
            },
            // 根据ID删除权限
            async removeRightById(role,rightId){
                const confirmResult= await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(error=>error)
                // console.log(confirmResult);
                if(confirmResult!=='confirm') {
                    return this.$message.error('取消了删除')
                }
                const {data:res}=await this.$http.delete('roles/'+role.id+'/rights/'+rightId)
                console.log(res);
                if(res.meta.status!==200) {
                    return this.$message.error('取消用户权限失败')
                }
                role.children=res.data
                //  this.getRolesList()
            },
            // 展示分配权限对话框
            async showSetRightDialog(role){
                this.roleId=role.id
                const {data:res}= await this.$http.get('rights/tree')
                // console.log(res);
                // 调用递归函数拿到所有的三级节点
                this.getLeafKeys(role,this.defkeys)
                // 显示对话框        
                this.setRightDialogVisible=true
                this.getRightsList=res.data
            },
            // 通过底柜的形式拿到角色已有权限的id数组
            getLeafKeys(node,arr){
                // 判断是否为三级节点,不包含childen属性为三级节点
                if(!node.children){
                    return arr.push(node.id)
                }
                node.children.forEach(item=>{
                    this.getLeafKeys(item,arr)
                })
            },
            // 关闭对话框时重置对话框中数据
            setRightDialogClosed(){
                this.defkeys=[]
            },
            // 确定按钮点击分配权限事件
            async allotRights(){
                const keys=[
                    ...this.$refs.treeRef.getCheckedKeys(),
                    ...this.$refs.treeRef.getHalfCheckedKeys()
                ]
                const idStr=keys.join(',')
                const {data:res}= await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
                console.log(res);
                this.getRolesList()
                this.setRightDialogVisible = false               
            }
        }
    }
</script>
<style lang="less" scoped>
    .el-tag {
        margin: 7px;
    }

    .bdtop {
        border-top: 1px solid #eee;
    }

    .bdbottom {
        border-bottom: 1px solid #eee;
    }
    .vcenter {
        display:flex;
        align-items: center;
    }
</style>