<?php

namespace App\Http\Controllers\Feishu;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spacecat\Feishu\FeishuAuth;
use Spacecat\Feishu\FeishuCloudDocument;


class FeishuCloudDocumentController extends Controller
{
    public static function  createContract($project_type,$project_id,$user_id): JsonResponse
    {
        $document_token = FeishuController::createDocument('test_title');
        Contract::saveDocument($document_token,$project_type,$project_id,1);

        return successResponse($document_token);
    }

    /**
     * 更新块
     *
     * @param Request $request
     * @return JsonResponse
     * @throws GuzzleException
     */
    public function updateBlock(Request $request): JsonResponse
    {
        $validator = validator($request->all(), [
            'document_id' => 'string|required',
            'block_id' => 'string|required',
            'post_data' => 'array',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        $tenantAccessToken = FeishuAuth::getTenantAccessTokenInternal(
            env('FS_APP_ID'), env('FS_APP_SECRET')
        )->tenant_access_token;
        $res = FeishuCloudDocument::updateBlock(
            $tenantAccessToken,
            $request->document_id,
            $request->block_id,
            $request->post_data,
        );
        if (data_get($res, 'code') !== 0) {
            $msg = data_get($res, 'msg');
            return errorResponse("更新失败：$msg");
        }
        return successResponse();
    }

    /**
     * 批量更新块
     *
     * @param Request $request
     * @return JsonResponse
     * @throws GuzzleException
     */
    public function batchUpdateBlock(Request $request): JsonResponse
    {
        $validator = validator($request->all(), [
            'document_id' => 'string|required',
            'post_data' => 'array',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        $tenantAccessToken = FeishuAuth::getTenantAccessTokenInternal(
            env('FS_APP_ID'), env('FS_APP_SECRET')
        )->tenant_access_token;
        $res = FeishuCloudDocument::batchUpdateBlocks(
            $tenantAccessToken,
            $request->document_id,
            $request->post_data,
        );
        if (data_get($res, 'code') !== 0) {
            $msg = data_get($res, 'msg');
            return errorResponse("更新失败：$msg");
        }
        return successResponse();
    }
}
