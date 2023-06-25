<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * @mixin Builder
 */
class File extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'disk',
        'dir',
        'md5'
    ];

    /**
     * 保存文件并创建记录
     * @param UploadedFile $file
     * @param $options
     * @return File
     */
    public static function saveFile(UploadedFile $file, $options): File
    {
        // 创建空记录
        $f = new File();
        $f->save();
        try {
            // 配置项
            $public = data_get($options, 'public', true);
            $dir = data_get($options, 'dir', 'files');
            $name = data_get($options, 'name');

            // 处理文件名，增加一个时间戳和随机后缀
            if ($name) {
                $name = sprintf(
                    '%s_%s_%s.%s',
                    $name,
                    now()->format('Y_m_d_H_i_s'),
                    rand(10, 99),
                    $file->getClientOriginalExtension(),
                );
            }

            // 保存文件基本信息
            $f->key = self::generateKey();
            $f->disk = data_get($options, 'disk', 'local');
            $f->public = $public;
            $f->original_name = $file->getClientOriginalName();
            $f->extension = $file->getClientOriginalExtension();
            $f->mime = $file->getClientMimeType();
            $f->size = $file->getSize() / 1024;
            $f->md5 = md5_file($file->path());
            $f->save();

            // 储存
            $_path = sprintf(
                '/%s/%s/%s',
                $public ? 'public' : 'private',
                $dir,
                now()->toDateString(),
            );
            $path = $name ? $file->storeAs($_path, $name) : $file->store($_path);
            // 去掉重复的斜线（如果传入的 path 开头或结尾包含斜线，生成的 path 会包含重复的斜线）
            $path = preg_replace('/\/{2,}/', '/', $path);

            // 保存储存信息
            $pathArr = explode('/', $path);
            $f->public_path = $f->public ? Storage::url($path) : null;
            $f->dir = implode('/', array_slice($pathArr, 1, sizeof($pathArr) - 2));
            $f->name = $pathArr[sizeof($pathArr) - 1];
            $f->save();
        } catch (\Exception $e) {
            // 保存错误日志
            $f->log = exception2str($e);
            $f->save();
        }
        return $f;
    }

    /**
     * 生成文件 key
     * @return string
     */
    private static function generateKey(): string
    {
        $key = Str::random(8);
        while ((new File)->where('key', $key)->first()) {
            $key = Str::random(8);
        }
        return $key;
    }

}
