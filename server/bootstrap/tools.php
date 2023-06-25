<?php

use Illuminate\Http\JsonResponse;
use JetBrains\PhpStorm\Pure;

/**
 * 成功返回
 *
 * @param null $data
 * @param null $other
 * @return JsonResponse
 */
function successResponse($data = null, $other = null): JsonResponse
{
    return response()->json([
        'success' => true,
        'data' => $data,
    ]);
}

/**
 * 失败返回
 *
 * @param null $message
 * @param null $other
 * @param int $code
 * @return JsonResponse
 *
 * showType => antd pro 通知类型：0 silent; 1 message.warn; 2 message.error; 4 notification; 9 page;
 */
function errorResponse($message = null, $other = null, int $code = 200): JsonResponse
{
    return response()->json(array_merge([
        'success' => false,
        'errorMessage' => $message,
    ], $other ?: []), $code);
}

/**
 * 异常转字符串
 *
 * @param Exception $e
 * @return string
 */
#[Pure] function exception2str(Exception $e): string
{
    return sprintf("Error!\nFile: %s\nLine: %s\nMessage: %s\nTrace:\n%s\n", $e->getFile(), $e->getLine(), $e->getMessage(), $e->getTraceAsString());
}

/**
 * 校验手机号合法性
 *
 * @param $phoneNumber
 * @return bool
 */
function verifyPhoneNumber($phoneNumber): bool
{
    return !!preg_match('/^1\d{10}$/', $phoneNumber);
}

/**
 * 获取当前时间
 *
 * @return float
 */
function getCurrentTime(): float
{
    list ($mSec, $sec) = explode(" ", microtime());
    return (float)$mSec + (float)$sec;
}


