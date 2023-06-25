<?php

namespace App\Http\Controllers\Feishu;

use App\Exceptions\CustomException;
use App\Http\Controllers\Controller;
use App\Jobs\Feishu\FsEventHandler;
use App\Models\ServerConstant;
use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Nette\Utils\Json;
use Spacecat\Feishu\Constant;
use Spacecat\Feishu\FeishuAuth;
use Spacecat\Feishu\FeishuContacts;
use Spacecat\Feishu\FeishuMiddle;
use Spacecat\Feishu\FeishuUtils;
use Spacecat\Feishu\FeishuWebComponent;
use Spacecat\Feishu\GuzzleRetry;

class FeishuController extends Controller
{

    /**
     * @throws GuzzleException
     * @throws Exception
     * 查询并存储root文件夹token
     */

    /*
     * 新建云文档
     */
    /**
     * @throws GuzzleException
     */
    public static function createDocument($title)
    {
        $tenantAccessToken = FeishuAuth::getTenantAccessTokenInternal(
            env('FS_APP_ID'), env('FS_APP_SECRET')
        )->tenant_access_token;
        $response = Http::retry(3, 100)
            ->withToken($tenantAccessToken)->post(Constant::BASE_URL . '/open-apis/docx/v1/documents', [
                'title' => $title,
                'folder_token' => ServerConstant::getRootFolderToken()]);
        $document_token = $response['data']['document']['document_id'];
        $rsp = FeishuController::setDocumentPermissions($document_token);
        self::setContractContent($document_token);
        return $document_token;
    }

    /*
    * 设置合同内容
    */
    /**
     * @throws GuzzleException
     */
    public static function setContractContent($document_token, $project)
    {
        $document_content = '"index": 0,
    "children": [
        {
            "block_type": 2,
            "text": {
            "elements": [
                    {
                        "text_run": {
                        "content": "多人实时协同，插入一切元素。不仅是在线文档，更是",
                            "text_element_style": {
                            "background_color": 14,
                                "text_color": 5
                            }
                        }
                    },
                    {
                        "text_run": {
                        "content": "强大的创作和互动工具",
                            "text_element_style": {
                            "background_color": 14,
                                "bold": true,
                                "text_color": 5
                            }
                        }
                    }
                ],
                "style": {}
            }
        }
    ]';
        $data = json_decode($document_content);
        $tenantAccessToken = FeishuAuth::getTenantAccessTokenInternal(
            env('FS_APP_ID'), env('FS_APP_SECRET')
        )->tenant_access_token;
        $response = Http::retry(3, 100)
            ->withToken($tenantAccessToken)->post(Constant::BASE_URL .
                "/open-apis/docx/v1/documents/{$document_token}/blocks/{$document_token}/children", $data);

    }

    /*
     * 设置云文档权限，允许所有人可读
     */
    /**
     * @throws GuzzleException
     */
    public static function setDocumentPermissions($token)
    {
        $tenantAccessToken = FeishuAuth::getTenantAccessTokenInternal(
            env('FS_APP_ID'), env('FS_APP_SECRET')
        )->tenant_access_token;

        $client = new Client(['base_uri' => Constant::BASE_URL, 'handler' => GuzzleRetry::createHandlerStack()]);
        $response = $client->request('PATCH', "/open-apis/drive/v1/permissions/${token}/public", ['headers' => [
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $tenantAccessToken], 'query' => [
            'type' => 'docx'], 'json' => [
            'share_entity' => 'same_tenant',
            'link_share_entity' => 'tenant_readable'
        ]]);
        if ($response->getStatusCode() !== 200) throw new Exception('network error');
        return json_decode($response->getBody()->getContents());
    }

