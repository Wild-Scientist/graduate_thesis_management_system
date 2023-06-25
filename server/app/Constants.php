<?php

namespace App;

class Constants
{
    /*
    |--------------------------------------------------------------------------
    | 验证
    |--------------------------------------------------------------------------
    |
    */

    // 分页字段
    const VALIDATOR_PAGE = 'numeric|nullable|min:1';
    const VALIDATOR_PAGE_SIZE = 'numeric|nullable|in:5,10,20,50,100';

    // 排序字段
    const VALIDATOR_ORDER = 'string|nullable|in:asc,desc';

    /*
    |--------------------------------------------------------------------------
    | 默认值
    |--------------------------------------------------------------------------
    |
    */

    // 分页
    const DEFAULT_PAGE_SIZE = 20;
}
