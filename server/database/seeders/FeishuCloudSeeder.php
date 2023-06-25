<?php

namespace Database\Seeders;

use App\Http\Controllers\Feishu\FeishuController;
use App\Models\ServerConstant;
use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spacecat\Feishu\Constant;
use Spacecat\Feishu\FeishuAuth;
use Spacecat\Feishu\GuzzleRetry;

class FeishuCloudSeeder extends Seeder
{
    /**
     * 初始化飞书云空间
     *
     * @return void
     * @throws GuzzleException
     */
    public function run()
    {
        FeishuController::setRootFolderConstant();
    }
}