    /*
     * 新建云空间存放文档的文件夹
     */
    public static function createDocumentFolder()
    {
        $tenantAccessToken = FeishuAuth::getTenantAccessTokenInternal(
            env('FS_APP_ID'), env('FS_APP_SECRET')
        )->tenant_access_token;
        $client = new Client(['base_uri' => Constant::BASE_URL, 'handler' => GuzzleRetry::createHandlerStack()]);
        $response = $client->request('POST', "/open-apis/drive/v1/files/create_folder", ['headers' => [
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $tenantAccessToken
        ], 'json' => ['name' => 'cloud_documents',
            'folder_token' => ServerConstant::getRootFolderToken()]]);
        if ($response->getStatusCode() !== 200) throw new Exception('network error');
    }

    /*
     * 获取文件夹下所有文件
     */
    public static function getAllFiles()
    {
        $tenantAccessToken = FeishuAuth::getTenantAccessTokenInternal(
            env('FS_APP_ID'), env('FS_APP_SECRET')
        )->tenant_access_token;
        $client = new Client(['base_uri' => Constant::BASE_URL, 'handler' => GuzzleRetry::createHandlerStack()]);
        $response = $client->request('GET', "/open-apis/drive/v1/files", ['headers' => [
            'Authorization' => 'Bearer ' . $tenantAccessToken
        ]]);
        if ($response->getStatusCode() !== 200) throw new Exception('network error');
        return json_decode($response->getBody()->getContents());
    }

    /**
     * 飞书事件处理
     *
     * @param Request $request
     * @return JsonResponse|void
     */
    public function fsEvent(Request $request)
    {
        // for fs event subscription
        if ($request->has('challenge')) {
            return response()->json([
                'challenge' => $request->{'challenge'}
            ]);
        }

        // handle 使用 VIP 快通道
        FsEventHandler::dispatch($request->all())->onQueue('vipF');
    }

    /**
     * 通过学号/工号/考号查询飞书用户
     *
     * 注意：
     * 本地和测试服使用的是中间机老接口（已停止维护），仅做开发调试使用
     * 生产服使用的是数据中心新接口，使用前需要添加白名单
     *
     * @throws CustomException
     * @throws GuzzleException
     */
    public static function getFsUserByNumber($number)
    {
        if (env('APP_DEBUG')) {
            $tenantAccessToken = FeishuAuth::getTenantAccessTokenInternal(
                env('FS_APP_ID'), env('FS_APP_SECRET')
            )->tenant_access_token;
            $userIdsRes = FeishuMiddle::getUserIdByNumber($tenantAccessToken, $number);
            $userIds = data_get($userIdsRes, 'data.employeeId', []);
        } else {
            $usersRes = FeishuMiddle::getUserByNumbers([$number], ['filter' => 'valid']);
            $users = data_get($usersRes, 'data.users', []);
            $userIds = array_map(function ($item) {
                return data_get($item, 'user_id');
            }, $users);
        }
        if (sizeof($userIds) === 1) {
            $tenantAccessToken = $tenantAccessToken ?? FeishuAuth::getTenantAccessTokenInternal(
                env('FS_APP_ID'), env('FS_APP_SECRET')
            )->tenant_access_token;
            $singleUserRes = FeishuContacts::getSingleUserData($tenantAccessToken, $userIds[0], 'user_id');
            return data_get($singleUserRes, 'data.user');
        } elseif (sizeof($userIds) > 1) {
            throw new CustomException('通过学号/工号/考号查到多个飞书用户');
        } else {
            throw new CustomException('通过学号/工号/考号未查到飞书用户');
        }
    }

