<?php

namespace App\Http\Controllers\Feishu;

use App\Http\Controllers\Controller;

class FeishuApprovalController extends Controller
{
    /**
     * 根据字段名，从 instanceForm 中取值
     *
     * @param array $instanceForm
     * @param string $fieldName
     * @param string $getKey 从识别到的字段对象中取出值的方式，对应 data_get
     * @return mixed
     */
    public static function getValueFromInstanceForm(array $instanceForm, string $fieldName, string $getKey = 'value'): mixed
    {
        $field = collect($instanceForm)->first(function ($value) use ($fieldName) {
            return $value->name === $fieldName;
        });
        return data_get($field, $getKey);
    }
}
