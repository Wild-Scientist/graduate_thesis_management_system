<?php

namespace App\Http\Controllers;

use App\Constants;
use App\Http\Controllers\Feishu\FeishuController;
use App\Imports\CommonImport;
use App\Models\ServerConstant;
use App\Models\Setting;
use App\Models\User;
use Database\Seeders\FeishuCloudSeeder;
use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Mockery\Matcher\Any;
use PhpOption\None;
use PhpParser\JsonDecoder;
use Spacecat\Feishu\Constant;
use Spacecat\Feishu\FeishuAuth;
use Spacecat\Feishu\GuzzleRetry;

class TestController extends Controller
{
    /**
     * 调试测试模块
     * @throws GuzzleException
     * @throws Exception
     */
    public function test():JsonResponse
    {
        if (!env('APP_DEBUG')) {
            return errorResponse('prod not support.');
        }
        return successResponse(FeishuController::createDocument());
    }

    /**
     * @throws GuzzleException
     */
    public function feishu(): string
    {
        $begin = getCurrentTime();
        $tenantAccessToken = FeishuAuth::getTenantAccessTokenInternal(
            env('FS_APP_ID'), env('FS_APP_SECRET')
        )->tenant_access_token;
        return sprintf("ok. spent time: %f s.\n", getCurrentTime() - $begin);
    }

    public function loginAnyoneSearch(Request $request): JsonResponse
    {
        if (!env('APP_DEBUG')) {
            return errorResponse('prod not support.');
        }
        $validator = validator($request->all(), [
            'page' => Constants::VALIDATOR_PAGE,
            'page_size' => Constants::VALIDATOR_PAGE_SIZE,
            'keyword' => 'string|nullable',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }

        $users = User::query();
        if ($request->has('keyword')) {
            $keyword = $request->{'keyword'};
            $users = $users->where(function ($query) use ($keyword) {
                return $query->where('id', 'like', "%$keyword%")
                    ->orWhere('username', 'like', "%$keyword%")
                    ->orWhere('name', 'like', "%$keyword%")
                    ->orWhere('phone', 'like', "%$keyword%")
                    ->orWhere('student_number', 'like', "%$keyword%")
                    ->orWhere('payroll_number', 'like', "%$keyword%")
                    ->orWhere('fs_user_id', 'like', "%$keyword%");
            });
        }
        $users = $users->paginate($request->page_size ?? Constants::DEFAULT_PAGE_SIZE);
        return successResponse($users);
    }

    public function loginAnyone(Request $request, $id): JsonResponse
    {
        if (!env('APP_DEBUG')) {
            return errorResponse('prod not support.');
        }

        $user = (new User)->findOrFail($id);
        return successResponse([
            'token' => $user->createToken(sprintf('%s-%s', now()->toDateTimeString(), $request->ip()))->{'plainTextToken'},
        ]);
    }

    public function import(Request $request): JsonResponse
    {
        $validator = validator($request->all(), [
            'file' => 'required|mimes:xls,xlsx',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        $sheets = (new CommonImport())->toArray($request->file('file'));
        $rows = $sheets[0];
        $head = $rows[0];

        // 表头校验
        $headRequiredColumns = ['手机号', '姓名'];
        if (sizeof($rows) < 1) {
            return errorResponse(CommonImport::TEMPLATE_INVALID_MESSAGE);
        }
        foreach ($headRequiredColumns as $column) {
            if (!in_array($column, $head)) {
                return errorResponse(CommonImport::TEMPLATE_INVALID_MESSAGE);
            }
        }

        // 数据校验
        foreach ($rows as $index => $row) {
            $indexInExcel = $index + 1;
            $phone = CommonImport::getValueFromRowByName($row, '手机号', $head);
            if ($index >= 1 && $phone) {
                // 数据校验（必填校验，手机号校验，枚举值合法校验等）
                $rowRequiredColumn = ['手机号'];
                for ($i = 0; $i < sizeof($rowRequiredColumn); $i++) {
                    if (!CommonImport::getValueFromRowByName($row, $rowRequiredColumn[$i], $head)) {
                        return errorResponse("第 $indexInExcel 行有必填数据为空");
                    }
                }
                if (!verifyPhoneNumber($phone)) {
                    return errorResponse("第 $indexInExcel 行手机号不正确");
                }
            }
        }

        // 写入数据（使用数据库事务保证数据完整性）
        $successCount = 0;
        DB::transaction(function () use ($rows, $head, &$successCount) {
            foreach ($rows as $index => $row) {
                if ($index >= 1 && CommonImport::getValueFromRowByName($row, '手机号', $head)) {
                    // do

                    $successCount++;
                }
            }
        });
        return successResponse(['success_count' => $successCount]);
    }

    /**
     * 组件库-场景-敏感词识别
     * @param Request $request
     * @return JsonResponse
     */
    public function keywordRecognize(Request $request): JsonResponse
    {
        $validator = validator($request->all(), [
            'content' => 'required|string',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }

        $sensitiveWords = Setting::getByKey(Setting::KEY_SENSITIVE_WORDS_LIB);
        $sensitiveWordsGroups = [];
        if ($sensitiveWords) {
            $sensitiveWords = Crypt::decryptString($sensitiveWords);
            $sensitiveWords = explode(',', $sensitiveWords);
            foreach ($sensitiveWords as $sensitiveWord) {
                array_push($sensitiveWordsGroups, explode('/', $sensitiveWord));
            }
        } else {
            $sensitiveWordsGroups = [
                ['的', '是'],
                ['在', '了'],
                ['不', '和'],
            ];
        }
        $out = [];
        foreach ($sensitiveWordsGroups as $index => $sensitiveWordsGroup) {
            foreach ($sensitiveWordsGroup as $sensitiveWord) {
                if (strstr($request->input('content'), $sensitiveWord)) {
                    if (isset($out[$index])) {
                        array_push($out[$index], $sensitiveWord);
                    } else {
                        $out[$index] = [$sensitiveWord];
                    }
                }
            }
        }
        return successResponse($out);
    }
}
