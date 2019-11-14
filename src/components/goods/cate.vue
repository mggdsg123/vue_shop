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
            <!-- 添加分类按钮 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCatedDialog">添加分类</el-button>
                </el-col>
            </el-row>
        <!-- 商品分类表格 -->
            <tree-table :data="cateList" :columns="columns" :selection-type="false"	:expand-type="false" show-index index-text="#" border :show-row-hover="false">
                <template slot="isOk" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:lightgreen"></i>
                    <i class="el-icon-error" v-else style="color:red"></i>
                </template>
                <template slot="order" slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
                    <el-tag type="success" size="mini" v-if="scope.row.cat_level===1">二级</el-tag>
                    <el-tag type="warning" size="mini" v-if="scope.row.cat_level===2">三级</el-tag>
                </template>
                <template slot="opt" slot-scope="scope">
                    <el-button icon="el-icon-edit" type="primary" size="mini" @click="showEditDialogById(scope.row.cat_id)">编辑</el-button>
                    <el-button icon="el-icon-delete" type="danger" size="mini" @click="removeCateById(scope.row.cat_id)">删除</el-button>
                </template>
            </tree-table>
        <!-- 分页模块 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[2, 5, 8, 12]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加分类对话框 -->
        <el-dialog title="添加分类" :visible.sync="addCatedDialogVisible" width="50%" @close="addCatedDialogClosed">     
            <el-form ref="addCateFormRef" :model="addCateForm" label-width="100px" :rules="addCateFormRules">
                <el-form-item label="分类名称:" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类:">
                    <el-cascader v-model="SelectedKeys" :options="parentCateList" :props="parentCateListProps" @change="parentCateChange" clearable></el-cascader>
                </el-form-item>
            </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addCatedDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCate">确 定</el-button>
         </span>
        </el-dialog>
        <!-- 修改商品分类信息对话框 -->
        <el-dialog title="编辑" :visible.sync="editCateDialogVisible" width="30%" @close="editDialogClosed">
        <el-form :model="editForm" label-width="80px" ref="editFormRef" :rules="editFormRules" >
            <el-form-item label="分类ID">
                <el-input v-model="editForm.cat_id" disabled></el-input>
            </el-form-item>
            <el-form-item label="分类名称" prop="cat_name">
                <el-input v-model="editForm.cat_name" ></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editCate">确 定</el-button>
        </span>
</el-dialog>

    </div>
