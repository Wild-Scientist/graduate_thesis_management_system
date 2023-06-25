<?php

use App\Http\Controllers\MiddleExaminationController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectStartupController;
use App\Http\Controllers\SettingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\NoticeController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\VersionController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\Feishu\FeishuController;
use App\Http\Controllers\Feishu\FeishuCloudDocumentController;
use App\Http\Controllers\TestController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

/**
 * 登录注册
 */
Route::post('/login/account', [UserController::class, 'accountLogin']);
Route::get('/login/captcha', [UserController::class, 'loginCaptcha'])->middleware('throttle:apiVeryLow');
Route::get('/login/fs/url', [UserController::class, 'feishuLoginUrl']);
Route::post('/login/fs', [UserController::class, 'feishuLogin']);
Route::get('/register/captcha', [UserController::class, 'registerCaptcha'])->middleware('throttle:apiVeryLow');
Route::post('/register', [UserController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    /**
     * 用户相关
     */
    Route::get('/current_user', [UserController::class, 'currentUser']);
    Route::get('/current_user_detail', [UserController::class, 'currentUserDetail']);
    Route::get('/my_data_example', [UserController::class, 'myDataExample']);
    Route::get('/account_setting_current_user', [UserController::class, 'accountSettingCurrentUser']);
    Route::post('/update_current_user', [UserController::class, 'updateCurrentUser']);
    Route::post('/login/out_login', [UserController::class, 'outLogin']);
    Route::get('/notices', [NoticeController::class, 'index']);

    /**
     * 全局选项
     */
    Route::get('/options/roles', [RoleController::class, 'options']);
    Route::get('/fs_departments', [FeishuController::class, 'departments']);// 敏感接口，实际使用时注意控制权限

    /**
     * 文件存储相关
     */
    // 上传图片（通用）
    Route::post('/upload_image', [UploadController::class, 'uploadImage']);
    // 上传图片（WangEditor 专用）
    Route::post('/wang_upload_image', [UploadController::class, 'wangUploadImage']);
    // 上传附件
    Route::post('/upload_attachments', [UploadController::class, 'uploadAttachments']);
    // 获取文件（通过 key）
    Route::get('/files/{key}', [UploadController::class, 'getFile']);

    /**
     * 导入
     */
    Route::post('/import', [TestController::class, 'import']);

    /**
     * 设置，使用前需要在控制器配置权限
     */
    Route::get('/settings', [SettingController::class, 'index']);
    Route::post('/settings', [SettingController::class, 'update']);

    Route::get('/{project_type}/get_projects', [ProjectController::class,'index'])
        ->where('project_type','\bproject_start_up|middle_examination|final_examination\b');
    Route::get('/{project_type}/get_details', [ProjectController::class,'details'])
        ->where('project_type','\bproject_start_up|middle_examination|final_examination\b');
    Route::post('/{project_type}/update_project', [ProjectController::class,'update'])
        ->where('project_type','\bproject_start_up|middle_examination|final_examination\b');
    Route::post('/{project_type}/withdraw', [ProjectController::class,'withdraw'])
        ->where('project_type','\bproject_start_up|middle_examination|final_examination\b');
    Route::post('/{project_type}/pass', [ProjectController::class,'pass'])
        ->where('project_type','\bproject_start_up|middle_examination|final_examination\b');
    Route::post('/{project_type}/reject', [ProjectController::class,'reject'])
        ->where('project_type','\bproject_start_up|middle_examination|final_examination\b');
    Route::post('/{project_type}/fail', [ProjectController::class,'fail'])
        ->where('project_type','\bproject_start_up|middle_examination|final_examination\b');
    Route::get('/{project_type}/get_contract', [ProjectController::class,'getContract'])
        ->where('project_type','\bproject_start_up|middle_examination|final_examination\b');


    /**
     * 飞书
     */
    Route::get('/sync_fs_user_data', [UserController::class, 'syncFsUserData']);
    Route::get('/search_fs_user', [UserController::class, 'searchFsUser']);
    Route::get('/jssdk_auth_config', [FeishuController::class, 'jsSDKAuthConfig']);
    Route::post('/update_block', [FeishuCloudDocumentController::class, 'updateBlock']);
    Route::post('/batch_update_blocks', [FeishuCloudDocumentController::class, 'batchUpdateBlock']);

    /**
     * 用户管理-用户列表
     */
    Route::middleware('permissions:menus.users-list')->group(function () {
        Route::get('/departments', [DepartmentController::class, 'departments']);
        Route::post('/departments', [DepartmentController::class, 'updateDepartment']);
        Route::delete('/departments/{id}', [DepartmentController::class, 'deleteDepartment']);
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'update']);
        Route::post('/users/{id}/fs_data', [UserController::class, 'updateFsData']);
        Route::post('/import_fs_user', [UserController::class, 'importFsUser']);
    });
    /**
     * 用户管理-角色权限
     */
    Route::middleware('permissions:menus.users-permission')->group(function () {
        Route::get('/roles', [RoleController::class, 'index']);
        Route::post('/roles', [RoleController::class, 'update']);
        Route::delete('/role', [RoleController::class, 'delete']);
        Route::get('/permissions', [PermissionController::class, 'index']);
    });
    /**
     * 开发者-版本管理
     */
    Route::middleware('dev')->group(function () {
        Route::get('/versions', [VersionController::class, 'index']);
        Route::post('/versions', [VersionController::class, 'update']);
    });
    Route::get('/latest_version', [VersionController::class, 'latestVersion']);
    /**
     * 组件库-场景
     */
    // 敏感词识别
    Route::post('/keyword_recognize', [TestController::class, 'keywordRecognize']);

});
/**
 * 登录任意用户（仅开发测试环境）
 */
Route::get('/login_anyone_search', [TestController::class, 'loginAnyoneSearch']);
Route::post('/login_anyone/{id}', [TestController::class, 'loginAnyone']);
Route::get('/test',[TestController::class, 'test']);

/**
 * 飞书事件订阅
 */
Route::post('/fs_event', [FeishuController::class, 'fsEvent']);
