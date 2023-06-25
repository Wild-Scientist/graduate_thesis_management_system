<?php

namespace App\Http\Controllers;

use App\Constants;
use App\Exceptions\CustomException;
use App\Http\Controllers\Feishu\FeishuController;
use App\Models\Role;
use App\Models\User;
use App\Models\VerificationCode;
use App\Rules\PhoneNumber;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spacecat\Feishu\FeishuAuth;
use Spacecat\Feishu\FeishuContacts;
use Spacecat\Feishu\FeishuMiddle;
use Spacecat\Feishu\FeishuUtils;

class UserController extends Controller
{
    /**
     * 账户密码密码 or 手机号登录
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function accountLogin(Request $request): JsonResponse
    {
        $validator = validator($request->all(), [
            'type' => 'string|required|in:account,mobile',
            'username' => 'string|required_if:type,account',
            'password' => 'string|required_if:type,account',
            'phone' => 'string|required_if:type,mobile',
            'captcha' => 'string|required_if:type,mobile',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        if ($request->{'type'} === 'account') {
            $user = (new User)->where('username', $request->{'username'})->first();
            if (!$user) {
                return errorResponse('用户名不存在');
            }
            if (!Hash::check($request->{'password'}, $user->{'password'})) {
                return errorResponse('用户名或密码错误');
            }
            return successResponse([
                'token' => $user->createToken(sprintf('%s-%s', now()->toDateTimeString(), $request->ip()))->{'plainTextToken'},
            ]);
        }
        if ($request->{'type'} === 'mobile') {
            $user = (new User)->where('phone', $request->{'phone'})->first();
            if (!$user) {
                return errorResponse('手机号未注册');
            }

            [$result, $message] = VerificationCode::verifyCode($request->{'phone'}, 'login', $request->{'captcha'});
            if (!$result) {
                return errorResponse($message);
            }
            return successResponse([
                'token' => $user->createToken(sprintf('%s-%s', now()->toDateTimeString(), $request->ip()))->{'plainTextToken'},
            ]);
        }
        return errorResponse();
    }

    /**
     * 获取登录验证码
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function loginCaptcha(Request $request): JsonResponse
    {
        $validator = validator($request->all(), [
            'phone' => ['required', new PhoneNumber],
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }

        $code = VerificationCode::generateCode($request->{'phone'}, 'login');

        if (!env('APP_DEBUG')) {

        }

        return successResponse(env('APP_DEBUG') ? $code : null);
    }

    /**
     * 获取飞书登录 URL
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function feishuLoginUrl(Request $request): JsonResponse
    {
        $validator = validator($request->all(), [
            'redirect_uri' => 'string|required',
            'state' => 'string|nullable',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        return successResponse(FeishuAuth::getLoginUrl($request->{'redirect_uri'}, env('FS_APP_ID'), $request->{'state'}));
    }

    /**
     * 飞书登录
     *
     * @param Request $request
     * @return JsonResponse
     * @throws GuzzleException
     */
    public function feishuLogin(Request $request): JsonResponse
    {
        $validator = validator($request->all(), [
            'code' => 'string|required',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        $appId = env('FS_APP_ID');
        $appSecret = env('FS_APP_SECRET');
        try {
            $appAccessToken = FeishuAuth::getAppAccessTokenInternal($appId, $appSecret)->app_access_token;
            $tenantAccessToken = FeishuAuth::getTenantAccessTokenInternal($appId, $appSecret)->tenant_access_token;
            $loginUserRes = FeishuAuth::getLoginUserIdentity($appAccessToken, [
                'grant_type' => 'authorization_code',
                'code' => $request->code,
            ]);
            $code = $loginUserRes->code;
            if ($code === 0) {
                $loginUser = $loginUserRes->data;
                $singleUserRes = FeishuContacts::getSingleUserData($tenantAccessToken, $loginUser->open_id);
                $singleUser = data_get($singleUserRes, 'data.user');
                $user = User::findUserByFsInfo($singleUser);
                if (!$user) {
                    $user = User::createUserByFsInfo($singleUser);
                }
                if (!$user->fs_avatar_72) {
                    $user->syncFsUserData($singleUser);
                }
                DB::transaction(function () use ($user, $loginUser) {
                    $user->fs_access_token = $loginUser->access_token;
                    $user->fs_access_token_expire_at = now()->addSeconds($loginUser->expires_in);
                    $user->fs_refresh_token = $loginUser->refresh_token;
                    $user->fs_refresh_token_expire_at = now()->addSeconds($loginUser->refresh_expires_in);
                    $user->save();
                });
                return successResponse([
                    'token' => $user->createToken(sprintf('%s-%s', now()->toDateTimeString(), $request->ip()))->{'plainTextToken'},
                ]);
            } else if ($code === 20007) {
                // 前端会识别该 message 自动跳转，不要直接改
                return errorResponse('code invalid.', ['showType' => 0]);
            } else {
                $message = '飞书登录失败';
                logger($message);
                logger($loginUserRes);
                return errorResponse($message);
            }
        } catch (ClientException $e) {
            if ($e->getResponse()->getStatusCode() === 429) {
                return errorResponse('当前登录用户过多，请稍后重试');
            } else {
                throw $e;
            }
        }
    }

    /**
     * 获取注册验证码
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function registerCaptcha(Request $request): JsonResponse
    {
        $validator = validator($request->all(), [
            'phone' => ['required', new PhoneNumber],
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }

        $code = VerificationCode::generateCode($request->{'phone'}, 'register');

        if (!env('APP_DEBUG')) {

        }

        return successResponse(env('APP_DEBUG') ? $code : null);
    }

    /**
     * 注册账户
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function register(Request $request): JsonResponse
    {
        $validator = validator($request->all(), [
            'username' => 'string|required',
            'password' => 'string|required',
            'confirm' => 'string|required',
            'phone' => ['required', new PhoneNumber],
            'captcha' => 'string|required',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }

        if ((new \App\Models\User)->where('username', $request->{'username'})->first()) {
            return errorResponse('用户名已存在');
        }

        if ((new \App\Models\User)->where('phone', $request->{'phone'})->first()) {
            return errorResponse('手机号已注册');
        }

        if ($request->{'password'} !== $request->{'confirm'}) {
            return errorResponse('两次输入的密码不匹配');
        }

        [$result, $message] = VerificationCode::verifyCode($request->{'phone'}, 'register', $request->{'captcha'});
        if (!$result) {
            return errorResponse($message);
        }

        $u = new User();
        $u->{'username'} = $request->{'username'};
        $u->{'password'} = bcrypt($request->{'password'});
        $u->{'phone'} = $request->{'phone'};
        $u->save();
        return successResponse([
            'token' => $u->createToken(sprintf('%s-%s', now()->toDateTimeString(), $request->ip()))->{'plainTextToken'},
        ]);
    }

    /**
     * 获取登录用户信息
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function currentUser(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->addRolePermissions();
        $user->fs_departments = $user->fsDepartments;
        $user->{'unread_count'} = 11;
        return successResponse($user);
    }

    /**
     * 获取登录用户详细信息
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function currentUserDetail(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->addRolePermissions();
        // 扩展部门数据
        $user->{'departments'} = 'SpaceCat－技术部';
        // 扩展省市区数据
        $user->{'geographic'} = [
            'province' => ['label' => '四川省', 'code' => '510000'],
            'city' => ['label' => '成都市', 'code' => '510100'],
        ];
        // 扩展标签数据
        $tags = ['90后', '巨蟹座', 'IT民工', '铲屎官', '选择恐惧症', '为了部落', '全军出击'];
        $tagsOut = [];
        foreach ($tags as $index => $tag) {
            array_push($tagsOut, ['key' => $index, 'label' => $tag]);
        }
        $user->{'tags'} = $tagsOut;
        // 扩展团队数据
        $teams = ['科学搬砖组', '全组都是吴彦祖', '中二少女团', '程序员日常', '高逼格设计天团', '骗你来学计算机'];
        $teamsOut = [];
        foreach ($teams as $index => $team) {
            array_push($teamsOut, ['id' => $index, 'href' => 'https://baidu.com', 'name' => $team]);
        }
        $user->{'teams'} = $teamsOut;
        return successResponse($user);
    }

    /**
     * 获取个人心中我的数据（示例）
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function myDataExample(Request $request): JsonResponse
    {
        $list = [];
        $wzHeroes = ['阿轲', '庄周', '鲁班七号', '孙尚香', '嬴政', '妲己', '墨子', '赵云', '小乔', '廉颇'];
        $titles = ['Laravel', 'React', 'Ant Design', 'Ant Design Pro', 'Bootstrap', 'React', 'Vue', 'Webpack', 'Docker', 'K8s'];
        $covers = [
            'https://gw.alipayobjects.com/zos/rmsportal/uMfMFlvUuceEyPpotzlq.png',
            'https://gw.alipayobjects.com/zos/rmsportal/iZBVOIhGJiAnhplqjvZW.png',
            'https://gw.alipayobjects.com/zos/rmsportal/iXjVmWVHbCJAyqvDxdtx.png',
            'https://gw.alipayobjects.com/zos/rmsportal/gLaIAoVWTtLbBWZNYEMg.png',
        ];
        for ($i = 0; $i < $request->{'count'}; $i++) {
            $members = [];
            for ($j = 0; $j < rand(2, 5); $j++) {
                array_push($members, ['id' => $j, 'name' => $wzHeroes[rand(0, 9)]]);
            }
            array_push($list, [
                'id' => $i,
                'owner' => $wzHeroes[rand(0, 9)],
                'star' => rand(0, 10000),
                'like' => rand(0, 100000),
                'message' => rand(0, 1000),
                'href' => 'https://baidu.com',
                'title' => $titles[rand(0, 9)],
                'content' => '鱼，我所欲也，熊掌，亦我所欲也，二者不可得兼，舍鱼而取熊掌者也。生，亦我所欲也，义，亦我所欲也，二者不可得兼，舍生而取义者也。生亦我所欲，所欲有甚于生者，故不为苟得也。死亦我所恶，所恶有甚于死者，故患有所不辟也。如使人之所欲莫甚于生，则凡可以得生者何不用也？使人之所恶莫甚于死者，则凡可以辟患者何不为也？由是则生而有不用也；由是则可以辟患而有不为也。是故所欲有甚于生者，所恶有甚于死者。非独贤者有是心也，人皆有之，贤者能勿丧耳。一箪食，一豆羹，得之则生，弗得则死。呼尔而与之，行道之人弗受；蹴尔而与之，乞人不屑也。万钟则不辩礼义而受之，万钟于我何加焉！为宫室之美，妻妾之奉，所识穷乏者得我欤？乡为身死而不受，今为宫室之美为之；乡为身死而不受，今为妻妾之奉为之；乡为身死而不受，今为所识穷乏者得我而为之：是亦不可以已乎？此之谓失其本心。',
                'activeUser' => rand(0, 1000),
                'newUser' => rand(0, 100),
                'cover' => $covers[rand(0, 3)],
                'subDescription' => '那是一种内在的东西， 他们到达不了，也无法触及的',
                'members' => $members,
            ]);
        }
        return successResponse(['list' => $list]);
    }

    /**
     * 获取个人设置
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function accountSettingCurrentUser(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->addRolePermissions();
        $user->{'unreadCount'} = 11;
        return successResponse($user);
    }

    /**
     * 更新个人基本信息
     * @param Request $request
     * @return JsonResponse
     */
    public function updateCurrentUser(Request $request): JsonResponse
    {
        $validator = validator($request->all(), [
            'username' => 'string|nullable',
            'name' => 'string|nullable',
            'signature' => 'string|nullable',
            'title' => 'string|nullable',
            'address' => 'string|nullable',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        $loginUser = $request->user();
        $loginUser->username = $request->username;
        $loginUser->name = $request->name;
        $loginUser->signature = $request->signature;
        $loginUser->title = $request->title;
        $loginUser->address = $request->address;
        $loginUser->save();
        return successResponse();
    }

    /**
     * 退出登录
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function outLogin(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return successResponse();
    }

    /**
     * 获取用户列表
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        // 输入验证
        $validator = validator($request->all(), [
            'page' => Constants::VALIDATOR_PAGE,
            'page_size' => Constants::VALIDATOR_PAGE_SIZE,
            'created_at' => Constants::VALIDATOR_ORDER,
            'updated_at' => Constants::VALIDATOR_ORDER,
            'keyword' => 'string|nullable',
            'department_id' => 'numeric|nullable|exists:departments,id',
            'role_ids' => 'array|nullable',
            'role_ids.*' => 'numeric|nullable|exists:roles,id',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        $users = User::query();
        // if ($request->has('departmentId')) {
        //     $users = (new \App\Models\Department)->find($request->{'departmentId'})->users();
        // }
        if ($request->has('role_ids') && sizeof($request->role_ids)) {
            $users = $users->whereHas('roles', function ($query) use ($request) {
                $query->whereIn('roles.id', $request->role_ids);
            });
        }
        if ($request->has('keyword')) {
            $keyword = $request->{'keyword'};
            $users = $users->where(function ($query) use ($keyword) {
                return $query->where('id', 'like', "%$keyword%")
                    ->orWhere('username', 'like', "%$keyword%")
                    ->orWhere('name', 'like', "%$keyword%")
                    ->orWhere('phone', 'like', "%$keyword%");
            });
        }
        if ($request->has('created_at')) {
            $users = $users->orderBy('created_at', $request->created_at);
        } else {
            $users = $users->orderBy('created_at', 'desc');
        }
        if ($request->has('updated_at')) {
            $users = $users->orderBy('updated_at', $request->updated_at);
        }

        $users = $users->paginate($request->page_size ?? Constants::DEFAULT_PAGE_SIZE);
        foreach ($users as $user) {
            $user->addRolePermissions();
        }
        return successResponse($users);
    }

    /**
     * 更新用户
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function update(Request $request): JsonResponse
    {
        $validator = validator($request->all(), [
            'id' => 'numeric|exists:users,id',
            'username' => 'string',
            'phone' => 'string',
            'role_ids' => 'array|nullable',
            'role_ids.*' => 'numeric|nullable|exists:roles,id',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        $loginUser = $request->user();
        // 当前用户不是超管时，无法给任何用户设置超管
        if (in_array(Role::ROLE_ID_SUPER, $request->role_ids) && !$loginUser->isSuper()) {
            return errorResponse('无权限');
        }
        if ($request->has('id')) {
            // 编辑
            $targetUser = (new User)->find($request->{'id'});
            if ($request->has('role_ids') && sizeof($request->role_ids)) {
                if ($targetUser->isSuper() && !$loginUser->isSuper()) {
                    return errorResponse('无权限');
                }
                $targetUser->roles()->sync($request->role_ids);
            }
            $targetUser->save();
            return successResponse();
        } else {
            // 新增
            if (User::query()->where('username', $request->username)->first()) {
                return errorResponse('用户名已存在');
            }
            if (User::query()->where('phone', $request->phone)->first()) {
                return errorResponse('手机号已存在');
            }
            DB::transaction(function () use ($request) {
                $u = new User();
                $u->username = $request->username;
                $u->phone = $request->phone;
                $u->save();
                $u->roles()->sync($request->role_ids);
            });
            return successResponse();
        }
    }

    /**
     * 更新用户飞书信息
     *
     * @param Request $request
     * @param $id
     * @return JsonResponse
     * @throws GuzzleException
     */
    public function updateFsData(Request $request, $id): JsonResponse
    {
        $request->merge(['id' => $id]);
        $validator = validator($request->all(), [
            'id' => 'numeric|exists:users,id',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        $user = (new User)->find($id);
        if (!$user->fs_user_id) {
            return errorResponse('用户未绑定飞书 USER ID，无法更新');
        }
        $tenantAccessToken = FeishuAuth::getTenantAccessTokenInternal(
            env('FS_APP_ID'), env('FS_APP_SECRET')
        )->tenant_access_token;
        $singleUserRes = FeishuContacts::getSingleUserData($tenantAccessToken, $user->fs_user_id, 'user_id');
        $singleUser = data_get($singleUserRes, 'data.user');
        $user->syncFsUserData($singleUser);
        // 重新查一次，否则默认关联不更新
        $user = (new User)->find($id);
        $user->addRolePermissions();
        return successResponse($user);
    }

    /**
     * 同步飞书用户信息
     *
     * @throws GuzzleException
     */
    public function syncFsUserData(Request $request): JsonResponse
    {
        $validator = validator($request->all(), [
            'number' => 'numeric',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }

        try {
            $fsUser = FeishuController::getFsUserByNumber($request->{'number'});
            return successResponse([
                'fs_avatar' => $fsUser->{'avatar'},
                'name' => $fsUser->{'name'},
                'fs_user_id' => $fsUser->{'user_id'},
                'student_number' => FeishuUtils::getCustomAttrValueFromSingleUser($fsUser, FeishuMiddle::CUSTOM_ATTRS_STUDENT_NUMBER_ID),
                'payroll_number' => FeishuUtils::getCustomAttrValueFromSingleUser($fsUser, FeishuMiddle::CUSTOM_ATTRS_PAYROLL_NUMBER_ID),
            ]);
        } catch (CustomException $e) {
            return errorResponse($e->getMessage());
        }
    }

    /**
     * 搜索飞书用户
     *
     * @throws GuzzleException
     */
    public function searchFsUser(Request $request): JsonResponse
    {
        $validator = validator($request->all(), [
            'name' => 'string',
            'number' => 'string',
            'page' => Constants::VALIDATOR_PAGE,
            'page_size' => Constants::VALIDATOR_PAGE_SIZE,
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }

        if (!$request->name && !$request->number) {
            return errorResponse('缺少必要参数');
        }

        return successResponse(FeishuController::searchFsUsers($request->all()));
    }

    /**
     * 添加飞书用户
     *
     * @throws GuzzleException
     */
    public function importFsUser(Request $request): JsonResponse
    {
        $validator = validator($request->all(), [
            'fs_user_id' => 'alpha_num|required',
            'role_ids' => 'array|required',
            'role_ids.*' => 'numeric|exists:roles,id',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        $fsUserId = $request->{'fs_user_id'};
        $tenantAccessToken = FeishuAuth::getTenantAccessTokenInternal(env('FS_APP_ID'), env('FS_APP_SECRET'))->tenant_access_token;
        $singleUserRes = FeishuContacts::getSingleUserData($tenantAccessToken, $fsUserId, 'user_id');
        $singleUser = data_get($singleUserRes, 'data.user');
        $user = User::findUserByFsInfo($singleUser);
        if ($user) {
            return errorResponse('用户已存在');
        }
        User::createUserByFsInfo($singleUser, $request->role_ids);
        return successResponse();
    }
}