</template>
<script>
import { log } from 'util'
import { async } from 'q'
    export default {
        data(){
            return {
                // 商品数据
                cateList:[],
                // 获取数据请求的参数
                queryInfo:{
                    type:3,
                    pagenum:1,
                    pagesize:5,
                },
                // 获取的数据总数
                total:0,
                // 表格各列的配置
                columns:[
                    {
                        label: '分类名称',
                        prop: 'cat_name',
                    },
                    {
                        label:'是否有效',
                        // 将当前列设置为自定义魔板列
                        type: 'template',
                        template: 'isOk',
                    },
                    {
                        label:'排序',
                        // 将当前列设置为自定义魔板列
                        type: 'template',
                        template: 'order',
                    },
                    {
                        label:'排操作序',
                        // 将当前列设置为自定义魔板列
                        type: 'template',
                        template: 'opt',
                    }
                ],
                // 控制添加分类对话框的显示与隐藏
                addCatedDialogVisible:false,
                // 添加分类表单数据
                addCateForm:{
                    cat_name:'',
                    cat_level:0,
                    cat_pid:0,
                },
                // 添加分类表单验证
                addCateFormRules:{
                    cat_name:[
                        {required: true, message: '请输入分类名称', trigger: 'blur'},
                        {min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
                    ],                   
                },
                parentCateList:[],
                // 级联选择器双向绑定数据
                SelectedKeys:[],
                // 级联选择器的配置项
                parentCateListProps:{
                    expandTrigger:'hover',
                    checkStrictly: true,
                    value:'cat_id',
                    label:'cat_name',
                    children:'children'
                },
                // 控制修改商品分类对话框的显示与隐藏
                editCateDialogVisible:false,
                // 修改商品信息对话框查询到的数据
                editForm:{},
                // 编辑商品信息对话框中表单验证
                editFormRules: {
                    cat_name:[
                        {required: true, message: '请输入分类名称', trigger: 'blur'},
                        {min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }  
                    ]
                }                            
            }                       
        },
        created(){
            this.getCateList()
        },
        methods:{
            // 获取商品分类数据列表
            async getCateList(){
                const {data:res}= await this.$http.get('categories',{params:this.queryInfo})
                // console.log(res);
                if(res.meta.status!==200){
                    return this.$message.error('获取商品分类列表失败')
                }
                this.cateList=res.data.result
                this.total=res.data.total
                // console.log(this.cateList);                
            },
            // 添加分类按钮点击显示对话框事件
            showAddCatedDialog(){
                this.getParentCateList()
                this.addCatedDialogVisible=true      
            },
            handleSizeChange(newSize){
                this.queryInfo.pagesize=newSize
                this.getCateList()
            },
            handleCurrentChange(newPagenum){
                this.queryInfo.pagenum=newPagenum
                this.getCateList()
            },

            // 获取父级商品分类列表
            async getParentCateList(){
               const {data:res}= await this.$http.get('categories',{params:{type:2}})
            //    console.log(res);
               if(res.meta.status!==200){
                   return this.$message.error('获取父级商品分类列表失败')
               }
               this.parentCateList=res.data
            //    console.log(this.parentCateList);
               
            },
            // 次联选择框改变事件
            parentCateChange(){
                if(this.SelectedKeys.length>0) {
                    this. addCateForm.cat_pid=this.SelectedKeys[this.SelectedKeys.length-1]
                    this.addCateForm.cat_level=this.SelectedKeys.length
                    return
                }else {
                    this.addCateForm.cat_pid=0
                    this.addCateForm.cat_level=0
                }
                // console.log(this.SelectedKeys)                 
            },
            // 对话框确定提交事件
            addCate(){
                // console.log(this.addCateForm);
                // 表单预验证
                this.$refs.addCateFormRef.validate(async valid=>{
                    // console.log(valid);
                    if(!valid){
                        return
                    }
                    const {data:res}= await this.$http.post('categories',this.addCateForm)
                    // console.log(res);
                    if(res.meta.status!==201){
                        return this.$message.error('添加分类失败')
                    }
                    this.$message.success('添加分类成功')
                    this.getCateList()
                    this.addCatedDialogVisible=false                               
                })
            },
            // 添加分类对话框关闭事件
            addCatedDialogClosed(){
                this.$refs.addCateFormRef.resetFields()
                this.SelectedKeys=[]
                this.addCateForm.cat_pid=0
                this.addCateForm.cat_level=0
            },
            // 展示修改商品信息对话框并根据Id获取信息
            async showEditDialogById(id){
                // console.log(id);    
                const {data:res}= await this.$http.get('categories/'+id)
                // console.log(res);
                if(res.meta.status!==200){
                    return this.$message.error('获取商品信息失败')
                }
                this.editForm=res.data
                this.editCateDialogVisible=true
            },
            // 对话框关闭重置表单及验证
            editDialogClosed(){
                this.$refs.editFormRef.resetFields()
            },
            // 对话框的确定提交事件
            editCate(){
                // 将修改信息预验证并重新提交
                this.$refs.editFormRef.validate(async valid=>{
                    if(!valid) return
                    const {data:res}= await this.$http.put('categories/'+this.editForm.cat_id,
                    {cat_name:this.editForm.cat_name})
                    // console.log(fres);
                    if(res.meta.status!==200){
                        return this.$message.error('修改商品信息失败')
                    }
                    this.$message.success('修改商品信息成功')   
                }) 
                this.getCateList()             
                this.editCateDialogVisible=false
            },
            // 删除商品信息
            async removeCateById(id){
                const {data:res}= await this.$http.delete('categories/'+id)
                // console.log(res);
                if(res.meta.status!==200){
                    return this.$message.error('删除失败')
                }
                this.$message.success('删除成功')
                this.getCateList()
            }
        }
    }
</script>
<style lang="less" scoped>
    .zk-table {
       margin-top: 15px;
   }
   .el-cascader {
       width: 100%;
   }
</style>