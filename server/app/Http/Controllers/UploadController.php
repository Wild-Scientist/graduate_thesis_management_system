<?php

namespace App\Http\Controllers;

use App\Models\File;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Session\Store;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * 注意保存到 public 目录的为公开可见文件，只要拿到路径就永久可访问
 * 敏感文件或用户私人文件通过设置入参 private 存放在 private 目录
 */
class UploadController extends Controller
{
    /**
     * 上传图片（通用）
     * @param Request $request
     * @return JsonResponse
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $validator = validator($request->all(), [
            'image' => 'required|mimes:jpg,jpeg,bmp,png,gif',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        $f = File::saveFile($request->file('image'), ['dir' => 'images']);
        return successResponse($f->public_path);
    }

    /**
     * 上传图片（WangEditor 专用）
     * @param Request $request
     * @return JsonResponse
     */
    public function wangUploadImage(Request $request): JsonResponse
    {
        $validator = validator($request->all(), [
            'image' => 'required|mimes:jpg,jpeg,bmp,png,gif',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        $f = File::saveFile($request->file('image'), ['dir' => 'images']);
        return response()->json([
            'errno' => 0,
            'data' => ['url' => $f->public_path],
        ]);
    }

    /**
     * 上传附件
     * @param Request $request
     * @return JsonResponse
     */
    public static function uploadAttachments(Request $request): JsonResponse
    {
        $validator = validator($request->all(), [
            'files' => 'required',// 请根据实际使用场景限制文件类型，不要放开
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        $private = $request->file('files')->getClientMimeType() === 'video/mp4' ? false : $request->private;

        $f = File::saveFile($request->file('files'), [
            'dir' => 'attachments',
            'public' => !$private,
            'name' => '新闻预审',
        ]);
        $out = [
            'key' => $f->key,
            'name' => $f->name,
            'public' => !$private,
        ];
        // 公开文件返回 path，前端可直接读取，不用在通过 key 调接口
        if (!$request->has('private')) {
            $out['public_path'] = $f->public_path;
        }
        return successResponse($out);
    }

    /**
     * 获取文件（通过key）
     * @param Request $request
     * @param $key
     * @return BinaryFileResponse|JsonResponse
     */
    public function getFile(Request $request, $key): BinaryFileResponse|JsonResponse
    {
        $request->merge(['key' => $key]);
        $validator = validator($request->all(), [
            'key' => 'alpha_num|required|exists:files,key',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }

        $f = (new File)->where('key', $key)->first();
        if ($f->public) {
            return successResponse($f->public_path);
        } else {
            // 可增加额外的鉴权逻辑
            return response()->file(
                base_path(
                    sprintf(
                        'storage/app/private/%s/%s',
                        $f->dir,
                        $f->name,
                    )
                )
            );
        }
    }

    public function delete($key)
    {
        $f = (new File)->where('key', $key)->first();
        Store::disk('attachments')->delete('');
    }
}
