<?php

namespace App\Models;

use Exception;
use GuzzleHttp\Client;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Spacecat\Feishu\Constant;
use Spacecat\Feishu\FeishuAuth;
use Spacecat\Feishu\GuzzleRetry;

/**
 * @mixin Builder
 */
class ServerConstant extends Model
{
    use HasFactory;

    public static function saveConstant($key, $value)
    {
        DB::transaction(function () use ($key,$value) {
            $s = new ServerConstant();
            $s->key = $key;
            $s->value = $value;
            $s->save();
        });
    }

    public static function getRootFolderToken()
    {
        $s = (new ServerConstant())->where( 'key','root_folder_token')->first();
        if ($s === null) {//数据库中没有保存记录
            $tenantAccessToken = FeishuAuth::getTenantAccessTokenInternal(
                env('FS_APP_ID'), env('FS_APP_SECRET')
            )->tenant_access_token;
            $client = new Client(['base_uri' => Constant::BASE_URL, 'handler' => GuzzleRetry::createHandlerStack()]);
            $response = $client->request('GET', "/open-apis/drive/explorer/v2/root_folder/meta", ['headers' => [
                'Authorization' => 'Bearer ' . $tenantAccessToken,
            ]]);
            if ($response->getStatusCode() !== 200) throw new Exception('network error');
            $token = json_decode($response->getBody()->getContents())->data->token;
            ServerConstant::saveConstant('root_folder_token', $token);
            return $token;
        } else {
            return $s->value;
        }
    }

}