    /**
     * 通过姓名搜索用户
     *
     * 注意：
     * 本地和测试服使用的是演示数据
     * 生产服使用的是数据中心接口，使用前需要添加白名单
     *
     * @throws GuzzleException
     */
    public static function searchFsUsers($query): array
    {
        if (env('APP_DEBUG')) {
            $tenantAccessToken = FeishuAuth::getTenantAccessTokenInternal(
                env('FS_APP_ID'), env('FS_APP_SECRET')
            )->tenant_access_token;
            $demoFsUserRes = FeishuContacts::getSingleUserData($tenantAccessToken, '2b66fb2g', 'user_id');
            $demoFsUser = data_get($demoFsUserRes, 'data.user');
            $users = ['total' => 1, 'users' => [[
                'user_id' => $demoFsUser->user_id,
                'name' => $demoFsUser->name,
                'avatar' => $demoFsUser->avatar,
                'status' => $demoFsUser->status,
                'custom_attrs' => [
                    'payroll_number' => FeishuUtils::getCustomAttrValueFromSingleUser($demoFsUser, FeishuMiddle::CUSTOM_ATTRS_PAYROLL_NUMBER_ID),
                    'student_number' => FeishuUtils::getCustomAttrValueFromSingleUser($demoFsUser, FeishuMiddle::CUSTOM_ATTRS_STUDENT_NUMBER_ID),
                    'examination_number' => FeishuUtils::getCustomAttrValueFromSingleUser($demoFsUser, FeishuMiddle::CUSTOM_ATTRS_EXAMINATION_NUMBER_ID),
                    'message' => FeishuUtils::getCustomAttrValueFromSingleUser($demoFsUser, FeishuMiddle::CUSTOM_ATTRS_MESSAGE_ID),
                ],
                'employee_no' => $demoFsUser->employee_no,
                'department_ids' => [
                    "od-66d98e17ca2ecf8bdf8b93016d601435",
                    "od-e61783659f9d26c7011984ab1858ec32"
                ],
                'departments' => [[
                    "name" => "成电飞书",
                    "open_department_id" => "od-66d98e17ca2ecf8bdf8b93016d601435"
                ], [
                    "name" => "经济与管理学院",
                    "open_department_id" => "od-e61783659f9d26c7011984ab1858ec32"
                ]]
            ]]];
        } else {
            $usersRes = FeishuMiddle::searchUser($query);
            $users = (array)data_get($usersRes, 'data');
        }
        return $users;
    }

    /**
     * 获取飞书部门下级数据
     *
     * @param Request $request
     * @return JsonResponse
     * @throws GuzzleException
     */
    public function departments(Request $request): JsonResponse
    {
        $validator = validator($request->all(), [
            'parent_department_id' => 'string|nullable',
            'show_user' => 'boolean|nullable',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        $tenantAccessToken = FeishuAuth::getTenantAccessTokenInternal(env('FS_APP_ID'), env('FS_APP_SECRET'))->{'tenant_access_token'};
        $departments = FeishuContacts::getDepartmentDataListAll($tenantAccessToken, [
            'parent_department_id' => $request->{'parent_department_id'} ?? 0
        ]);
        $out = ['departments' => $departments];
        if ($request->{'show_user'}) {
            $users = FeishuContacts::getUserListAll($tenantAccessToken, [
                'department_id' => $request->{'parent_department_id'}
            ]);
            $out['users'] = $users;
        }
        return successResponse($out);
    }

    /**
     * @throws GuzzleException
     */
    public function jsSDKAuthConfig(Request $request): JsonResponse
    {
        $validator = validator($request->all(), [
            'url' => 'required|string',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        // 获取 access_token（实际场景可能使用 user_access_token 请确认场景）
        $appAccessToken = FeishuAuth::getAppAccessTokenInternal(
            env('FS_APP_ID'), env('FS_APP_SECRET')
        )->app_access_token;
        // $user = $request->user();
        // $userAccessToken = $user->{'fs_access_token'};
        $token = $appAccessToken;

        // 获取 jsapi_ticket
        $ticket = data_get(FeishuWebComponent::getJsAPITicket($token), 'data.ticket');

        // 生成 Signature
        $noncestr = substr(md5(time()), 5, 16);
        $timestamp = time() * 1000;
        $url = $request->{'url'};
        $string1 = sprintf('jsapi_ticket=%s&noncestr=%s&timestamp=%s&url=%s', $ticket, $noncestr, $timestamp, $url);
        $signature = sha1($string1);

        return successResponse([
            // 'openId' => $user->{'fs_open_id'}
            'signature' => $signature,
            'appId' => env('FS_APP_ID'),
            'timestamp' => $timestamp,
            'nonceStr' => $noncestr,
        ]);
    }
}
