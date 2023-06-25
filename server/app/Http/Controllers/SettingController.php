<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * 权限配置
     * 不设置代表无权限，即不能通过接口读写
     * 设置为 null 代表不检查权限，即任意读写（有风险）
     * 设置为字符串即需要对应权限，支持多个，用|隔开，有任一权限即可
     */
    const KEY_PERMISSIONS = [
        'key' => 'permission',
        'keyOr' => 'permission1|permission2',
        'keyNotCheck' => null,
    ];

    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $validator = validator($request->all(), [
            'keys' => 'array|required',
            'keys.*' => 'string',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        $out = [];
        foreach ($request->keys as $key) {
            $pass = array_key_exists($key, self::KEY_PERMISSIONS)
                && self::KEY_PERMISSIONS[$key]
                && $request->user()->hasPermissions(explode('|', self::KEY_PERMISSIONS[$key]));
            if (!$pass) {
                return errorResponse(sprintf('key:%s no permission.', $key));

            }
            $out[$key] = Setting::getByKey($key);
        }
        return successResponse($out);
    }

    public function update(Request $request): \Illuminate\Http\JsonResponse
    {
        foreach ($request->all() as $key => $value) {
            $pass = array_key_exists($key, self::KEY_PERMISSIONS)
                && self::KEY_PERMISSIONS[$key]
                && $request->user()->hasPermissions(explode('|', self::KEY_PERMISSIONS[$key]));
            if (!$pass) {
                return errorResponse(sprintf('key:%s no permission.', $key));

            }
            Setting::store($key, $value);
        }
        return successResponse();
    }
}
