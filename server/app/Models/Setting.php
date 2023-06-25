<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @mixin Builder
 */
class Setting extends Model
{
    use HasFactory;

    // 组件库-场景-敏感词识别-敏感词库
    const KEY_SENSITIVE_WORDS_LIB = 'sensitive_words_lib';

    public static function getByKey($key, $default = null)
    {
        $s = (new Setting)->where('key', $key)->first();
        return data_get($s, 'value') ?: $default;
    }

    public static function store($key, $value, $info = null)
    {
        $s = (new Setting)->where('key', $key)->first();
        if (!$s) {
            $s = new Setting();
            $s->key = $key;
        }
        $s->value = $value;
        $s->info = $info;
        $s->save();
    }
}
